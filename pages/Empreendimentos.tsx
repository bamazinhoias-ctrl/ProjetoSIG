import React, { useState } from 'react';
import { Contact, Appointment, AppointmentType, User, UserRole, ActivityType, Partner } from '../types';
import { Plus, Search, MapPin, Phone, Edit, Calendar as CalendarIcon, X, Building2, Save, User as UserIcon, LayoutGrid, ClipboardList, Trash2, Users } from 'lucide-react';

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
  const [appointmentForm, setAppointmentForm] = useState<Partial<Appointment>>({});

  // Check if current user has permission to edit
  const canEdit = currentUser ? (
      currentUser.role === UserRole.PRESIDENTE || 
      currentUser.role === UserRole.COORD_GERAL || 
      currentUser.permissions?.includes('edit_empreendimentos')
  ) : false;

  const initialFormState: Partial<Contact> = {
    company: '', address: '', city: '', zone: 'Urbana', phone: '', cnpj: '',
    role: ActivityType.ARTESANATO, mainProduct: '', menCount: 0, womenCount: 0,
    name: '', cpf: '', email: '', representativeRole: '',
    cadsol: false, situation: 'Em funcionamento', organization: 'Grupo Informal', partners: [],
    registeredByRole: '', registeredDate: new Date().toISOString().split('T')[0], notes: ''
  };

  const [contactForm, setContactForm] = useState<Partial<Contact>>(initialFormState);
  const [newPartner, setNewPartner] = useState<Partial<Partner>>({ name: '', role: '', gender: 'Feminino' });

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (contact?: Contact) => {
    setActiveTab('basic');
    if (contact) {
      setEditingId(contact.id);
      setContactForm({ ...contact, partners: contact.partners || [] });
    } else {
      setEditingId(null);
      setContactForm({ ...initialFormState, registeredByRole: currentUser?.role || UserRole.AUX_ADMIN });
    }
    setIsModalOpen(true);
  };

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactForm.company && contactForm.name) {
        if (editingId) {
            onUpdateContact({ ...contactForm, id: editingId } as Contact);
        } else {
            onAddContact({ ...contactForm, id: Math.random().toString(36).substr(2, 9), lastContacted: new Date().toISOString(), ownerId: currentUser?.id } as Contact);
        }
        setIsModalOpen(false);
    }
  };

  const addPartner = () => {
      if (newPartner.name) {
          const p: Partner = { id: Math.random().toString(36).substr(2,9), name: newPartner.name, role: newPartner.role || 'Sócio', gender: newPartner.gender as any };
          setContactForm(prev => ({ ...prev, partners: [...(prev.partners || []), p] }));
          setNewPartner({ name: '', role: '', gender: 'Feminino' });
      }
  };

  const removePartner = (id: string) => {
      setContactForm(prev => ({ ...prev, partners: prev.partners?.filter(p => p.id !== id) }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Building2 className="w-6 h-6 text-brand-600" /> Gestão de Empreendimentos</h2>
          <p className="text-sm text-slate-500">Base de Dados e Cadastro Unificado</p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"/>
            </div>
            {canEdit && (
                <button onClick={() => handleOpenModal()} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"><Plus className="w-4 h-4" /> Novo Cadastro</button>
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
                        <th className="px-6 py-4">Atividade</th>
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
                                <div className="text-sm text-slate-700 flex items-center gap-1"><MapPin className="w-3 h-3 text-brand-500"/> {contact.city || 'N/I'}</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-600">{contact.role}</span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex justify-end gap-2">
                                    {canEdit && <button onClick={() => handleOpenModal(contact)} className="p-1.5 text-slate-400 hover:text-brand-600 bg-slate-50 rounded border border-slate-200"><Edit className="w-4 h-4"/></button>}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {isModalOpen && canEdit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                    <h3 className="font-bold text-slate-800 text-lg">{editingId ? 'Editar Cadastro' : 'Novo Empreendimento'}</h3>
                    <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-slate-400"/></button>
                </div>

                <div className="flex border-b border-slate-200 bg-white px-6">
                    <button onClick={() => setActiveTab('basic')} className={`px-4 py-3 text-sm font-bold border-b-2 ${activeTab === 'basic' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500'}`}>1. Dados Básicos</button>
                    <button onClick={() => setActiveTab('details')} className={`px-4 py-3 text-sm font-bold border-b-2 ${activeTab === 'details' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500'}`}>2. Detalhes</button>
                    <button onClick={() => setActiveTab('partners')} className={`px-4 py-3 text-sm font-bold border-b-2 ${activeTab === 'partners' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500'}`}>3. Sócios</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    <form id="enterpriseForm" onSubmit={handleSubmitContact} className="space-y-6">
                        {activeTab === 'basic' && (
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                <h4 className="text-xs font-bold text-slate-500 uppercase">Identificação</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <input className="border p-2 rounded text-sm w-full" placeholder="Nome do Empreendimento" value={contactForm.company} onChange={e => setContactForm({...contactForm, company: e.target.value})} required/>
                                    <input className="border p-2 rounded text-sm w-full" placeholder="CNPJ" value={contactForm.cnpj} onChange={e => setContactForm({...contactForm, cnpj: e.target.value})}/>
                                    <input className="border p-2 rounded text-sm w-full" placeholder="Endereço" value={contactForm.address} onChange={e => setContactForm({...contactForm, address: e.target.value})}/>
                                    <input className="border p-2 rounded text-sm w-full" placeholder="Cidade" value={contactForm.city} onChange={e => setContactForm({...contactForm, city: e.target.value})}/>
                                    <input className="border p-2 rounded text-sm w-full" placeholder="Telefone" value={contactForm.phone} onChange={e => setContactForm({...contactForm, phone: e.target.value})}/>
                                    <input className="border p-2 rounded text-sm w-full" placeholder="Email" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})}/>
                                </div>
                            </div>
                        )}

                        {activeTab === 'details' && (
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                <h4 className="text-xs font-bold text-slate-500 uppercase">Atividade Econômica</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <select className="border p-2 rounded text-sm w-full bg-white" value={contactForm.role} onChange={e => setContactForm({...contactForm, role: e.target.value})}>
                                        {Object.values(ActivityType).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <input className="border p-2 rounded text-sm w-full" placeholder="Produto Principal" value={contactForm.mainProduct} onChange={e => setContactForm({...contactForm, mainProduct: e.target.value})}/>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={contactForm.cadsol} onChange={e=>setContactForm({...contactForm, cadsol: e.target.checked})}/> Cadastro CADSOL</label>
                                </div>
                            </div>
                        )}

                        {activeTab === 'partners' && (
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                <div className="flex gap-2 mb-2">
                                    <input className="border p-2 rounded text-sm flex-1" placeholder="Nome" value={newPartner.name} onChange={e=>setNewPartner({...newPartner, name: e.target.value})}/>
                                    <button type="button" onClick={addPartner} className="bg-brand-600 text-white px-3 py-1 rounded text-sm font-bold">ADD</button>
                                </div>
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-100 font-bold text-slate-500">
                                        <tr><th className="p-2">Nome</th><th className="p-2">Função</th><th className="w-8"></th></tr>
                                    </thead>
                                    <tbody>
                                        {contactForm.partners?.map(p => (
                                            <tr key={p.id} className="border-t">
                                                <td className="p-2">{p.name}</td><td className="p-2">{p.role}</td>
                                                <td className="p-2"><button type="button" onClick={()=>removePartner(p.id)}><Trash2 className="w-3 h-3 text-red-400"/></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </form>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-end gap-2">
                    <button onClick={() => setIsModalOpen(false)} className="text-sm font-bold text-slate-500 px-4 py-2">Cancelar</button>
                    <button type="submit" form="enterpriseForm" className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 px-6 rounded-lg text-sm">Salvar</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
