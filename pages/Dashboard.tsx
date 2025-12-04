import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Deal, DealStage, User, UserRole } from '../types';
import { Calendar, Tablet, FileText, CheckCircle2, UserCheck, LayoutDashboard, Briefcase, DollarSign, ShoppingBag, Target, TrendingUp, Package } from 'lucide-react';

interface DashboardProps {
  deals: Deal[];
  totalContacts: number;
  users: User[];
  currentUser: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ deals, totalContacts, users, currentUser }) => {
  const isManager = currentUser.role === UserRole.PRESIDENTE || currentUser.role === UserRole.COORD_GERAL;
  const isSales = currentUser.role === UserRole.AGENTE_VENDA;
  
  // Filter deals based on role: Managers see all, ASPs see only theirs
  const relevantDeals = isManager ? deals : deals.filter(d => d.assigneeId === currentUser.id);

  // Calculate Unique Contacts for the current user view
  const myEmpreendimentosCount = useMemo(() => {
    if (isManager) return totalContacts;
    const uniqueIds = new Set(relevantDeals.map(d => d.contactId));
    return uniqueIds.size;
  }, [isManager, totalContacts, relevantDeals]);

  const stats = useMemo(() => {
    // Chart data: Value by Stage
    const chartData = Object.values(DealStage).map(stage => ({
      name: stage.split(' ')[0], // Short name
      value: relevantDeals.filter(d => d.stage === stage).length
    }));

    return { chartData };
  }, [relevantDeals]);

  // Stage Counters for Cards
  const stageCounts = {
    agendamento: relevantDeals.filter(d => d.stage === DealStage.AGENDAMENTO).length,
    coleta: relevantDeals.filter(d => d.stage === DealStage.COLETA_EVE || d.stage === DealStage.COLETA_CAD).length,
    plano: relevantDeals.filter(d => d.stage === DealStage.PLANO_ACAO).length,
    aprovacao: relevantDeals.filter(d => d.stage === DealStage.APROVACAO).length,
    concluido: relevantDeals.filter(d => d.stage === DealStage.CONCLUIDO).length,
  };

  // --- SALES AGENT DASHBOARD ---
  if (isSales) {
    // Mock Data for Sales Charts
    const salesData = [
        { name: 'Seg', value: 1200 },
        { name: 'Ter', value: 950 },
        { name: 'Qua', value: 1600 },
        { name: 'Qui', value: 1100 },
        { name: 'Sex', value: 2100 },
        { name: 'Sáb', value: 2800 },
        { name: 'Dom', value: 1800 },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
             <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-slate-500"/>
                    Dashboard Comercial (Loja)
                </h2>
                
                {/* Sales Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <span className="text-2xl font-bold text-emerald-900">R$ 1.250</span>
                        </div>
                        <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Volume Diário</p>
                    </div>

                    <div className="p-4 rounded-xl border border-blue-100 bg-blue-50 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <span className="text-2xl font-bold text-blue-900">R$ 45,90</span>
                        </div>
                        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Ticket Médio</p>
                    </div>

                     <div className="p-4 rounded-xl border border-purple-100 bg-purple-50 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                                <Target className="w-5 h-5" />
                            </div>
                            <span className="text-2xl font-bold text-purple-900">65%</span>
                        </div>
                        <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Meta de Loja</p>
                    </div>

                    <div className="p-4 rounded-xl border border-amber-100 bg-amber-50 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <span className="text-2xl font-bold text-amber-900">28</span>
                        </div>
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Transações</p>
                    </div>
                </div>
             </div>

             {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-slate-500"/> Evolução de Vendas (Semanal)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={salesData}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(val)=>`R$${val}`}/>
                            <Tooltip 
                                contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1)'}}
                                formatter={(val: number) => [`R$ ${val}`, 'Vendas']}
                            />
                            <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Products / Recent Sales */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-slate-500"/> Itens Mais Vendidos
                    </h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Mel Orgânico', qty: 45, val: 'R$ 890' },
                            { name: 'Kit Pano de Prato', qty: 32, val: 'R$ 640' },
                            { name: 'Doce de Leite', qty: 28, val: 'R$ 420' },
                            { name: 'Licor de Jenipapo', qty: 15, val: 'R$ 380' },
                            { name: 'Biscoito Caseiro', qty: 12, val: 'R$ 180' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                                    <p className="text-xs text-slate-500">{item.qty} unidades</p>
                                </div>
                                <span className="font-bold text-slate-700 text-sm">{item.val}</span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        Ver Relatório Completo
                    </button>
                </div>
            </div>
        </div>
    );
  }

  // --- STANDARD OPS VIEW (For ASPs, Coordinators, President) ---
  
  // Card Configuration
  const cards = [
    { 
      id: 'empreendimentos',
      label: isManager ? 'Base de Empreendimentos' : 'Meus Empreendimentos', 
      count: myEmpreendimentosCount, 
      icon: Briefcase, 
      color: 'bg-slate-100 text-slate-600 border-slate-200' 
    },
    { 
      id: 'agendamento',
      label: 'Agendamentos', 
      count: stageCounts.agendamento, 
      icon: Calendar, 
      color: 'bg-blue-50 text-blue-600 border-blue-100' 
    },
    { 
      id: 'coleta',
      label: 'Coleta (Campo)', 
      count: stageCounts.coleta, 
      icon: Tablet, 
      color: 'bg-amber-50 text-amber-600 border-amber-100' 
    },
    { 
      id: 'plano',
      label: 'Planos de Ação', 
      count: stageCounts.plano, 
      icon: FileText, 
      color: 'bg-purple-50 text-purple-600 border-purple-100' 
    },
    { 
      id: 'aprovacao',
      label: 'Em Aprovação', 
      count: stageCounts.aprovacao, 
      icon: UserCheck, 
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100' 
    },
    { 
      id: 'concluido',
      label: 'Concluídos', 
      count: stageCounts.concluido, 
      icon: CheckCircle2, 
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100' 
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Section: Kanban Stage Stats (Individualized) */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-slate-500"/>
            {isManager ? 'Visão Global de Produção' : 'Minhas Etapas de Atendimento'}
        </h2>
        
        {/* Adjusted grid columns to accommodate the new card (6 cards total) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {cards.map((card, index) => (
                <div 
                    key={card.id} 
                    className={`p-4 rounded-xl border transition-all duration-300 animate-fade-in hover:shadow-md ${card.color.replace('bg-', 'hover:bg-opacity-80 ')} border-slate-200 bg-white`}
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-lg ${card.color}`}>
                            <card.icon className="w-5 h-5" />
                        </div>
                        <span className="text-2xl font-bold text-slate-900">{card.count}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide truncate" title={card.label}>{card.label}</p>
                </div>
            ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[400px] animate-slide-in hover:shadow-md transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Fluxo de Atendimento</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{fontSize: 12, fill: '#64748b'}} 
                interval={0} 
              />
              <YAxis 
                tick={{fontSize: 12, fill: '#64748b'}} 
                allowDecimals={false}
              />
              <Tooltip 
                cursor={{fill: '#f1f5f9'}}
                formatter={(value: number) => [value, 'Atendimentos']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {stats.chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={'#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-slide-in hover:shadow-md transition-shadow duration-300" style={{ animationDelay: '100ms' }}>
           <h3 className="text-lg font-semibold text-slate-800 mb-4">
               {isManager ? 'Últimas Movimentações (Equipe)' : 'Meus Últimos Atendimentos'}
           </h3>
           <div className="space-y-4">
             {relevantDeals.slice(0, 5).map((deal, index) => (
               <div 
                 key={deal.id} 
                 className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-transparent hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 cursor-default"
                 style={{ animationDelay: `${index * 50}ms` }}
               >
                 <div>
                    <p className="font-medium text-slate-900">{deal.title}</p>
                    <p className="text-sm text-slate-500">{deal.stage}</p>
                 </div>
                 <div className="text-right">
                    <span className="text-xs font-semibold px-2 py-1 bg-white border border-slate-200 rounded text-slate-600 shadow-sm">
                        {deal.id.startsWith('EVE') ? 'Técnico' : 'Comercial'}
                    </span>
                 </div>
               </div>
             ))}
             {relevantDeals.length === 0 && <p className="text-slate-400">Nenhuma atividade recente.</p>}
           </div>
        </div>
      </div>
    </div>
  );
};