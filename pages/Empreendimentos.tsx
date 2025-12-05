import React, { useState, useEffect } from 'react';
import { Contact, Appointment, AppointmentType, User, UserRole, ActivityType, Partner } from '../types';
import { Plus, Search, MapPin, Phone, Mail, Edit, Calendar as CalendarIcon, Check, X, Building2, Save, User as UserIcon, Briefcase, FileText, Map, Users, LayoutGrid, ClipboardList, Trash2 } from 'lucide-react';

interface EmpreendimentosProps {
  contacts: Contact[];
  users: User[];
  onAddContact: (contact: Contact) => void;
  onUpdateContact: (contact: Contact) => void;
  onAddAppointment: (appointment: Appointment) => void;
  currentUser?: User;
}

export const Empreendimentos: React.FC<EmpreendimentosProps> = ({ 
  contacts, 
  users, 
  onAddContact, 
  onUpdateContact,
  onAddAppointment,
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'partners'>('basic');
  
  // Pre-Scheduling Modal
  const [isSchedulingOpen, setIsSchedulingOpen] = useState(false);
  const [schedulingContactId, setSchedulingContactId] = useState<string | null>(null);

  // Check if current user has permission to edit
  const canEdit = currentUser ? (
      currentUser.role === UserRole.PRESIDENTE || 
      currentUser.role === UserRole.COORD_GERAL || 
      currentUser.permissions?.includes('edit_empreendimentos')
  ) : false;

  // Initial Form State
  const initialFormState: Partial<Contact> = {
    // Enterprise
    company: '',
    address: '',
    city: '',
    zone: 'Urbana',
    phone: '',
    cnpj: '',
    
    // Productive
    role: ActivityType.ARTESANATO,
    mainProduct: '',
    menCount: 0,
    womenCount: 0,
    
    // Representative
    name: '', // Full Name
    cpf: '',
    email: '',
    representativeRole: '',
    
    // Detailed Data (EVE Sync)
    cadsol: false,
    situation: 'Em funcionamento',
    organization: 'Grupo Informal',
    partners: [],

    // Metadata
    registeredByRole: '',
    registeredDate: new Date().toISOString().split('T')[0],
    notes: ''
  };

  const [contactForm, setContactForm] = useState<Partial<Contact>>(initialFormState);
  const [newPartner, setNewPartner] = useState<Partial<Partner>>({ name: '', role: '', gender: 'Feminino' });

  const [appointmentForm, setAppointmentForm] = useState<Partial<Appointment>>({
    title: 'Visita de Diagnóstico (Pré-Agendado)',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: AppointmentType.VISITA,
    assigneeId: ''
  });

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (contact?: Contact) => {
    setActiveTab('basic');
    if (contact) {
      setEditingId(contact.id);
      setContactForm({
        ...contact,
        registeredDate: contact.registeredDate || new Date().toISOString().split('T')[0],
        registeredByRole: contact.registeredByRole || currentUser?.role || UserRole.AUX_ADMIN,
        partners: contact.partners || []
      });
    } else {
      setEditingId(null);
      setContactForm({
          ...initialFormState,
          registeredByRole: currentUser?.role || UserRole.AUX_ADMIN,
          registeredDate: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactForm.company && contactForm.name) {
        if (editingId) {
            onUpdateContact({ ...contactForm, id: editingId } as Contact);
        } else {
            onAddContact({
                ...contactForm,
                id: Math.random().toString(36).substr(2, 9),
                lastContacted: new Date().toISOString(),
                ownerId: currentUser?.id // Set ownerId on creation
            } as Contact);
        }
        setIsModalOpen(false);
    }
  };

  // Partners Management
  const addPartner = () => {
      if (newPartner.name) {
          const p: Partner = {
              id: Math.random().toString(36).substr(2,9),
              name: newPartner.name,
              role: newPartner.role || 'Sócio',
              gender: newPartner.gender as any
          };
          setContactForm(prev => ({ ...prev, partners: [...(prev.partners || []), p] }));
          setNewPartner({ name: '', role: '', gender: 'Feminino' });
      }
  };

  const removePartner = (id: string) => {
      setContactForm(prev => ({ ...prev, partners: prev.partners?.filter(p => p.id !== id) }));
  };

  const handleOpenScheduling = (contactId: string) => {
    setSchedulingContactId(contactId);
    setAppointmentForm({
        title: 'Visita de Diagnóstico (Pré-Agendado)',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        type: AppointmentType.VISITA,
        assigneeId: ''
    });
    setIsSchedulingOpen(true);
  };

  const handleSubmitScheduling = (e: React.FormEvent) => {
    e.preventDefault();
    if (schedulingContactId && appointmentForm.date && appointmentForm.time && appointmentForm.assigneeId) {
        onAddAppointment({
            id: Math.random().toString(36).substr(2, 9),
            title: appointmentForm.title || 'Visita Técnica',
            date: appointmentForm.date,
            time: appointmentForm.time,
            type: appointmentForm.type || AppointmentType.VISITA,
            contactId: schedulingContactId,
            assigneeId: appointmentForm.assigneeId,
            notes: 'Pré-agendamento realizado pela equipe administrativa/comercial.'
        });
        alert("Agendamento sincronizado com sucesso na Agenda e Kanban!");
        setIsSchedulingOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-brand-600" />
            Gestão de Empreendimentos
          </h2>
          <p className="text-sm text-slate-500">Base de Dados e Cadastro Unificado</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <input 
                    type="text" 
                    placeholder="Buscar empreendimento..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
            </div>
            {canEdit && (
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Novo Cadastro
                </button>
            )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Empreendimento</th>
                        <th className="px-6 py-4">Localização</th>
                        <th className="px-6 py-4">Atividade / Produto</th>
                        <th className="px-6 py-4">Representante</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredContacts.map(contact => (
                        <tr key={contact.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="font-bold text-slate-800">{contact.company}</div>
                                {contact.cnpj && <div className="text-xs text-slate-400 font-mono">{contact.cnpj}</div>}
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-slate-700 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-brand-500"/> 
                                    {contact.city || 'N/I'} <span className="text-xs text-slate-400">({contact.zone || 'N/I'})</span>
                                </div>
                                <div className="text-xs text-slate-500 truncate max-w-[150px]">{contact.address}</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-600">
                                    {contact.role}
                                </span>
                                {contact.mainProduct && (
                                    <div className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                                        <Building2 className="w-3 h-3"/> {contact.mainProduct}
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-medium text-slate-700">{contact.name}</div>
                                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                    <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> {contact.phone}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={() => handleOpenScheduling(contact.id)}
                                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold border border-indigo-200 transition-colors flex items-center gap-1"
                                        title="Realizar Pré-Agendamento"
                                    >
                                        <CalendarIcon className="w-3 h-3"/> Agendar
                                    </button>
                                    {canEdit && (
                                        <button 
                                            onClick={() => handleOpenModal(contact)}
                                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors border border-transparent hover:border-brand-200"
                                            title="Editar Dados"
                                        >
                                            <Edit className="w-4 h-4"/>
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredContacts.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400">Nenhum empreendimento encontrado.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Main Registration Modal - Fixed Positioning and Scroll */}
      {isModalOpen && canEdit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in border border-slate-200">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <Building2 className="w-6 h-6 text-brand-600"/> 
                            {editingId ? 'Editar Cadastro' : 'Novo Empreendimento'}
                        </h3>
                        <p className="text-xs text-slate-500">Dados cadastrais e produtivos</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* TABS */}
                <div className="flex border-b border-slate-200 bg-white px-6">
                    <button 
                        onClick={() => setActiveTab('basic')}
                        className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'basic' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        1. Dados Básicos
                    </button>
                    <button 
                        onClick={() => setActiveTab('details')}
                        className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'details' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        2. Detalhes & Organização
                    </button>
                    <button 
                        onClick={() => setActiveTab('partners')}
                        className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'partners' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        3. Quadro Societário
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    <form id="enterpriseForm" onSubmit={handleSubmitContact} className="space-y-6">
                        
                        {/* TAB 1: BASIC INFO */}
                        {activeTab === 'basic' && (
                            <div className="space-y-6 animate-fade-in">
                                {/* Section 1: Enterprise Info */}
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                                    <h4 className="text-xs font-bold text-brand-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <Map className="w-4 h-4"/> Identificação & Localização
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                        <div className="md:col-span-6">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome do Empreendimento</label>
                                            <input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" 
                                                value={contactForm.company} onChange={e => setContactForm({...contactForm, company: e.target.value})} placeholder="Razão Social ou Nome Fantasia"/>
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">CNPJ</label>
                                            <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" 
                                                value={contactForm.cnpj} onChange={e => setContactForm({...contactForm, cnpj: e.target.value})} placeholder="00.000.000/0000-00"/>
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Telefone</label>
                                            <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" 
                                                value={contactForm.phone} onChange={e => setContactForm({...contactForm, phone: e.target.value})} placeholder="(XX) XXXXX-XXXX"/>
                                        </div>

                                        <div className="md:col-span-6">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Endereço da Sede</label>
                                            <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" 
                                                value={contactForm.address} onChange={e => setContactForm({...contactForm, address: e.target.value})} placeholder="Rua, Número, Bairro"/>
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cidade</label>
                                            <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" 
                                                value={contactForm.city} onChange={e => setContactForm({...contactForm, city: e.target.value})} placeholder="Município"/>
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Zona</label>
                                            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                                                value={contactForm.zone} onChange={e => setContactForm({...contactForm, zone: e.target.value as any})}>
                                                <option value="Urbana">Urbana</option>
                                                <option value="Rural">Rural</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Representative */}
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                    <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <UserIcon className="w-4 h-4"/> Representante
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                                            <input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                                                value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})}/>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">CPF / RG</label>
                                            <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                                                value={contactForm.cpf} onChange={e => setContactForm({...contactForm, cpf: e.target.value})}/>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cargo</label>
                                            <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                                                value={contactForm.representativeRole} onChange={e => setContactForm({...contactForm, representativeRole: e.target.value})} placeholder="Ex: Presidente"/>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">E-mail</label>
                                            <input type="email" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                                                value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: DETAILS & ORGANIZATION */}
                        {activeTab === 'details' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                    <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <LayoutGrid className="w-4 h-4"/> Estrutura & Produção
                                    </h4>
                                    
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Atividade</label>
                                                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                                    value={contactForm.role} onChange={e => setContactForm({...contactForm, role: e.target.value})}>
                                                    {Object.values(ActivityType).map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Produto Principal</label>
                                                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                                                    value={contactForm.mainProduct} onChange={e => setContactForm({...contactForm, mainProduct: e.target.value})} placeholder="Ex: Mel"/>
                                            </div>
                                        </div>
                                        
                                        <hr className="border-slate-100"/>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Situação Atual</label>
                                                <div className="space-y-2">
                                                    {['Em funcionamento', 'Em implantação', 'Em reestruturação', 'Paralisado'].map(opt => (
                                                        <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                                            <input type="radio" name="situation" className="text-brand-600 focus:ring-brand-500" 
                                                                checked={contactForm.situation === opt} onChange={() => setContactForm({...contactForm, situation: opt})} />
                                                            {opt}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Forma de Organização</label>
                                                <div className="space-y-2">
                                                    {['Grupo Informal', 'Associação', 'Cooperativa', 'Rede'].map(opt => (
                                                        <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                                            <input type="radio" name="org" className="text-brand-600 focus:ring-brand-500" 
                                                                checked={contactForm.organization === opt} onChange={() => setContactForm({...contactForm, organization: opt})} />
                                                            {opt}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input type="checkbox" className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500" 
                                                    checked={contactForm.cadsol} onChange={e => setContactForm({...contactForm, cadsol: e.target.checked})} />
                                                <span className="font-bold text-sm text-slate-800">Possui cadastro no CADSOL?</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: PARTNERS TABLE */}
                        {activeTab === 'partners' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-500"></div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                                            <Users className="w-4 h-4"/> Quadro Societário
                                        </h4>
                                        <span className="text-xs bg-slate-100 px-2 py-1 rounded font-bold text-slate-600">
                                            {contactForm.partners?.length || 0} Sócios
                                        </span>
                                    </div>

                                    {/* Add Partner Form */}
                                    <div className="flex gap-2 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        <input type="text" placeholder="Nome do Sócio" className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-sm outline-none" 
                                            value={newPartner.name} onChange={e => setNewPartner({...newPartner, name: e.target.value})} />
                                        <input type="text" placeholder="Cargo/Função" className="w-1/3 px-3 py-1.5 border border-slate-300 rounded text-sm outline-none" 
                                            value={newPartner.role} onChange={e => setNewPartner({...newPartner, role: e.target.value})} />
                                        <select className="w-24 px-2 py-1.5 border border-slate-300 rounded text-sm outline-none bg-white"
                                            value={newPartner.gender} onChange={e => setNewPartner({...newPartner, gender: e.target.value as any})}>
                                            <option value="Feminino">Fem</option>
                                            <option value="Masculino">Masc</option>
                                            <option value="Outro">Outro</option>
                                        </select>
                                        <button type="button" onClick={addPartner} className="bg-brand-600 text-white px-3 rounded hover:bg-brand-700 text-sm font-bold">+</button>
                                    </div>

                                    {/* Table */}
                                    <div className="overflow-hidden border border-slate-200 rounded-lg">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-100 font-bold text-slate-500 uppercase">
                                                <tr>
                                                    <th className="p-3">Nome</th>
                                                    <th className="p-3">Função</th>
                                                    <th className="p-3 text-center">Gênero</th>
                                                    <th className="p-3 text-center w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {contactForm.partners?.map((p) => (
                                                    <tr key={p.id}>
                                                        <td className="p-3 font-medium text-slate-700">{p.name}</td>
                                                        <td className="p-3 text-slate-500">{p.role}</td>
                                                        <td className="p-3 text-center">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${p.gender === 'Feminino' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                                {p.gender.substring(0,1)}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <button type="button" onClick={() => removePartner(p.id)} className="text-slate-300 hover:text-red-500">
                                                                <Trash2 className="w-3.5 h-3.5"/>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {(!contactForm.partners || contactForm.partners.length === 0) && (
                                                    <tr><td colSpan={4} className="p-4 text-center text-slate-400 italic">Nenhum sócio cadastrado.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    {/* Auto-calc summary to clarify for user */}
                                    <div className="mt-2 text-[10px] text-slate-400 text-right">
                                        Total H: {contactForm.partners?.filter(p => p.gender === 'Masculino').length || 0} | 
                                        Total M: {contactForm.partners?.filter(p => p.gender === 'Feminino').length || 0}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Internal Control Footer (Always Visible) */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2 text-slate-500">
                                <ClipboardList className="w-5 h-5"/>
                                <span className="text-xs font-bold uppercase tracking-wide">Controle Interno</span>
                            </div>
                            <div className="flex gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Responsável</label>
                                    <div className="text-xs font-medium text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                                        {contactForm.registeredByRole}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data</label>
                                    <div className="text-xs font-medium text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                                        {contactForm.registeredDate}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer Actions - Fixed */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-between items-center">
                    <button onClick={() => setIsModalOpen(false)} className="text-sm font-bold text-slate-500 hover:text-slate-700 px-4 py-2">
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        form="enterpriseForm"
                        className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg shadow-brand-200 flex items-center gap-2 transform active:scale-95 transition-all text-sm"
                    >
                        <Save className="w-4 h-4"/> {editingId ? 'Atualizar' : 'Salvar Cadastro'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Pre-Scheduling Modal */}
      {isSchedulingOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setIsSchedulingOpen(false)} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                <div className="px-6 py-4 border-b border-indigo-100 flex justify-between items-center bg-indigo-50">
                    <div>
                        <h3 className="font-bold text-indigo-900 text-lg flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5"/> Pré-Agendamento
                        </h3>
                        <p className="text-xs text-indigo-600">Sincroniza com Agenda e Kanban dos ASPs</p>
                    </div>
                    <button onClick={() => setIsSchedulingOpen(false)}><X className="w-5 h-5 text-indigo-400 hover:text-indigo-600"/></button>
                </div>
                <form onSubmit={handleSubmitScheduling} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Motivo da Visita</label>
                        <input type="text" required className="w-full px-3 py-2 border rounded-lg text-sm" value={appointmentForm.title} onChange={e => setAppointmentForm({...appointmentForm, title: e.target.value})}/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Data Sugerida</label>
                            <input type="date" required className="w-full px-3 py-2 border rounded-lg text-sm" value={appointmentForm.date} onChange={e => setAppointmentForm({...appointmentForm, date: e.target.value})}/>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Horário</label>
                            <input type="time" required className="w-full px-3 py-2 border rounded-lg text-sm" value={appointmentForm.time} onChange={e => setAppointmentForm({...appointmentForm, time: e.target.value})}/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">ASP Responsável (Técnico)</label>
                        <select 
                            required 
                            className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                            value={appointmentForm.assigneeId}
                            onChange={e => setAppointmentForm({...appointmentForm, assigneeId: e.target.value})}
                        >
                            <option value="">Selecione um técnico...</option>
                            {users.filter(u => u.role === UserRole.AGENTE_PRODUTIVO).map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="pt-2">
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg flex justify-center items-center gap-2 shadow-md shadow-indigo-200">
                            <Check className="w-4 h-4"/> Confirmar Agendamento
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};