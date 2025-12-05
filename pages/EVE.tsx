import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Package, TrendingUp, TrendingDown, Calculator, 
  Plus, Trash2, Save, ShoppingBag, DollarSign, 
  Factory, Zap, LayoutGrid, ChevronRight, Search, 
  ArrowRight, Percent, FileText, CheckCircle2, AlertTriangle, Menu,
  PieChart as PieChartIcon
} from 'lucide-react';
import { Contact } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';

// --- HELPER FUNCTIONS ---
const toCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const toPercent = (value: number) => `${value.toFixed(2).replace('.', ',')}%`;
const toNum = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    return parseFloat(val.toString().replace(/\./g, '').replace(',', '.')) || 0;
};

// --- TYPES ---
interface EVEProps {
    contacts?: Contact[];
    onComplete?: (contactId: string) => void;
    initialContactId?: string;
}

type ProductType = 'Fabricacao' | 'Revenda' | 'Servico';

interface Product {
  id: string;
  name: string;
  type: ProductType;
  unit: string;
  monthlyQty: number; 
  sellingPrice: number;
  period: string; 
}

interface Investment {
  id: string;
  description: string;
  quantity: number;
  value: number;
  lifeSpan: number; // Anos
  residualValue: number;
}

interface FixedCost {
  id: string;
  description: string;
  value: number;
}

interface RawMaterial {
    id: string;
    description: string;
    unit: string;
    unitPrice: number; // Preço de compra por unidade de medida
}

interface ProductCost {
    productId: string;
    batchSize: number; // Quantidade produzida no lote
    commissionRate: number; // %
    taxRate: number; // %
    lossesRate: number; // %
    materials: {
        materialId: string;
        quantityUsed: number; // Qtd usada no lote
    }[];
}

interface ResaleItem {
    productId: string;
    purchasePrice: number;
    taxRate: number;
    commissionRate: number;
    lossesRate: number;
}

