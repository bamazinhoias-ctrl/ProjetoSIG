import React, { useState, useMemo } from 'react';
import { Product, CartItem, Contact } from '../types';
import { ShoppingCart, Package, Calculator, Search, Trash2, Plus, Minus, CreditCard, ArrowRight, Truck, X, Save, DollarSign, User, Tag, Pencil, ArrowLeftRight, Building, LayoutGrid, Receipt, MoreHorizontal, FileBarChart, Calendar, TrendingUp, PieChart as PieChartIcon, Wallet, Briefcase } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';

interface CommercialProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateStock: (productId: string, quantity: number) => void;
  contacts: Contact[];
}

export const Commercial: React.FC<CommercialProps> = ({ products, onAddProduct, onUpdateProduct, onDeleteProduct, onUpdateStock, contacts }) => {
  const [activeTab, setActiveTab] = useState<'pos' | 'inventory' | 'calculator'>('pos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  
  // Registration/Edit Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDates, setReportDates] = useState({ 
      start: new Date().toISOString().split('T')[0], 
      end: new Date().toISOString().split('T')[0] 
  });
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: 'Artesanato',
    producerId: '',
    cost: 0,
    tax: 20, // Default margin %
    stock: 0
  });

  // Calculator State (Standalone Tab)
  const [calcCost, setCalcCost] = useState<number>(0);
  const [calcTax, setCalcTax] = useState<number>(20); // % default

  const categories = ['Todos', 'Artesanato', 'Agricultura', 'Culinária', 'Serviços'];
  const COLORS = ['#F97316', '#10b981', '#f59e0b', '#8b5cf6']; // Brand Primary, Green, Amber, Purple

  // Inventory Filter
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // POS Logic
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckout = () => {
    cart.forEach(item => onUpdateStock(item.id, -item.quantity));
    setCart([]);
    alert('Venda realizada com sucesso!');
  };

  // Standalone Calculator Logic
  const finalPriceStandalone = useMemo(() => {
    return calcCost + (calcCost * (calcTax / 100));
  }, [calcCost, calcTax]);

  // Registration Smart Pricing Logic
  const calculatedRegistrationPrice = useMemo(() => {
    return newProduct.cost + (newProduct.cost * (newProduct.tax / 100));
  }, [newProduct.cost, newProduct.tax]);

  const openNewProductModal = () => {
    setEditingId(null);
    setNewProduct({
      name: '',
      sku: '',
      category: 'Artesanato',
      producerId: '',
      cost: 0,
      tax: 20,
      stock: 0
    });
    setShowRegisterModal(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingId(product.id);
    const impliedTax = product.cost > 0 ? ((product.price - product.cost) / product.cost) * 100 : 20;

    setNewProduct({
      name: product.name,
      sku: product.sku,
      category: product.category,
      producerId: product.producerId,
      cost: product.cost,
      tax: parseFloat(impliedTax.toFixed(2)),
      stock: product.stock
    });
    setShowRegisterModal(true);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProduct.name && newProduct.cost > 0 && newProduct.producerId) {
        const productData: Product = {
            id: editingId || Math.random().toString(36).substr(2, 9),
            name: newProduct.name,
            sku: newProduct.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
            category: newProduct.category,
            producerId: newProduct.producerId,
            cost: newProduct.cost,
            price: calculatedRegistrationPrice,
            stock: newProduct.stock
        };

        if (editingId) {
            onUpdateProduct(productData);
        } else {
            onAddProduct(productData);
        }
        
        setShowRegisterModal(false);
    }
  };

  // Mock Data for Reports with Financial Breakdown
  const reportData = {
      summary: {
          total: 12450.00,
          transactions: 85,
          ticket: 146.47,
          // Financial Breakdown
          producerTotal: 9337.50, // Approx 75%
          storeTotal: 3112.50     // Approx 25%
      },
      dailySales: [
          { name: '01/Out', value: 1200 },
          { name: '02/Out', value: 950 },
          { name: '03/Out', value: 1600 },
          { name: '04/Out', value: 2100 },
          { name: '05/Out', value: 800 },
          { name: '06/Out', value: 1850 },
          { name: '07/Out', value: 3950 },
      ],
      categorySales: [
          { name: 'Artesanato', value: 4500 },
          { name: 'Agricultura', value: 3200 },
          { name: 'Culinária', value: 2800 },
          { name: 'Serviços', value: 1950 },
      ]
  };

  const producerPercentage = (reportData.summary.producerTotal / reportData.summary.total) * 100;
  const storePercentage = (reportData.summary.storeTotal / reportData.summary.total) * 100;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4 animate-fade-in relative">
      {/* Module Navigation */}
      <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto">
            <button 
                onClick={() => setActiveTab('pos')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'pos' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                <LayoutGrid className="w-4 h-4" /> PDV (Frente de Caixa)
            </button>
            <button 
                onClick={() => setActiveTab('inventory')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'inventory' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                <Package className="w-4 h-4" /> Gestão de Estoque
            </button>
            <button 
                onClick={() => setActiveTab('calculator')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'calculator' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                <Calculator className="w-4 h-4" /> Calculadora de Margem
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button 
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
            >
                <FileBarChart className="w-4 h-4" /> Relatórios de Vendas
            </button>
        </div>
        
        {/* Unit Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-500 border border-slate-200">
             <Building className="w-4 h-4" /> Unidade Atual: CESOL Central
        </div>
      </div>

      {/* POS View - ROBUST */}
      {activeTab === 'pos' && (
        <div className="flex h-full gap-4 items-stretch overflow-hidden">
          {/* Left: Product Grid & Search */}
          <div className="flex-1 flex flex-col gap-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 overflow-hidden">
            {/* Search & Categories */}
            <div className="space-y-4 shrink-0">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Buscar produto por nome, código ou produtor..." 
                        className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-base"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                                selectedCategory === cat 
                                ? 'bg-brand-600 text-white border-brand-600 shadow-md' 
                                : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:bg-brand-50'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-20">
              {filteredProducts.map(product => (
                <button 
                  key={product.id} 
                  className="bg-white p-4 rounded-xl border border-slate-200 hover:border-brand-500 hover:ring-2 hover:ring-brand-100 transition-all text-left flex flex-col justify-between group h-48 active:scale-95"
                  onClick={() => addToCart(product)}
                >
                  <div className="w-full h-24 bg-slate-100 rounded-lg mb-3 flex items-center justify-center text-slate-300 group-hover:bg-brand-50 group-hover:text-brand-300 transition-colors">
                    <Package className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight">{product.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-1">{product.sku}</p>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <span className="font-black text-slate-900 text-lg">R$ {product.price.toFixed(2)}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${product.stock > 5 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {product.stock} un
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Cart / Receipt */}
          <div className="w-96 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden shrink-0">
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 opacity-80" />
                    <span className="font-bold">Cupom de Venda</span>
                </div>
                <div className="bg-white/10 px-2 py-1 rounded text-xs font-mono">
                    #{Math.floor(Math.random()*10000)}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-10 h-10 opacity-30" />
                  </div>
                  <p className="text-sm font-medium">Caixa Livre</p>
                  <p className="text-xs">Selecione produtos para iniciar</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex gap-3 animate-fade-in">
                    <div className="w-12 h-12 bg-slate-100 rounded-md flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 text-slate-300"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 truncate">{item.name}</h4>
                      <p className="text-xs text-slate-500">Unit: R$ {item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                         <span className="font-bold text-slate-900 text-sm">R$ {(item.price * item.quantity).toFixed(2)}</span>
                         <div className="flex items-center gap-2 bg-slate-100 rounded-md p-0.5">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-0.5 hover:bg-white rounded hover:shadow-sm"><Minus className="w-3 h-3"/></button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-0.5 hover:bg-white rounded hover:shadow-sm"><Plus className="w-3 h-3"/></button>
                         </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 self-start -mt-1 -mr-1">
                        <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 bg-white border-t border-slate-200 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-10">
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-slate-500 text-sm">
                    <span>Subtotal</span>
                    <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-sm">
                    <span>Descontos</span>
                    <span>R$ 0,00</span>
                </div>
                <div className="border-t border-dashed border-slate-200 my-2"></div>
                <div className="flex justify-between items-end">
                    <span className="text-slate-800 font-bold">Total a Pagar</span>
                    <span className="text-3xl font-black text-slate-900 tracking-tight">R$ {cartTotal.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 mb-4">
                  {['Dinheiro', 'Pix', 'Crédito', 'Débito'].map(method => (
                      <button key={method} className="px-2 py-2 rounded border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 transition-colors">
                          {method}
                      </button>
                  ))}
              </div>

              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg shadow-brand-200 flex justify-center items-center gap-2 transition-all active:scale-[0.98]"
              >
                <CreditCard className="w-5 h-5" /> Finalizar Venda ({cartItemCount})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SALES REPORT MODAL (New) */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowReportModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden animate-scale-in flex flex-col h-[90vh] md:h-auto md:max-h-[90vh]">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <FileBarChart className="w-5 h-5 text-purple-600"/> 
                            Relatório de Vendas
                        </h3>
                        <p className="text-xs text-slate-500">
                           Análise de desempenho comercial e administrativo
                        </p>
                    </div>
                    <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    
                    {/* Filters */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Data Inicial</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input 
                                    type="date" 
                                    value={reportDates.start}
                                    onChange={(e) => setReportDates({...reportDates, start: e.target.value})}
                                    className="pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Data Final</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input 
                                    type="date" 
                                    value={reportDates.end}
                                    onChange={(e) => setReportDates({...reportDates, end: e.target.value})}
                                    className="pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                        </div>
                        <button className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Gerar Análise
                        </button>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">Faturamento Total</p>
                                <p className="text-2xl font-black text-slate-800">R$ {reportData.summary.total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                <Receipt className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">Volume de Vendas</p>
                                <p className="text-2xl font-black text-slate-800">{reportData.summary.transactions} <span className="text-sm font-medium text-slate-400">transações</span></p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
                                <Tag className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">Ticket Médio</p>
                                <p className="text-2xl font-black text-slate-800">R$ {reportData.summary.ticket.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                            </div>
                        </div>
                    </div>

                    {/* ADMINISTRATIVE / FINANCIAL BREAKDOWN */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
                         <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-slate-500"/> Detalhamento Financeiro (Administrativo)
                         </h4>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                             {/* Stats */}
                             <div className="space-y-4">
                                 <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                                     <div className="flex justify-between items-end mb-1">
                                         <p className="text-xs font-bold text-green-700 uppercase">Repasse aos Produtores</p>
                                         <span className="text-xs font-bold bg-white px-2 py-0.5 rounded text-green-700 border border-green-200">{producerPercentage.toFixed(0)}%</span>
                                     </div>
                                     <p className="text-2xl font-black text-green-800">R$ {reportData.summary.producerTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                                     <p className="text-[10px] text-green-600 mt-1">Valor líquido destinado aos beneficiários</p>
                                 </div>
                                 
                                 <div className="p-4 rounded-lg bg-brand-50 border border-brand-100">
                                     <div className="flex justify-between items-end mb-1">
                                         <p className="text-xs font-bold text-brand-700 uppercase">Receita Operacional (Loja)</p>
                                         <span className="text-xs font-bold bg-white px-2 py-0.5 rounded text-brand-700 border border-brand-200">{storePercentage.toFixed(0)}%</span>
                                     </div>
                                     <p className="text-2xl font-black text-brand-800">R$ {reportData.summary.storeTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                                     <p className="text-[10px] text-brand-600 mt-1">Margem retida para manutenção do CESOL</p>
                                 </div>
                             </div>

                             {/* Visual Representation */}
                             <div className="flex flex-col justify-center h-full space-y-4">
                                 <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                                     <span>Distribuição da Receita</span>
                                     <span>100% Total</span>
                                 </div>
                                 <div className="w-full h-8 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                                     <div 
                                        className="h-full bg-green-500 flex items-center justify-center text-[10px] font-bold text-white transition-all duration-1000" 
                                        style={{width: `${producerPercentage}%`}}
                                     >
                                        Produtor
                                     </div>
                                     <div 
                                        className="h-full bg-brand-500 flex items-center justify-center text-[10px] font-bold text-white transition-all duration-1000" 
                                        style={{width: `${storePercentage}%`}}
                                     >
                                        Loja
                                     </div>
                                 </div>
                                 <div className="flex gap-4 text-xs justify-center pt-2">
                                     <div className="flex items-center gap-1.5">
                                         <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                         <span className="text-slate-600">Custo do Produto</span>
                                     </div>
                                     <div className="flex items-center gap-1.5">
                                         <div className="w-3 h-3 bg-brand-500 rounded-full"></div>
                                         <span className="text-slate-600">Taxa Administrativa</span>
                                     </div>
                                 </div>
                             </div>
                         </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Daily Sales Chart */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[300px]">
                            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-brand-500" />
                                Evolução de Vendas (Diário)
                            </h4>
                            <ResponsiveContainer width="100%" height="85%">
                                <AreaChart data={reportData.dailySales}>
                                    <defs>
                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F97316" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                                    <YAxis tick={{fontSize: 12}} tickFormatter={(val) => `R$${val}`}/>
                                    <Tooltip 
                                        contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1)'}}
                                        formatter={(val: number) => [`R$ ${val}`, 'Vendas']}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#F97316" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Category Pie Chart */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[300px]">
                             <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                                <PieChartIcon className="w-5 h-5 text-emerald-500" />
                                Participação por Categoria
                            </h4>
                            <ResponsiveContainer width="100%" height="85%">
                                <PieChart>
                                    <Pie
                                        data={reportData.categorySales}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {reportData.categorySales.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(val: number) => `R$ ${val}`} />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                    <button 
                        onClick={() => alert("Relatório em PDF gerado (Simulação)")}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg shadow-sm transition-colors text-sm"
                    >
                        Exportar PDF
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Registration/Edit Modal - Kept Robust as Requested */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowRegisterModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <Tag className="w-5 h-5 text-brand-600"/> 
                            {editingId ? 'Editar Produto' : 'Cadastro de Produto'}
                        </h3>
                        <p className="text-xs text-slate-500">
                           {editingId ? 'Atualizar informações do item' : 'Adicionar novo item ao estoque'}
                        </p>
                    </div>
                    <button onClick={() => setShowRegisterModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="productForm" onSubmit={handleRegisterSubmit} className="space-y-6">
                        
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Produto</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                    placeholder="Ex: Mel Silvestre Orgânico 500g"
                                    value={newProduct.name}
                                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">SKU (Código)</label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                    placeholder="Gerado auto se vazio"
                                    value={newProduct.sku}
                                    onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                                <select 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                    value={newProduct.category}
                                    onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                                >
                                    <option value="Artesanato">Artesanato</option>
                                    <option value="Agricultura">Agricultura</option>
                                    <option value="Culinária">Culinária</option>
                                    <option value="Serviços">Serviços</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Produtor / Beneficiário</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    <select 
                                        required
                                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all appearance-none"
                                        value={newProduct.producerId}
                                        onChange={e => setNewProduct({...newProduct, producerId: e.target.value})}
                                    >
                                        <option value="">Selecione o produtor responsável...</option>
                                        {contacts.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Smart Pricing Section */}
                        <div className="bg-brand-50 p-5 rounded-xl border border-brand-100">
                            <h4 className="text-sm font-bold text-brand-800 flex items-center gap-2 mb-4">
                                <Calculator className="w-4 h-4"/> Precificação Inteligente
                            </h4>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-1">Custo Produtor (R$)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-brand-400 text-sm">R$</span>
                                        <input 
                                            required
                                            type="number" 
                                            min="0"
                                            step="0.01"
                                            className="w-full pl-9 pr-3 py-2 bg-white border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-brand-900 font-bold"
                                            value={newProduct.cost || ''}
                                            onChange={e => setNewProduct({...newProduct, cost: parseFloat(e.target.value) || 0})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-1">Margem Loja (%)</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        className="w-full px-3 py-2 bg-white border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-brand-900 font-bold"
                                        value={newProduct.tax}
                                        onChange={e => setNewProduct({...newProduct, tax: parseFloat(e.target.value) || 0})}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-brand-200 shadow-sm">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Preço Final Calculado</p>
                                    <p className="text-2xl font-black text-slate-800 tracking-tight">
                                        R$ {calculatedRegistrationPrice.toFixed(2)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">Lucro Estimado</p>
                                    <p className="text-sm font-bold text-green-600">
                                        + R$ {(calculatedRegistrationPrice - newProduct.cost).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Stock */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Estoque Inicial</label>
                            <input 
                                type="number" 
                                min="0"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                value={newProduct.stock}
                                onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})}
                            />
                        </div>
                    </form>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button 
                        onClick={() => setShowRegisterModal(false)}
                        className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-sm transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit"
                        form="productForm"
                        className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm rounded-lg shadow-sm flex items-center gap-2 transition-all hover:scale-105"
                    >
                        <Save className="w-4 h-4" /> {editingId ? 'Atualizar Produto' : 'Salvar Produto'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};