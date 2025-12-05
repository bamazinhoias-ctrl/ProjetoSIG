import React, { useState, useMemo } from 'react';
import { DollarSign, FileText, PieChart as PieChartIcon, TrendingUp, TrendingDown, Plus, Search, Filter, AlertCircle, CheckCircle, Wallet, ArrowUpRight, ArrowDownRight, User as UserIcon, X, Check, FileCheck, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import { User, Product, Contact, Transaction, TransactionType, TransactionStatus, TransactionCategory, UserRole } from '../types';

interface AdministrativeProps {
    users?: User[];
    products?: Product[];
    contacts?: Contact[];
    currentUser?: User;
}

// Mock Initial Data
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', description: 'Venda Loja #8821', type: 'Receita', category: 'Vendas', value: 1250.00, date: '2023-10-25', status: 'Aprovado', requesterId: 'sys', requesterName: 'Sistema PDV' },
  { id: '2', description: 'Compra de Papel A4 e Toner', type: 'Despesa', category: 'Materiais', value: 450.00, date: '2023-10-26', status: 'Pago', requesterId: '6', requesterName: 'Julia Auxiliar' },
  { id: '3', description: 'Manutenção Ar Condicionado', type: 'Despesa', category: 'Serviços', value: 280.00, date: '2023-10-26', status: 'Pendente', requesterId: '6', requesterName: 'Julia Auxiliar' },
  { id: '4', description: 'Reembolso Combustível (Visita Litoral)', type: 'Despesa', category: 'Transporte', value: 150.00, date: '2023-10-27', status: 'Pendente', requesterId: '2', requesterName: 'João ASP' },
  { id: '5', description: 'Repasse Produtor (Assoc. Mulheres)', type: 'Despesa', category: 'Repasse', value: 890.00, date: '2023-10-24', status: 'Aprovado', requesterId: '5', requesterName: 'Ana Financeiro' },
  { id: '6', description: 'Venda Loja #8822', type: 'Receita', category: 'Vendas', value: 340.00, date: '2023-10-27', status: 'Aprovado', requesterId: 'sys', requesterName: 'Sistema PDV' },
];

const CATEGORY_COLORS: Record<string, string> = {
    'Operacional': '#64748b',
    'Pessoal': '#e11d48',
    'Materiais': '#f59e0b',
    'Transporte': '#0ea5e9',
    'Serviços': '#8b5cf6',
    'Vendas': '#10b981',
    'Repasse': '#f97316',
    'Outros': '#94a3b8'
};

