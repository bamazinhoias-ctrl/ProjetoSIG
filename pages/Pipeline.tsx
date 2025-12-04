import React, { useState } from 'react';
import { Deal, DealStage, Contact, User, UserRole } from '../types';
import { DealCard } from '../components/DealCard';
import { Plus, Sparkles, Tablet, Monitor, CheckCircle, Smartphone, Lock, Filter, Users } from 'lucide-react';
import { generatePipelineInsights } from '../services/geminiService';

interface PipelineProps {
  deals: Deal[];
  contacts: Contact[];
  users: User[];
  currentUser: User;
  onUpdateDeal: (deal: Deal) => void;
  onSelectDeal: (deal: Deal) => void;
}

const STAGES = Object.values(DealStage);

export const Pipeline: React.FC<PipelineProps> = ({ deals, contacts, users, currentUser, onUpdateDeal, onSelectDeal }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null);
  
  // Default filter: If ASP, show mine. If Coord, show all.
  const [filterMode, setFilterMode] = useState<'all' | 'mine'>(
      currentUser.role === UserRole.AGENTE_PRODUTIVO ? 'mine' : 'all'
  );

  const getNextStage = (currentStage: DealStage): DealStage => {
    const currentIndex = STAGES.indexOf(currentStage);
    if (currentIndex < STAGES.length - 1) {
      return STAGES[currentIndex + 1];
    }
    return currentStage;
  };

  const handleAdvance = (deal: Deal) => {
    const nextStage = getNextStage(deal.stage);
    if (nextStage !== deal.stage) {
      onUpdateDeal({ ...deal, stage: nextStage });
    }
  };

  const handleAssign = (dealId: string, userId: string) => {
    const deal = deals.find(d => d.id === dealId);
    if (deal) {
        onUpdateDeal({ ...deal, assigneeId: userId });
    }
  }

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, dealId: string) => {
    e.dataTransfer.setData("dealId", dealId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, stage: DealStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Optional: Logic to clear highlight if leaving the container
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStage: DealStage) => {
    e.preventDefault();
    setDragOverStage(null);
    const dealId = e.dataTransfer.getData("dealId");
    
    if (dealId) {
      const deal = deals.find(d => d.id === dealId);
      if (deal && deal.stage !== targetStage) {
        onUpdateDeal({ ...deal, stage: targetStage });
      }
    }
  };

  const handleGenerateInsights = async () => {
    setLoadingInsight(true);
    const result = await generatePipelineInsights(deals);
    setInsight(result);
    setLoadingInsight(false);
  };

  // Visual helper for Stage Environment
  const getStageEnvironment = (stage: DealStage) => {
    switch (stage) {
        case DealStage.AGENDAMENTO: return { icon: <Monitor className="w-3 h-3"/>, label: 'Coordenação', color: 'text-brand-500' };
        case DealStage.COLETA_EVE: 
        case DealStage.COLETA_CAD: return { icon: <Tablet className="w-3 h-3"/>, label: 'Tablet (Campo)', color: 'text-amber-600' };
        case DealStage.PLANO_ACAO: return { icon: <Monitor className="w-3 h-3"/>, label: 'Escritório', color: 'text-brand-500' };
        case DealStage.APROVACAO: return { icon: <Lock className="w-3 h-3"/>, label: 'Gestão', color: 'text-purple-500' };
        default: return { icon: <CheckCircle className="w-3 h-3"/>, label: 'Arquivo', color: 'text-green-500' };
    }
  };

  // Filter Logic
  const filteredDeals = deals.filter(deal => {
      if (filterMode === 'mine') return deal.assigneeId === currentUser.id;
      return true;
  });

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Nova Visita
            </button>
            <button 
                onClick={handleGenerateInsights}
                disabled={loadingInsight}
                className="flex items-center gap-2 bg-white hover:bg-purple-50 text-purple-700 px-4 py-2 rounded-lg font-medium transition-colors border border-purple-200 shadow-sm"
            >
            <Sparkles className="w-4 h-4" /> {loadingInsight ? 'Analisando Fluxo...' : 'Relatório de Gestão (IA)'}
            </button>
        </div>
        
        <div className="flex items-center gap-4">
            {/* Filter Toggles */}
            <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                <button 
                    onClick={() => setFilterMode('all')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all ${filterMode === 'all' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Users className="w-3 h-3" /> Todos
                </button>
                <button 
                    onClick={() => setFilterMode('mine')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all ${filterMode === 'mine' ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Filter className="w-3 h-3" /> Meus Atendimentos
                </button>
            </div>

            {/* Environment Legend */}
            <div className="hidden lg:flex gap-4 text-xs font-medium text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-1.5"><Tablet className="w-4 h-4 text-amber-500"/> Offline (Tablet)</div>
                <div className="w-px h-4 bg-slate-200"></div>
                <div className="flex items-center gap-1.5"><Monitor className="w-4 h-4 text-brand-500"/> Online (Web)</div>
            </div>
        </div>
      </div>

      {insight && (
          <div className="bg-gradient-to-r from-purple-50 to-white border border-purple-100 rounded-xl p-6 mb-6 text-purple-900 animate-fade-in shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles className="w-32 h-32"/></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold flex items-center gap-2 text-lg"><Sparkles className="w-5 h-5 text-purple-600"/> Insights do Coordenador</h4>
                    <button onClick={() => setInsight(null)} className="text-purple-400 hover:text-purple-700 font-bold text-xl">×</button>
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed opacity-90">{insight}</p>
              </div>
          </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {STAGES.map(stage => {
          const stageDeals = filteredDeals.filter(d => d.stage === stage);
          const env = getStageEnvironment(stage);
          const isDragOver = dragOverStage === stage;
          const isTablet = stage === DealStage.COLETA_EVE || stage === DealStage.COLETA_CAD;

          return (
            <div 
              key={stage} 
              className={`min-w-[320px] w-[320px] flex flex-col rounded-xl max-h-full transition-all duration-300 ${
                isDragOver ? 'bg-brand-50 ring-2 ring-brand-300 scale-[1.01]' : 'bg-slate-100'
              }`}
              onDragOver={(e) => handleDragOver(e, stage)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage)}
            >
              {/* Column Header */}
              <div className={`p-4 border-b border-slate-200/50 rounded-t-xl sticky top-0 backdrop-blur-sm z-10 ${isTablet ? 'bg-amber-50/80' : 'bg-slate-50/80'}`}>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{stage}</h3>
                    <span className="bg-white text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200">{stageDeals.length}</span>
                </div>
                <div className={`flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider ${env.color}`}>
                    {env.icon} {env.label}
                </div>
                
                {/* Visual Progress Bar for Column Load */}
                <div className="w-full bg-slate-200 h-1 mt-3 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full ${isTablet ? 'bg-amber-400' : 'bg-brand-400'}`} 
                        style={{ width: `${Math.min((stageDeals.length / 10) * 100, 100)}%` }}
                    ></div>
                </div>
              </div>

              {/* Cards Container */}
              <div className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[100px] scrollbar-hide">
                {stageDeals.map(deal => (
                  <DealCard 
                    key={deal.id} 
                    deal={deal}
                    contact={contacts.find(c => c.id === deal.contactId)}
                    assignee={users.find(u => u.id === deal.assigneeId)}
                    users={users}
                    currentUserRole={currentUser.role}
                    onAssign={handleAssign}
                    onAdvance={() => handleAdvance(deal)}
                    onSelect={() => onSelectDeal(deal)}
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                  />
                ))}
                
                {stageDeals.length === 0 && !isDragOver && (
                    <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm pointer-events-none opacity-60">
                        <Smartphone className="w-6 h-6 mb-2 opacity-50"/>
                        <span>Arraste card para cá</span>
                    </div>
                )}
                
                {isDragOver && (
                   <div className="h-32 flex items-center justify-center border-2 border-dashed border-brand-400 bg-brand-50 rounded-xl text-brand-600 text-sm font-bold animate-pulse pointer-events-none">
                       Soltar aqui
                   </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};