// --- MAIN COMPONENT ---
export const EVE: React.FC<EVEProps> = ({ contacts = [], onComplete, initialContactId }) => {
  const [activeModule, setActiveModule] = useState<string>('empreendimento');
  const [selectedContactId, setSelectedContactId] = useState<string>(initialContactId || '');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // --- DATA STORES ---
  
  // 1. Empreendimento
  const [enterprise, setEnterprise] = useState({
    name: '', cnpj: '', activity: '', address: '', city: '', phone: '', email: '', 
    situation: 'Em funcionamento', partnersM: 0, partnersF: 0, organization: 'Grupo Informal', cadsol: false
  });

  // 2. Produtos
  const [products, setProducts] = useState<Product[]>([]);
  const [newProd, setNewProd] = useState<Partial<Product>>({ type: 'Fabricacao', unit: 'un', monthlyQty: 0, sellingPrice: 0, period: 'Mensal' });

  // 3. Investimentos
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [newInvest, setNewInvest] = useState<Partial<Investment>>({ quantity: 1, value: 0, lifeSpan: 5, residualValue: 0 });

  // 5. Custos Fixos
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([
      { id: '1', description: 'Energia Elétrica', value: 0 },
      { id: '2', description: 'Água', value: 0 },
      { id: '3', description: 'Aluguel', value: 0 },
      { id: '4', description: 'Internet/Telefone', value: 0 },
      { id: '5', description: 'Pró-Labore', value: 1412.00 },
      { id: '6', description: 'Contador/MEI', value: 75.00 },
  ]);
  const [newFixed, setNewFixed] = useState<Partial<FixedCost>>({ value: 0 });

  // 7. Custo Produção (Database)
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([
      { id: 'm1', description: 'Elastico', unit: 'cm', unitPrice: 0.05 }, 
      { id: 'm2', description: 'Linha', unit: 'mt', unitPrice: 0.03 },
      { id: 'm3', description: 'Missanga Madeira Media', unit: 'Unidade', unitPrice: 0.12 },
      { id: 'm4', description: 'Missanga Madeira Pequena', unit: 'Unidade', unitPrice: 0.08 },
      { id: 'm5', description: 'Paitê', unit: 'Unidade', unitPrice: 0.05 },
      { id: 'm6', description: 'Sacola', unit: 'Unidade', unitPrice: 0.40 },
  ]);
  const [newMaterial, setNewMaterial] = useState<Partial<RawMaterial>>({ unit: 'un', unitPrice: 0 });
  
  const [productCosts, setProductCosts] = useState<Record<string, ProductCost>>({});
  const [resaleCosts, setResaleCosts] = useState<Record<string, ResaleItem>>({});
  
  // UI Helpers for Cost Screens
  const [selectedProdId, setSelectedProdId] = useState<string>('');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [qtyToAdd, setQtyToAdd] = useState<number>(0);

  // --- INITIALIZATION ---
  useEffect(() => {
    if (selectedContactId) {
        const c = contacts.find(co => co.id === selectedContactId);
        if (c) {
            setEnterprise({
                name: c.company, cnpj: c.cnpj || '', activity: c.role, 
                address: c.address || '', city: c.city || '', phone: c.phone, email: c.email,
                situation: c.situation || 'Em funcionamento',
                partnersM: c.menCount || 0, partnersF: c.womenCount || 0,
                organization: c.organization || 'Grupo Informal', cadsol: c.cadsol || false
            });
        }
    }
  }, [selectedContactId, contacts]);

  // Sync Prod Costs Structure
  useEffect(() => {
      products.forEach(p => {
          if (p.type === 'Fabricacao' && !productCosts[p.id]) {
              setProductCosts(prev => ({...prev, [p.id]: { productId: p.id, batchSize: 1, commissionRate: 0, taxRate: 0, lossesRate: 0, materials: [] }}));
          }
          if (p.type === 'Revenda' && !resaleCosts[p.id]) {
              setResaleCosts(prev => ({...prev, [p.id]: { productId: p.id, purchasePrice: 0, taxRate: 0, commissionRate: 0, lossesRate: 0 }}));
          }
      });
      if (products.length > 0 && !selectedProdId) setSelectedProdId(products[0].id);
  }, [products]);


  // --- CALCULATIONS ENGINE ---

  // Depreciation
  const depreciationItems = investments.map(inv => {
      const totalVal = inv.quantity * inv.value;
      const depreciable = totalVal - inv.residualValue;
      const annualDep = inv.lifeSpan > 0 ? depreciable / inv.lifeSpan : 0;
      const monthlyDep = annualDep / 12;
      return { ...inv, totalVal, depreciable, annualDep, monthlyDep };
  });
  const totalDepreciationMonthly = depreciationItems.reduce((acc, i) => acc + i.monthlyDep, 0);

  // Fixed Costs
  const totalFixedCostsCash = fixedCosts.reduce((acc, f) => acc + f.value, 0);
  const totalFixedCostsEconomic = totalFixedCostsCash + totalDepreciationMonthly;

  // Variable Costs & Unit Analysis
  const productsAnalysis = products.map(p => {
      let unitVariableCost = 0;
      let unitTaxCost = 0;
      let unitCommissionCost = 0;

      if (p.type === 'Fabricacao' && productCosts[p.id]) {
          const costData = productCosts[p.id];
          const materialsCost = costData.materials.reduce((acc, m) => {
              const mat = rawMaterials.find(rm => rm.id === m.materialId);
              return acc + ((mat?.unitPrice || 0) * m.quantityUsed);
          }, 0);
          
          const totalBatchCost = materialsCost * (1 + (costData.lossesRate / 100));
          unitVariableCost = costData.batchSize > 0 ? totalBatchCost / costData.batchSize : 0;
          
          unitTaxCost = p.sellingPrice * (costData.taxRate / 100);
          unitCommissionCost = p.sellingPrice * (costData.commissionRate / 100);

      } else if (p.type === 'Revenda' && resaleCosts[p.id]) {
          const costData = resaleCosts[p.id];
          const purchaseCost = costData.purchasePrice * (1 + (costData.lossesRate / 100));
          unitVariableCost = purchaseCost;
          
          unitTaxCost = p.sellingPrice * (costData.taxRate / 100);
          unitCommissionCost = p.sellingPrice * (costData.commissionRate / 100);
      }

      const totalUnitVariableCost = unitVariableCost + unitTaxCost + unitCommissionCost;
      const unitCM = p.sellingPrice - totalUnitVariableCost;
      const totalRevenue = p.sellingPrice * p.monthlyQty;
      const totalCM = unitCM * p.monthlyQty;

      return { ...p, unitVariableCost, totalUnitVariableCost, unitCM, totalCM, totalRevenue };
  });

  const totalRevenue = productsAnalysis.reduce((acc, p) => acc + p.totalRevenue, 0);
  const totalCM = productsAnalysis.reduce((acc, p) => acc + p.totalCM, 0);
  const totalVariableCosts = productsAnalysis.reduce((acc, p) => acc + (p.totalUnitVariableCost * p.monthlyQty), 0);
  
  const operatingProfit = totalCM - totalFixedCostsEconomic;
  const breakEvenValue = totalCM > 0 ? (totalFixedCostsEconomic * totalRevenue) / totalCM : 0;
  const payback = operatingProfit > 0 ? investments.reduce((acc,i)=>acc+(i.quantity*i.value),0) / operatingProfit : 0;


  // --- HANDLERS ---
  const handleAddProduct = () => {
      if(newProd.name) {
          setProducts([...products, { 
              ...newProd, 
              id: Math.random().toString(), 
              monthlyQty: Number(newProd.monthlyQty), 
              sellingPrice: Number(newProd.sellingPrice),
              period: newProd.period || 'Mensal'
          } as Product]);
          setNewProd({ type: 'Fabricacao', unit: 'un', monthlyQty: 0, sellingPrice: 0, name: '', period: 'Mensal' });
      }
  };

  const handleAddInvestment = () => {
      if(newInvest.description) {
          setInvestments([...investments, { ...newInvest, id: Math.random().toString(), quantity: Number(newInvest.quantity), value: Number(newInvest.value), lifeSpan: Number(newInvest.lifeSpan), residualValue: Number(newInvest.residualValue) } as Investment]);
          setNewInvest({ quantity: 1, value: 0, lifeSpan: 5, residualValue: 0, description: '' });
      }
  };

  const handleAddMaterialToDb = () => {
      if(newMaterial.description) {
          setRawMaterials([...rawMaterials, { ...newMaterial, id: Math.random().toString(), unitPrice: Number(newMaterial.unitPrice) } as RawMaterial]);
          setNewMaterial({ unit: 'kg', unitPrice: 0, description: '' });
      }
  };

  const handleAddMaterialToProduct = () => {
      if(selectedProdId && selectedMaterialId && qtyToAdd > 0) {
          const currentCost = productCosts[selectedProdId];
          const newMats = [...currentCost.materials, { materialId: selectedMaterialId, quantityUsed: qtyToAdd }];
          setProductCosts({...productCosts, [selectedProdId]: { ...currentCost, materials: newMats }});
          setQtyToAdd(0);
      }
  };

  // --- MENU CONFIG ---
  const menuItems = [
      { id: 'empreendimento', label: '1. Empreendimento', icon: Building2 },
      { id: 'produtos', label: '2. Produtos', icon: Package },
      { id: 'investimentos', label: '3. Investimentos', icon: Zap },
      { id: 'depreciacao', label: '4. Depreciação', icon: TrendingUp },
      { id: 'custofixo', label: '5. Custo Fixo', icon: Building2 },
      { id: 'producao', label: '6. Custo Variável (Prod)', icon: Factory },
      { id: 'revenda', label: '7. Custo Variável (Rev)', icon: ShoppingBag },
      { id: 'resultados', label: '8. Resultados', icon: PieChartIcon },
  ];

  return (
    <div className="flex h-[calc(100vh-100px)] bg-slate-100 border rounded-xl overflow-hidden shadow-2xl">
        
        {/* LATERAL NAVIGATION */}
        <div className={`bg-[#2c3e50] text-white flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-16'}`}>
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                {isSidebarOpen && <h2 className="font-bold text-lg tracking-tight">EVE System</h2>}
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-white/10 rounded">
                    <Menu className="w-5 h-5"/>
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-2">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveModule(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-4 ${
                            activeModule === item.id 
                            ? 'bg-white/10 border-brand-500 text-white' 
                            : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                        title={!isSidebarOpen ? item.label : ''}
                    >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {isSidebarOpen && <span>{item.label}</span>}
                    </button>
                ))}
            </div>

            <div className="p-4 border-t border-white/10 bg-[#233140]">
                {isSidebarOpen ? (
                    <div className="space-y-3">
                        <select className="w-full text-xs text-slate-800 p-2 rounded bg-white" value={selectedContactId} onChange={(e) => setSelectedContactId(e.target.value)}>
                            <option value="">Carregar Empreendimento...</option>
                            {contacts.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
                        </select>
                        <button onClick={() => onComplete && selectedContactId && onComplete(selectedContactId)} className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                            <Save className="w-4 h-4"/> Salvar Estudo
                        </button>
                    </div>
                ) : (
                    <button className="w-full flex justify-center text-brand-500 hover:text-white"><Save className="w-5 h-5"/></button>
                )}
            </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 bg-slate-50 overflow-y-auto p-6 lg:p-10 relative">
            
            {/* Header Title */}
            <div className="mb-6 flex justify-between items-end border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        {menuItems.find(i => i.id === activeModule)?.icon && React.createElement(menuItems.find(i => i.id === activeModule)!.icon, { className: 'w-8 h-8 text-brand-600' })}
                        {menuItems.find(i => i.id === activeModule)?.label}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">{enterprise.name ? `Análise: ${enterprise.name}` : 'Novo Estudo de Viabilidade'}</p>
                </div>
            </div>

            {/* --- 1. EMPREENDIMENTO --- */}
            {activeModule === 'empreendimento' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-4xl animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Empreendimento</label>
                            <input className="w-full border p-2 rounded bg-slate-50" value={enterprise.name} onChange={e => setEnterprise({...enterprise, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Atividade Econômica</label>
                            <input className="w-full border p-2 rounded bg-slate-50" value={enterprise.activity} onChange={e => setEnterprise({...enterprise, activity: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CNPJ</label>
                            <input className="w-full border p-2 rounded bg-slate-50" value={enterprise.cnpj} onChange={e => setEnterprise({...enterprise, cnpj: e.target.value})} />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Endereço Completo</label>
                            <input className="w-full border p-2 rounded bg-slate-50" value={`${enterprise.address} - ${enterprise.city}`} disabled />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                            <input className="w-full border p-2 rounded bg-slate-50" value={enterprise.email} onChange={e => setEnterprise({...enterprise, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone</label>
                            <input className="w-full border p-2 rounded bg-slate-50" value={enterprise.phone} onChange={e => setEnterprise({...enterprise, phone: e.target.value})} />
                        </div>
                        
                        {/* Specific fields from print */}
                        <div className="col-span-2 bg-slate-50 p-4 rounded border border-slate-100 mt-4">
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-3">Situação Atual</label>
                            <div className="flex gap-4">
                                {['Em funcionamento', 'Em implantação', 'Em reestruturação'].map(opt => (
                                    <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input type="radio" checked={enterprise.situation === opt} onChange={() => setEnterprise({...enterprise, situation: opt})} className="text-brand-600"/> {opt}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sócios (Homens)</label>
                            <input type="number" className="w-full border p-2 rounded bg-slate-50" value={enterprise.partnersM} onChange={e => setEnterprise({...enterprise, partnersM: Number(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sócios (Mulheres)</label>
                            <input type="number" className="w-full border p-2 rounded bg-slate-50" value={enterprise.partnersF} onChange={e => setEnterprise({...enterprise, partnersF: Number(e.target.value)})} />
                        </div>
                    </div>
                </div>
            )}

            {/* --- 2. PRODUTOS --- */}
            {activeModule === 'produtos' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-[#b0c4de] text-slate-800 text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-4 py-3 text-left">Nome do Produto</th>
                                    <th className="px-4 py-3 text-right">Quantidade</th>
                                    <th className="px-4 py-3 text-center">Unidade</th>
                                    <th className="px-4 py-3 text-center">Período</th>
                                    <th className="px-4 py-3 text-right">Preço de Venda</th>
                                    <th className="px-4 py-3 text-center w-20">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {products.map((p, i) => (
                                    <tr key={p.id} className="hover:bg-blue-50">
                                        <td className="px-4 py-3 font-medium">{p.name}</td>
                                        <td className="px-4 py-3 text-right">{p.monthlyQty}</td>
                                        <td className="px-4 py-3 text-center">{p.unit}</td>
                                        <td className="px-4 py-3 text-center">{p.period}</td>
                                        <td className="px-4 py-3 text-right">{toCurrency(p.sellingPrice)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => setProducts(products.filter(x => x.id !== p.id))}><Trash2 className="w-4 h-4 text-blue-400 hover:text-red-500"/></button>
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-slate-50">
                                    <td className="px-4 py-2"><input placeholder="Produto..." className="w-full border rounded px-2 py-1" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})}/></td>
                                    <td className="px-4 py-2"><input type="number" placeholder="0" className="w-full border rounded px-2 py-1 text-right" value={newProd.monthlyQty} onChange={e => setNewProd({...newProd, monthlyQty: Number(e.target.value)})}/></td>
                                    <td className="px-4 py-2"><input placeholder="un" className="w-full border rounded px-2 py-1 text-center" value={newProd.unit} onChange={e => setNewProd({...newProd, unit: e.target.value})}/></td>
                                    <td className="px-4 py-2">
                                        <select className="w-full border rounded px-2 py-1 text-center bg-white" value={newProd.period} onChange={e => setNewProd({...newProd, period: e.target.value})}>
                                            <option value="Mensal">Mensal</option>
                                            <option value="Semanal">Semanal</option>
                                            <option value="Diário">Diário</option>
                                            <option value="Anual">Anual</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-2"><input type="number" placeholder="0,00" className="w-full border rounded px-2 py-1 text-right" value={newProd.sellingPrice} onChange={e => setNewProd({...newProd, sellingPrice: Number(e.target.value)})}/></td>
                                    <td className="px-4 py-2 text-center">
                                        <button onClick={handleAddProduct} className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"><Plus className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- 3. INVESTIMENTOS --- */}
            {activeModule === 'investimentos' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-[#b0c4de] text-slate-800 text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-4 py-3 text-left">Itens (Máquinas, Móveis, Utensílios)</th>
                                    <th className="px-4 py-3 text-right">Quant.</th>
                                    <th className="px-4 py-3 text-right">Valor Unit.</th>
                                    <th className="px-4 py-3 text-right">Valor Total</th>
                                    <th className="w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {investments.map(inv => (
                                    <tr key={inv.id} className="hover:bg-blue-50">
                                        <td className="px-4 py-3">{inv.description}</td>
                                        <td className="px-4 py-3 text-right">{inv.quantity}</td>
                                        <td className="px-4 py-3 text-right">{toCurrency(inv.value)}</td>
                                        <td className="px-4 py-3 text-right font-bold text-slate-700">{toCurrency(inv.quantity * inv.value)}</td>
                                        <td className="px-4 py-3 text-center"><button onClick={() => setInvestments(investments.filter(x => x.id !== inv.id))}><Trash2 className="w-4 h-4 text-blue-400"/></button></td>
                                    </tr>
                                ))}
                                <tr className="bg-slate-50">
                                    <td className="px-4 py-2"><input placeholder="Novo Investimento..." className="w-full border rounded px-2 py-1" value={newInvest.description} onChange={e => setNewInvest({...newInvest, description: e.target.value})}/></td>
                                    <td className="px-4 py-2"><input type="number" className="w-full border rounded px-2 py-1 text-right" value={newInvest.quantity} onChange={e => setNewInvest({...newInvest, quantity: Number(e.target.value)})}/></td>
                                    <td className="px-4 py-2"><input type="number" className="w-full border rounded px-2 py-1 text-right" value={newInvest.value} onChange={e => setNewInvest({...newInvest, value: Number(e.target.value)})}/></td>
                                    <td className="px-4 py-2 text-right text-slate-400">-</td>
                                    <td className="px-4 py-2 text-center"><button onClick={handleAddInvestment} className="bg-blue-500 text-white p-1 rounded"><Plus className="w-4 h-4"/></button></td>
                                </tr>
                            </tbody>
                            <tfoot className="bg-slate-100 font-bold text-slate-700">
                                <tr>
                                    <td colSpan={3} className="px-4 py-3 text-right uppercase text-xs">Total:</td>
                                    <td className="px-4 py-3 text-right text-brand-700">{toCurrency(investments.reduce((acc, i) => acc + (i.quantity * i.value), 0))}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* --- 4. DEPRECIAÇÃO --- */}
            {activeModule === 'depreciacao' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                            <TrendingDown className="w-5 h-5 text-blue-600"/>
                            <h3 className="font-bold text-slate-700">Quadro de Depreciação</h3>
                        </div>
                        <table className="w-full text-sm">
                            <thead className="bg-[#b0c4de] text-slate-800 text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-4 py-3 text-left">Itens</th>
                                    <th className="px-4 py-3 text-right">Quant.</th>
                                    <th className="px-4 py-3 text-right">Valor Unit.</th>
                                    <th className="px-4 py-3 text-right">Vida Útil (Anos)</th>
                                    <th className="px-4 py-3 text-right">Valor Residual</th>
                                    <th className="px-4 py-3 text-right">Depreciação Anual</th>
                                    <th className="px-4 py-3 text-right">Depreciação Mensal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {depreciationItems.map(d => (
                                    <tr key={d.id} className="hover:bg-blue-50">
                                        <td className="px-4 py-3">{d.description}</td>
                                        <td className="px-4 py-3 text-right">{d.quantity}</td>
                                        <td className="px-4 py-3 text-right">{toCurrency(d.value)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <input className="w-12 border rounded text-right p-1 bg-transparent" value={d.lifeSpan} onChange={(e) => {
                                                const newInvestments = [...investments];
                                                const target = newInvestments.find(i => i.id === d.id);
                                                if (target) target.lifeSpan = Number(e.target.value);
                                                setInvestments(newInvestments);
                                            }}/>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <input className="w-20 border rounded text-right p-1 bg-transparent" value={d.residualValue} onChange={(e) => {
                                                const newInvestments = [...investments];
                                                const target = newInvestments.find(i => i.id === d.id);
                                                if (target) target.residualValue = Number(e.target.value);
                                                setInvestments(newInvestments);
                                            }}/>
                                        </td>
                                        <td className="px-4 py-3 text-right">{toCurrency(d.annualDep)}</td>
                                        <td className="px-4 py-3 text-right font-bold text-slate-700">{toCurrency(d.monthlyDep)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-[#8baac4] text-white font-bold">
                                <tr>
                                    <td colSpan={6} className="px-4 py-3 text-right">TOTAL:</td>
                                    <td className="px-4 py-3 text-right">{toCurrency(totalDepreciationMonthly)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* --- 5. CUSTO FIXO --- */}
            {activeModule === 'custofixo' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                            <ArrowRight className="w-5 h-5 text-blue-600"/>
                            <h3 className="font-bold text-slate-700">Custo Fixo Mensal</h3>
                        </div>
                        <table className="w-full text-sm">
                            <thead className="bg-[#b0c4de] text-slate-800 text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-4 py-3 text-left">Itens</th>
                                    <th className="px-4 py-3 text-right">Valor</th>
                                    <th className="w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {fixedCosts.map(fc => (
                                    <tr key={fc.id} className="hover:bg-blue-50">
                                        <td className="px-4 py-3">
                                            <input className="w-full bg-transparent outline-none" value={fc.description} onChange={e => {
                                                const n = [...fixedCosts]; n.find(x => x.id === fc.id)!.description = e.target.value; setFixedCosts(n);
                                            }}/>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <input type="number" className="w-full bg-transparent outline-none text-right" value={fc.value} onChange={e => {
                                                const n = [...fixedCosts]; n.find(x => x.id === fc.id)!.value = Number(e.target.value); setFixedCosts(n);
                                            }}/>
                                        </td>
                                        <td className="px-4 py-3 text-center"><button onClick={() => setFixedCosts(fixedCosts.filter(x => x.id !== fc.id))}><Trash2 className="w-4 h-4 text-blue-400"/></button></td>
                                    </tr>
                                ))}
                                <tr className="bg-blue-50/50">
                                    <td className="px-4 py-3 font-medium text-slate-600">Depreciação Mensal (Automático)</td>
                                    <td className="px-4 py-3 text-right font-medium text-slate-600">{toCurrency(totalDepreciationMonthly)}</td>
                                    <td></td>
                                </tr>
                                <tr className="bg-slate-50">
                                    <td className="px-4 py-2"><input placeholder="Nova Despesa..." className="w-full border rounded px-2 py-1" value={newFixed.description} onChange={e => setNewFixed({...newFixed, description: e.target.value})}/></td>
                                    <td className="px-4 py-2"><input type="number" className="w-full border rounded px-2 py-1 text-right" value={newFixed.value} onChange={e => setNewFixed({...newFixed, value: Number(e.target.value)})}/></td>
                                    <td className="px-4 py-2 text-center"><button onClick={() => { if(newFixed.description){ setFixedCosts([...fixedCosts, {id: Math.random().toString(), ...newFixed} as FixedCost]); setNewFixed({value:0}); }}} className="bg-blue-500 text-white p-1 rounded"><Plus className="w-4 h-4"/></button></td>
                                </tr>
                            </tbody>
                            <tfoot className="bg-[#8baac4] text-white font-bold">
                                <tr>
                                    <td className="px-4 py-3 text-right">TOTAL:</td>
                                    <td className="px-4 py-3 text-right">{toCurrency(totalFixedCostsEconomic)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* --- 6. CUSTO VARIÁVEL (PRODUÇÃO) --- */}
            {activeModule === 'producao' && (
                <div className="space-y-6 animate-fade-in">
                    
                    {/* Header: Enterprise & Activity */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 mb-4 border-b pb-2">
                            <TrendingUp className="w-6 h-6 text-[#3b5998]"/>
                            <h2 className="text-xl font-bold text-[#3b5998]">Custo Variável de Produção</h2>
                        </div>
                        <div className="text-sm space-y-1">
                            <p><span className="font-bold text-slate-700">Empreendimento:</span> {enterprise.name}</p>
                            <p><span className="font-bold text-slate-700">Atividade:</span> {enterprise.activity}</p>
                        </div>
                        <div className="mt-4">
                            <select className="border p-2 rounded text-sm w-full md:w-1/2 bg-white" value={selectedProdId} onChange={e => setSelectedProdId(e.target.value)}>
                                {products.filter(p => p.type === 'Fabricacao').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {selectedProdId && productCosts[selectedProdId] && (
                        <div className="space-y-6">
                            
                            {/* --- TOP GRID: Product Details & Sales Costs --- */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200">
                                
                                {/* 1. Production Planned */}
                                <div className="mb-6">
                                    <h4 className="text-xs font-bold text-slate-600 uppercase mb-2 border-b pb-1">Produção Planejada: <span className="text-[#3b5998]">{products.find(p=>p.id===selectedProdId)?.name}</span></h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="text-[10px] text-slate-400 uppercase font-bold">Quantidade</label>
                                            <p className="font-medium text-sm border-b border-slate-200 py-1">{products.find(p=>p.id===selectedProdId)?.monthlyQty}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-400 uppercase font-bold">Unidade</label>
                                            <p className="font-medium text-sm border-b border-slate-200 py-1">{products.find(p=>p.id===selectedProdId)?.unit}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-400 uppercase font-bold">Período</label>
                                            <p className="font-medium text-sm border-b border-slate-200 py-1">{products.find(p=>p.id===selectedProdId)?.period}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-400 uppercase font-bold">Preço de Venda Unitário</label>
                                            <p className="font-medium text-sm border-b border-slate-200 py-1">{toCurrency(products.find(p=>p.id===selectedProdId)?.sellingPrice || 0)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Sales Costs & Margins (Calculated based on Batch Cost) */}
                                {(() => {
                                    // Calculate Batch Cost first to show Unit Var Cost here
                                    const pc = productCosts[selectedProdId];
                                    const prod = products.find(p => p.id === selectedProdId);
                                    if (!prod || !pc) return null;

                                    const rawCost = pc.materials.reduce((acc, m) => {
                                        const raw = rawMaterials.find(r => r.id === m.materialId);
                                        return acc + ((raw?.unitPrice || 0) * m.quantityUsed);
                                    }, 0);
                                    
                                    const totalBatchCost = rawCost * (1 + (pc.lossesRate / 100));
                                    const unitVarCost = pc.batchSize > 0 ? totalBatchCost / pc.batchSize : 0;
                                    
                                    const taxVal = prod.sellingPrice * (pc.taxRate / 100);
                                    const commVal = prod.sellingPrice * (pc.commissionRate / 100);
                                    const contribMargin = prod.sellingPrice - unitVarCost - taxVal - commVal;

                                    return (
                                        <div className="mb-6">
                                            <h4 className="text-xs font-bold text-slate-600 uppercase mb-2 border-b pb-1">Custos sobre a venda</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div>
                                                    <label className="text-[10px] text-slate-400 uppercase font-bold">Comissão %</label>
                                                    <input 
                                                        type="number" 
                                                        className="w-full bg-blue-50 border border-blue-100 rounded px-2 py-1 text-sm text-slate-700"
                                                        value={pc.commissionRate}
                                                        onChange={e => {
                                                            const n = {...productCosts}; n[selectedProdId].commissionRate = parseFloat(e.target.value); setProductCosts(n);
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-slate-400 uppercase font-bold">Impostos %</label>
                                                    <input 
                                                        type="number" 
                                                        className="w-full bg-blue-50 border border-blue-100 rounded px-2 py-1 text-sm text-slate-700"
                                                        value={pc.taxRate}
                                                        onChange={e => {
                                                            const n = {...productCosts}; n[selectedProdId].taxRate = parseFloat(e.target.value); setProductCosts(n);
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-slate-400 uppercase font-bold">Custo Variável Unitário R$</label>
                                                    <p className="font-bold text-sm text-slate-800 py-1">{unitVarCost.toFixed(2)}</p>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-slate-400 uppercase font-bold">Margem de Contribuição R$</label>
                                                    <p className="font-bold text-sm text-slate-800 py-1">{contribMargin.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* 3. Batch Definition */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-600 uppercase mb-2 border-b pb-1">Quantidade produzida num processo produtivo</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="text-[10px] text-slate-400 uppercase font-bold">Quantidade</label>
                                            <input 
                                                type="number" 
                                                className="w-full bg-blue-50 border border-blue-100 rounded px-2 py-1 text-sm text-slate-700"
                                                value={productCosts[selectedProdId].batchSize}
                                                onChange={e => {
                                                    const n = {...productCosts}; n[selectedProdId].batchSize = parseFloat(e.target.value); setProductCosts(n);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-400 uppercase font-bold">Unidade</label>
                                            <p className="font-medium text-sm py-1">{products.find(p=>p.id===selectedProdId)?.unit}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* --- TABLES SECTION --- */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                
                                {/* Left Table: Raw Materials DB */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                                    <div className="bg-[#3b5998] text-white px-4 py-2 font-bold text-sm text-center">Levantamento dos Preços</div>
                                    <div className="flex-1 overflow-y-auto max-h-[400px]">
                                        <table className="w-full text-xs">
                                            <thead className="bg-[#8baac4] text-white">
                                                <tr>
                                                    <th className="p-2 text-left">Item</th>
                                                    <th className="p-2 text-right">Unidade</th>
                                                    <th className="p-2 text-right">Preço</th>
                                                    <th className="p-2"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {rawMaterials.map(m => (
                                                    <tr key={m.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedMaterialId(m.id)}>
                                                        <td className={`p-2 ${selectedMaterialId === m.id ? 'font-bold text-[#3b5998]' : ''}`}>{m.description}</td>
                                                        <td className="p-2 text-right">{m.unit}</td>
                                                        <td className="p-2 text-right">{toCurrency(m.unitPrice)}</td>
                                                        <td className="p-2 text-center">
                                                            {selectedMaterialId === m.id && <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto"></div>}
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-slate-50">
                                                    <td className="p-1"><input placeholder="Novo Item" className="w-full border rounded px-1" value={newMaterial.description || ''} onChange={e=>setNewMaterial({...newMaterial, description: e.target.value})}/></td>
                                                    <td className="p-1"><input placeholder="Un" className="w-full border rounded px-1 text-right" value={newMaterial.unit || ''} onChange={e=>setNewMaterial({...newMaterial, unit: e.target.value})}/></td>
                                                    <td className="p-1"><input placeholder="0.00" type="number" className="w-full border rounded px-1 text-right" value={newMaterial.unitPrice || ''} onChange={e=>setNewMaterial({...newMaterial, unitPrice: parseFloat(e.target.value)})}/></td>
                                                    <td className="p-1 text-center"><button onClick={handleAddMaterialToDb} className="text-blue-600 font-bold">+</button></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Right Table: Batch Recipe */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                                    <div className="bg-[#3b5998] text-white px-4 py-2 font-bold text-sm flex justify-between items-center">
                                        <span>Consumo num Processo Produtivo</span>
                                        <div className="flex items-center gap-1">
                                            <input 
                                                type="number" 
                                                placeholder="Qtd" 
                                                className="w-16 text-slate-800 text-xs px-1 py-0.5 rounded"
                                                value={qtyToAdd || ''}
                                                onChange={e => setQtyToAdd(parseFloat(e.target.value))}
                                            />
                                            <button 
                                                onClick={handleAddMaterialToProduct} 
                                                disabled={!selectedMaterialId}
                                                className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-xs uppercase font-bold"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto max-h-[400px]">
                                        <table className="w-full text-xs">
                                            <thead className="bg-[#8baac4] text-white">
                                                <tr>
                                                    <th className="p-2 text-right">Quantidade</th>
                                                    <th className="p-2 text-center">Unidade</th>
                                                    <th className="p-2 text-right">Custo</th>
                                                    <th className="w-6"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {productCosts[selectedProdId].materials.map((m, idx) => {
                                                    const raw = rawMaterials.find(r => r.id === m.materialId);
                                                    if (!raw) return null;
                                                    return (
                                                        <tr key={idx}>
                                                            <td className="p-2 text-right">{m.quantityUsed}</td>
                                                            <td className="p-2 text-center">{raw.unit}</td>
                                                            <td className="p-2 text-right">{toCurrency(m.quantityUsed * raw.unitPrice)}</td>
                                                            <td className="p-2 text-center">
                                                                <button onClick={()=>{
                                                                    const pc = {...productCosts};
                                                                    pc[selectedProdId].materials = pc[selectedProdId].materials.filter((_, i) => i !== idx);
                                                                    setProductCosts(pc);
                                                                }}><Trash2 className="w-3 h-3 text-red-400"/></button>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Footer Calculation */}
                                    <div className="bg-slate-50 border-t border-slate-200 p-2 text-xs space-y-1">
                                        {(() => {
                                            const pc = productCosts[selectedProdId];
                                            const subtotal = pc.materials.reduce((acc, m) => {
                                                const raw = rawMaterials.find(r => r.id === m.materialId);
                                                return acc + ((raw?.unitPrice || 0) * m.quantityUsed);
                                            }, 0);
                                            const lossesVal = subtotal * (pc.lossesRate / 100);
                                            const total = subtotal + lossesVal;

                                            return (
                                                <>
                                                    <div className="flex justify-between px-2">
                                                        <span className="font-bold text-slate-600">Subtotal</span>
                                                        <span className="font-bold text-slate-800">{toCurrency(subtotal)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center px-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-slate-600">Perdas %</span>
                                                            <input 
                                                                type="number" 
                                                                className="w-12 bg-white border border-slate-300 rounded text-right px-1"
                                                                value={pc.lossesRate}
                                                                onChange={e => {
                                                                    const n = {...productCosts}; n[selectedProdId].lossesRate = parseFloat(e.target.value); setProductCosts(n);
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="font-bold text-slate-800">{toCurrency(lossesVal)}</span>
                                                    </div>
                                                    <div className="flex justify-between px-2 pt-1 border-t border-slate-200 bg-[#8baac4] text-white p-1 rounded-b">
                                                        <span className="font-bold uppercase">Total</span>
                                                        <span className="font-bold">{toCurrency(total)}</span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- 7. CUSTO VARIÁVEL (REVENDA) --- */}
            {activeModule === 'revenda' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                         <ShoppingBag className="w-6 h-6 text-blue-600"/>
                         <h2 className="text-lg font-bold text-slate-700">Informações de Compra e Venda</h2>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="grid grid-cols-2 bg-[#3b5998] text-white font-bold text-center py-2 text-sm">
                            <div>Informações de Compra</div>
                            <div>Informações de Venda</div>
                        </div>
                        <table className="w-full text-xs">
                             <thead className="bg-[#8baac4] text-white">
                                 <tr>
                                     <th className="p-3 text-left">Produtos</th>
                                     <th className="p-3 text-right">Preço Compra</th>
                                     <th className="p-3 text-right">% Perda</th>
                                     <th className="p-3 text-right">Custo Unit</th>
                                     {/* Divider */}
                                     <th className="p-3 text-right border-l border-white/20">Preço Venda</th>
                                     <th className="p-3 text-right">Impostos %</th>
                                     <th className="p-3 text-right">Comissão %</th>
                                     <th className="p-3 text-right">Margem Contrib.</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100">
                                 {products.filter(p => p.type === 'Revenda').map(p => {
                                     const rc = resaleCosts[p.id];
                                     if (!rc) return null;
                                     const unitCost = rc.purchasePrice * (1 + rc.lossesRate/100);
                                     const variableExp = p.sellingPrice * ((rc.taxRate + rc.commissionRate)/100);
                                     const cm = p.sellingPrice - unitCost - variableExp;

                                     return (
                                         <tr key={p.id} className="hover:bg-blue-50">
                                             <td className="p-3 font-bold text-slate-700">{p.name}</td>
                                             <td className="p-3 text-right">
                                                 <input className="w-20 text-right bg-slate-50 border rounded" type="number" value={rc.purchasePrice} onChange={e=>{
                                                     const r = {...resaleCosts}; r[p.id].purchasePrice = Number(e.target.value); setResaleCosts(r);
                                                 }}/>
                                             </td>
                                             <td className="p-3 text-right">
                                                 <input className="w-12 text-right bg-slate-50 border rounded" type="number" value={rc.lossesRate} onChange={e=>{
                                                     const r = {...resaleCosts}; r[p.id].lossesRate = Number(e.target.value); setResaleCosts(r);
                                                 }}/>
                                             </td>
                                             <td className="p-3 text-right font-bold">{toCurrency(unitCost)}</td>
                                             
                                             <td className="p-3 text-right border-l border-slate-200">{toCurrency(p.sellingPrice)}</td>
                                             <td className="p-3 text-right">
                                                 <input className="w-12 text-right bg-slate-50 border rounded" type="number" value={rc.taxRate} onChange={e=>{
                                                     const r = {...resaleCosts}; r[p.id].taxRate = Number(e.target.value); setResaleCosts(r);
                                                 }}/>
                                             </td>
                                             <td className="p-3 text-right">
                                                 <input className="w-12 text-right bg-slate-50 border rounded" type="number" value={rc.commissionRate} onChange={e=>{
                                                     const r = {...resaleCosts}; r[p.id].commissionRate = Number(e.target.value); setResaleCosts(r);
                                                 }}/>
                                             </td>
                                             <td className={`p-3 text-right font-black ${cm > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                 {toCurrency(cm)}
                                             </td>
                                         </tr>
                                     );
                                 })}
                             </tbody>
                        </table>
                        {products.filter(p => p.type === 'Revenda').length === 0 && (
                            <div className="p-8 text-center text-slate-400">Nenhum produto de revenda cadastrado.</div>
                        )}
                    </div>
                </div>
            )}

            {/* --- 8. RESULTADOS --- */}
            {activeModule === 'resultados' && (
                <div className="space-y-6 animate-fade-in">
                    
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                             <p className="text-xs font-bold text-slate-500 uppercase">Receita Total</p>
                             <p className="text-2xl font-black text-blue-600">{toCurrency(totalRevenue)}</p>
                         </div>
                         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                             <p className="text-xs font-bold text-slate-500 uppercase">Margem Contrib.</p>
                             <p className="text-2xl font-black text-emerald-600">{toCurrency(totalCM)}</p>
                         </div>
                         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                             <p className="text-xs font-bold text-slate-500 uppercase">Lucro Operacional</p>
                             <p className={`text-2xl font-black ${operatingProfit >= 0 ? 'text-slate-800' : 'text-red-600'}`}>{toCurrency(operatingProfit)}</p>
                         </div>
                         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                             <p className="text-xs font-bold text-slate-500 uppercase">Lucratividade</p>
                             <p className={`text-2xl font-black ${totalRevenue > 0 && operatingProfit/totalRevenue > 0.1 ? 'text-brand-600' : 'text-slate-600'}`}>
                                 {totalRevenue > 0 ? toPercent((operatingProfit/totalRevenue)*100) : '0%'}
                             </p>
                         </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* DRE */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                             <div className="p-4 border-b bg-slate-50 font-bold text-slate-700">DRE - Demonstrativo de Resultado</div>
                             <div className="p-6 space-y-3 text-sm">
                                 <div className="flex justify-between">
                                     <span className="font-bold text-slate-700">(+) Receita Bruta</span>
                                     <span className="font-bold text-blue-600">{toCurrency(totalRevenue)}</span>
                                 </div>
                                 <div className="flex justify-between pl-4 text-slate-500 border-b pb-2">
                                     <span>(-) Custos Variáveis Totais</span>
                                     <span>{toCurrency(totalVariableCosts)}</span>
                                 </div>
                                 
                                 <div className="flex justify-between bg-emerald-50 p-2 rounded">
                                     <span className="font-bold text-emerald-800">(=) Margem de Contribuição</span>
                                     <span className="font-bold text-emerald-800">{toCurrency(totalCM)}</span>
                                 </div>

                                 <div className="flex justify-between pl-4 text-slate-500 pt-2">
                                     <span>(-) Custos Fixos (Desembolso)</span>
                                     <span>{toCurrency(totalFixedCostsCash)}</span>
                                 </div>
                                 <div className="flex justify-between pl-4 text-slate-500 border-b pb-2">
                                     <span>(-) Depreciação (Econômico)</span>
                                     <span>{toCurrency(totalDepreciationMonthly)}</span>
                                 </div>

                                 <div className={`flex justify-between p-3 rounded text-lg ${operatingProfit >= 0 ? 'bg-slate-800 text-white' : 'bg-red-100 text-red-700'}`}>
                                     <span className="font-bold">(=) Resultado Operacional</span>
                                     <span className="font-bold">{toCurrency(operatingProfit)}</span>
                                 </div>
                             </div>
                        </div>

                        {/* Indicators */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5"/> Ponto de Equilíbrio</h3>
                                <div className="flex items-end gap-4">
                                    <div className="text-3xl font-black text-slate-800">{toCurrency(breakEvenValue)}</div>
                                    <div className="text-sm text-slate-500 mb-1">necessários para cobrir custos</div>
                                </div>
                                <div className="w-full bg-slate-100 h-4 rounded-full mt-4 overflow-hidden relative">
                                    <div className="absolute left-0 top-0 bottom-0 bg-slate-300 w-full"></div> 
                                    <div 
                                        className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ${totalRevenue > breakEvenValue ? 'bg-emerald-500' : 'bg-brand-500'}`}
                                        style={{ width: `${Math.min((totalRevenue / (breakEvenValue * 1.5)) * 100, 100)}%` }}
                                    ></div>
                                    <div 
                                        className="absolute top-0 bottom-0 w-1 bg-black z-10"
                                        style={{ left: `${Math.min((breakEvenValue / (breakEvenValue * 1.5)) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-slate-400 mt-1">
                                    <span>R$ 0</span>
                                    <span>Meta: {toCurrency(breakEvenValue)}</span>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Zap className="w-5 h-5"/> Payback (Retorno)</h3>
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl font-black text-slate-800">{payback <= 0 || payback === Infinity ? 'Indefinido' : payback.toFixed(1)}</div>
                                    <div className="text-sm text-slate-500">meses estimados</div>
                                </div>
                                <p className="text-xs text-slate-400 mt-2">Investimento total: {toCurrency(investments.reduce((acc,i)=>acc+(i.quantity*i.value),0))}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    </div>
  );
};