export const Administrative: React.FC<AdministrativeProps> = ({ users, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'entries' | 'approvals'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [showModal, setShowModal] = useState(false);
  
  // Filters
  const [filterType, setFilterType] = useState<'Todos' | 'Receita' | 'Despesa'>('Todos');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');

  // New Transaction State
  const [newTrans, setNewTrans] = useState<Partial<Transaction>>({
    description: '',
    value: 0,
    type: 'Despesa',
    category: 'Operacional',
    date: new Date().toISOString().split('T')[0],
  });

  // Permission Logic
  const canApprove = currentUser && (currentUser.role === UserRole.PRESIDENTE || currentUser.role === UserRole.COORD_ADMIN);
  const canEditFinancials = currentUser && (currentUser.role === UserRole.PRESIDENTE || currentUser.role === UserRole.COORD_ADMIN || currentUser.role === UserRole.AUX_ADMIN);

  // --- Calculations ---
  const totalRevenue = transactions.filter(t => t.type === 'Receita' && t.status !== 'Rejeitado').reduce((acc, t) => acc + t.value, 0);
  const totalExpense = transactions.filter(t => t.type === 'Despesa' && t.status !== 'Rejeitado').reduce((acc, t) => acc + t.value, 0);
  const balance = totalRevenue - totalExpense;
  const pendingCount = transactions.filter(t => t.status === 'Pendente').length;

  // Chart Data
  const monthlyData = [
      { name: 'Out 01-07', receita: 4000, despesa: 2400 },
      { name: 'Out 08-14', receita: 3000, despesa: 1398 },
      { name: 'Out 15-21', receita: 2000, despesa: 9800 },
      { name: 'Out 22-28', receita: 2780, despesa: 3908 },
  ];

  const categoryData = Object.values(transactions.reduce<Record<string, {name: string, value: number}>>((acc, curr) => {
      if (curr.type === 'Despesa' && curr.status !== 'Rejeitado') {
        if (!acc[curr.category]) acc[curr.category] = { name: curr.category, value: 0 };
        acc[curr.category].value += curr.value;
      }
      return acc;
  }, {}));

  // --- Actions ---
  const handleSaveTransaction = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTrans.description || !newTrans.value) return;

      const transaction: Transaction = {
          id: Math.random().toString(36).substr(2, 9),
          description: newTrans.description,
          value: Number(newTrans.value),
          type: newTrans.type as TransactionType,
          category: newTrans.category as TransactionCategory,
          date: newTrans.date || new Date().toISOString().split('T')[0],
          status: canApprove ? 'Aprovado' : 'Pendente', // Auto-approve if created by admin
          requesterId: currentUser?.id || 'unknown',
          requesterName: currentUser?.name || 'Usuário',
          notes: newTrans.notes
      };

      setTransactions([transaction, ...transactions]);
      setShowModal(false);
      setNewTrans({ description: '', value: 0, type: 'Despesa', category: 'Operacional', date: new Date().toISOString().split('T')[0] });
  };

  const updateStatus = (id: string, newStatus: TransactionStatus) => {
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: newStatus, approverId: currentUser?.id, approvedDate: new Date().toISOString() } : t));
  };

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
        case 'Pago': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'Aprovado': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'Pendente': return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'Rejeitado': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-slate-100';
    }
  };

  // Filtered List
  const displayTransactions = transactions.filter(t => {
      if (filterType !== 'Todos' && t.type !== filterType) return false;
      if (filterStatus !== 'Todos' && t.status !== filterStatus) return false;
      return true;
  });

  const pendingTransactions = transactions.filter(t => t.status === 'Pendente');

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
         <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
             <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-brand-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
             >
                 <PieChartIcon className="w-4 h-4"/> Dashboard
             </button>
             <button 
                onClick={() => setActiveTab('entries')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'entries' ? 'bg-brand-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
             >
                 <FileText className="w-4 h-4"/> Extrato de Lançamentos
             </button>
             <button 
                onClick={() => setActiveTab('approvals')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap relative ${activeTab === 'approvals' ? 'bg-brand-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
             >
                 <FileCheck className="w-4 h-4"/> Central de Aprovações
                 {pendingCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] rounded-full border-2 border-white">{pendingCount}</span>}
             </button>
         </div>

         {canEditFinancials && (
             <button 
                onClick={() => setShowModal(true)}
                className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md transition-all whitespace-nowrap"
             >
                 <Plus className="w-4 h-4"/> Novo Lançamento
             </button>
         )}
      </div>

      {/* DASHBOARD VIEW */}
      {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-slide-in">
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp className="w-16 h-16 text-emerald-600"/></div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Receitas (Mês)</p>
                      <h3 className="text-2xl font-black text-emerald-600 mt-1">R$ {totalRevenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
                      <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3 text-emerald-500"/> +12% vs mês anterior
                      </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingDown className="w-16 h-16 text-red-600"/></div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Despesas (Mês)</p>
                      <h3 className="text-2xl font-black text-red-600 mt-1">R$ {totalExpense.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
                      <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                          <ArrowDownRight className="w-3 h-3 text-red-500"/> -5% vs mês anterior
                      </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet className="w-16 h-16 text-brand-600"/></div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Saldo Atual</p>
                      <h3 className={`text-2xl font-black mt-1 ${balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>R$ {balance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
                      <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full">
                           <div className="bg-brand-500 h-1.5 rounded-full" style={{width: '65%'}}></div>
                      </div>
                  </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[350px]">
                      <h4 className="text-lg font-bold text-slate-800 mb-6">Fluxo de Caixa</h4>
                      <ResponsiveContainer width="100%" height="85%">
                          <BarChart data={monthlyData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="name" tick={{fontSize: 12}} />
                              <YAxis tick={{fontSize: 12}} />
                              <Tooltip contentStyle={{borderRadius: '8px', border:'none'}}/>
                              <Legend />
                              <Bar dataKey="receita" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="despesa" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[350px]">
                      <h4 className="text-lg font-bold text-slate-800 mb-6">Despesas por Categoria</h4>
                      <ResponsiveContainer width="100%" height="85%">
                          <PieChart>
                              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                  {categoryData.map((entry: any, index: number) => (
                                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#cbd5e1'} />
                                  ))}
                              </Pie>
                              <Tooltip formatter={(value) => `R$ ${value}`}/>
                              <Legend />
                          </PieChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </div>
      )}

      {/* ENTRIES VIEW (LIST) */}
      {activeTab === 'entries' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-slide-in">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-brand-600"/> Livro Caixa
                  </h3>
                  <div className="flex items-center gap-2">
                      <select 
                        value={filterType} 
                        onChange={e => setFilterType(e.target.value as any)}
                        className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-3 py-2 outline-none"
                      >
                          <option value="Todos">Todas Operações</option>
                          <option value="Receita">Apenas Receitas</option>
                          <option value="Despesa">Apenas Despesas</option>
                      </select>
                      <select 
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-3 py-2 outline-none"
                      >
                          <option value="Todos">Todos Status</option>
                          <option value="Pago">Pagos</option>
                          <option value="Pendente">Pendentes</option>
                          <option value="Aprovado">Aprovados</option>
                      </select>
                  </div>
              </div>
              
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase border-b border-slate-200">
                          <tr>
                              <th className="px-6 py-4">Data</th>
                              <th className="px-6 py-4">Descrição</th>
                              <th className="px-6 py-4">Categoria</th>
                              <th className="px-6 py-4">Solicitante</th>
                              <th className="px-6 py-4">Valor</th>
                              <th className="px-6 py-4">Status</th>
                              {canEditFinancials && <th className="px-6 py-4 text-right">Ação</th>}
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {displayTransactions.map(t => (
                              <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{new Date(t.date).toLocaleDateString()}</td>
                                  <td className="px-6 py-4 font-medium text-slate-800">{t.description}</td>
                                  <td className="px-6 py-4">
                                      <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                          {t.category}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 text-xs text-slate-500 flex items-center gap-1">
                                      <UserIcon className="w-3 h-3"/> {t.requesterName}
                                  </td>
                                  <td className={`px-6 py-4 font-bold ${t.type === 'Receita' ? 'text-emerald-600' : 'text-red-600'}`}>
                                      {t.type === 'Receita' ? '+' : '-'} R$ {t.value.toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4">
                                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(t.status)}`}>
                                          {t.status}
                                      </span>
                                  </td>
                                  {canEditFinancials && (
                                      <td className="px-6 py-4 text-right">
                                          {t.status === 'Aprovado' && (
                                              <button 
                                                onClick={() => updateStatus(t.id, 'Pago')}
                                                className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1 rounded border border-emerald-200 font-bold transition-colors"
                                              >
                                                  Confirmar Pagto
                                              </button>
                                          )}
                                      </td>
                                  )}
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  {displayTransactions.length === 0 && (
                      <div className="p-10 text-center text-slate-400">Nenhum lançamento encontrado com os filtros atuais.</div>
                  )}
              </div>
          </div>
      )}

      {/* APPROVALS VIEW */}
      {activeTab === 'approvals' && (
          <div className="animate-slide-in">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-brand-600"/> Pendências de Aprovação
              </h3>
              
              {pendingTransactions.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-10 text-center flex flex-col items-center">
                      <CheckCircle className="w-12 h-12 text-emerald-500 mb-4 opacity-50"/>
                      <h4 className="text-lg font-bold text-slate-700">Tudo em dia!</h4>
                      <p className="text-slate-500">Não há requisições pendentes de análise no momento.</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pendingTransactions.map(t => (
                          <div key={t.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                              <div className={`h-1 w-full ${t.type === 'Receita' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                              <div className="p-5">
                                  <div className="flex justify-between items-start mb-3">
                                      <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">{t.category}</span>
                                      <span className="text-xs text-slate-400 font-mono">{new Date(t.date).toLocaleDateString()}</span>
                                  </div>
                                  <h4 className="font-bold text-slate-800 mb-1">{t.description}</h4>
                                  <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
                                      Solicitado por: <span className="font-medium text-slate-700">{t.requesterName}</span>
                                  </p>
                                  
                                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4 flex justify-between items-center">
                                      <span className="text-xs font-bold text-slate-500 uppercase">Valor</span>
                                      <span className={`text-lg font-black ${t.type === 'Receita' ? 'text-emerald-600' : 'text-red-600'}`}>
                                          R$ {t.value.toFixed(2)}
                                      </span>
                                  </div>

                                  {canApprove ? (
                                      <div className="grid grid-cols-2 gap-3">
                                          <button 
                                            onClick={() => updateStatus(t.id, 'Rejeitado')}
                                            className="py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-bold text-sm transition-colors"
                                          >
                                              Rejeitar
                                          </button>
                                          <button 
                                            onClick={() => updateStatus(t.id, 'Aprovado')}
                                            className="py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 font-bold text-sm transition-colors shadow-sm"
                                          >
                                              Aprovar
                                          </button>
                                      </div>
                                  ) : (
                                      <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded border border-amber-100 text-center">
                                          Aguardando aprovação da Coordenação.
                                      </div>
                                  )}
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}

      {/* NEW TRANSACTION MODAL */}
      {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}/>
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-slate-800 text-lg">Novo Lançamento</h3>
                      <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400 hover:text-red-500"/></button>
                  </div>
                  <form onSubmit={handleSaveTransaction} className="p-6 space-y-4">
                      
                      {/* Type Toggle */}
                      <div className="flex bg-slate-100 p-1 rounded-lg">
                          <button 
                            type="button" 
                            onClick={() => setNewTrans({...newTrans, type: 'Despesa'})}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${newTrans.type === 'Despesa' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}
                          >
                              Despesa
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setNewTrans({...newTrans, type: 'Receita'})}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${newTrans.type === 'Receita' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                          >
                              Receita
                          </button>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Descrição</label>
                          <input 
                            required 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" 
                            placeholder="Ex: Pagamento Fornecedor X"
                            value={newTrans.description}
                            onChange={e => setNewTrans({...newTrans, description: e.target.value})}
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Valor (R$)</label>
                              <input 
                                required 
                                type="number" 
                                min="0" 
                                step="0.01"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" 
                                value={newTrans.value || ''}
                                onChange={e => setNewTrans({...newTrans, value: parseFloat(e.target.value)})}
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Categoria</label>
                              <select 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                value={newTrans.category}
                                onChange={e => setNewTrans({...newTrans, category: e.target.value as any})}
                              >
                                  {Object.keys(CATEGORY_COLORS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                              </select>
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Data</label>
                          <input 
                            type="date" 
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" 
                            value={newTrans.date}
                            onChange={e => setNewTrans({...newTrans, date: e.target.value})}
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Observações / Anexo (Simulado)</label>
                          <textarea 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none h-20 resize-none" 
                            placeholder="Detalhes adicionais..."
                            value={newTrans.notes || ''}
                            onChange={e => setNewTrans({...newTrans, notes: e.target.value})}
                          />
                      </div>

                      <div className="pt-2">
                          <button type="submit" className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all">
                              Salvar Lançamento
                          </button>
                      </div>

                  </form>
              </div>
          </div>
      )}

    </div>
  );
};