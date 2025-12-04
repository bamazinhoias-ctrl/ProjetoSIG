import React, { useState, useMemo } from 'react';
import { Product, CartItem, Contact } from '../types';
import { ShoppingCart, Package, Calculator, Search, Trash2, Plus, Minus, CreditCard, ArrowRight, Truck, X, Save, DollarSign, User, Tag, Pencil, Edit } from 'lucide-react';

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
  
  // Registration/Edit Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
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

  // Inventory Filter
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    // Reverse calculate tax/margin based on price and cost
    // Price = Cost + (Cost * Tax/100)
    // Tax = ((Price - Cost) / Cost) * 100
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

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in relative">
      {/* Module Navigation */}
      <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm w-fit">
        <button 
          onClick={() => setActiveTab('pos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'pos' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <ShoppingCart className="w-4 h-4" /> Frente de Caixa (PDV)
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'inventory' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Package className="w-4 h-4" /> Estoque Distribuído
        </button>
        <button 
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'calculator' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Calculator className="w-4 h-4" /> Calculadora Reversa
        </button>
      </div>

      {/* POS View */}
      {activeTab === 'pos' && (
        <div className="flex h-full gap-6 items-start">
          {/* Product Grid */}
          <div className="flex-1 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Buscar produto por nome ou SKU..." 
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto max-h-[calc(100vh-250px)] pb-4">
              {filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => addToCart(product)}
                >
                  <div className="h-32 bg-slate-100 rounded-lg mb-3 flex items-center justify-center text-slate-300">
                    <Package className="w-10 h-10" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-slate-500 mb-2">{product.sku}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-600">R$ {product.price.toFixed(2)}</span>
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">Est: {product.stock}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="w-96 bg-white rounded-xl border border-slate-200 shadow-lg flex flex-col h-[calc(100vh-140px)] sticky top-4">
            <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" /> Carrinho de Compras
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
                  <p className="text-sm">Carrinho vazio</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-slate-900 line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-blue-600 font-bold">R$ {item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-white rounded-md border border-slate-200">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-100 text-slate-600"><Minus className="w-3 h-3" /></button>
                        <span className="text-xs w-6 text-center font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-100 text-slate-600"><Plus className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 rounded-b-xl space-y-4">
              <div className="flex justify-between items-center text-sm text-slate-600">
                <span>Subtotal</span>
                <span>R$ {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-slate-900">
                <span>Total</span>
                <span>R$ {cartTotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold shadow-sm flex justify-center items-center gap-2 transition-all"
              >
                <CreditCard className="w-4 h-4" /> Finalizar Venda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calculator View */}
      {activeTab === 'calculator' && (
        <div className="max-w-2xl mx-auto w-full pt-10">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="bg-slate-900 p-6 text-white text-center">
              <Calculator className="w-8 h-8 mx-auto mb-2 opacity-80" />
              <h2 className="text-xl font-bold">Calculadora Reversa</h2>
              <p className="text-slate-400 text-sm">Escopo PDF: Custo Produtor + Taxa Adm = Preço Final</p>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Custo do Produtor (R$)</label>
                  <input 
                    type="number" 
                    value={calcCost}
                    onChange={e => setCalcCost(Number(e.target.value))}
                    className="w-full text-2xl font-bold p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-slate-500 mt-2">Valor repassado integralmente</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Taxa Administrativa (%)</label>
                  <input 
                    type="number" 
                    value={calcTax}
                    onChange={e => setCalcTax(Number(e.target.value))}
                    className="w-full text-2xl font-bold p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="20"
                  />
                  <p className="text-xs text-slate-500 mt-2">Custos operacionais da Loja</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 text-slate-300">
                <ArrowRight className="w-6 h-6" />
              </div>

              <div className="bg-blue-600 text-white p-6 rounded-xl text-center shadow-inner">
                <p className="text-sm opacity-80 mb-1">Preço Final Sugerido</p>
                <span className="text-4xl font-bold">R$ {finalPriceStandalone.toFixed(2)}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-xs text-slate-500 flex justify-between">
                 <span>Repasse Produtor: <b>R$ {calcCost.toFixed(2)}</b></span>
                 <span>Margem Loja: <b>R$ {(finalPriceStandalone - calcCost).toFixed(2)}</b></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table View */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 animate-slide-in">
           <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <h3 className="font-bold text-slate-700">Controle de Estoque</h3>
             <div className="flex gap-2">
                <button 
                  onClick={openNewProductModal}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Novo Produto
                </button>
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-lg font-medium transition-colors">
                  <Truck className="w-4 h-4" /> Transferência
                </button>
             </div>
           </div>
           <table className="w-full text-left text-sm">
             <thead className="bg-slate-50 text-slate-500 font-medium">
               <tr>
                 <th className="px-6 py-3">Produto</th>
                 <th className="px-6 py-3">SKU</th>
                 <th className="px-6 py-3">Categoria</th>
                 <th className="px-6 py-3">Produtor</th>
                 <th className="px-6 py-3 text-right">Preço</th>
                 <th className="px-6 py-3 text-center">Estoque</th>
                 <th className="px-6 py-3 text-right">Ações</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {products.map(product => (
                 <tr key={product.id} className="hover:bg-slate-50 group">
                   <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                   <td className="px-6 py-4 text-slate-500 font-mono text-xs">{product.sku}</td>
                   <td className="px-6 py-4 text-slate-600">{product.category}</td>
                   <td className="px-6 py-4 text-slate-600">
                      {contacts.find(c => c.id === product.producerId)?.name || 'N/A'}
                   </td>
                   <td className="px-6 py-4 text-right font-medium">R$ {product.price.toFixed(2)}</td>
                   <td className="px-6 py-4 text-center">
                     <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                       {product.stock} un
                     </span>
                   </td>
                   <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                         <button 
                            onClick={() => openEditProductModal(product)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors"
                            title="Editar"
                         >
                            <Pencil className="w-4 h-4" />
                         </button>
                         <button 
                            onClick={() => onDeleteProduct(product.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-colors"
                            title="Excluir"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      )}

      {/* Registration/Edit Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowRegisterModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <Tag className="w-5 h-5 text-blue-600"/> 
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
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Ex: Mel Silvestre Orgânico 500g"
                                    value={newProduct.name}
                                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">SKU (Código)</label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Gerado auto se vazio"
                                    value={newProduct.sku}
                                    onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                                <select 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
                                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
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
                        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                            <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-4">
                                <Calculator className="w-4 h-4"/> Precificação Inteligente
                            </h4>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">Custo Produtor (R$)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-blue-400 text-sm">R$</span>
                                        <input 
                                            required
                                            type="number" 
                                            min="0"
                                            step="0.01"
                                            className="w-full pl-9 pr-3 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-blue-900 font-bold"
                                            value={newProduct.cost || ''}
                                            onChange={e => setNewProduct({...newProduct, cost: parseFloat(e.target.value) || 0})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">Margem Loja (%)</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-blue-900 font-bold"
                                        value={newProduct.tax}
                                        onChange={e => setNewProduct({...newProduct, tax: parseFloat(e.target.value) || 0})}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
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
                            <label className="block text-sm font-medium text-slate-700 mb-1">Estoque Atual</label>
                            <input 
                                type="number" 
                                min="0"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm flex items-center gap-2 transition-all hover:scale-105"
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