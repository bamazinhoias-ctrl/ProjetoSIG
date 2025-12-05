import React, { useState, useEffect } from 'react';
import { 
  Building2, Package, TrendingUp, TrendingDown, 
  Plus, Trash2, Save, ShoppingBag, 
  Factory, Zap, Search, 
  Menu, PieChart as PieChartIcon, Pencil, RefreshCw, FolderPlus, ChevronLeft, ChevronRight, X, Check, ListPlus, FileCheck
} from 'lucide-react';
import { Contact } from '../types';

// --- HELPER FUNCTIONS ---
const toCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const toDec = (value: number) => value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
    purchasePrice: number; // Preço total da compra
    purchaseQty: number;   // Quantidade da compra
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
    packQuantity: number; // Quantidade na embalagem de compra
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
    name: '', activity: '', cnpj: '', cadsol: false, 
    address: '', neighborhood: '', zip: '', city: '', state: 'BA', 
    phone: '', cellphone: '', email: '', situation: 'Em funcionamento', 
    partnersM: 0, partnersF: 0, organization: 'Grupo Informal'
  });

  // --- 2. PRODUTOS DATA ---
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});

  // --- 3. INVESTIMENTOS DATA ---
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [investmentsOthersPct, setInvestmentsOthersPct] = useState<number>(0);
  const [newInvest, setNewInvest] = useState<Partial<Investment>>({ quantity: 1, value: 0, lifeSpan: 0, residualValue: 0 });

  // --- 5. CUSTO FIXO DATA ---
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([
      { id: '1', description: 'Energia', value: 0 },
      { id: '2', description: 'Água', value: 0 },
      { id: '3', description: 'Aluguel', value: 0 },
      { id: '4', description: 'Internet', value: 0 },
      { id: '5', description: 'Transporte', value: 0 },
      { id: '6', description: 'Material de Limpeza', value: 0 },
  ]);
  const [newFixed, setNewFixed] = useState<Partial<FixedCost>>({ value: 0 });
  const [maintenanceCost, setMaintenanceCost] = useState<number>(0);
  const [fixedCostOthersPct, setFixedCostOthersPct] = useState<number>(0);
  const [associatesData, setAssociatesData] = useState({ count: 0, value: 0 });

  // --- 6 & 7. CUSTO VARIÁVEL (DB) ---
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([
      { id: 'm1', description: 'Insumo Exemplo 1', unit: 'kg', purchaseQty: 1, purchasePrice: 10.00 },
  ]);
  const [newMaterialInput, setNewMaterialInput] = useState<Partial<RawMaterial>>({ 
      description: '', unit: 'un', purchaseQty: 0, purchasePrice: 0 
  });
  const [newMaterialQtyUsed, setNewMaterialQtyUsed] = useState<number>(0);

  const [prodCosts, setProdCosts] = useState<Record<string, ProductionCostData>>({});
  const [resaleCosts, setResaleCosts] = useState<Record<string, ResaleCostData>>({});
  const [newResaleProduct, setNewResaleProduct] = useState({ name: '', unit: 'un' });

  // UI Helpers
  const [selectedProdId, setSelectedProdId] = useState<string>('');

  // --- INITIALIZATION ---
  useEffect(() => {
    if (selectedContactId) {
        const c = contacts.find(co => co.id === selectedContactId);
        if (c) {
            setEnterprise({
                name: c.company, activity: c.role, cnpj: c.cnpj || '', cadsol: c.cadsol || false,
                address: c.address || '', neighborhood: c.neighborhood || '', zip: c.zip || '',
                city: c.city || '', state: c.state || 'BA', phone: c.phone, cellphone: c.cellphone || '',
                email: c.email, situation: c.situation || 'Em funcionamento',
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
              setResaleCosts(prev => ({...prev, [p.id]: { productId: p.id, purchasePrice: 0, packQuantity: 1, taxRate: 0, commissionRate: 0, lossesRate: 0 }}));
          }
      });
      if (products.length > 0 && !selectedProdId) setSelectedProdId(products[0].id);
  }, [products]);

  // --- CALCULATIONS ---
  // 1. Depreciation
  const depreciationTotal = investments.reduce((acc, item) => {
      const depreciableValue = (item.quantity * item.value) - item.residualValue;
      const monthlyDep = item.lifeSpan > 0 ? depreciableValue / (item.lifeSpan * 12) : 0;
      return acc + monthlyDep;
  }, 0);

  // 2. Fixed Costs
  const fixedCostsListTotal = fixedCosts.reduce((acc, item) => acc + item.value, 0);
  const subtotalFixed = fixedCostsListTotal + depreciationTotal + maintenanceCost;
  const othersValueFixed = subtotalFixed * (fixedCostOthersPct / 100);
  const associatesRemuneration = associatesData.count * associatesData.value;
  const fixedCostsTotalEconomic = subtotalFixed + othersValueFixed + associatesRemuneration;
  const fixedCostsTotalCash = fixedCostsListTotal + maintenanceCost + othersValueFixed + associatesRemuneration;

  // 3. Analyzed Products
  const analyzedProducts = products.map(p => {
      let unitVarCost = 0;
      let tax = 0;
      let comm = 0;

      if (p.type === 'Fabricacao' && prodCosts[p.id]) {
          const pc = prodCosts[p.id];
          const materialsCost = pc.materials.reduce((acc, m) => {
              const mat = rawMaterials.find(r => r.id === m.materialId);
              const unitPrice = (mat?.purchaseQty && mat.purchaseQty > 0) ? (mat.purchasePrice / mat.purchaseQty) : 0;
              return acc + (unitPrice * m.quantityUsed);
          }, 0);
          const batchCost = materialsCost * (1 + (pc.lossesRate / 100));
          unitVarCost = pc.batchSize > 0 ? batchCost / pc.batchSize : 0;
          tax = pc.taxRate;
          comm = pc.commissionRate;
      } else if (p.type === 'Revenda' && resaleCosts[p.id]) {
          const rc = resaleCosts[p.id];
          const packQty = rc.packQuantity > 0 ? rc.packQuantity : 1;
          const unitPurchasePrice = rc.purchasePrice / packQty;
          unitVarCost = unitPurchasePrice * (1 + (rc.lossesRate / 100));
          tax = rc.taxRate;
          comm = rc.commissionRate;
      }

      const totalRevenue = p.sellingPrice * p.monthlyQty;
      const varExpenses = p.sellingPrice * ((tax + comm) / 100);
      const totalVarCost = (unitVarCost * p.monthlyQty) + (varExpenses * p.monthlyQty);
      const unitCM = p.sellingPrice - unitVarCost - varExpenses;
      const totalCM = unitCM * p.monthlyQty;
      const cmPercent = p.sellingPrice > 0 ? (unitCM / p.sellingPrice) * 100 : 0;

      return { ...p, unitVarCost, tax, comm, totalRevenue, totalVarCost, unitCM, totalCM, cmPercent };
  });

  // 4. Totals
  const totalRevenue = analyzedProducts.reduce((acc, p) => acc + p.totalRevenue, 0);
  const totalVariableCosts = analyzedProducts.reduce((acc, p) => acc + p.totalVarCost, 0);
  const totalCM = analyzedProducts.reduce((acc, p) => acc + p.totalCM, 0);
  const totalCosts = fixedCostsTotalEconomic + totalVariableCosts;
  const balance = totalRevenue - totalCosts;
  const breakEvenPoint = (totalRevenue > 0 && totalCM > 0) ? fixedCostsTotalEconomic / (totalCM / totalRevenue) : 0;
  
  const subtotalInvestment = investments.reduce((acc, i) => acc + (i.quantity * i.value), 0);
  const totalInvestment = subtotalInvestment + (subtotalInvestment * (investmentsOthersPct / 100));

  // --- HANDLERS ---
  const handleAddInvestment = () => {
      if (newInvest.description) {
          setInvestments([...investments, { ...newInvest, id: Math.random().toString(), quantity: Number(newInvest.quantity)||1, value: Number(newInvest.value)||0, lifeSpan: Number(newInvest.lifeSpan)||0, residualValue: Number(newInvest.residualValue)||0 } as Investment]);
          setNewInvest({ quantity: 1, value: 0, lifeSpan: 0, residualValue: 0, description: '' });
      }
  };

  const handleAddNewMaterialRow = () => {
      if (selectedProdId && newMaterialInput.description && newMaterialQtyUsed > 0) {
          const newMatId = Math.random().toString();
          const newMat: RawMaterial = {
              id: newMatId, description: newMaterialInput.description, unit: newMaterialInput.unit || 'un',
              purchasePrice: Number(newMaterialInput.purchasePrice) || 0, purchaseQty: Number(newMaterialInput.purchaseQty) || 1
          };
          setRawMaterials([...rawMaterials, newMat]);
          const pc = {...prodCosts};
          if (!pc[selectedProdId].materials) pc[selectedProdId].materials = [];
          pc[selectedProdId].materials.push({ materialId: newMatId, quantityUsed: newMaterialQtyUsed });
          setProdCosts(pc);
          setNewMaterialInput({ description: '', unit: 'un', purchaseQty: 0, purchasePrice: 0 });
          setNewMaterialQtyUsed(0);
      }
  };

  const handleAddResaleProduct = () => {
      if (newResaleProduct.name) {
          const newId = Math.random().toString();
          setProducts([...products, {
              id: newId, name: newResaleProduct.name, type: 'Revenda', unit: newResaleProduct.unit,
              monthlyQty: 0, sellingPrice: 0, period: 'Mensal'
          }]);
          setNewResaleProduct({ name: '', unit: 'un' });
      }
  };

  const handleSaveProduct = () => {
      if (currentProduct.name) {
          if (currentProduct.id) {
              setProducts(products.map(p => p.id === currentProduct.id ? currentProduct as Product : p));
          } else {
              setProducts([...products, { ...currentProduct, id: Math.random().toString(), monthlyQty: Number(currentProduct.monthlyQty), sellingPrice: Number(currentProduct.sellingPrice) } as Product]);
          }
          setIsProductModalOpen(false);
      }
  };

  // --- SHARED COMPONENTS ---
  const ActionButtons = ({ onReset, onSave }: any) => (
    <div className="flex justify-center gap-4 mt-8 print:hidden">
        <button onClick={onReset || (() => confirm('Redefinir dados?') && alert('Dados redefinidos.'))} className="bg-[#7288a4] hover:bg-[#60748b] text-white font-bold py-2 px-6 rounded shadow-md text-sm uppercase flex items-center gap-2">REDEFINIR <RefreshCw className="w-4 h-4" /></button>
        <button onClick={onSave || (() => alert('Dados salvos!'))} className="bg-[#7288a4] hover:bg-[#60748b] text-white font-bold py-2 px-8 rounded shadow-md text-sm uppercase">SALVAR</button>
    </div>
  );

  const FormInput = ({ label, value, onChange, placeholder, type = 'text', className = '' }: any) => (
      <div className={`mb-3 ${className}`}>
          <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
          <input type={type} className="w-full bg-[#f0f4f8] text-slate-700 text-sm p-2.5 rounded border-none focus:ring-1 focus:ring-brand-400 focus:bg-white transition-colors" value={value || ''} onChange={onChange} placeholder={placeholder} />
      </div>
  );

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
        {/* SIDEBAR */}
        <div className={`bg-[#2c3e50] text-white flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-16'}`}>
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                {isSidebarOpen && <h2 className="font-bold text-lg tracking-tight">EVE System</h2>}
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-white/10 rounded"><Menu className="w-5 h-5"/></button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
                {menuItems.map(item => (
                    <button key={item.id} onClick={() => setActiveModule(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-4 ${activeModule === item.id ? 'bg-white/10 border-brand-500 text-white' : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-white'}`} title={!isSidebarOpen ? item.label : ''}>
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

        {/* CONTENT */}
        <div className="flex-1 bg-slate-50 overflow-y-auto p-6 relative">
            
            {/* 1. EMPREENDIMENTO */}
            {activeModule === 'empreendimento' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-4xl mx-auto animate-fade-in">
                    <h2 className="text-xl font-bold text-slate-800 border-b pb-4 mb-6 flex items-center gap-2"><Building2 className="w-6 h-6 text-brand-600"/> Dados do Empreendimento</h2>
                    <div className="space-y-4">
                        <FormInput label="Nome" value={enterprise.name} onChange={(e:any)=>setEnterprise({...enterprise, name: e.target.value})} />
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput label="Atividade" value={enterprise.activity} onChange={(e:any)=>setEnterprise({...enterprise, activity: e.target.value})} />
                            <FormInput label="CNPJ" value={enterprise.cnpj} onChange={(e:any)=>setEnterprise({...enterprise, cnpj: e.target.value})} />
                        </div>
                        <FormInput label="Endereço" value={enterprise.address} onChange={(e:any)=>setEnterprise({...enterprise, address: e.target.value})} />
                        <div className="grid grid-cols-3 gap-4">
                            <FormInput label="Bairro" value={enterprise.neighborhood} onChange={(e:any)=>setEnterprise({...enterprise, neighborhood: e.target.value})} />
                            <FormInput label="Cidade" value={enterprise.city} onChange={(e:any)=>setEnterprise({...enterprise, city: e.target.value})} />
                            <FormInput label="UF" value={enterprise.state} onChange={(e:any)=>setEnterprise({...enterprise, state: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput label="Telefone" value={enterprise.phone} onChange={(e:any)=>setEnterprise({...enterprise, phone: e.target.value})} />
                            <FormInput label="Email" value={enterprise.email} onChange={(e:any)=>setEnterprise({...enterprise, email: e.target.value})} />
                        </div>
                    </div>
                    <ActionButtons />
                </div>
            )}

            {/* 2. PRODUTOS */}
            {activeModule === 'produtos' && (
                <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200 max-w-5xl mx-auto animate-fade-in">
                    <div className="flex justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-800">Produtos e Serviços</h2>
                        <button onClick={() => { setCurrentProduct({ type: 'Fabricacao', unit: 'un', monthlyQty: 0, sellingPrice: 0, period: 'Mensal' }); setIsProductModalOpen(true); }} className="bg-brand-600 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2"><FolderPlus className="w-4 h-4"/> Novo</button>
                    </div>
                    <div className="border border-blue-200 rounded-sm overflow-hidden mb-4">
                        <div className="bg-[#f0f8ff] p-2 border-b border-blue-100 pl-4"><h3 className="text-blue-500 font-bold text-sm">Lista de Produtos</h3></div>
                        <table className="w-full text-sm">
                            <thead className="bg-[#9FB6D6] text-white">
                                <tr>
                                    <th className="px-6 py-3 text-left">Nome</th>
                                    <th className="px-6 py-3 text-center">Tipo</th>
                                    <th className="px-6 py-3 text-right">Qtd Mês</th>
                                    <th className="px-6 py-3 text-right">Preço Venda</th>
                                    <th className="px-6 py-3 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {products.map(p => (
                                    <tr key={p.id}>
                                        <td className="px-6 py-4 font-medium">{p.name}</td>
                                        <td className="px-6 py-4 text-center text-xs uppercase">{p.type}</td>
                                        <td className="px-6 py-4 text-right">{p.monthlyQty}</td>
                                        <td className="px-6 py-4 text-right">{toCurrency(p.sellingPrice)}</td>
                                        <td className="px-6 py-4 text-center flex justify-center gap-2">
                                            <button onClick={()=>{setCurrentProduct(p); setIsProductModalOpen(true)}}><Pencil className="w-4 h-4 text-blue-500"/></button>
                                            <button onClick={()=>setProducts(products.filter(x=>x.id!==p.id))}><Trash2 className="w-4 h-4 text-red-500"/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <ActionButtons />
                </div>
            )}

            {/* 3. INVESTIMENTOS */}
            {activeModule === 'investimentos' && (
                <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200 max-w-5xl mx-auto animate-fade-in">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Investimentos Fixos</h2>
                    <table className="w-full text-sm mb-4">
                        <thead className="bg-[#8EA7CA] text-white">
                            <tr>
                                <th className="p-3 text-left">Item</th>
                                <th className="p-3 text-right">Qtd</th>
                                <th className="p-3 text-right">Valor Unit.</th>
                                <th className="p-3 text-right">Total</th>
                                <th className="p-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {investments.map(inv => (
                                <tr key={inv.id}>
                                    <td className="p-3"><input className="w-full bg-transparent outline-none" value={inv.description} onChange={e=>{const n=[...investments]; n.find(x=>x.id===inv.id)!.description=e.target.value; setInvestments(n)}}/></td>
                                    <td className="p-3"><input type="number" className="w-full bg-transparent outline-none text-right" value={inv.quantity} onChange={e=>{const n=[...investments]; n.find(x=>x.id===inv.id)!.quantity=Number(e.target.value); setInvestments(n)}}/></td>
                                    <td className="p-3"><input type="number" className="w-full bg-transparent outline-none text-right" value={inv.value} onChange={e=>{const n=[...investments]; n.find(x=>x.id===inv.id)!.value=Number(e.target.value); setInvestments(n)}}/></td>
                                    <td className="p-3 text-right">{toCurrency(inv.quantity * inv.value)}</td>
                                    <td className="p-3 text-center"><button onClick={()=>setInvestments(investments.filter(x=>x.id!==inv.id))}><Trash2 className="w-4 h-4 text-red-500"/></button></td>
                                </tr>
                            ))}
                            <tr className="bg-slate-50">
                                <td className="p-3"><input placeholder="Novo item..." className="w-full bg-transparent outline-none" value={newInvest.description||''} onChange={e=>setNewInvest({...newInvest, description:e.target.value})}/></td>
                                <td className="p-3"><input type="number" className="w-full bg-transparent outline-none text-right" value={newInvest.quantity||''} onChange={e=>setNewInvest({...newInvest, quantity:Number(e.target.value)})}/></td>
                                <td className="p-3"><input type="number" className="w-full bg-transparent outline-none text-right" value={newInvest.value||''} onChange={e=>setNewInvest({...newInvest, value:Number(e.target.value)})}/></td>
                                <td className="p-3 text-right"><button onClick={handleAddInvestment}><Plus className="w-5 h-5 text-blue-600"/></button></td>
                                <td></td>
                            </tr>
                        </tbody>
                        <tfoot className="bg-[#8EA7CA] text-white font-bold">
                            <tr>
                                <td colSpan={3} className="p-3 text-right">TOTAL</td>
                                <td className="p-3 text-right">{toCurrency(subtotalInvestment)}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                    <ActionButtons />
                </div>
            )}

            {/* 4. DEPRECIAÇÃO */}
            {activeModule === 'depreciacao' && (
                <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200 max-w-5xl mx-auto animate-fade-in">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Cálculo de Depreciação</h2>
                    <table className="w-full text-sm">
                        <thead className="bg-[#8EA7CA] text-white">
                            <tr>
                                <th className="p-3 text-left">Item</th>
                                <th className="p-3 text-right">Valor Total</th>
                                <th className="p-3 text-right">Valor Residual</th>
                                <th className="p-3 text-center">Vida Útil (Anos)</th>
                                <th className="p-3 text-right">Depreciação Mensal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {investments.map(inv => {
                                const total = inv.quantity * inv.value;
                                const depMensal = inv.lifeSpan > 0 ? (total - inv.residualValue) / (inv.lifeSpan * 12) : 0;
                                return (
                                    <tr key={inv.id}>
                                        <td className="p-3 font-medium">{inv.description}</td>
                                        <td className="p-3 text-right">{toCurrency(total)}</td>
                                        <td className="p-3"><input type="number" className="w-full text-right bg-slate-50 border rounded" value={inv.residualValue} onChange={e=>{const n=[...investments]; n.find(x=>x.id===inv.id)!.residualValue=Number(e.target.value); setInvestments(n)}}/></td>
                                        <td className="p-3"><input type="number" className="w-full text-center bg-slate-50 border rounded" value={inv.lifeSpan} onChange={e=>{const n=[...investments]; n.find(x=>x.id===inv.id)!.lifeSpan=Number(e.target.value); setInvestments(n)}}/></td>
                                        <td className="p-3 text-right font-bold text-slate-600">{toCurrency(depMensal)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-[#8EA7CA] text-white font-bold">
                            <tr>
                                <td colSpan={4} className="p-3 text-right">TOTAL MENSAL</td>
                                <td className="p-3 text-right">{toCurrency(depreciationTotal)}</td>
                            </tr>
                        </tfoot>
                    </table>
                    <ActionButtons />
                </div>
            )}

            {/* 5. CUSTO FIXO */}
            {activeModule === 'custofixo' && (
                <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200 max-w-5xl mx-auto animate-fade-in">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Custos Fixos Mensais</h2>
                    <table className="w-full text-sm mb-4">
                        <thead className="bg-[#8EA7CA] text-white">
                            <tr>
                                <th className="p-3 text-left">Descrição</th>
                                <th className="p-3 text-right w-40">Valor (R$)</th>
                                <th className="p-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {fixedCosts.map(fc => (
                                <tr key={fc.id}>
                                    <td className="p-3"><input className="w-full bg-transparent outline-none" value={fc.description} onChange={e=>{const n=[...fixedCosts]; n.find(x=>x.id===fc.id)!.description=e.target.value; setFixedCosts(n)}}/></td>
                                    <td className="p-3"><input type="number" className="w-full bg-transparent outline-none text-right" value={fc.value} onChange={e=>{const n=[...fixedCosts]; n.find(x=>x.id===fc.id)!.value=Number(e.target.value); setFixedCosts(n)}}/></td>
                                    <td className="p-3 text-center"><button onClick={()=>setFixedCosts(fixedCosts.filter(x=>x.id!==fc.id))}><Trash2 className="w-4 h-4 text-red-500"/></button></td>
                                </tr>
                            ))}
                            <tr className="bg-slate-50">
                                <td className="p-3"><input placeholder="Novo custo fixo..." className="w-full bg-transparent outline-none" value={newFixed.description||''} onChange={e=>setNewFixed({...newFixed, description:e.target.value})}/></td>
                                <td className="p-3"><input type="number" className="w-full bg-transparent outline-none text-right" value={newFixed.value||''} onChange={e=>setNewFixed({...newFixed, value:Number(e.target.value)})}/></td>
                                <td className="p-3 text-center"><button onClick={()=>{if(newFixed.description){setFixedCosts([...fixedCosts, {id:Math.random().toString(), ...newFixed} as FixedCost]); setNewFixed({value:0, description:''})}}}><Plus className="w-5 h-5 text-blue-600"/></button></td>
                            </tr>
                        </tbody>
                        <tfoot className="bg-slate-50 text-slate-700">
                            <tr>
                                <td className="p-3 text-right font-medium">Depreciação Mensal (Automático)</td>
                                <td className="p-3 text-right font-bold">{toCurrency(depreciationTotal)}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td className="p-3 text-right font-medium">Manutenção</td>
                                <td className="p-3"><input type="number" className="w-full text-right bg-white border rounded" value={maintenanceCost} onChange={e=>setMaintenanceCost(Number(e.target.value))}/></td>
                                <td></td>
                            </tr>
                            <tr className="bg-[#8EA7CA] text-white font-bold">
                                <td className="p-3 text-right uppercase">Total Custo Fixo</td>
                                <td className="p-3 text-right">{toCurrency(fixedCostsTotalEconomic)}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                    <ActionButtons />
                </div>
            )}

            {/* 6. CUSTO VARIÁVEL (PRODUÇÃO) - SPECIFIC LAYOUT */}
            {activeModule === 'producao' && (
                <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200 max-w-6xl mx-auto animate-fade-in">
                    <div className="mb-6 border-b border-slate-200 pb-4">
                         <h2 className="text-2xl font-normal text-[#5c7cfa] flex items-center gap-2">
                            <TrendingUp className="w-8 h-8 transform rotate-12" /> Custo Variável de Produção
                         </h2>
                    </div>
                    <div className="mb-4">
                        <select className="w-full max-w-md p-2 border rounded" value={selectedProdId} onChange={e => setSelectedProdId(e.target.value)}>
                            {products.filter(p => p.type === 'Fabricacao').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    {selectedProdId && prodCosts[selectedProdId] && (
                        <>
                            {/* Header Stats */}
                            <div className="grid grid-cols-4 gap-4 mb-6 bg-slate-50 p-4 rounded">
                                <div className="text-center border-r border-slate-200">
                                    <p className="text-xs text-slate-500">Produção Planejada</p>
                                    <p className="font-bold text-slate-800">{products.find(p=>p.id===selectedProdId)?.monthlyQty} {products.find(p=>p.id===selectedProdId)?.unit}</p>
                                </div>
                                <div className="text-center border-r border-slate-200">
                                    <p className="text-xs text-slate-500">Preço Venda</p>
                                    <p className="font-bold text-slate-800">{toCurrency(products.find(p=>p.id===selectedProdId)?.sellingPrice||0)}</p>
                                </div>
                                <div className="text-center border-r border-slate-200">
                                    <p className="text-xs text-slate-500">Custo Var. Unit.</p>
                                    <p className="font-bold text-slate-800">{toCurrency(analyzedProducts.find(p=>p.id===selectedProdId)?.unitVarCost||0)}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-slate-500">Margem Contrib.</p>
                                    <p className="font-bold text-green-600">{toCurrency(analyzedProducts.find(p=>p.id===selectedProdId)?.unitCM||0)}</p>
                                </div>
                            </div>

                            {/* Batch Size */}
                            <div className="mb-6 flex gap-4 items-center bg-blue-50 p-3 rounded border border-blue-100">
                                <label className="text-sm font-bold text-blue-800">Quantidade produzida num processo (Lote):</label>
                                <input type="number" className="w-20 p-1 text-center border rounded" value={prodCosts[selectedProdId].batchSize} onChange={e=>{const pc={...prodCosts}; pc[selectedProdId].batchSize=Number(e.target.value); setProdCosts(pc)}}/>
                                <span className="text-sm text-blue-600">{products.find(p=>p.id===selectedProdId)?.unit}</span>
                            </div>

                            {/* Tables */}
                            <div className="flex gap-4 items-start">
                                {/* LEFT: Source Prices */}
                                <div className="flex-1 bg-white rounded overflow-hidden border border-slate-200">
                                    <div className="bg-[#4c669f] text-white text-center font-bold py-2 text-sm">Levantamento dos Preços (Compra)</div>
                                    <table className="w-full text-xs">
                                        <thead className="bg-[#9daecf] text-white">
                                            <tr>
                                                <th className="p-2 text-left">Item</th>
                                                <th className="p-2 text-right">Qtd Compra</th>
                                                <th className="p-2 text-center">Unid</th>
                                                <th className="p-2 text-right">Preço Total</th>
                                                <th className="w-8"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {prodCosts[selectedProdId].materials.map((m, i) => {
                                                const raw = rawMaterials.find(r => r.id === m.materialId);
                                                return (
                                                    <tr key={i} className="bg-slate-50">
                                                        <td className="p-2 font-medium">{raw?.description}</td>
                                                        <td className="p-2 text-right">{raw?.purchaseQty}</td>
                                                        <td className="p-2 text-center">{raw?.unit}</td>
                                                        <td className="p-2 text-right">{toDec(raw?.purchasePrice || 0)}</td>
                                                        <td className="p-2 text-center"><button onClick={()=>{const pc={...prodCosts}; pc[selectedProdId].materials.splice(i,1); setProdCosts(pc)}}><Trash2 className="w-3 h-3 text-red-500"/></button></td>
                                                    </tr>
                                                );
                                            })}
                                            <tr className="bg-white">
                                                <td className="p-2"><input placeholder="Novo Item" className="w-full outline-none border-b" value={newMaterialInput.description} onChange={e=>setNewMaterialInput({...newMaterialInput, description: e.target.value})}/></td>
                                                <td className="p-2"><input type="number" className="w-full outline-none text-right border-b" value={newMaterialInput.purchaseQty||''} onChange={e=>setNewMaterialInput({...newMaterialInput, purchaseQty: Number(e.target.value)})}/></td>
                                                <td className="p-2"><input className="w-full outline-none text-center border-b" value={newMaterialInput.unit} onChange={e=>setNewMaterialInput({...newMaterialInput, unit: e.target.value})}/></td>
                                                <td className="p-2"><input type="number" className="w-full outline-none text-right border-b" value={newMaterialInput.purchasePrice||''} onChange={e=>setNewMaterialInput({...newMaterialInput, purchasePrice: Number(e.target.value)})}/></td>
                                                <td className="p-2 text-center"><button onClick={handleAddNewMaterialRow}><ListPlus className="w-4 h-4 text-blue-600"/></button></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* RIGHT: Consumption */}
                                <div className="flex-1 bg-white rounded overflow-hidden border border-slate-200">
                                    <div className="bg-[#4c669f] text-white text-center font-bold py-2 text-sm">Consumo no Processo</div>
                                    <table className="w-full text-xs">
                                        <thead className="bg-[#9daecf] text-white">
                                            <tr>
                                                <th className="p-2 text-right">Qtd Usada</th>
                                                <th className="p-2 text-center">Unid</th>
                                                <th className="p-2 text-right">Custo Proporcional</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {prodCosts[selectedProdId].materials.map((m, i) => {
                                                const raw = rawMaterials.find(r => r.id === m.materialId);
                                                const unitPrice = (raw?.purchaseQty && raw.purchaseQty > 0) ? (raw.purchasePrice / raw.purchaseQty) : 0;
                                                const cost = unitPrice * m.quantityUsed;
                                                return (
                                                    <tr key={i} className="bg-white">
                                                        <td className="p-2"><input type="number" className="w-full text-right bg-slate-50 border rounded p-1" value={m.quantityUsed} onChange={e => {const pc={...prodCosts}; pc[selectedProdId].materials[i].quantityUsed = Number(e.target.value); setProdCosts(pc)}}/></td>
                                                        <td className="p-2 text-center text-slate-500">{raw?.unit}</td>
                                                        <td className="p-2 text-right font-medium">{toCurrency(cost)}</td>
                                                    </tr>
                                                );
                                            })}
                                            {/* Spacer row to align with left table input */}
                                            <tr className="bg-white"><td className="p-2 h-8" colSpan={3}></td></tr>
                                        </tbody>
                                        <tfoot className="bg-slate-50">
                                            {(() => {
                                                const subtotal = prodCosts[selectedProdId].materials.reduce((acc, m) => {
                                                    const raw = rawMaterials.find(r => r.id === m.materialId);
                                                    const unitPrice = (raw?.purchaseQty && raw.purchaseQty > 0) ? (raw.purchasePrice / raw.purchaseQty) : 0;
                                                    return acc + (unitPrice * m.quantityUsed);
                                                }, 0);
                                                const losses = subtotal * (prodCosts[selectedProdId].lossesRate / 100);
                                                return (
                                                    <>
                                                        <tr>
                                                            <td colSpan={2} className="p-2 text-right font-bold text-slate-600">Subtotal</td>
                                                            <td className="p-2 text-right font-bold">{toCurrency(subtotal)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan={2} className="p-2 text-right font-bold text-slate-600 flex justify-end gap-2 items-center">
                                                                Perdas % <input type="number" className="w-12 text-center border rounded" value={prodCosts[selectedProdId].lossesRate} onChange={e=>{const pc={...prodCosts}; pc[selectedProdId].lossesRate=Number(e.target.value); setProdCosts(pc)}}/>
                                                            </td>
                                                            <td className="p-2 text-right">{toCurrency(losses)}</td>
                                                        </tr>
                                                        <tr className="bg-[#9daecf] text-white">
                                                            <td colSpan={2} className="p-2 text-right font-bold uppercase">Custo Total do Lote</td>
                                                            <td className="p-2 text-right font-bold">{toCurrency(subtotal + losses)}</td>
                                                        </tr>
                                                    </>
                                                );
                                            })()}
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                    <ActionButtons />
                </div>
            )}

            {/* 7. CUSTO VARIÁVEL (REVENDA) - SPECIFIC LAYOUT */}
            {activeModule === 'revenda' && (
                <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200 max-w-6xl mx-auto animate-fade-in">
                    <div className="mb-6 space-y-1">
                        <h2 className="text-sm text-slate-700"><span className="font-bold">Empreendimento:</span> {enterprise.name}</h2>
                    </div>
                    <div className="bg-white rounded-sm overflow-hidden mb-6 border border-slate-200">
                        <table className="w-full text-xs">
                             <thead>
                                 <tr>
                                     <th colSpan={6} className="bg-[#3b5998] text-white text-center font-bold py-2 text-sm border-r border-white/20">Informações de Compra</th>
                                     <th colSpan={4} className="bg-[#3b5998] text-white text-center font-bold py-2 text-sm">Informações de Venda</th>
                                 </tr>
                                 <tr className="bg-[#8EA7CA] text-white font-bold">
                                     <th className="p-3 text-left w-1/4">Produtos</th>
                                     <th className="p-3 text-right w-16">Qtde Emb.</th>
                                     <th className="p-3 text-center w-16">Unid</th>
                                     <th className="p-3 text-right w-24">Preço Compra</th>
                                     <th className="p-3 text-center w-16">% Perda</th>
                                     <th className="p-3 text-right w-24 border-r border-white/30">Custo Unit.</th>
                                     <th className="p-3 text-center w-24">Venda Mês</th>
                                     <th className="p-3 text-center w-20">Unid Venda</th>
                                     <th className="p-3 text-right w-24">Preço Venda</th>
                                     <th className="p-3 text-right w-28">Margem Contrib.</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100">
                                 {products.filter(p => p.type === 'Revenda').map(p => {
                                     const rc = resaleCosts[p.id];
                                     if (!rc) return null;
                                     const packQty = rc.packQuantity > 0 ? rc.packQuantity : 1;
                                     const unitPurchasePrice = rc.purchasePrice / packQty;
                                     const unitCost = unitPurchasePrice * (1 + (rc.lossesRate/100));
                                     const margin = p.sellingPrice - unitCost;
                                     return (
                                         <tr key={p.id} className="hover:bg-blue-50 bg-[#9daecf]/10">
                                             <td className="p-2 font-bold text-slate-700">{p.name}</td>
                                             <td className="p-2"><input type="number" className="w-full bg-white border rounded p-1 text-right" value={rc.packQuantity} onChange={e=>{const r={...resaleCosts}; r[p.id].packQuantity=Number(e.target.value); setResaleCosts(r)}}/></td>
                                             <td className="p-2 text-center text-slate-500">{p.unit}</td>
                                             <td className="p-2"><input type="number" className="w-full bg-white border rounded p-1 text-right" value={rc.purchasePrice} onChange={e=>{const r={...resaleCosts}; r[p.id].purchasePrice=Number(e.target.value); setResaleCosts(r)}}/></td>
                                             <td className="p-2"><input type="number" className="w-full bg-white border rounded p-1 text-center" value={rc.lossesRate} onChange={e=>{const r={...resaleCosts}; r[p.id].lossesRate=Number(e.target.value); setResaleCosts(r)}}/></td>
                                             <td className="p-2 text-right font-bold text-slate-600 border-r border-slate-200">{toCurrency(unitCost)}</td>
                                             
                                             <td className="p-2"><input type="number" className="w-full bg-white border rounded p-1 text-center" value={p.monthlyQty} onChange={e=>{const up=products.map(prod=>prod.id===p.id?{...prod, monthlyQty:Number(e.target.value)}:prod); setProducts(up)}}/></td>
                                             <td className="p-2 text-center text-slate-500">{p.unit}</td>
                                             <td className="p-2"><input type="number" className="w-full bg-white border rounded p-1 text-right" value={p.sellingPrice} onChange={e=>{const up=products.map(prod=>prod.id===p.id?{...prod, sellingPrice:Number(e.target.value)}:prod); setProducts(up)}}/></td>
                                             <td className={`p-2 text-right font-bold ${margin>0?'text-emerald-600':'text-red-600'}`}>{toCurrency(margin)}</td>
                                         </tr>
                                     );
                                 })}
                                 <tr className="bg-white">
                                     <td className="p-2 flex gap-2 items-center">
                                         <button onClick={handleAddResaleProduct} className="text-blue-600 hover:text-blue-800"><ListPlus className="w-5 h-5" /></button>
                                         <input placeholder="Novo Produto..." className="w-full bg-slate-50 rounded px-2 py-1 outline-none" value={newResaleProduct.name} onChange={e=>setNewResaleProduct({...newResaleProduct, name:e.target.value})}/>
                                     </td>
                                     <td colSpan={9}></td>
                                 </tr>
                             </tbody>
                        </table>
                    </div>
                    <ActionButtons />
                </div>
            )}

            {/* 8. RESULTADOS - SPECIFIC LAYOUT */}
            {activeModule === 'resultados' && (
                <div className="max-w-6xl mx-auto animate-fade-in bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 border-b-2 border-slate-100 pb-4 mb-8">
                        <div className="w-10 h-10 flex items-center justify-center"><FileCheck className="w-8 h-8 text-[#5C7CFA]" /></div>
                        <h2 className="text-2xl font-normal text-[#5C7CFA]">Resultado Sintético</h2>
                    </div>
                    <div className="mb-8 text-sm text-slate-600 space-y-1">
                        <p><span className="font-bold">Empreendimento:</span> {enterprise.name}</p>
                        <p><span className="font-bold">Atividade:</span> {enterprise.activity}</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-12 items-start mb-10">
                        <div className="w-full max-w-sm">
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr className="bg-slate-50"><td className="py-1 px-4 font-bold text-right">Receita Total</td><td className="py-1 px-4 text-right">{toCurrency(totalRevenue)}</td></tr>
                                    <tr><td className="py-1 px-4 font-bold text-right">Custo Total</td><td className="py-1 px-4 text-right">{toCurrency(totalCosts)}</td></tr>
                                    <tr className="bg-slate-50"><td className="py-1 px-4 font-bold text-right">Custo Fixo</td><td className="py-1 px-4 text-right">{toCurrency(fixedCostsTotalEconomic)}</td></tr>
                                    <tr><td className="py-1 px-4 font-bold text-right">Custo Variável</td><td className="py-1 px-4 text-right">{toCurrency(totalVariableCosts)}</td></tr>
                                    <tr className="bg-[#9daecf]"><td className="py-1 px-4 font-bold text-white text-right">Saldo</td><td className="py-1 px-4 text-right font-bold text-white">{toCurrency(balance)}</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="bg-[#f0f4f8] border-t-4 border-[#8ea7ca] p-4 text-center rounded-sm shadow-sm mb-4">
                                <span className="font-bold text-slate-700 text-sm">Receita no Ponto de Equilíbrio: {toCurrency(breakEvenPoint)}</span>
                            </div>
                            <button onClick={() => window.print()} className="bg-[#5C7CFA] hover:bg-blue-700 text-white font-bold py-1.5 px-6 rounded shadow text-sm uppercase transition-colors">IMPRIMIR</button>
                        </div>
                    </div>
                    <div className="bg-[#9daecf] text-white p-2 font-bold text-sm mb-0 rounded-t-sm">Resultado</div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-white text-slate-800 border-b border-slate-200">
                                <tr>
                                    <th className="p-2 text-left w-1/4 align-bottom">Produtos</th>
                                    <th className="p-2 text-right align-bottom">Qtde</th>
                                    <th className="p-2 text-center align-bottom">Unid</th>
                                    <th className="p-2 text-right align-bottom">Preço Venda</th>
                                    <th className="p-2 text-right align-bottom">Receita Total</th>
                                    <th className="p-2 text-right align-bottom">Custo Var. Unit.</th>
                                    <th className="p-2 text-right align-bottom">Custo Var. Total</th>
                                    <th className="p-2 text-right align-bottom">Margem Contrib.</th>
                                    <th className="p-2 text-center align-bottom">Qtd Ponto Equilíbrio</th>
                                    <th className="p-2 text-right align-bottom">% Margem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {analyzedProducts.map((p) => {
                                    const revenueShare = totalRevenue > 0 ? p.totalRevenue / totalRevenue : 0;
                                    const allocatedFixedCost = fixedCostsTotalEconomic * revenueShare;
                                    const beQty = p.unitCM > 0 ? allocatedFixedCost / p.unitCM : 0;
                                    return (
                                        <tr key={p.id} className="hover:bg-slate-50 text-slate-700">
                                            <td className="p-3 font-medium">{p.name}</td>
                                            <td className="p-3 text-right">{p.monthlyQty}</td>
                                            <td className="p-3 text-center">{p.unit}</td>
                                            <td className="p-3 text-right">{toDec(p.sellingPrice)}</td>
                                            <td className="p-3 text-right">{toDec(p.totalRevenue)}</td>
                                            <td className="p-3 text-right">{toDec(p.unitVarCost)}</td>
                                            <td className="p-3 text-right">{toDec(p.totalVarCost)}</td>
                                            <td className="p-3 text-right">{toDec(p.unitCM)}</td>
                                            <td className="p-3 text-center">{Math.ceil(beQty)}</td>
                                            <td className="p-3 text-right">{toDec(p.cmPercent)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>

        {/* --- PRODUCT MODAL --- */}
        {isProductModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsProductModalOpen(false)} />
                <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800 text-lg">{currentProduct.id ? 'Editar Produto' : 'Novo Produto'}</h3>
                        <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div><label className="block text-xs font-bold text-slate-500 mb-1">Descrição</label><input type="text" className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-blue-500" value={currentProduct.name || ''} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs font-bold text-slate-500 mb-1">Tipo</label><select className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-blue-500" value={currentProduct.type} onChange={e => setCurrentProduct({...currentProduct, type: e.target.value as ProductType})}><option value="Fabricacao">Fabricação</option><option value="Revenda">Revenda</option><option value="Servico">Serviço</option></select></div>
                            <div><label className="block text-xs font-bold text-slate-500 mb-1">Unidade</label><input type="text" className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-blue-500" value={currentProduct.unit || ''} onChange={e => setCurrentProduct({...currentProduct, unit: e.target.value})} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs font-bold text-slate-500 mb-1">Qtd. Mês</label><input type="number" className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-blue-500" value={currentProduct.monthlyQty || ''} onChange={e => setCurrentProduct({...currentProduct, monthlyQty: Number(e.target.value)})} /></div>
                            <div><label className="block text-xs font-bold text-slate-500 mb-1">Preço Venda</label><input type="number" className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-blue-500" value={currentProduct.sellingPrice || ''} onChange={e => setCurrentProduct({...currentProduct, sellingPrice: Number(e.target.value)})} /></div>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                        <button onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Cancelar</button>
                        <button onClick={handleSaveProduct} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded shadow-sm">Salvar</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};