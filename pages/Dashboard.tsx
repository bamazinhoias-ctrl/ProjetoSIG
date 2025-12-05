import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, PieChart, Pie, Legend } from 'recharts';
import { Deal, DealStage, User, UserRole, Contact, View } from '../types';
import { Calendar, Tablet, FileText, CheckCircle2, UserCheck, LayoutDashboard, Briefcase, DollarSign, ShoppingBag, Target, TrendingUp, Package, Users, ArrowUpRight, ArrowDownRight, Wallet, AlertCircle, Clock, CheckCircle, ChevronDown, ChevronUp, Activity, BarChart3, PieChart as PieChartIcon, List } from 'lucide-react';

interface DashboardProps {
  deals: Deal[];
  totalContacts: number;
  users: User[];
  currentUser: User;
  contacts?: Contact[];
  onNavigate: (view: View) => void;
}

// --- REUSABLE COLLAPSIBLE SECTION COMPONENT ---
interface DashboardSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  color?: string; // Tailwind text color class for icon
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ title, icon: Icon, children, defaultOpen = true, color = "text-slate-500" }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6 transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-100"
      >
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-slate-50 border border-slate-100 ${color}`}>
             <Icon className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
        </div>
        <div className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5" />
        </div>
      </button>
      
      {isOpen && (
        <div className="p-6 animate-fade-in bg-slate-50/30">
          {children}
        </div>
      )}
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ deals, totalContacts, users, currentUser, contacts, onNavigate }) => {
  const isManager = currentUser.role === UserRole.PRESIDENTE || currentUser.role === UserRole.COORD_GERAL;
  const isAdminCoord = currentUser.role === UserRole.COORD_ADMIN;
  const isSales = currentUser.role === UserRole.AGENTE_VENDA;
  const isASP = currentUser.role === UserRole.AGENTE_PRODUTIVO;
  
  // Brand Colors
  const BRAND_PRIMARY = '#F97316'; 
  const BRAND_SECONDARY = '#F59E0B'; 
  
  // Filter deals
  const relevantDeals = isManager ? deals : deals.filter(d => d.assigneeId === currentUser.id);

  // Calculate Unique Contacts
  const myEmpreendimentosCount = useMemo(() => {
    if (isManager || isAdminCoord) return totalContacts;
    const uniqueIds = new Set(relevantDeals.map(d => d.contactId));
    return uniqueIds.size;
  }, [isManager, isAdminCoord, totalContacts, relevantDeals]);

  const stats = useMemo(() => {
    const chartData = Object.values(DealStage).map(stage => ({
      name: stage.split(' ')[0], 
      value: relevantDeals.filter(d => d.stage === stage).length
    }));
    return { chartData };
  }, [relevantDeals]);

  const stageCounts = {
    agendamento: relevantDeals.filter(d => d.stage === DealStage.AGENDAMENTO).length,
    coleta: relevantDeals.filter(d => d.stage === DealStage.COLETA_EVE || d.stage === DealStage.COLETA_CAD).length,
    plano: relevantDeals.filter(d => d.stage === DealStage.PLANO_ACAO).length,
    aprovacao: relevantDeals.filter(d => d.stage === DealStage.APROVACAO).length,
    concluido: relevantDeals.filter(d => d.stage === DealStage.CONCLUIDO).length,
  };

  // --- 1. ADMIN COORDINATOR VIEW ---
  if (isAdminCoord) {
      const financialData = [
          { name: 'Jan', receita: 12000, despesa: 8500 },
          { name: 'Fev', receita: 14500, despesa: 9000 },
          { name: 'Mar', receita: 13800, despesa: 8200 },
          { name: 'Abr', receita: 16200, despesa: 9500 },
          { name: 'Mai', receita: 18500, despesa: 10000 },
          { name: 'Jun', receita: 15400, despesa: 9200 },
      ];

      const hrData = [
          { name: 'Operacional', value: users.filter(u => u.role === UserRole.AGENTE_PRODUTIVO || u.role === UserRole.AGENTE_VENDA).length },
          { name: 'Gestão', value: users.filter(u => u.role === UserRole.COORD_GERAL || u.role === UserRole.COORD_ADMIN).length },
          { name: 'Apoio', value: users.filter(u => u.role !== UserRole.PRESIDENTE && u.role !== UserRole.AGENTE_PRODUTIVO && u.role !== UserRole.AGENTE_VENDA && u.role !== UserRole.COORD_GERAL && u.role !== UserRole.COORD_ADMIN).length + 2 }, 
      ];
      
      const HR_COLORS = [BRAND_PRIMARY, BRAND_SECONDARY, '#94a3b8'];

      return (
          <div className="animate-fade-in space-y-2">
              <DashboardSection title="Resumo Operacional & Financeiro" icon={Wallet} color="text-emerald-600">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* KPI Cards */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-colors">
                        <div className="flex justify-between items-start z-10 relative">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Fluxo de Caixa</p>
                                <h3 className="text-2xl font-black text-slate-800">R$ 5.400,00</h3>
                            </div>
                            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200 transition-colors">
                                <Wallet className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-1 text-xs font-bold text-emerald-600">
                             <ArrowUpRight className="w-3 h-3" /> +12% vs mês anterior
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm group hover:border-amber-300 transition-colors">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Contas a Pagar</p>
                                <h3 className="text-2xl font-black text-slate-800">R$ 1.850,00</h3>
                            </div>
                            <div className="p-2 rounded-lg bg-amber-100 text-amber-600 group-hover:bg-amber-200 transition-colors">
                                <ArrowDownRight className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-amber-600">
                             3 faturas vencendo hoje
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm group hover:border-brand-300 transition-colors">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Repasse Produtores</p>
                                <h3 className="text-2xl font-black text-slate-800">R$ 9.337,50</h3>
                            </div>
                            <div className="p-2 rounded-lg bg-brand-100 text-brand-600 group-hover:bg-brand-200 transition-colors">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-brand-600">
                             Pendente de liberação
                        </div>
                    </div>

                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm group hover:border-purple-300 transition-colors">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Total Colaboradores</p>
                                <h3 className="text-2xl font-black text-slate-800">{users.length}</h3>
                            </div>
                            <div className="p-2 rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-200 transition-colors">
                                <UserCheck className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5">
                             <div className="bg-purple-500 h-1.5 rounded-full" style={{width: '90%'}}></div>
                        </div>
                    </div>
                </div>
              </DashboardSection>

              <DashboardSection title="Análise de Dados e RH" icon={BarChart3} color="text-blue-600">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Financial Overview Chart */}
                    <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm min-h-[350px]">
                        <h3 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4"/> Evolução Financeira
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={financialData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(val) => `R$${val/1000}k`}/>
                                    <Tooltip 
                                        contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1)'}}
                                        formatter={(val: number) => [`R$ ${val}`, '']}
                                    />
                                    <Legend wrapperStyle={{paddingTop: '10px'}}/>
                                    <Bar dataKey="receita" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="despesa" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* HR Distribution */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2">
                            <Users className="w-4 h-4"/> Quadro de Pessoal
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                    <Pie
                                        data={hrData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {hrData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={HR_COLORS[index % HR_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
              </DashboardSection>
          </div>
      );
  }

  // --- 2. SALES AGENT VIEW ---
  if (isSales) {
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
        <div className="animate-fade-in space-y-2">
             <DashboardSection title="Resumo de Vendas Diário" icon={ShoppingBag} color="text-brand-600">
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

                    <div className="p-4 rounded-xl border border-brand-100 bg-brand-50 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 rounded-lg bg-brand-100 text-brand-600">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <span className="text-2xl font-bold text-brand-900">R$ 45,90</span>
                        </div>
                        <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide">Ticket Médio</p>
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
             </DashboardSection>

            <DashboardSection title="Inteligência de Vendas" icon={BarChart3} color="text-purple-600">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sales Chart */}
                    <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
                        <h3 className="text-sm font-bold text-slate-600 mb-6 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-slate-500"/> Performance Semanal
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={salesData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={BRAND_PRIMARY} stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor={BRAND_PRIMARY} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(val)=>`R$${val}`}/>
                                <Tooltip 
                                    contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1)'}}
                                    formatter={(val: number) => [`R$ ${val}`, 'Vendas']}
                                />
                                <Area type="monotone" dataKey="value" stroke={BRAND_PRIMARY} strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2">
                            <Package className="w-4 h-4 text-slate-500"/> Ranking de Produtos
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
                        <button className="w-full mt-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                            Ver Relatório Completo
                        </button>
                    </div>
                </div>
            </DashboardSection>
        </div>
    );
  }

  // --- 3. STANDARD OPS VIEW (ASP) ---
  
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
      color: 'bg-brand-50 text-brand-600 border-brand-100' 
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

  const aspMixData = [
      { name: 'Artesanato', value: relevantDeals.filter(d => d.title.includes('Bio') || d.title.includes('Tecido')).length + 2 },
      { name: 'Agricultura', value: relevantDeals.filter(d => d.title.includes('Mel') || d.title.includes('Agri')).length + 3 },
      { name: 'Serviços', value: 1 },
  ];
  const MIX_COLORS = ['#F97316', '#10b981', '#8b5cf6'];

  return (
    <div className="animate-fade-in space-y-2">
      
      {/* 3.1 Kanban Stats */}
      <DashboardSection title={isManager ? "Visão Global de Produção" : "Meu Fluxo de Trabalho"} icon={LayoutDashboard} color="text-slate-600">
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
      </DashboardSection>

      {/* 3.2 ASP Specific Layout */}
      {isASP ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col: Performance Stats & Mix */}
            <div className="space-y-6 lg:col-span-1">
                <DashboardSection title="Metas & Performance" icon={Target} color="text-brand-600">
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                <span>Visitas Realizadas</span>
                                <span>12/20</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-brand-500 h-2 rounded-full" style={{width: '60%'}}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                <span>Planos Entregues</span>
                                <span>5/8</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-indigo-500 h-2 rounded-full" style={{width: '62%'}}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                <span>Cadastros Novos</span>
                                <span>3/5</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-emerald-500 h-2 rounded-full" style={{width: '60%'}}></div>
                            </div>
                        </div>
                    </div>
                </DashboardSection>

                <DashboardSection title="Carteira por Segmento" icon={PieChartIcon} color="text-purple-600">
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={aspMixData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {aspMixData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={MIX_COLORS[index % MIX_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </DashboardSection>
            </div>

            {/* Right Col: Enhanced Activities List (Table Style) */}
            <div className="lg:col-span-2">
                <DashboardSection title="Monitoramento de Atividades" icon={List} color="text-blue-600">
                    <div className="overflow-x-auto -mx-6 -my-6">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-100 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                    <th className="px-6 py-4 font-semibold">Empreendimento / Ação</th>
                                    <th className="px-6 py-4 font-semibold">Data Limite</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Probabilidade</th>
                                    <th className="px-6 py-4 font-semibold text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {relevantDeals.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm">
                                            Nenhuma atividade pendente. Bom trabalho!
                                        </td>
                                    </tr>
                                ) : (
                                    relevantDeals.slice(0, 7).map((deal) => {
                                        const contact = contacts?.find(c => c.id === deal.contactId);
                                        const isLate = new Date(deal.expectedCloseDate) < new Date();
                                        
                                        return (
                                            <tr key={deal.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-800 text-sm">{contact?.name || 'Cliente Não Identificado'}</span>
                                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                                            <FileText className="w-3 h-3"/> {deal.title}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`text-xs font-bold flex items-center gap-1 ${isLate ? 'text-red-600' : 'text-slate-600'}`}>
                                                        {isLate && <AlertCircle className="w-3 h-3"/>}
                                                        {new Date(deal.expectedCloseDate).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold border ${
                                                        deal.stage === DealStage.CONCLUIDO ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        deal.stage === DealStage.APROVACAO ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                        'bg-amber-50 text-amber-700 border-amber-100'
                                                    }`}>
                                                        {deal.stage}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 w-32">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full ${deal.probability > 70 ? 'bg-emerald-500' : deal.probability > 40 ? 'bg-brand-500' : 'bg-red-400'}`} 
                                                                style={{width: `${deal.probability}%`}}
                                                            ></div>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-500">{deal.probability}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => onNavigate('fomento')}
                                                        className="text-xs font-bold text-slate-400 hover:text-brand-600 border border-slate-200 hover:border-brand-300 px-3 py-1 rounded bg-white transition-all shadow-sm"
                                                    >
                                                        Detalhes
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </DashboardSection>
            </div>
        </div>
      ) : (
        /* 3.3 MANAGER / PRESIDENT VIEW */
        <DashboardSection title="Inteligência de Dados & Monitoramento" icon={Activity} color="text-brand-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-[400px] animate-slide-in hover:shadow-md transition-shadow duration-300">
                <h3 className="text-sm font-bold text-slate-600 mb-6">Fluxo de Atendimento</h3>
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
                        <Cell key={`cell-${index}`} fill={BRAND_PRIMARY} />
                        ))}
                    </Bar>
                    </BarChart>
                </ResponsiveContainer>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-slide-in hover:shadow-md transition-shadow duration-300" style={{ animationDelay: '100ms' }}>
                <h3 className="text-sm font-bold text-slate-600 mb-4">
                    {isManager ? 'Últimas Movimentações (Equipe)' : 'Meus Últimos Atendimentos'}
                </h3>
                <div className="space-y-4">
                    {relevantDeals.slice(0, 5).map((deal, index) => (
                    <div 
                        key={deal.id} 
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-transparent hover:border-brand-200 hover:bg-brand-50 transition-all duration-200 cursor-default"
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
        </DashboardSection>
      )}
    </div>
  );
};