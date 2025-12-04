import React, { useState } from 'react';
import { User, Deal, Contact, UserRole, DealStage } from '../types';
import { Mail, Shield, Briefcase, MapPin, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp, FileText, Camera, X, Check, RefreshCw, FileCheck, ClipboardCheck, TrendingUp, DollarSign, ShoppingBag, BarChart3 } from 'lucide-react';

interface ProfileProps {
  user: User;
  deals: Deal[];
  contacts: Contact[];
  isOwnProfile: boolean;
  onUpdateUser: (user: User) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, deals, contacts, isOwnProfile, onUpdateUser }) => {
  const [expandedDealId, setExpandedDealId] = useState<string | null>(null);
  
  // Avatar Editing State
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState(user.avatar || '');

  // --- Logic for Data Display ---
  const isManager = user.role === UserRole.PRESIDENTE || user.role === UserRole.COORD_GERAL;
  const isASP = user.role === UserRole.AGENTE_PRODUTIVO;
  const isSalesAgent = user.role === UserRole.AGENTE_VENDA;

  // 1. Activity List (Timeline): Always shows what is assigned specifically to this user
  const myDeals = deals.filter(d => d.assigneeId === user.id);
  
  // 2. Stats Cards Logic
  const statsSourceDeals = isManager ? deals : myDeals;

  // Basic Calculations
  const activeVisits = statsSourceDeals.filter(d => d.stage !== DealStage.CONCLUIDO).length;
  const completedVisits = statsSourceDeals.filter(d => d.stage === DealStage.CONCLUIDO).length;
  const uniqueEmpreendimentos = isManager 
    ? contacts.length 
    : new Set(myDeals.map(d => d.contactId)).size;

  // ASP Specific Calculations
  const aspEvesProntos = myDeals.filter(d => 
    (d.title.toLowerCase().includes('eve') || d.title.toLowerCase().includes('diagnóstico') || d.id.includes('EVE')) && 
    (d.stage === DealStage.CONCLUIDO || d.stage === DealStage.APROVACAO)
  ).length;

  const aspPlanosProntos = myDeals.filter(d => 
    (d.title.toLowerCase().includes('plano') || d.title.toLowerCase().includes('ação')) && 
    (d.stage === DealStage.CONCLUIDO || d.stage === DealStage.APROVACAO)
  ).length;

  const toggleDetails = (dealId: string) => {
    setExpandedDealId(prev => prev === dealId ? null : dealId);
  };

  const handleSaveAvatar = () => {
    if (newAvatarUrl.trim()) {
        onUpdateUser({ ...user, avatar: newAvatarUrl });
        setIsEditingAvatar(false);
    }
  };

  const handleRandomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setNewAvatarUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&length=1&bold=true&seed=${randomSeed}`);
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-8 pb-10">
      
      {/* Profile Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
            
            {/* Avatar Section */}
            <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-slate-50 p-1 border border-slate-200 overflow-hidden relative">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover rounded-full" alt="avatar"/> : <div className="w-full h-full flex items-center justify-center text-slate-400 text-3xl font-bold bg-slate-100">{user.name.charAt(0)}</div>}
                        
                        {/* Hover Overlay for Edit */}
                        {isOwnProfile && (
                        <div 
                            onClick={() => {
                                setNewAvatarUrl(user.avatar || '');
                                setIsEditingAvatar(true);
                            }}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[1px] rounded-full"
                        >
                            <Camera className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                        )}
                </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">{user.name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full font-medium">
                        <Shield className="w-3.5 h-3.5 text-brand-600" /> {user.role}
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {user.email}
                    </span>
                     {!isOwnProfile ? (
                        <div className="px-3 py-1 rounded-full text-xs font-bold border border-amber-200 bg-amber-50 text-amber-700 flex items-center gap-1">
                        <Shield className="w-3 h-3"/> Visualização
                    </div>
                    ) : (
                        <div className="px-3 py-1 rounded-full text-xs font-bold border border-brand-200 bg-brand-50 text-brand-700 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3"/> Ativo
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Stats Cards Section */}
        {isSalesAgent ? (
             /* SALES AGENT DASHBOARD */
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-slate-100">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white text-emerald-600 rounded-lg shadow-sm">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-emerald-800 font-bold uppercase">Vendas Hoje</p>
                            <p className="text-xl font-bold text-emerald-900">R$ 1.250,00</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-brand-50 border border-brand-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white text-brand-600 rounded-lg shadow-sm">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-brand-800 font-bold uppercase">Ticket Médio</p>
                            <p className="text-xl font-bold text-brand-900">R$ 45,90</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white text-purple-600 rounded-lg shadow-sm">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-purple-800 font-bold uppercase">Meta Mensal</p>
                            <p className="text-xl font-bold text-purple-900">65%</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white text-amber-600 rounded-lg shadow-sm">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-amber-800 font-bold uppercase">Top Produto</p>
                            <p className="text-sm font-bold text-amber-900 truncate">Mel Orgânico</p>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
             /* STANDARD DASHBOARD (Operations/Management) */
            <div className={`grid grid-cols-1 md:grid-cols-2 ${isASP ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6 mt-8 pt-8 border-t border-slate-100`}>
                <div className="group p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-brand-200 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white text-brand-600 rounded-lg shadow-sm border border-slate-100">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">
                                {isManager ? 'Total de Empreendimentos' : isASP ? 'Empreendimentos Atendidos' : 'Meus Empreendimentos'}
                            </p>
                            <p className="text-xl font-bold text-slate-900">{uniqueEmpreendimentos}</p>
                        </div>
                    </div>
                </div>

                {isASP ? (
                    <>
                        <div className="group p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white text-indigo-600 rounded-lg shadow-sm border border-slate-100">
                                    <FileCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">EVEs Prontos</p>
                                    <p className="text-xl font-bold text-slate-900">{aspEvesProntos}</p>
                                </div>
                            </div>
                        </div>

                        <div className="group p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white text-emerald-600 rounded-lg shadow-sm border border-slate-100">
                                    <ClipboardCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Planos de Ação Prontos</p>
                                    <p className="text-xl font-bold text-slate-900">{aspPlanosProntos}</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                <div className="group p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white text-emerald-600 rounded-lg shadow-sm border border-slate-100">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">
                                    {isManager ? 'Total Concluído' : 'Minhas Conclusões'}
                                </p>
                                <p className="text-xl font-bold text-slate-900">{completedVisits}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="group p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white text-amber-600 rounded-lg shadow-sm border border-slate-100">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">
                                {isManager ? 'Pendências da Equipe' : 'Pendências (Visitas)'}
                            </p>
                            <p className="text-xl font-bold text-slate-900">{activeVisits}</p>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Left Column: Activities or Sales Info */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* If Sales Agent, Show Sales Charts or Specific Data instead of Field Activities */}
            {isSalesAgent ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                         <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-brand-600"/> Performance de Vendas
                         </h3>
                         <select className="text-sm border-none bg-slate-50 rounded-lg px-3 py-1 font-medium text-slate-600 outline-none cursor-pointer">
                             <option>Últimos 7 dias</option>
                             <option>Este Mês</option>
                         </select>
                    </div>
                    <div className="h-64 flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400">
                         <div className="text-center">
                             <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-20"/>
                             <p className="text-sm font-medium">Gráfico de Vendas (Simulação)</p>
                         </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                         <div className="p-4 bg-brand-50 rounded-xl">
                             <p className="text-xs text-brand-600 font-bold uppercase mb-1">Produto Destaque</p>
                             <p className="font-bold text-slate-800">Kit Pano de Prato</p>
                             <p className="text-xs text-slate-500">12 unidades vendidas</p>
                         </div>
                         <div className="p-4 bg-emerald-50 rounded-xl">
                             <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Meta Diária</p>
                             <div className="w-full bg-emerald-200 h-2 rounded-full mt-2">
                                 <div className="bg-emerald-500 h-2 rounded-full" style={{width: '80%'}}></div>
                             </div>
                             <p className="text-right text-xs text-emerald-700 font-bold mt-1">80% Atingido</p>
                         </div>
                    </div>
                </div>
            ) : (
                /* Standard Field Activities for ASP/Managers */
                <>
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <MapPin className="w-6 h-6 text-slate-400" />
                            Roteiro de Atividades
                        </h3>
                        <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
                            {myDeals.length} Registros
                        </span>
                    </div>
                    
                    {myDeals.length === 0 ? (
                        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center text-slate-400 shadow-sm">
                            <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-10" />
                            <p className="text-lg font-medium text-slate-500">Nenhuma atividade atribuída a você.</p>
                            {isManager && <p className="text-sm mt-2">Como Coordenadora, utilize o painel "Fomento" para ver a visão global.</p>}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myDeals.map(deal => {
                                const contact = contacts.find(c => c.id === deal.contactId);
                                const isExpanded = expandedDealId === deal.id;
                                
                                return (
                                    <div key={deal.id} className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'shadow-md border-brand-200' : 'shadow-sm border-slate-200 hover:border-brand-300'}`}>
                                        <div className="p-5 flex justify-between items-center cursor-pointer" onClick={() => toggleDetails(deal.id)}>
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center border ${deal.stage === DealStage.CONCLUIDO ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-brand-50 text-brand-600 border-brand-100'}`}>
                                                    {deal.stage === DealStage.CONCLUIDO ? <CheckCircle className="w-5 h-5"/> : <Clock className="w-5 h-5"/>}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-lg">{contact?.name || 'Empreendimento'}</h4>
                                                    <p className="text-sm text-slate-500 mb-2">{deal.title}</p>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${deal.stage === DealStage.CONCLUIDO ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                            {deal.stage}
                                                        </span>
                                                        <span className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3"/> {contact?.company}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button 
                                                className={`p-2 rounded-full transition-colors ${isExpanded ? 'bg-slate-100 text-slate-600' : 'text-slate-300 hover:bg-slate-50 hover:text-slate-500'}`}
                                            >
                                                {isExpanded ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                                            </button>
                                        </div>
                                        
                                        {isExpanded && (
                                            <div className="px-5 pb-5 pt-0 animate-fade-in">
                                                <div className="p-5 bg-slate-50/50 rounded-xl border border-slate-100 mt-2">
                                                    <div className="flex gap-4">
                                                        <FileText className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                                                        <div className="flex-1 space-y-4">
                                                            <div>
                                                                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Dados do Beneficiário</h5>
                                                                <div className="grid grid-cols-2 gap-4 text-sm bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                                                    <div>
                                                                        <span className="block text-xs text-slate-400">Telefone</span>
                                                                        <span className="font-medium text-slate-700">{contact?.phone}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="block text-xs text-slate-400">Email</span>
                                                                        <span className="font-medium text-slate-700">{contact?.email}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Notas de Campo</h5>
                                                                <p className="text-sm text-slate-600 italic leading-relaxed bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                                                    "{contact?.notes || "Nenhuma observação registrada."}"
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </>
            )}
         </div>

         {/* Right Column: Info & Targets */}
         <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-slate-400" /> Detalhes da Conta
                </h3>
                <div className="space-y-4 relative">
                    <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-slate-100"></div>
                    <div className="relative pl-6">
                        <div className="absolute left-0 top-1.5 w-3.5 h-3.5 bg-white border-2 border-slate-200 rounded-full"></div>
                        <span className="text-xs text-slate-400 block mb-0.5">ID do Usuário</span>
                        <code className="bg-slate-50 px-2 py-1 rounded text-xs text-slate-600 font-mono border border-slate-200">{user.id}</code>
                    </div>
                    <div className="relative pl-6">
                        <div className="absolute left-0 top-1.5 w-3.5 h-3.5 bg-emerald-100 border-2 border-emerald-500 rounded-full"></div>
                        <span className="text-xs text-slate-400 block mb-0.5">Status</span>
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                            Ativo e Operante
                        </span>
                    </div>
                     <div className="relative pl-6">
                        <div className="absolute left-0 top-1.5 w-3.5 h-3.5 bg-white border-2 border-slate-200 rounded-full"></div>
                        <span className="text-xs text-slate-400 block mb-0.5">Último Acesso</span>
                        <span className="text-sm text-slate-600 font-medium">Hoje, 08:30</span>
                    </div>
                </div>
            </div>
            
            {user.role === UserRole.AGENTE_PRODUTIVO && (
                <div className="bg-gradient-to-br from-brand-50 to-indigo-50 p-6 rounded-3xl border border-brand-100">
                    <h3 className="text-brand-900 font-bold text-sm mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-brand-600"/> Metas do Mês
                    </h3>
                    <p className="text-brand-700/80 text-xs mb-6 leading-relaxed">
                        Mantenha o ritmo! Você precisa de mais <span className="font-bold text-brand-800">{15 - completedVisits} visitas</span> para atingir a meta operacional de campo.
                    </p>
                    
                    <div className="flex justify-between text-xs font-bold text-brand-800 mb-1">
                        <span>Progresso</span>
                        <span>{Math.round((completedVisits/15)*100)}%</span>
                    </div>
                    <div className="w-full bg-white h-3 rounded-full overflow-hidden border border-brand-100 shadow-inner">
                        <div 
                            className="bg-gradient-to-r from-brand-500 to-indigo-600 h-full rounded-full transition-all duration-1000" 
                            style={{width: `${Math.min((completedVisits/15)*100, 100)}%`}}
                        ></div>
                    </div>
                    <p className="text-right text-[10px] text-brand-500 mt-2 font-medium">Target: 15 visitas</p>
                </div>
            )}
         </div>
      </div>

      {/* Avatar Edit Modal */}
      {isEditingAvatar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsEditingAvatar(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <Camera className="w-5 h-5 text-brand-600"/> Alterar Foto
                    </h3>
                    <button onClick={() => setIsEditingAvatar(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="flex justify-center">
                        <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden">
                             {newAvatarUrl ? <img src={newAvatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Camera className="w-8 h-8"/></div>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">URL da Imagem</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                placeholder="https://..."
                                value={newAvatarUrl}
                                onChange={e => setNewAvatarUrl(e.target.value)}
                            />
                            <button 
                                onClick={handleRandomizeAvatar}
                                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-200 transition-colors"
                                title="Gerar Aleatório"
                            >
                                <RefreshCw className="w-4 h-4"/>
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Insira um link direto para a imagem ou gere um avatar aleatório.</p>
                    </div>

                    <button 
                        onClick={handleSaveAvatar}
                        disabled={!newAvatarUrl}
                        className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-brand-200 transition-all flex justify-center items-center gap-2"
                    >
                        <Check className="w-4 h-4" /> Salvar Nova Foto
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};