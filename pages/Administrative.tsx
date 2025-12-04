import React, { useState } from 'react';
import { DollarSign, FileText, PieChart as PieChartIcon, TrendingUp, TrendingDown, Plus, Search, Filter, AlertCircle, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Types specific to this module
interface Expense {
  id: string;
  description: string;
  category: 'Operacional' | 'Pessoal' | 'Materiais' | 'Transporte' | 'Serviços';
  value: number;
  date: string;
  status: 'Pendente' | 'Aprovado' | 'Pago' | 'Rejeitado';
  requester: string;
}

const INITIAL_EXPENSES: Expense[] = [
  { id: '1', description: 'Material de Escritório (Papel A4, Toner)', category: 'Materiais', value: 450.00, date: '2023-10-25', status: 'Pago', requester: 'Ana Silva' },
  { id: '2', description: 'Manutenção do Ar Condicionado', category: 'Serviços', value: 280.00, date: '2023-10-26', status: 'Aprovado', requester: 'Carlos Souza' },
  { id: '3', description: 'Combustível Visita Técnica (Litoral)', category: 'Transporte', value: 150.00, date: '2023-10-27', status: 'Pendente', requester: 'Marcos Oliveira' },
  { id: '4', description: 'Coffee Break - Oficina de Precificação', category: 'Operacional', value: 320.00, date: '2023-10-28', status: 'Pendente', requester: 'Julia Santos' },
  { id: '5', description: 'Internet e Telefonia (Outubro)', category: 'Operacional', value: 189.90, date: '2023-10-20', status: 'Pago', requester: 'Financeiro' },
  // Adding previous month data for chart demonstration
  { id: '6', description: 'Aluguel Equipamentos (Setembro)', category: 'Operacional', value: 1200.00, date: '2023-09-15', status: 'Pago', requester: 'Financeiro' },
  { id: '7', description: 'Combustível (Setembro)', category: 'Transporte', value: 350.00, date: '2023-09-10', status: 'Pago', requester: 'Marcos Oliveira' },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const Administrative: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [filter, setFilter] = useState('Todos');
  const [showForm, setShowForm] = useState(false);
  
  // New Expense Form State
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    description: '',
    value: 0,
    category: 'Operacional',
    requester: ''
  });

  // Derived Statistics
  const totalBudget = 50000; // Mock Monthly Budget
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.value, 0);
  const remainingBudget = totalBudget - totalSpent;
  const pendingCount = expenses.filter(e => e.status === 'Pendente').length;

  // Chart Data preparation: Category
  const categoryData = Object.values(expenses.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = { name: curr.category, value: 0 };
    acc[curr.category].value += curr.value;
    return acc;
  }, {} as Record<string, { name: string, value: number }>));

  // Chart Data preparation: Monthly
  const monthlyData = Object.values(expenses.reduce((acc, curr) => {
    const date = new Date(curr.date);
    // Format: "Out/2023"
    const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    const sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) acc[monthKey] = { name: monthKey, value: 0, sortKey };
    acc[monthKey].value += curr.value;
    return acc;
  }, {} as Record<string, { name: string, value: number, sortKey: string }>))
  .sort((a: any, b: any) => a.sortKey.localeCompare(b.sortKey));

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpense.description && newExpense.value) {
      const expense: Expense = {
        id: Math.random().toString(36).substr(2, 9),
        description: newExpense.description,
        value: Number(newExpense.value),
        category: newExpense.category as any,
        date: new Date().toISOString().split('T')[0],
        status: 'Pendente',
        requester: newExpense.requester || 'Usuário Atual'
      };
      setExpenses([expense, ...expenses]);
      setShowForm(false);
      setNewExpense({ description: '', value: 0, category: 'Operacional', requester: '' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pago': return 'bg-green-100 text-green-700 border-green-200';
      case 'Aprovado': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pendente': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Rejeitado': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Orçamento Mensal</p>
              <h3 className="text-2xl font-bold text-slate-900">R$ {totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>Verba liberada (Convênio 001/24)</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Executado</p>
              <h3 className="text-2xl font-bold text-slate-900">R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <PieChartIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${(totalSpent / totalBudget) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-right">{((totalSpent / totalBudget) * 100).toFixed(1)}% do orçamento</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Pendências</p>
              <h3 className="text-2xl font-bold text-slate-900">{pendingCount}</h3>
            </div>
            <div className="p-3 rounded-lg bg-amber-100 text-amber-600">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-amber-600 font-medium">
            <AlertCircle className="w-3 h-3" />
            <span>Requisições aguardando aprovação</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Composição de Gastos (Categoria)</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => `R$ ${value.toLocaleString()}`} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Evolução de Gastos (Mensal)</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                   tick={{ fontSize: 12, fill: '#64748b' }} 
                   axisLine={false} 
                   tickLine={false}
                   tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Total Gasto']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Expenses Table Section - Full Width */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <div>
                <h3 className="text-lg font-bold text-slate-900">Despesas & Requisições</h3>
                <p className="text-sm text-slate-500">Gestão financeira da unidade</p>
             </div>
             <button 
               onClick={() => setShowForm(!showForm)}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${showForm ? 'bg-slate-200 text-slate-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
             >
               {showForm ? <><Search className="w-4 h-4"/> Cancelar</> : <><Plus className="w-4 h-4"/> Nova Requisição</>}
             </button>
          </div>

          {showForm && (
            <div className="p-6 bg-blue-50 border-b border-blue-100 animate-fade-in">
              <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div className="lg:col-span-2">
                  <label className="block text-xs font-medium text-blue-800 mb-1">Descrição</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="Ex: Compra de Material de Limpeza"
                    value={newExpense.description}
                    onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-800 mb-1">Categoria</label>
                  <select 
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={newExpense.category}
                    onChange={e => setNewExpense({...newExpense, category: e.target.value as any})}
                  >
                    <option value="Operacional">Operacional</option>
                    <option value="Pessoal">Pessoal</option>
                    <option value="Materiais">Materiais</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Serviços">Serviços</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-800 mb-1">Valor (R$)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={newExpense.value || ''}
                    onChange={e => setNewExpense({...newExpense, value: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="lg:col-span-4 flex justify-end">
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                        Salvar Lançamento
                    </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Descrição</th>
                  <th className="px-6 py-3">Categoria</th>
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3">Valor</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Solicitante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{expense.description}</td>
                    <td className="px-6 py-4 text-slate-500">{expense.category}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">R$ {expense.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(expense.status)}`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">{expense.requester}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {expenses.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                    Nenhum lançamento encontrado.
                </div>
            )}
          </div>
        </div>
    </div>
  );
};