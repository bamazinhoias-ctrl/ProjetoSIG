import React, { useState } from 'react';
import { Appointment, AppointmentType, Contact, User, UserRole } from '../types';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, User as UserIcon, X, Check, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';

interface AgendaProps {
  appointments: Appointment[];
  contacts: Contact[];
  users: User[];
  onAddAppointment: (appointment: Appointment) => void;
  currentUser?: User; // Added currentUser prop to check permissions inside component if needed
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const Agenda: React.FC<AgendaProps> = ({ appointments, contacts, users, onAddAppointment, currentUser }) => {
  const [showModal, setShowModal] = useState(false);
  
  // Calendar Navigation State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [formData, setFormData] = useState<Partial<Appointment>>({
    type: AppointmentType.VISITA,
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    assigneeId: ''
  });

  // Check if current user can create appointments
  const canCreateAppointment = currentUser ? [UserRole.COORD_GERAL, UserRole.AGENTE_PRODUTIVO, UserRole.AUX_ADMIN].includes(currentUser.role) : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.date && formData.time && formData.contactId) {
      onAddAppointment({
        id: Math.random().toString(36).substr(2, 9),
        title: formData.title,
        date: formData.date,
        time: formData.time,
        type: formData.type as AppointmentType,
        contactId: formData.contactId,
        assigneeId: formData.assigneeId,
        notes: formData.notes || ''
      });
      setShowModal(false);
      // Reset form
      setFormData({
        type: AppointmentType.VISITA,
        date: selectedDate.toISOString().split('T')[0],
        time: '09:00',
        title: '',
        contactId: '',
        assigneeId: '',
        notes: ''
      });
    }
  };

  const getTypeColor = (type: AppointmentType) => {
    switch (type) {
        case AppointmentType.VISITA: return 'bg-blue-50 text-blue-700 border-blue-100';
        case AppointmentType.REUNIAO: return 'bg-purple-50 text-purple-700 border-purple-100';
        case AppointmentType.ENTREGA: return 'bg-green-50 text-green-700 border-green-100';
        default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  // --- Calendar Logic ---

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newSelectedDate);
    // Pre-fill form with selected date
    setFormData(prev => ({ ...prev, date: newSelectedDate.toISOString().split('T')[0] }));
  };

  // Data preparation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const selectedDateStr = selectedDate.toISOString().split('T')[0];

  // Selected Day Appointments
  const dailyAppointments = appointments
    .filter(a => a.date === selectedDateStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="animate-fade-in flex flex-col lg:flex-row gap-4 pb-10">
      
      {/* LEFT: Calendar View - Removed h-full and overflow-hidden to allow full expansion */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
                <div className="flex gap-0.5 bg-white border border-slate-200 rounded-md shadow-sm">
                    <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-50 rounded-l text-slate-500 hover:text-brand-600 transition-colors"><ChevronLeft className="w-4 h-4"/></button>
                    <div className="w-px bg-slate-100 my-1"></div>
                    <button onClick={handleNextMonth} className="p-1 hover:bg-slate-50 rounded-r text-slate-500 hover:text-brand-600 transition-colors"><ChevronRight className="w-4 h-4"/></button>
                </div>
                <h2 className="text-lg font-bold text-slate-700 capitalize flex items-center gap-2">
                    {monthName}
                </h2>
            </div>
            {canCreateAppointment && (
                <button 
                    onClick={() => {
                        setFormData(prev => ({...prev, date: selectedDateStr}));
                        setShowModal(true);
                    }}
                    className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:shadow-md shadow-sm"
                >
                    <Plus className="w-3.5 h-3.5" /> Novo Agendamento
                </button>
            )}
        </div>

        {/* Grid - Removed overflow-y-auto to let it grow naturally */}
        <div className="p-5">
            <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS.map(day => (
                    <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-2">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5 min-h-0">
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[120px] bg-slate-50/30 rounded-lg border border-transparent"></div>
                ))}
                
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
                    const dayApps = appointments.filter(a => a.date === dateStr);
                    const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
                    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                    
                    // Show only first 3 items to prevent clustering, adjusted logic
                    const visibleApps = dayApps.slice(0, 3);
                    const hiddenCount = dayApps.length - 3;

                    return (
                        <div 
                            key={day}
                            onClick={() => handleDayClick(day)}
                            className={`min-h-[120px] border rounded-lg p-1.5 cursor-pointer transition-all hover:shadow-md relative group flex flex-col ${
                                isSelected ? 'border-brand-400 ring-1 ring-brand-400 bg-brand-50/20' : 
                                isToday ? 'border-brand-200 bg-brand-50/5' : 'border-slate-100 hover:border-brand-200'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-brand-600 text-white font-bold' : 'text-slate-500'}`}>
                                    {day}
                                </span>
                            </div>
                            
                            <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                                {visibleApps.map(app => (
                                    <div key={app.id} className="text-[9px] truncate px-1.5 py-0.5 rounded bg-white border border-slate-100 text-slate-600 shadow-sm group-hover:border-brand-100 block w-full leading-tight">
                                        <span className="font-bold mr-1 text-slate-400">{app.time}</span>
                                        {app.title}
                                    </div>
                                ))}
                                {hiddenCount > 0 && (
                                    <div className="text-[9px] text-slate-400 font-bold pl-1 mt-auto">
                                        + {hiddenCount}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>

      {/* RIGHT: Daily Detail Sidebar - Kept fixed height or stickiness if desired, but letting it flow for now */}
      <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-fit min-h-[500px] flex flex-col sticky top-4">
            <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-brand-600" />
                        Agenda do Dia
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 capitalize">
                        {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </p>
                </div>
                <div className="text-xs font-bold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                    {dailyAppointments.length}
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[calc(100vh-200px)]">
                {dailyAppointments.length === 0 ? (
                    <div className="text-center py-10 opacity-50 flex flex-col items-center justify-center h-full">
                        <Briefcase className="w-10 h-10 mb-2 text-slate-300"/>
                        <p className="text-xs text-slate-500">Livre para agendamentos.</p>
                        {canCreateAppointment && (
                            <button 
                                onClick={() => {
                                    setFormData(prev => ({...prev, date: selectedDateStr}));
                                    setShowModal(true);
                                }}
                                className="mt-3 text-brand-600 text-xs font-bold hover:underline"
                            >
                                + Adicionar
                            </button>
                        )}
                    </div>
                ) : (
                    dailyAppointments.map(apt => {
                        const contact = contacts.find(c => c.id === apt.contactId);
                        const assignee = users.find(u => u.id === apt.assigneeId);
                        
                        return (
                            <div key={apt.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all group relative overflow-hidden">
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${apt.type === AppointmentType.VISITA ? 'bg-blue-500' : apt.type === AppointmentType.REUNIAO ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                                
                                <div className="flex justify-between items-start mb-2 pl-2">
                                    <span className="text-sm font-bold text-slate-700 font-mono">{apt.time}</span>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border uppercase tracking-wider ${getTypeColor(apt.type)}`}>
                                        {apt.type}
                                    </span>
                                </div>
                                
                                <h4 className="font-semibold text-slate-800 pl-2 mb-1 text-sm leading-tight">{apt.title}</h4>
                                
                                {contact && (
                                    <div className="pl-2 flex items-start gap-1.5 text-[10px] text-slate-500 mb-2 leading-snug">
                                        <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-slate-300"/>
                                        <span>{contact.company} <span className="text-slate-400">• {contact.name}</span></span>
                                    </div>
                                )}

                                {assignee && (
                                    <div className="mt-2 pt-2 border-t border-slate-50 pl-2 flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[9px] text-slate-600 font-bold border border-slate-200">
                                            {assignee.name.charAt(0)}
                                        </div>
                                        <span className="text-[10px] text-slate-600 font-medium">{assignee.name}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">Novo Agendamento</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Título do Evento</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-sm"
                  placeholder="Ex: Visita de Diagnóstico"
                  value={formData.title || ''}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Data</label>
                    <input 
                    type="date" 
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-sm"
                    value={formData.date || ''}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Horário</label>
                    <input 
                    type="time" 
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-sm"
                    value={formData.time || ''}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Tipo</label>
                    <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-sm"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as AppointmentType})}
                    >
                        {Object.values(AppointmentType).map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Beneficiário</label>
                    <select 
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-sm"
                    value={formData.contactId || ''}
                    onChange={e => setFormData({...formData, contactId: e.target.value})}
                    >
                        <option value="">Selecione...</option>
                        {contacts.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
              </div>

              <div>
                 <label className="block text-xs font-medium text-slate-600 mb-1">Responsável Técnico (ASP)</label>
                 <div className="relative">
                     <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                     <select 
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all appearance-none text-sm"
                        value={formData.assigneeId || ''}
                        onChange={e => setFormData({...formData, assigneeId: e.target.value})}
                     >
                        <option value="">Selecione o Agente...</option>
                        {users.filter(u => u.role === UserRole.AGENTE_PRODUTIVO).map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                     </select>
                 </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Observações</label>
                <textarea 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all h-20 resize-none text-sm"
                  placeholder="Detalhes adicionais..."
                  value={formData.notes || ''}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 rounded-lg shadow-sm flex justify-center items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm"
                >
                  <Check className="w-4 h-4" /> Confirmar e Sincronizar Fomento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};