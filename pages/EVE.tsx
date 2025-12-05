import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Package, TrendingUp, TrendingDown, Calculator, 
  Plus, Trash2, Save, ShoppingBag, DollarSign, 
  Factory, Zap, LayoutGrid, ChevronRight, Search, 
  ArrowRight, Percent, FileText, CheckCircle2, AlertTriangle, Menu,
  PieChart as PieChartIcon, Printer
} from 'lucide-react';
import { Contact } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';

// --- HELPER FUNCTIONS ---
const toCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const toPercent = (value: number) => `${value.toFixed(2).replace('.', ',')}%`;
const toDec = (value: number) => value.toFixed(2).replace('.', ',');

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
  residualValue: number; // Valor de revenda ao final
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
    unitPrice: number;
}

// Logic: Production Cost per Product
interface ProductionCostData {
    productId: string;
    batchSize: number; // Tamanho do Lote
    materials: {
        materialId: string;
        quantityUsed: number;
    }[];
    lossesRate: number; // %
    commissionRate: number; // %
    taxRate: number; // %
}

// Logic: Resale Cost per Product
interface ResaleCostData {
    productId: string;
    purchasePrice: number;
    lossesRate: number; // %
    commissionRate: number; // %
    taxRate: number; // %
}

// --- MAIN COMPONENT ---
export const EVE: React.FC<EVEProps> = ({ contacts = [], onComplete, initialContactId }) => {
  const [activeModule, setActiveModule] = useState<string>('empreendimento');
  const [selectedContactId, setSelectedContactId] = useState<string>(initialContactId || '');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // --- 1. EMPREENDIMENTO DATA ---
  const [enterprise, setEnterprise] = useState({
    name: '', cnpj: '', activity: '', address: '', city: '', phone: '', email: '', 
    situation: 'Em funcionamento', partnersM: 0, partnersF: 0, organization: 'Grupo Informal'
  });

  // --- 2. PRODUTOS DATA ---
  const [products, setProducts] = useState<Product[]>([]);
  const [newProd, setNewProd] = useState<Partial<Product>>({ type: 'Fabricacao', unit: 'un', monthlyQty: 0, sellingPrice: 0, period: 'Mensal' });

  // --- 3. INVESTIMENTOS DATA ---
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [newInvest, setNewInvest] = useState<Partial<Investment>>({ quantity: 1, value: 0, lifeSpan: 5, residualValue: 0 });

  // --- 5. CUSTO FIXO DATA ---
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([
      { id: '1', description: 'Energia Elétrica', value: 0 },
      { id: '2', description: 'Água', value: 0 },
      { id: '3', description: 'Aluguel', value: 0 },
      { id: '4', description: 'Internet/Telefone', value: 0 },
      { id: '5', description: 'Pró-Labore', value: 1412.00 },
      { id: '6', description: 'Contador/MEI', value: 75.00 },
      { id: '7', description: 'Manutenção', value: 0 },
  ]);
  const [newFixed, setNewFixed] = useState<Partial<FixedCost>>({ value: 0 });

  // --- 6 & 7. CUSTO VARIÁVEL (DB) ---
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([
      { id: 'm1', description: 'Material A', unit: 'kg', unitPrice: 10.00 },
      { id: 'm2', description: 'Embalagem', unit: 'un', unitPrice: 0.50 },
  ]);
  const [newMaterial, setNewMaterial] = useState<Partial<RawMaterial>>({ unit: 'un', unitPrice: 0 });

  const [prodCosts, setProdCosts] = useState<Record<string, ProductionCostData>>({});
  const [resaleCosts, setResaleCosts] = useState<Record<string, ResaleCostData>>({});

  // UI Helpers
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
                organization: c.organization || 'Grupo Informal'
            });
        }
    }
  }, [selectedContactId, contacts]);

  // Ensure Cost Objects exist for products
  useEffect(() => {
      products.forEach(p => {
          if (p.type === 'Fabricacao' && !prodCosts[p.id]) {
              setProdCosts(prev => ({...prev, [p.id]: { productId: p.id, batchSize: 1, commissionRate: 0, taxRate: 0, lossesRate: 0, materials: [] }}));
          }
          if (p.type === 'Revenda' && !resaleCosts[p.id]) {
              setResaleCosts(prev => ({...prev, [p.id]: { productId: p.id, purchasePrice: 0, taxRate: 0, commissionRate: 0, lossesRate: 0 }}));
          }
      });
      if (products.length > 0 && !selectedProdId) setSelectedProdId(products[0].id);
  }, [products]);

  // --- CALCULATIONS (THE ENGINE) ---

  // 1. Depreciation (Monthly)
  const depreciationTotal = investments.reduce((acc, item) => {
      const depreciableValue = (item.quantity * item.value) - item.residualValue;
      const monthlyDep = item.lifeSpan > 0 ? depreciableValue / (item.lifeSpan * 12) : 0;
      return acc + monthlyDep;
  }, 0);

  // 2. Fixed Costs (Total Economic)
  const fixedCostsTotalCash = fixedCosts.reduce((acc, item) => acc + item.value, 0);
  const fixedCostsTotalEconomic = fixedCostsTotalCash + depreciationTotal;

  // 3. Variable Costs & Margins (Per Product)
  const analyzedProducts = products.map(p => {
      let unitVarCost = 0;
      let tax = 0;
      let comm = 0;

      if (p.type === 'Fabricacao' && prodCosts[p.id]) {
          const pc = prodCosts[p.id];
          const materialsCost = pc.materials.reduce((acc, m) => {
              const mat = rawMaterials.find(r => r.id === m.materialId);
              return acc + ((mat?.unitPrice || 0) * m.quantityUsed);
          }, 0);
          
          const batchCost = materialsCost * (1 + (pc.lossesRate / 100));
          unitVarCost = pc.batchSize > 0 ? batchCost / pc.batchSize : 0;
          tax = pc.taxRate;
          comm = pc.commissionRate;

      } else if (p.type === 'Revenda' && resaleCosts[p.id]) {
          const rc = resaleCosts[p.id];
          const cost = rc.purchasePrice * (1 + (rc.lossesRate / 100));
          unitVarCost = cost;
          tax = rc.taxRate;
          comm = rc.commissionRate;
      }

      const totalRevenue = p.sellingPrice * p.monthlyQty;
      const totalVarCost = (unitVarCost * p.monthlyQty) + (totalRevenue * ((tax + comm) / 100));
      const unitCM = p.sellingPrice - unitVarCost - (p.sellingPrice * ((tax + comm) / 100));
      const totalCM = unitCM * p.monthlyQty;

      return {
          ...p,
          unitVarCost,
          tax,
          comm,
          totalRevenue,
          totalVarCost,
          unitCM,
          totalCM
      };
  });

  // 4. General Results
  const totalRevenue = analyzedProducts.reduce((acc, p) => acc + p.totalRevenue, 0);
  const totalVariableCosts = analyzedProducts.reduce((acc, p) => acc + p.totalVarCost, 0);
  const totalCM = analyzedProducts.reduce((acc, p) => acc + p.totalCM, 0);
  const operatingProfit = totalCM - fixedCostsTotalEconomic;
  
  // Indicators
  const mcPercentage = totalRevenue > 0 ? (totalCM / totalRevenue) : 0;
  const breakEvenPoint = mcPercentage > 0 ? fixedCostsTotalEconomic / mcPercentage : 0;
  
  const totalInvestment = investments.reduce((acc, i) => acc + (i.quantity * i.value), 0);
  const payback = operatingProfit > 0 ? totalInvestment / operatingProfit : 0;
  const profitability = totalRevenue > 0 ? (operatingProfit / totalRevenue) * 100 : 0;

  // --- ACTIONS ---
  const handleAddProduct = () => {
      if (newProd.name) {
          setProducts([...products, { ...newProd, id: Math.random().toString(), monthlyQty: Number(newProd.monthlyQty), sellingPrice: Number(newProd.sellingPrice), period: 'Mensal' } as Product]);
          setNewProd({ type: 'Fabricacao', unit: 'un', monthlyQty: 0, sellingPrice: 0, name: '', period: 'Mensal' });
      }
  };

  const handleAddInvestment = () => {
      if (newInvest.description) {
          setInvestments([...investments, { ...newInvest, id: Math.random().toString(), quantity: Number(newInvest.quantity), value: Number(newInvest.value), lifeSpan: Number(newInvest.lifeSpan), residualValue: Number(newInvest.residualValue) } as Investment]);
          setNewInvest({ quantity: 1, value: 0, lifeSpan: 5, residualValue: 0, description: '' });
      }
  };

  const handleAddMaterialToDb = () => {
      if (newMaterial.description) {
          setRawMaterials([...rawMaterials, { ...newMaterial, id: Math.random().toString(), unitPrice: Number(newMaterial.unitPrice) } as RawMaterial]);
          setNewMaterial({ unit: 'un', unitPrice: 0, description: '' });
      }
  };

  const handleAddMaterialToProduct = () => {
      if (selectedProdId && selectedMaterialId && qtyToAdd > 0) {
          const pc = {...prodCosts};
          pc[selectedProdId].materials.push({ materialId: selectedMaterialId, quantityUsed: qtyToAdd });
          setProdCosts(pc);
          setQtyToAdd(0);
      }
  };

  const menuItems = [
      { id: 'empreendimento', label: '1. Empreendimento', icon: Building2 },
      { id: 'produtos', label: '2. Produtos', icon: Package },
      { id: 'investimentos', label: '3. Investimentos', icon: Zap },
      { id: 'depreciacao', label: '4. Depreciação', icon: TrendingDown },
      { id: 'custofixo', label: '5. Custo Fixo', icon: Building2 },
      { id: 'producao', label: '6. Custo Variável (Prod)', icon: Factory },
      { id: 'revenda', label: '7. Custo Variável (Rev)', icon: ShoppingBag },
      { id: 'resultados', label: '8. Resultados', icon: PieChartIcon },
  ];

  return (
    <div className="flex h-[calc(100vh-100px)] bg-slate-100 border rounded-xl overflow-hidden shadow-2xl">
        
        {/* SIDEBAR NAVIGATION */}
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
                {isSidebarOpen && (
                    <div className="space-y-3">
                        <select className="w-full text-xs text-slate-800 p-2 rounded bg-white" value={selectedContactId} onChange={(e) => setSelectedContactId(e.target.value)}>
                            <option value="">Carregar Empreendimento...</option>
                            {contacts.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
                        </select>
                        <button onClick={() => onComplete && selectedContactId && onComplete(selectedContactId)} className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                            <Save className="w-4 h-4"/> Salvar Estudo
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 bg-slate-50 overflow-y-auto p-6 relative">
            
            {/* --- 1. EMPREENDIMENTO --- */}
            {activeModule === 'empreendimento' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-4xl mx-auto animate-fade-in">
                    <h2 className="text-xl font-bold text-slate-800 border-b pb-4 mb-6 flex items-center gap-2"><Building2 className="w-6 h-6 text-brand-600"/> Dados do Empreendimento</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Nome do Empreendimento</label>
                            <input className="w-full border p-2 rounded bg-slate-50" value={enterprise.name} onChange={e => setEnterprise({...enterprise, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Atividade Econômica</label>
                            <input className="w-full border p-2 rounded bg-slate-50" value={enterprise.activity} onChange={e => setEnterprise({...enterprise, activity: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">CNPJ</label>
                            <input className="w-full border p-2 rounded bg-slate-50" value={enterprise.cnpj} onChange={e => setEnterprise({...enterprise, cnpj: e.target.value})} />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Endereço Completo</label>
                            <input className="w-full border p-2 rounded bg-slate-50" value={`${enterprise.address} - ${enterprise.city}`} disabled />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                            <input className="w-full border p-2 rounded bg-slate-50" value={enterprise.email} onChange={e => setEnterprise({...enterprise, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Telefone</label>
                            <input className="w-full border p-2 rounded bg-slate-50" value={enterprise.phone} onChange={e => setEnterprise({...enterprise, phone: e.target.value})} />
                        </div>
                        
                        <div className="col-span-2 bg-slate-50 p-4 rounded border border-slate-100 mt-2">
                            <label className="text-xs font-bold text-slate-700 uppercase mb-3 block">Situação Atual</label>
                            <div className="flex gap-4">
                                {['Em funcionamento', 'Em implantação', 'Em reestruturação'].map(opt => (
                                    <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input type="radio" checked={enterprise.situation === opt} onChange={() => setEnterprise({...enterprise, situation: opt})} className="text-brand-600"/> {opt}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- 2. PRODUTOS --- */}
            {activeModule === 'produtos' && (
                <div className="max-w-6xl mx-auto animate-fade-in">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Package className="w-6 h-6 text-brand-600"/> Cadastro de Produtos e Serviços</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-[#3b5998] text-white text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-4 py-3 text-left">Descrição do Produto/Serviço</th>
                                    <th className="px-4 py-3 text-center">Tipo</th>
                                    <th className="px-4 py-3 text-center">Unidade</th>
                                    <th className="px-4 py-3 text-center">Período</th>
                                    <th className="px-4 py-3 text-right">Qtd. Média</th>
                                    <th className="px-4 py-3 text-right">Preço Venda</th>
                                    <th className="px-4 py-3 text-center w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {products.map((p) => (
                                    <tr key={p.id} className="hover:bg-blue-50">
                                        <td className="px-4 py-3 font-medium">{p.name}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${p.type === 'Revenda' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{p.type}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">{p.unit}</td>
                                        <td className="px-4 py-3 text-center">{p.period}</td>
                                        <td className="px-4 py-3 text-right font-bold text-slate-700">{p.monthlyQty}</td>
                                        <td className="px-4 py-3 text-right font-bold text-emerald-600">{toCurrency(p.sellingPrice)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => setProducts(products.filter(x => x.id !== p.id))}><Trash2 className="w-4 h-4 text-red-400 hover:text-red-600"/></button>
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-slate-50">
                                    <td className="p-2"><input placeholder="Novo Item..." className="w-full border rounded px-2 py-1" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})}/></td>
                                    <td className="p-2">
                                        <select className="w-full border rounded px-2 py-1" value={newProd.type} onChange={e => setNewProd({...newProd, type: e.target.value as ProductType})}>
                                            <option value="Fabricacao">Fabricação</option>
                                            <option value="Revenda">Revenda</option>
                                            <option value="Servico">Serviço</option>
                                        </select>
                                    </td>
                                    <td className="p-2"><input placeholder="Un" className="w-full border rounded px-2 py-1 text-center" value={newProd.unit} onChange={e => setNewProd({...newProd, unit: e.target.value})}/></td>
                                    <td className="p-2">
                                        <select className="w-full border rounded px-2 py-1" value={newProd.period} onChange={e => setNewProd({...newProd, period: e.target.value})}>
                                            <option value="Mensal">Mensal</option>
                                            <option value="Semanal">Semanal</option>
                                            <option value="Diário">Diário</option>
                                        </select>
                                    </td>
                                    <td className="p-2"><input type="number" placeholder="0" className="w-full border rounded px-2 py-1 text-right" value={newProd.monthlyQty} onChange={e => setNewProd({...newProd, monthlyQty: Number(e.target.value)})}/></td>
                                    <td className="p-2"><input type="number" placeholder="0,00" className="w-full border rounded px-2 py-1 text-right" value={newProd.sellingPrice} onChange={e => setNewProd({...newProd, sellingPrice: Number(e.target.value)})}/></td>
                                    <td className="p-2 text-center">
                                        <button onClick={handleAddProduct} className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"><Plus className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- 3. INVESTIMENTOS --- */}
            {activeModule === 'investimentos' && (
                <div className="max-w-6xl mx-auto animate-fade-in">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Zap className="w-6 h-6 text-brand-600"/> Investimentos Fixos</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-[#3b5998] text-white text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-4 py-3 text-left">Discriminação (Máquinas, Móveis, Utensílios)</th>
                                    <th className="px-4 py-3 text-right">Quantidade</th>
                                    <th className="px-4 py-3 text-right">Valor Unitário</th>
                                    <th className="px-4 py-3 text-right">Valor Total</th>
                                    <th className="px-4 py-3 text-right">Vida Útil (Anos)</th>
                                    <th className="px-4 py-3 text-right">Valor Residual</th>
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
                                        <td className="px-4 py-3 text-right">{inv.lifeSpan}</td>
                                        <td className="px-4 py-3 text-right">{toCurrency(inv.residualValue)}</td>
                                        <td className="px-4 py-3 text-center"><button onClick={() => setInvestments(investments.filter(x => x.id !== inv.id))}><Trash2 className="w-4 h-4 text-red-400"/></button></td>
                                    </tr>
                                ))}
                                <tr className="bg-slate-50">
                                    <td className="p-2"><input placeholder="Item..." className="w-full border rounded px-2 py-1" value={newInvest.description} onChange={e => setNewInvest({...newInvest, description: e.target.value})}/></td>
                                    <td className="p-2"><input type="number" className="w-full border rounded px-2 py-1 text-right" value={newInvest.quantity} onChange={e => setNewInvest({...newInvest, quantity: Number(e.target.value)})}/></td>
                                    <td className="p-2"><input type="number" className="w-full border rounded px-2 py-1 text-right" value={newInvest.value} onChange={e => setNewInvest({...newInvest, value: Number(e.target.value)})}/></td>
                                    <td className="p-2 text-right text-slate-400 bg-slate-100">-</td>
                                    <td className="p-2"><input type="number" className="w-full border rounded px-2 py-1 text-right" value={newInvest.lifeSpan} onChange={e => setNewInvest({...newInvest, lifeSpan: Number(e.target.value)})}/></td>
                                    <td className="p-2"><input type="number" className="w-full border rounded px-2 py-1 text-right" value={newInvest.residualValue} onChange={e => setNewInvest({...newInvest, residualValue: Number(e.target.value)})}/></td>
                                    <td className="p-2 text-center"><button onClick={handleAddInvestment} className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"><Plus className="w-4 h-4"/></button></td>
                                </tr>
                            </tbody>
                            <tfoot className="bg-slate-100 font-bold text-slate-700">
                                <tr>
                                    <td colSpan={3} className="px-4 py-3 text-right uppercase text-xs">Total Investimento:</td>
                                    <td className="px-4 py-3 text-right text-brand-700">{toCurrency(totalInvestment)}</td>
                                    <td colSpan={3}></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* --- 4. DEPRECIAÇÃO --- */}
            {activeModule === 'depreciacao' && (
                <div className="max-w-6xl mx-auto animate-fade-in">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingDown className="w-6 h-6 text-brand-600"/> Mapa de Depreciação</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-[#3b5998] text-white text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-4 py-3 text-left">Bem</th>
                                    <th className="px-4 py-3 text-right">Valor Total (Novo)</th>
                                    <th className="px-4 py-3 text-right">Valor Residual (Final)</th>
                                    <th className="px-4 py-3 text-right">Valor Depreciável</th>
                                    <th className="px-4 py-3 text-right">Vida Útil (Meses)</th>
                                    <th className="px-4 py-3 text-right">Depreciação Mensal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {investments.map(inv => {
                                    const totalVal = inv.quantity * inv.value;
                                    const depreciable = totalVal - inv.residualValue;
                                    const months = inv.lifeSpan * 12;
                                    const monthlyDep = months > 0 ? depreciable / months : 0;
                                    return (
                                        <tr key={inv.id} className="hover:bg-blue-50">
                                            <td className="px-4 py-3">{inv.description}</td>
                                            <td className="px-4 py-3 text-right">{toCurrency(totalVal)}</td>
                                            <td className="px-4 py-3 text-right text-slate-500">{toCurrency(inv.residualValue)}</td>
                                            <td className="px-4 py-3 text-right font-medium">{toCurrency(depreciable)}</td>
                                            <td className="px-4 py-3 text-right">{months}</td>
                                            <td className="px-4 py-3 text-right font-bold text-red-600">{toCurrency(monthlyDep)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-slate-100 font-bold text-slate-800">
                                <tr>
                                    <td colSpan={5} className="px-4 py-3 text-right uppercase text-xs">Total Depreciação Mensal:</td>
                                    <td className="px-4 py-3 text-right text-red-700">{toCurrency(depreciationTotal)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* --- 5. CUSTO FIXO --- */}
            {activeModule === 'custofixo' && (
                <div className="max-w-4xl mx-auto animate-fade-in">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Building2 className="w-6 h-6 text-brand-600"/> Custos Fixos Mensais</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-[#3b5998] text-white text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-4 py-3 text-left">Descrição da Despesa</th>
                                    <th className="px-4 py-3 text-right">Valor Mensal</th>
                                    <th className="w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {fixedCosts.map(fc => (
                                    <tr key={fc.id} className="hover:bg-blue-50">
                                        <td className="px-4 py-3">
                                            <input className="w-full bg-transparent outline-none font-medium text-slate-700" value={fc.description} onChange={e => {
                                                const n = [...fixedCosts]; n.find(x => x.id === fc.id)!.description = e.target.value; setFixedCosts(n);
                                            }}/>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <input type="number" className="w-full bg-transparent outline-none text-right font-bold text-slate-700" value={fc.value} onChange={e => {
                                                const n = [...fixedCosts]; n.find(x => x.id === fc.id)!.value = Number(e.target.value); setFixedCosts(n);
                                            }}/>
                                        </td>
                                        <td className="px-4 py-3 text-center"><button onClick={() => setFixedCosts(fixedCosts.filter(x => x.id !== fc.id))}><Trash2 className="w-4 h-4 text-red-400"/></button></td>
                                    </tr>
                                ))}
                                <tr className="bg-blue-50/50">
                                    <td className="px-4 py-3 font-medium text-slate-500 italic">Depreciação Mensal (Automático)</td>
                                    <td className="px-4 py-3 text-right font-medium text-slate-500 italic">{toCurrency(depreciationTotal)}</td>
                                    <td></td>
                                </tr>
                                <tr className="bg-slate-50">
                                    <td className="p-2"><input placeholder="Nova Despesa..." className="w-full border rounded px-2 py-1" value={newFixed.description} onChange={e => setNewFixed({...newFixed, description: e.target.value})}/></td>
                                    <td className="p-2"><input type="number" className="w-full border rounded px-2 py-1 text-right" value={newFixed.value} onChange={e => setNewFixed({...newFixed, value: Number(e.target.value)})}/></td>
                                    <td className="p-2 text-center"><button onClick={() => { if(newFixed.description){ setFixedCosts([...fixedCosts, {id: Math.random().toString(), ...newFixed} as FixedCost]); setNewFixed({value:0}); }}} className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"><Plus className="w-4 h-4"/></button></td>
                                </tr>
                            </tbody>
                            <tfoot className="bg-slate-800 text-white font-bold">
                                <tr>
                                    <td className="px-4 py-3 text-right uppercase text-xs">Total Custo Fixo (Econômico):</td>
                                    <td className="px-4 py-3 text-right">{toCurrency(fixedCostsTotalEconomic)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* --- 6. CUSTO VARIÁVEL (PRODUÇÃO) --- */}
            {activeModule === 'producao' && (
                <div className="max-w-6xl mx-auto animate-fade-in space-y-6">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Factory className="w-6 h-6 text-brand-600"/> Custo Variável de Produção</h2>
                        <select className="border p-2 rounded text-sm min-w-[250px] bg-slate-50" value={selectedProdId} onChange={e => setSelectedProdId(e.target.value)}>
                            {products.filter(p => p.type === 'Fabricacao').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    {selectedProdId && prodCosts[selectedProdId] && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* LEFT: Raw Materials Database */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
                                <div className="bg-[#3b5998] text-white px-4 py-2 font-bold text-sm text-center">Banco de Insumos</div>
                                <div className="flex-1 overflow-y-auto">
                                    <table className="w-full text-xs">
                                        <thead className="bg-slate-100 font-bold text-slate-600">
                                            <tr><th className="p-2 text-left">Item</th><th className="p-2 text-right">Preço</th><th className="p-2 text-center">Unid</th></tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {rawMaterials.map(m => (
                                                <tr key={m.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedMaterialId(m.id)}>
                                                    <td className={`p-2 ${selectedMaterialId === m.id ? 'font-bold text-blue-600' : ''}`}>{m.description}</td>
                                                    <td className="p-2 text-right">{toCurrency(m.unitPrice)}</td>
                                                    <td className="p-2 text-center">{m.unit}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-2 bg-slate-50 border-t border-slate-200 grid grid-cols-4 gap-1">
                                    <input placeholder="Novo Item..." className="col-span-2 text-xs border rounded p-1" value={newMaterial.description} onChange={e=>setNewMaterial({...newMaterial, description: e.target.value})}/>
                                    <input placeholder="R$" type="number" className="text-xs border rounded p-1" value={newMaterial.unitPrice || ''} onChange={e=>setNewMaterial({...newMaterial, unitPrice: Number(e.target.value)})}/>
                                    <button onClick={handleAddMaterialToDb} className="bg-blue-600 text-white rounded font-bold text-xs">+</button>
                                </div>
                            </div>

                            {/* RIGHT: Recipe & Calculation */}
                            <div className="lg:col-span-2 flex flex-col gap-6">
                                {/* Top Stats */}
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-4 gap-4">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-500">Tamanho do Lote</label>
                                        <div className="flex gap-2">
                                            <input type="number" className="w-full border rounded p-1 text-sm font-bold text-slate-800" value={prodCosts[selectedProdId].batchSize} onChange={e=>{
                                                const pc = {...prodCosts}; pc[selectedProdId].batchSize = Number(e.target.value); setProdCosts(pc);
                                            }}/>
                                            <span className="text-xs self-center text-slate-400">{products.find(p=>p.id===selectedProdId)?.unit}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-500">% Perdas</label>
                                        <input type="number" className="w-full border rounded p-1 text-sm text-slate-800" value={prodCosts[selectedProdId].lossesRate} onChange={e=>{
                                            const pc = {...prodCosts}; pc[selectedProdId].lossesRate = Number(e.target.value); setProdCosts(pc);
                                        }}/>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-500">% Impostos</label>
                                        <input type="number" className="w-full border rounded p-1 text-sm text-slate-800" value={prodCosts[selectedProdId].taxRate} onChange={e=>{
                                            const pc = {...prodCosts}; pc[selectedProdId].taxRate = Number(e.target.value); setProdCosts(pc);
                                        }}/>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-500">% Comissão</label>
                                        <input type="number" className="w-full border rounded p-1 text-sm text-slate-800" value={prodCosts[selectedProdId].commissionRate} onChange={e=>{
                                            const pc = {...prodCosts}; pc[selectedProdId].commissionRate = Number(e.target.value); setProdCosts(pc);
                                        }}/>
                                    </div>
                                </div>

                                {/* Materials Table */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
                                    <div className="bg-[#3b5998] text-white px-4 py-2 font-bold text-sm flex justify-between items-center">
                                        <span>Consumo por Lote</span>
                                        <div className="flex gap-2">
                                            <input type="number" placeholder="Qtd" className="w-20 text-black text-xs px-2 rounded" value={qtyToAdd || ''} onChange={e=>setQtyToAdd(Number(e.target.value))}/>
                                            <button onClick={handleAddMaterialToProduct} disabled={!selectedMaterialId} className="bg-white/20 hover:bg-white/30 px-3 rounded text-xs font-bold uppercase">Adicionar</button>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto">
                                        <table className="w-full text-xs">
                                            <thead className="bg-slate-100">
                                                <tr><th className="p-2 text-left">Insumo</th><th className="p-2 text-right">Qtd</th><th className="p-2 text-center">Unid</th><th className="p-2 text-right">Custo Total</th><th className="w-8"></th></tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {prodCosts[selectedProdId].materials.map((m, i) => {
                                                    const raw = rawMaterials.find(r=>r.id===m.materialId);
                                                    return (
                                                        <tr key={i}>
                                                            <td className="p-2">{raw?.description}</td>
                                                            <td className="p-2 text-right">{m.quantityUsed}</td>
                                                            <td className="p-2 text-center">{raw?.unit}</td>
                                                            <td className="p-2 text-right">{toCurrency((raw?.unitPrice||0) * m.quantityUsed)}</td>
                                                            <td className="p-2"><button onClick={()=>{
                                                                const pc = {...prodCosts}; pc[selectedProdId].materials.splice(i,1); setProdCosts(pc);
                                                            }}><Trash2 className="w-3 h-3 text-red-400"/></button></td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Footer Totals */}
                                    <div className="bg-slate-50 border-t p-3 space-y-2">
                                        {(() => {
                                            const subtotal = prodCosts[selectedProdId].materials.reduce((acc, m) => {
                                                const raw = rawMaterials.find(r=>r.id===m.materialId);
                                                return acc + ((raw?.unitPrice||0) * m.quantityUsed);
                                            }, 0);
                                            const losses = subtotal * (prodCosts[selectedProdId].lossesRate / 100);
                                            const totalBatch = subtotal + losses;
                                            const unitCost = prodCosts[selectedProdId].batchSize > 0 ? totalBatch / prodCosts[selectedProdId].batchSize : 0;
                                            const sellingPrice = products.find(p=>p.id===selectedProdId)?.sellingPrice || 0;
                                            const varExpenses = sellingPrice * ((prodCosts[selectedProdId].taxRate + prodCosts[selectedProdId].commissionRate) / 100);
                                            const cm = sellingPrice - unitCost - varExpenses;

                                            return (
                                                <>
                                                    <div className="flex justify-between text-xs text-slate-500"><span>Subtotal Materiais:</span> <span>{toCurrency(subtotal)}</span></div>
                                                    <div className="flex justify-between text-xs text-red-500"><span>+ Perdas ({prodCosts[selectedProdId].lossesRate}%):</span> <span>{toCurrency(losses)}</span></div>
                                                    <div className="border-t border-dashed my-1"></div>
                                                    <div className="flex justify-between font-bold text-sm text-slate-800"><span>Custo Total do Lote:</span> <span>{toCurrency(totalBatch)}</span></div>
                                                    <div className="flex justify-between font-bold text-sm text-blue-700 mt-2 p-2 bg-blue-50 rounded"><span>Custo Variável Unitário:</span> <span>{toCurrency(unitCost)}</span></div>
                                                    <div className="flex justify-between font-bold text-sm text-emerald-700 p-2 bg-emerald-50 rounded"><span>Margem de Contribuição Unit.:</span> <span>{toCurrency(cm)}</span></div>
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
                <div className="max-w-6xl mx-auto animate-fade-in">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><ShoppingBag className="w-6 h-6 text-brand-600"/> Custo Variável de Revenda</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-xs">
                             <thead className="bg-[#3b5998] text-white uppercase font-bold">
                                 <tr>
                                     <th className="p-3 text-left">Produto</th>
                                     <th className="p-3 text-right w-24">Pr. Compra</th>
                                     <th className="p-3 text-right w-20">% Perdas</th>
                                     <th className="p-3 text-right">Custo Unit.</th>
                                     <th className="p-3 text-right border-l border-white/20">Pr. Venda</th>
                                     <th className="p-3 text-right w-20">% Imposto</th>
                                     <th className="p-3 text-right w-20">% Comissão</th>
                                     <th className="p-3 text-right">Margem Contrib.</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100">
                                 {products.filter(p => p.type === 'Revenda').map(p => {
                                     const rc = resaleCosts[p.id];
                                     if (!rc) return null;
                                     const unitCost = rc.purchasePrice * (1 + (rc.lossesRate/100));
                                     const varExpenses = p.sellingPrice * ((rc.taxRate + rc.commissionRate)/100);
                                     const cm = p.sellingPrice - unitCost - varExpenses;

                                     return (
                                         <tr key={p.id} className="hover:bg-blue-50">
                                             <td className="p-3 font-bold text-slate-700">{p.name}</td>
                                             <td className="p-3"><input type="number" className="w-full border rounded text-right bg-slate-50" value={rc.purchasePrice} onChange={e=>{
                                                 const r = {...resaleCosts}; r[p.id].purchasePrice = Number(e.target.value); setResaleCosts(r);
                                             }}/></td>
                                             <td className="p-3"><input type="number" className="w-full border rounded text-right bg-slate-50" value={rc.lossesRate} onChange={e=>{
                                                 const r = {...resaleCosts}; r[p.id].lossesRate = Number(e.target.value); setResaleCosts(r);
                                             }}/></td>
                                             <td className="p-3 text-right font-bold text-slate-600">{toCurrency(unitCost)}</td>
                                             
                                             <td className="p-3 text-right border-l border-slate-200">{toCurrency(p.sellingPrice)}</td>
                                             <td className="p-3"><input type="number" className="w-full border rounded text-right bg-slate-50" value={rc.taxRate} onChange={e=>{
                                                 const r = {...resaleCosts}; r[p.id].taxRate = Number(e.target.value); setResaleCosts(r);
                                             }}/></td>
                                             <td className="p-3"><input type="number" className="w-full border rounded text-right bg-slate-50" value={rc.commissionRate} onChange={e=>{
                                                 const r = {...resaleCosts}; r[p.id].commissionRate = Number(e.target.value); setResaleCosts(r);
                                             }}/></td>
                                             <td className={`p-3 text-right font-bold ${cm > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{toCurrency(cm)}</td>
                                         </tr>
                                     );
                                 })}
                             </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- 8. RESULTADOS --- */}
            {activeModule === 'resultados' && (
                <div className="max-w-6xl mx-auto animate-fade-in space-y-6">
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
                             <p className={`text-2xl font-black ${profitability > 0 ? 'text-brand-600' : 'text-slate-600'}`}>{toDec(profitability)}%</p>
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
                                     <span>{toCurrency(fixedCostsTotalCash)}</span>
                                 </div>
                                 <div className="flex justify-between pl-4 text-slate-500 border-b pb-2">
                                     <span>(-) Depreciação (Econômico)</span>
                                     <span>{toCurrency(depreciationTotal)}</span>
                                 </div>
                                 <div className={`flex justify-between p-3 rounded text-lg ${operatingProfit >= 0 ? 'bg-slate-800 text-white' : 'bg-red-100 text-red-700'}`}>
                                     <span className="font-bold">(=) Resultado Operacional</span>
                                     <span className="font-bold">{toCurrency(operatingProfit)}</span>
                                 </div>
                             </div>
                        </div>

                        {/* Analysis Indicators */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5"/> Ponto de Equilíbrio</h3>
                                <div className="flex items-end gap-4">
                                    <div className="text-3xl font-black text-slate-800">{toCurrency(breakEvenPoint)}</div>
                                    <div className="text-sm text-slate-500 mb-1">receita necessária/mês</div>
                                </div>
                                <div className="w-full bg-slate-100 h-4 rounded-full mt-4 overflow-hidden relative">
                                    <div 
                                        className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ${totalRevenue > breakEvenPoint ? 'bg-emerald-500' : 'bg-brand-500'}`}
                                        style={{ width: `${Math.min((totalRevenue / (breakEvenPoint * 1.5 || 1)) * 100, 100)}%` }}
                                    ></div>
                                    <div 
                                        className="absolute top-0 bottom-0 w-1 bg-black z-10"
                                        style={{ left: `${Math.min((breakEvenPoint / (breakEvenPoint * 1.5 || 1)) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-slate-400 mt-1">
                                    <span>R$ 0</span>
                                    <span>Meta: {toCurrency(breakEvenPoint)}</span>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Zap className="w-5 h-5"/> Payback (Retorno)</h3>
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl font-black text-slate-800">{payback <= 0 || payback === Infinity ? 'Indefinido' : payback.toFixed(1)}</div>
                                    <div className="text-sm text-slate-500">meses estimados</div>
                                </div>
                                <p className="text-xs text-slate-400 mt-2">Investimento total: {toCurrency(totalInvestment)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    </div>
  );
};