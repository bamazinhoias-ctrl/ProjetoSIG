import React, { useState, useMemo, useEffect } from 'react';
import { ClipboardList, Calculator, TrendingUp, AlertTriangle, FileCheck, DollarSign, Plus, Trash2, Package, Truck, Lightbulb, BarChart3, Printer, ArrowRight, ArrowLeft, Clock, Building2, Hourglass, Percent, ShoppingBag, MapPin, User, ChevronDown, Save } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Contact } from '../types';

// --- Types & Interfaces ---

interface Product {
    id: string;
    name: string;
    unit: string;
    monthlyProduction: number; // Qtd Mensal Estimada
    sellingPrice: number; // Preço de Venda
}

interface Investment {
    id: string;
    description: string;
    quantity: number;
    unitValue: number;
    usefulLifeYears: number; // Para cálculo de depreciação
}

interface CostFixed {
    id: string;
    description: string;
    value: number;
}

// Ficha Técnica (Ingredientes/Insumos)
interface TechnicalItem {
    id: string;
    productId: string;
    description: string;
    pkgUnit: string; // Unidade da embalagem (kg, lt, un)
    pkgPrice: number; // Preço da embalagem fechada
    pkgQty: number; // Quantidade na embalagem
    usageQty: number; // Quanto usa na receita
}

// Revenda (Compra pronta para vender)
interface ResaleItem {
    id: string;
    name: string;
    purchasePrice: number;
    sellingPrice: number;
    monthlyVolume: number;
    taxRate: number; // Impostos %
}

interface EVEProps {
    contacts?: Contact[];
    onComplete?: (contactId: string) => void;
    initialContactId?: string;
}

