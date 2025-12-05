import React from 'react';
import { Deal, Contact, DealStage, User, UserRole, View } from '../types';
import { MapPin, Calendar, ArrowRight, Tablet, Monitor, User as UserIcon, ChevronDown, ExternalLink } from 'lucide-react';

interface DealCardProps {
  deal: Deal;
  contact?: Contact;
  assignee?: User;
  users?: User[]; // List of all users for assignment dropdown
  currentUserRole?: UserRole;
  onAdvance: () => void;
  onSelect: () => void;
  onAssign?: (dealId: string, userId: string) => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onNavigate?: (view: View, contextId?: string) => void;
}

export const DealCard: React.FC<DealCardProps> = ({ 
  deal, 
  contact, 
  assignee, 
  users, 
  currentUserRole,
  onAdvance, 
  onSelect, 
  onAssign,
  onDragStart,
  onNavigate
}) => {
  
  // Determine icon based on stage context defined in scope
  const getDeviceIcon = () => {
    if (deal.stage === DealStage.COLETA_EVE || deal.stage === DealStage.COLETA_CAD) {
        return <Tablet className="w-3 h-3 text-slate-400 group-hover:text-amber-500 transition-colors" />;
    }
    return <Monitor className="w-3 h-3 text-slate-400 group-hover:text-blue-500 transition-colors" />;
  };

  const canAssign = currentUserRole === UserRole.COORD_GERAL || currentUserRole === UserRole.PRESIDENTE;

  const handleAssignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onAssign) {
      onAssign(deal.id, e.target.value);
    }
  };

  const handleNavigateToTask = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!onNavigate || !deal.contactId) return;

      if (deal.stage === DealStage.COLETA_EVE) {
          onNavigate('eve', deal.contactId);
      } else if (deal.stage === DealStage.COLETA_CAD) {
          onNavigate('cadcidadao', deal.contactId);
      } else if (deal.stage === DealStage.PLANO_ACAO) {
          onNavigate('actionplan', deal.contactId);
      }
  };

  const showTaskButton = [DealStage.COLETA_EVE, DealStage.COLETA_CAD, DealStage.PLANO_ACAO].includes(deal.stage);

  return (
    <div 
      className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 
                 hover:shadow-lg hover:-translate-y-1 hover:border-blue-300
                 transition-all duration-300 ease-in-out
                 cursor-grab active:cursor-grabbing group relative animate-scale-in"
      onClick={onSelect}
      draggable={!!onDragStart}
      onDragStart={onDragStart}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-slate-800 line-clamp-2 text-sm group-hover:text-blue-700 transition-colors">{contact?.name || deal.title}</h4>
        <div className="flex gap-1 transform transition-transform group-hover:scale-110 duration-300">
            {getDeviceIcon()}
        </div>
      </div>
      
      {contact && (
        <div className="text-xs text-slate-500 mb-2">
          <span className="block font-medium text-blue-600 mb-1">{contact.role}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {contact.company}</span>
        </div>
      )}

      {/* Assignment Section */}
      <div className="mb-3 flex items-center gap-2">
        {canAssign && users && onAssign ? (
           <div className="relative w-full" onClick={e => e.stopPropagation()}>
             <select 
               className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 appearance-none pr-6 focus:ring-1 focus:ring-blue-500 outline-none text-slate-600"
               value={deal.assigneeId || ''}
               onChange={handleAssignChange}
             >
               <option value="">-- Sem Responsável --</option>
               {users.filter(u => u.role === UserRole.AGENTE_PRODUTIVO).map(u => (
                 <option key={u.id} value={u.id}>{u.name}</option>
               ))}
             </select>
             <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1.5 pointer-events-none" />
           </div>
        ) : (
          assignee ? (
            <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
              <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-600 font-bold">
                 {assignee.name.charAt(0)}
              </div>
              <span className="text-[10px] text-slate-600 truncate max-w-[100px]">{assignee.name}</span>
            </div>
          ) : (
            <div className="text-[10px] text-slate-400 italic">Não atribuído</div>
          )
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50 group-hover:border-blue-50 transition-colors">
        <div className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-slate-500">
          <Calendar className="w-3 h-3" />
          {new Date(deal.expectedCloseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </div>
        
        <div className="flex gap-2">
            {showTaskButton && onNavigate && (
                <button 
                    onClick={handleNavigateToTask}
                    className="text-xs flex items-center gap-1 text-slate-500 hover:text-brand-600 font-bold hover:bg-brand-50 px-2 py-1 rounded-md transition-all duration-200"
                    title="Abrir Formulário"
                >
                    <ExternalLink className="w-3 h-3"/> Abrir
                </button>
            )}
            <button 
            onClick={(e) => {
                e.stopPropagation();
                onAdvance();
            }}
            className="text-xs flex items-center gap-1 text-slate-600 hover:text-white font-medium hover:bg-blue-600 px-2 py-1 rounded-md transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow"
            >
            Mover <ArrowRight className="w-3 h-3" />
            </button>
        </div>
      </div>
    </div>
  );
};