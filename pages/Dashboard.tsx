import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Deal, DealStage, User, UserRole } from '../types';
import { Calendar, Tablet, FileText, CheckCircle2, UserCheck, LayoutDashboard } from 'lucide-react';

interface DashboardProps {
  deals: Deal[];
  totalContacts: number;
  users: User[];
  currentUser: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ deals, totalContacts, users, currentUser }) => {
  const isManager = currentUser.role === UserRole.PRESIDENTE || currentUser.role === UserRole.COORD_GERAL;
  
  // Filter deals based on role: Managers see all, ASPs see only theirs
  const relevantDeals = isManager ? deals : deals.filter(d => d.assigneeId === currentUser.id);

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

  // Card Configuration
  const cards = [
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
    <div className="space-y-6">
      
      {/* Top Section: Kanban Stage Stats (Individualized) */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-slate-500"/>
            {isManager ? 'Visão Global de Produção' : 'Minhas Etapas de Atendimento'}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{card.label}</p>
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