export const EVE: React.FC<EVEProps> = ({ contacts = [], onComplete, initialContactId }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [selectedContactId, setSelectedContactId] = useState<string>(initialContactId || '');

  // --- STATE ---

  // 1. Dados do Empreendimento
  const [enterpriseData, setEnterpriseData] = useState({
      name: '', activity: '', cnpj: '', city: '', phone: '', daysWorked: 22, hoursWorked: 8
  });

  // 2. Produtos (Fabricação)
  const [products, setProducts] = useState<Product[]>([]);
  const [newProd, setNewProd] = useState<Partial<Product>>({ name: '', unit: 'un', monthlyProduction: 0, sellingPrice: 0 });

  // 3. Investimentos
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [newInv, setNewInv] = useState<Partial<Investment>>({ description: '', quantity: 1, unitValue: 0, usefulLifeYears: 5 });

  // 4. Custos Fixos
  const [fixedCosts, setFixedCosts] = useState<CostFixed[]>([
      { id: '1', description: 'Pró-Labore (Retirada Sócios)', value: 1412.00 },
      { id: '2', description: 'Energia Elétrica', value: 150.00 },
      { id: '3', description: 'Água/Esgoto', value: 80.00 },
      { id: '4', description: 'Internet/Telefone', value: 100.00 },
      { id: '5', description: 'Aluguel', value: 0.00 },
      { id: '6', description: 'MEI / Impostos Fixos', value: 70.00 },
  ]);
  const [newFixed, setNewFixed] = useState<Partial<CostFixed>>({ description: '', value: 0 });

  // 6. Custos Variáveis (Ficha Técnica)
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [techItems, setTechItems] = useState<TechnicalItem[]>([]);
  const [newTechItem, setNewTechItem] = useState<Partial<TechnicalItem>>({ description: '', pkgUnit: 'kg', pkgPrice: 0, pkgQty: 0, usageQty: 0 });

  // 7. Revenda (Mercadorias)
  const [resaleItems, setResaleItems] = useState<ResaleItem[]>([]);
  const [newResale, setNewResale] = useState<Partial<ResaleItem>>({ name: '', purchasePrice: 0, sellingPrice: 0, monthlyVolume: 0, taxRate: 0 });

  // --- INITIALIZATION ---
  useEffect(() => {
      if (initialContactId) setSelectedContactId(initialContactId);
  }, [initialContactId]);

  useEffect(() => {
      const contact = contacts.find(c => c.id === selectedContactId);
      if (contact) {
          setEnterpriseData(prev => ({
              ...prev,
              name: contact.company,
              activity: contact.role,
              cnpj: contact.cnpj || '',
              city: contact.city || '',
              phone: contact.phone
          }));
      }
  }, [selectedContactId, contacts]);

  useEffect(() => {
      if (products.length > 0 && !selectedProductId) {
          setSelectedProductId(products[0].id);
      }
  }, [products]);

  // --- ACTIONS ---

  const addProduct = () => {
      if (newProd.name && newProd.sellingPrice) {
          setProducts([...products, { ...newProd, id: Math.random().toString() } as Product]);
          setNewProd({ name: '', unit: 'un', monthlyProduction: 0, sellingPrice: 0 });
      }
  };

  const addInvestment = () => {
      if (newInv.description && newInv.unitValue) {
          setInvestments([...investments, { ...newInv, id: Math.random().toString(), quantity: newInv.quantity || 1, usefulLifeYears: newInv.usefulLifeYears || 5 } as Investment]);
          setNewInv({ description: '', quantity: 1, unitValue: 0, usefulLifeYears: 5 });
      }
  };

  const addFixedCost = () => {
      if (newFixed.description && newFixed.value) {
          setFixedCosts([...fixedCosts, { ...newFixed, id: Math.random().toString() } as CostFixed]);
          setNewFixed({ description: '', value: 0 });
      }
  };

  const addTechItem = () => {
      if (newTechItem.description && selectedProductId) {
          setTechItems([...techItems, { 
              ...newTechItem, 
              id: Math.random().toString(), 
              productId: selectedProductId,
              pkgQty: newTechItem.pkgQty || 1 // Avoid division by zero
          } as TechnicalItem]);
          setNewTechItem({ description: '', pkgUnit: 'kg', pkgPrice: 0, pkgQty: 0, usageQty: 0 });
      }
  };

  const addResale = () => {
      if (newResale.name && newResale.sellingPrice) {
          setResaleItems([...resaleItems, { ...newResale, id: Math.random().toString() } as ResaleItem]);
          setNewResale({ name: '', purchasePrice: 0, sellingPrice: 0, monthlyVolume: 0, taxRate: 0 });
      }
  };

  // --- CALCULATIONS (THE ENGINE) ---

  // 1. Receita Total
  const totalRevenueProducts = products.reduce((acc, p) => acc + (p.monthlyProduction * p.sellingPrice), 0);
  const totalRevenueResale = resaleItems.reduce((acc, r) => acc + (r.monthlyVolume * r.sellingPrice), 0);
  const totalRevenue = totalRevenueProducts + totalRevenueResale;

  // 2. Investimento Total
  const totalInvestment = investments.reduce((acc, i) => acc + (i.quantity * i.unitValue), 0);

  // 3. Depreciação Mensal
  const totalDepreciation = investments.reduce((acc, i) => {
      const totalValue = i.quantity * i.unitValue;
      const months = i.usefulLifeYears * 12;
      return acc + (months > 0 ? totalValue / months : 0);
  }, 0);

  // 4. Custos Fixos Totais
  const totalFixed = fixedCosts.reduce((acc, c) => acc + c.value, 0);

  // 5. Custos Variáveis (Fabricação)
  const getProductUnitCost = (prodId: string) => {
      const items = techItems.filter(t => t.productId === prodId);
      return items.reduce((acc, item) => {
          const unitPrice = item.pkgQty > 0 ? item.pkgPrice / item.pkgQty : 0;
          return acc + (unitPrice * item.usageQty);
      }, 0);
  };

  const totalVariableProducts = products.reduce((acc, p) => {
      return acc + (getProductUnitCost(p.id) * p.monthlyProduction);
  }, 0);

  // 6. Custos Variáveis (Revenda) - CMV
  const totalVariableResale = resaleItems.reduce((acc, r) => {
      const cost = r.purchasePrice * r.monthlyVolume;
      const tax = (r.sellingPrice * r.monthlyVolume) * (r.taxRate / 100);
      return acc + cost + tax;
  }, 0);

  const totalVariable = totalVariableProducts + totalVariableResale;

  // 7. Resultados (DRE)
  const marginContribution = totalRevenue - totalVariable;
  const totalCosts = totalFixed + totalDepreciation;
  const netProfit = marginContribution - totalCosts;
  
  const profitability = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const contributionMarginRatio = totalRevenue > 0 ? marginContribution / totalRevenue : 0;
  
  const breakEvenPointValue = contributionMarginRatio > 0 ? totalCosts / contributionMarginRatio : 0;
  const paybackMonths = netProfit > 0 ? totalInvestment / netProfit : 0;

  // --- NAVIGATION ---
  const steps = [
      { id: 1, label: 'Empreendimento', icon: Building2 },
      { id: 2, label: 'Produtos (Receita)', icon: Package },
      { id: 3, label: 'Investimentos', icon: Truck },
      { id: 4, label: 'Depreciação', icon: Hourglass },
      { id: 5, label: 'Custos Fixos', icon: Lightbulb },
      { id: 6, label: 'Ficha Técnica', icon: Calculator },
      { id: 7, label: 'Revenda', icon: ShoppingBag },
      { id: 8, label: 'Resultados', icon: TrendingUp },
      { id: 9, label: 'Relatório', icon: Printer },
  ];

  const handlePrint = () => {
      if (onComplete && selectedContactId) onComplete(selectedContactId);
      window.print();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen">
        
        {/* Header - Hidden on Print */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center print:hidden">
            <div className="flex items-center gap-3">
                <div className="bg-brand-600 p-2 rounded-lg text-white">
                    <ClipboardList className="w-5 h-5"/>
                </div>
                <div>
                    <h1 className="font-bold text-slate-800 text-lg">EVE - Estudo de Viabilidade Econômica</h1>
                    <p className="text-xs text-slate-500">Metodologia Simplificada de Plano de Negócios</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                    Etapa {activeStep} de 9
                </span>
            </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Steps - Hidden on Print */}
            <div className="w-64 bg-white border-r border-slate-200 overflow-y-auto print:hidden hidden md:block">
                <div className="p-4 space-y-1">
                    {steps.map(step => (
                        <button
                            key={step.id}
                            onClick={() => setActiveStep(step.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all ${
                                activeStep === step.id 
                                ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-sm' 
                                : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <step.icon className={`w-4 h-4 ${activeStep === step.id ? 'text-brand-600' : 'text-slate-400'}`}/>
                            {step.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 print:p-0 print:overflow-visible">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[500px] print:shadow-none print:border-none print:p-0">
                    
                    {/* STEP 1: EMPREENDIMENTO */}
                    {activeStep === 1 && (
                        <div className="animate-fade-in space-y-6">
                            <h2 className="text-xl font-bold text-slate-800 border-b pb-4 mb-6">1. Dados do Empreendimento</h2>
                            
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Importar Dados</label>
                                <select 
                                    className="w-full p-2 border rounded"
                                    value={selectedContactId}
                                    onChange={(e) => setSelectedContactId(e.target.value)}
                                >
                                    <option value="">-- Selecione da Base --</option>
                                    {contacts.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Empreendimento</label>
                                    <input type="text" className="w-full p-2 border rounded" value={enterpriseData.name} onChange={e => setEnterpriseData({...enterpriseData, name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Atividade Principal</label>
                                    <input type="text" className="w-full p-2 border rounded" value={enterpriseData.activity} onChange={e => setEnterpriseData({...enterpriseData, activity: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ</label>
                                    <input type="text" className="w-full p-2 border rounded" value={enterpriseData.cnpj} onChange={e => setEnterpriseData({...enterpriseData, cnpj: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Cidade/UF</label>
                                    <input type="text" className="w-full p-2 border rounded" value={enterpriseData.city} onChange={e => setEnterpriseData({...enterpriseData, city: e.target.value})} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Dias Trabalhados/Mês</label>
                                    <input type="number" className="w-full p-2 border rounded" value={enterpriseData.daysWorked} onChange={e => setEnterpriseData({...enterpriseData, daysWorked: parseInt(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Horas Trabalhadas/Dia</label>
                                    <input type="number" className="w-full p-2 border rounded" value={enterpriseData.hoursWorked} onChange={e => setEnterpriseData({...enterpriseData, hoursWorked: parseInt(e.target.value)})} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: PRODUTOS (RECEITA) */}
                    {activeStep === 2 && (
                        <div className="animate-fade-in space-y-6">
                            <h2 className="text-xl font-bold text-slate-800 border-b pb-4 mb-6">2. Previsão de Receita (Produção Própria)</h2>
                            
                            <div className="flex gap-2 items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Produto</label>
                                    <input className="w-full p-2 border rounded text-sm" placeholder="Ex: Bolo de Pote" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})}/>
                                </div>
                                <div className="w-24">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Preço (R$)</label>
                                    <input type="number" className="w-full p-2 border rounded text-sm" value={newProd.sellingPrice || ''} onChange={e => setNewProd({...newProd, sellingPrice: parseFloat(e.target.value)})}/>
                                </div>
                                <div className="w-24">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Qtd/Mês</label>
                                    <input type="number" className="w-full p-2 border rounded text-sm" value={newProd.monthlyProduction || ''} onChange={e => setNewProd({...newProd, monthlyProduction: parseFloat(e.target.value)})}/>
                                </div>
                                <button onClick={addProduct} className="bg-brand-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-brand-700 h-[38px]">+</button>
                            </div>

                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 font-bold text-slate-600">
                                    <tr>
                                        <th className="p-3">Produto</th>
                                        <th className="p-3">Preço Unit.</th>
                                        <th className="p-3">Qtd Mensal</th>
                                        <th className="p-3 text-right">Total</th>
                                        <th className="w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {products.map(p => (
                                        <tr key={p.id}>
                                            <td className="p-3">{p.name}</td>
                                            <td className="p-3">R$ {p.sellingPrice.toFixed(2)}</td>
                                            <td className="p-3">{p.monthlyProduction}</td>
                                            <td className="p-3 text-right font-bold text-emerald-600">R$ {(p.sellingPrice * p.monthlyProduction).toFixed(2)}</td>
                                            <td className="p-3"><button onClick={() => setProducts(products.filter(x => x.id !== p.id))}><Trash2 className="w-4 h-4 text-red-400"/></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-50 font-bold">
                                        <td colSpan={3} className="p-3 text-right">RECEITA MENSAL TOTAL:</td>
                                        <td className="p-3 text-right text-emerald-700">R$ {totalRevenueProducts.toFixed(2)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}

                    {/* STEP 3: INVESTIMENTOS */}
                    {activeStep === 3 && (
                        <div className="animate-fade-in space-y-6">
                            <h2 className="text-xl font-bold text-slate-800 border-b pb-4 mb-6">3. Investimentos Fixos</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Item</label>
                                    <input className="w-full p-2 border rounded text-sm" placeholder="Máquinas, Móveis..." value={newInv.description} onChange={e => setNewInv({...newInv, description: e.target.value})}/>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Valor Unit.</label>
                                    <input type="number" className="w-full p-2 border rounded text-sm" value={newInv.unitValue || ''} onChange={e => setNewInv({...newInv, unitValue: parseFloat(e.target.value)})}/>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Vida Útil (Anos)</label>
                                    <input type="number" className="w-full p-2 border rounded text-sm" value={newInv.usefulLifeYears} onChange={e => setNewInv({...newInv, usefulLifeYears: parseFloat(e.target.value)})}/>
                                </div>
                                <button onClick={addInvestment} className="bg-brand-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-brand-700 h-[38px]">+</button>
                            </div>

                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 font-bold text-slate-600">
                                    <tr>
                                        <th className="p-3">Item</th>
                                        <th className="p-3">Valor Total</th>
                                        <th className="p-3">Vida Útil</th>
                                        <th className="p-3 text-right">Depreciação/Mês</th>
                                        <th className="w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {investments.map(i => {
                                        const totalVal = i.quantity * i.unitValue;
                                        const depMonth = totalVal / (i.usefulLifeYears * 12);
                                        return (
                                            <tr key={i.id}>
                                                <td className="p-3">{i.description} ({i.quantity}x)</td>
                                                <td className="p-3">R$ {totalVal.toFixed(2)}</td>
                                                <td className="p-3">{i.usefulLifeYears} anos</td>
                                                <td className="p-3 text-right text-slate-500">R$ {depMonth.toFixed(2)}</td>
                                                <td className="p-3"><button onClick={() => setInvestments(investments.filter(x => x.id !== i.id))}><Trash2 className="w-4 h-4 text-red-400"/></button></td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-50 font-bold">
                                        <td className="p-3 text-right">TOTAL INVESTIDO:</td>
                                        <td className="p-3 text-brand-700">R$ {totalInvestment.toFixed(2)}</td>
                                        <td className="p-3 text-right">TOTAL DEPRECIAÇÃO:</td>
                                        <td className="p-3 text-right text-red-500">R$ {totalDepreciation.toFixed(2)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}

                    {/* STEP 4: DEPRECIAÇÃO (VIEW ONLY) */}
                    {activeStep === 4 && (
                        <div className="animate-fade-in space-y-6">
                            <h2 className="text-xl font-bold text-slate-800 border-b pb-4 mb-6">4. Quadro de Depreciação</h2>
                            <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm mb-4 border border-blue-100">
                                A depreciação é calculada automaticamente com base nos investimentos lançados na etapa anterior. Este valor representa a reserva mensal necessária para repor os equipamentos no futuro.
                            </div>
                            <div className="flex justify-between items-center p-6 bg-slate-50 rounded-xl border border-slate-200">
                                <div>
                                    <p className="text-slate-500 text-sm font-bold uppercase">Investimento Total em Equipamentos</p>
                                    <p className="text-3xl font-black text-slate-800">R$ {totalInvestment.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-500 text-sm font-bold uppercase">Depreciação Mensal (Custo)</p>
                                    <p className="text-3xl font-black text-red-600">R$ {totalDepreciation.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: CUSTOS FIXOS */}
                    {activeStep === 5 && (
                        <div className="animate-fade-in space-y-6">
                            <h2 className="text-xl font-bold text-slate-800 border-b pb-4 mb-6">5. Custos Fixos Mensais</h2>
                            
                            <div className="flex gap-2 items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Descrição da Despesa</label>
                                    <input className="w-full p-2 border rounded text-sm" placeholder="Aluguel, Luz, Pro-labore..." value={newFixed.description} onChange={e => setNewFixed({...newFixed, description: e.target.value})}/>
                                </div>
                                <div className="w-32">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Valor Mensal</label>
                                    <input type="number" className="w-full p-2 border rounded text-sm" value={newFixed.value || ''} onChange={e => setNewFixed({...newFixed, value: parseFloat(e.target.value)})}/>
                                </div>
                                <button onClick={addFixedCost} className="bg-brand-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-brand-700 h-[38px]">+</button>
                            </div>

                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 font-bold text-slate-600">
                                    <tr>
                                        <th className="p-3">Descrição</th>
                                        <th className="p-3 text-right">Valor</th>
                                        <th className="w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {fixedCosts.map(c => (
                                        <tr key={c.id}>
                                            <td className="p-3">{c.description}</td>
                                            <td className="p-3 text-right font-medium">R$ {c.value.toFixed(2)}</td>
                                            <td className="p-3"><button onClick={() => setFixedCosts(fixedCosts.filter(x => x.id !== c.id))}><Trash2 className="w-4 h-4 text-red-400"/></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-50 font-bold">
                                        <td className="p-3 text-right">TOTAL CUSTO FIXO:</td>
                                        <td className="p-3 text-right text-red-600">R$ {totalFixed.toFixed(2)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}

                    {/* STEP 6: FICHA TÉCNICA */}
                    {activeStep === 6 && (
                        <div className="animate-fade-in space-y-6">
                            <h2 className="text-xl font-bold text-slate-800 border-b pb-4 mb-6">6. Custos Variáveis (Ficha Técnica)</h2>
                            
                            <div className="flex items-center gap-4 bg-slate-100 p-4 rounded-lg mb-6">
                                <label className="font-bold text-slate-700">Selecione o Produto:</label>
                                <select 
                                    className="flex-1 p-2 border rounded"
                                    value={selectedProductId}
                                    onChange={e => setSelectedProductId(e.target.value)}
                                >
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>

                            {selectedProductId && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Ingrediente/Material</label>
                                            <input className="w-full p-2 border rounded text-sm" value={newTechItem.description} onChange={e => setNewTechItem({...newTechItem, description: e.target.value})}/>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Preço Emb. (R$)</label>
                                            <input type="number" className="w-full p-2 border rounded text-sm" value={newTechItem.pkgPrice || ''} onChange={e => setNewTechItem({...newTechItem, pkgPrice: parseFloat(e.target.value)})}/>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Qtd na Emb.</label>
                                            <input type="number" className="w-full p-2 border rounded text-sm" value={newTechItem.pkgQty || ''} onChange={e => setNewTechItem({...newTechItem, pkgQty: parseFloat(e.target.value)})}/>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Uso na Receita</label>
                                            <input type="number" className="w-full p-2 border rounded text-sm" value={newTechItem.usageQty || ''} onChange={e => setNewTechItem({...newTechItem, usageQty: parseFloat(e.target.value)})}/>
                                        </div>
                                        <div className="md:col-span-5 flex justify-end">
                                            <button onClick={addTechItem} className="bg-brand-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-brand-700">Adicionar Ingrediente</button>
                                        </div>
                                    </div>

                                    <table className="w-full text-sm text-left mb-4">
                                        <thead className="bg-slate-100 font-bold text-slate-600">
                                            <tr>
                                                <th className="p-3">Ingrediente</th>
                                                <th className="p-3 text-right">Custo Unitário</th>
                                                <th className="w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {techItems.filter(t => t.productId === selectedProductId).map(t => {
                                                const unitCost = (t.pkgPrice / t.pkgQty) * t.usageQty;
                                                return (
                                                    <tr key={t.id}>
                                                        <td className="p-3">{t.description}</td>
                                                        <td className="p-3 text-right">R$ {unitCost.toFixed(2)}</td>
                                                        <td className="p-3"><button onClick={() => setTechItems(techItems.filter(x => x.id !== t.id))}><Trash2 className="w-4 h-4 text-red-400"/></button></td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-slate-50 font-bold">
                                                <td className="p-3 text-right">CUSTO UNITÁRIO TOTAL:</td>
                                                <td className="p-3 text-right text-red-600">R$ {getProductUnitCost(selectedProductId).toFixed(2)}</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </>
                            )}
                        </div>
                    )}

                    {/* STEP 7: REVENDA */}
                    {activeStep === 7 && (
                        <div className="animate-fade-in space-y-6">
                            <h2 className="text-xl font-bold text-slate-800 border-b pb-4 mb-6">7. Revenda de Mercadorias</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Mercadoria</label>
                                    <input className="w-full p-2 border rounded text-sm" value={newResale.name} onChange={e => setNewResale({...newResale, name: e.target.value})}/>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Custo Compra</label>
                                    <input type="number" className="w-full p-2 border rounded text-sm" value={newResale.purchasePrice || ''} onChange={e => setNewResale({...newResale, purchasePrice: parseFloat(e.target.value)})}/>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Preço Venda</label>
                                    <input type="number" className="w-full p-2 border rounded text-sm" value={newResale.sellingPrice || ''} onChange={e => setNewResale({...newResale, sellingPrice: parseFloat(e.target.value)})}/>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Vendas/Mês</label>
                                    <input type="number" className="w-full p-2 border rounded text-sm" value={newResale.monthlyVolume || ''} onChange={e => setNewResale({...newResale, monthlyVolume: parseFloat(e.target.value)})}/>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Imposto %</label>
                                    <input type="number" className="w-full p-2 border rounded text-sm" value={newResale.taxRate || ''} onChange={e => setNewResale({...newResale, taxRate: parseFloat(e.target.value)})}/>
                                </div>
                                <div className="md:col-span-6 flex justify-end">
                                    <button onClick={addResale} className="bg-brand-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-brand-700">Adicionar Item</button>
                                </div>
                            </div>

                            <table className="w-full text-sm text-left mt-4">
                                <thead className="bg-slate-100 font-bold text-slate-600">
                                    <tr>
                                        <th className="p-3">Item</th>
                                        <th className="p-3 text-right">Compra</th>
                                        <th className="p-3 text-right">Venda</th>
                                        <th className="p-3 text-right">Margem Unit.</th>
                                        <th className="w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {resaleItems.map(r => {
                                        const tax = r.sellingPrice * (r.taxRate / 100);
                                        const cost = r.purchasePrice + tax;
                                        const margin = r.sellingPrice - cost;
                                        return (
                                            <tr key={r.id}>
                                                <td className="p-3">{r.name}</td>
                                                <td className="p-3 text-right">R$ {r.purchasePrice.toFixed(2)}</td>
                                                <td className="p-3 text-right">R$ {r.sellingPrice.toFixed(2)}</td>
                                                <td className="p-3 text-right font-bold text-emerald-600">R$ {margin.toFixed(2)}</td>
                                                <td className="p-3"><button onClick={() => setResaleItems(resaleItems.filter(x => x.id !== r.id))}><Trash2 className="w-4 h-4 text-red-400"/></button></td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* STEP 8: RESULTADOS (DRE) */}
                    {activeStep === 8 && (
                        <div className="animate-fade-in space-y-6">
                            <h2 className="text-xl font-bold text-slate-800 border-b pb-4 mb-6">8. Demonstrativo de Resultados</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* DRE TABLE */}
                                <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                                    <div className="bg-slate-100 p-3 font-bold text-slate-700 border-b">DRE Gerencial Mensal</div>
                                    <div className="divide-y divide-slate-100 text-sm">
                                        <div className="flex justify-between p-3">
                                            <span className="font-bold">(+) Receita Bruta Total</span>
                                            <span className="font-bold text-emerald-600">R$ {totalRevenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-slate-50">
                                            <span>(-) Custos Variáveis (Matéria-prima/CMV)</span>
                                            <span className="text-red-500">R$ {totalVariable.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-indigo-50 border-y border-indigo-100">
                                            <span className="font-bold text-indigo-800">(=) Margem de Contribuição</span>
                                            <span className="font-bold text-indigo-800">R$ {marginContribution.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                                        </div>
                                        <div className="flex justify-between p-3">
                                            <span>(-) Custos Fixos</span>
                                            <span className="text-red-500">R$ {totalFixed.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                                        </div>
                                        <div className="flex justify-between p-3">
                                            <span>(-) Depreciação (Reserva)</span>
                                            <span className="text-red-500">R$ {totalDepreciation.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                                        </div>
                                        <div className="flex justify-between p-4 bg-slate-800 text-white font-bold text-lg">
                                            <span>(=) Lucro Líquido</span>
                                            <span className={netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}>R$ {netProfit.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Indicators */}
                                <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                                        <p className="text-xs font-bold text-slate-500 uppercase">Lucratividade</p>
                                        <p className={`text-3xl font-black ${profitability > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {profitability.toFixed(1)}%
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                                        <p className="text-xs font-bold text-slate-500 uppercase">Ponto de Equilíbrio</p>
                                        <p className="text-2xl font-black text-brand-600">
                                            R$ {breakEvenPointValue.toLocaleString('pt-BR', {minimumFractionDigits: 0})}
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                                        <p className="text-xs font-bold text-slate-500 uppercase">Tempo de Retorno (Payback)</p>
                                        <p className="text-xl font-bold text-slate-800">
                                            {paybackMonths > 0 ? `${paybackMonths.toFixed(1)} meses` : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 9: RELATÓRIO FINAL */}
                    {activeStep === 9 && (
                        <div className="animate-fade-in bg-white p-8 space-y-8">
                            <div className="text-center border-b-2 border-slate-800 pb-6">
                                <h1 className="text-2xl font-black uppercase">Relatório de Viabilidade Econômica (EVE)</h1>
                                <p className="text-sm text-slate-500 mt-2">CESOL - Centro Público de Economia Solidária</p>
                                <p className="text-xs text-slate-400">{new Date().toLocaleDateString()}</p>
                            </div>

                            <div className="bg-slate-50 p-4 rounded border border-slate-200 print:bg-transparent print:border-slate-800">
                                <h3 className="font-bold uppercase text-sm mb-2 border-b border-slate-300 pb-1">1. Identificação</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <p><strong>Empreendimento:</strong> {enterpriseData.name}</p>
                                    <p><strong>Atividade:</strong> {enterpriseData.activity}</p>
                                    <p><strong>Cidade:</strong> {enterpriseData.city}</p>
                                    <p><strong>Telefone:</strong> {enterpriseData.phone}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 text-sm">
                                <div>
                                    <h3 className="font-bold uppercase border-b border-slate-300 pb-1 mb-2">2. Resumo de Investimentos</h3>
                                    <table className="w-full text-left">
                                        <tbody>
                                            {investments.map(i => (
                                                <tr key={i.id} className="border-b border-slate-100">
                                                    <td className="py-1">{i.description}</td>
                                                    <td className="text-right">R$ {(i.quantity * i.unitValue).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                            <tr className="font-bold bg-slate-100 print:bg-transparent">
                                                <td className="py-1">TOTAL</td>
                                                <td className="text-right">R$ {totalInvestment.toFixed(2)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div>
                                    <h3 className="font-bold uppercase border-b border-slate-300 pb-1 mb-2">3. Custos Fixos</h3>
                                    <table className="w-full text-left">
                                        <tbody>
                                            {fixedCosts.map(c => (
                                                <tr key={c.id} className="border-b border-slate-100">
                                                    <td className="py-1">{c.description}</td>
                                                    <td className="text-right">R$ {c.value.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                            <tr className="font-bold bg-slate-100 print:bg-transparent">
                                                <td className="py-1">TOTAL</td>
                                                <td className="text-right">R$ {totalFixed.toFixed(2)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold uppercase border-b border-slate-300 pb-1 mb-2">4. Indicadores de Viabilidade</h3>
                                <div className="grid grid-cols-4 gap-4 text-center border p-4 rounded">
                                    <div>
                                        <p className="text-xs uppercase text-slate-500">Faturamento</p>
                                        <p className="font-bold">R$ {totalRevenue.toLocaleString('pt-BR', {minimumFractionDigits:2})}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase text-slate-500">Lucro Líquido</p>
                                        <p className={`font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            R$ {netProfit.toLocaleString('pt-BR', {minimumFractionDigits:2})}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase text-slate-500">Lucratividade</p>
                                        <p className="font-bold">{profitability.toFixed(1)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase text-slate-500">Ponto de Equilíbrio</p>
                                        <p className="font-bold">R$ {breakEvenPointValue.toFixed(0)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-xs text-justify text-slate-500 border-t pt-4">
                                <p><strong>Parecer Técnico Automático:</strong> O empreendimento apresenta {netProfit > 0 ? 'viabilidade econômica positiva' : 'risco financeiro'} com base nos dados fornecidos. A margem de contribuição é de {(contributionMarginRatio*100).toFixed(1)}%, indicando a capacidade de cobertura dos custos fixos. Recomenda-se {profitability < 10 ? 'revisão de custos ou aumento de preços' : 'manutenção da estratégia atual'}.</p>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Buttons - Hidden on Print */}
                <div className="max-w-4xl mx-auto mt-6 flex justify-between print:hidden">
                    <button 
                        onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                        disabled={activeStep === 1}
                        className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-50"
                    >
                        <ArrowLeft className="w-4 h-4"/> Anterior
                    </button>

                    {activeStep < 9 ? (
                        <button 
                            onClick={() => {
                                window.scrollTo(0,0);
                                setActiveStep(prev => prev + 1);
                            }}
                            className="flex items-center gap-2 px-8 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 shadow-md"
                        >
                            Próximo <ArrowRight className="w-4 h-4"/>
                        </button>
                    ) : (
                        <button 
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-8 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 shadow-md"
                        >
                            <Printer className="w-4 h-4"/> Imprimir PDF
                        </button>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};