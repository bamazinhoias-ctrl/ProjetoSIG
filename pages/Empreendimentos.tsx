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
  
  // Check if current user has permission to edit
  const canEdit = currentUser ? (
      currentUser.role === UserRole.PRESIDENTE || 
      currentUser.role === UserRole.COORD_GERAL || 
      currentUser.permissions?.includes('edit_empreendimentos')
  ) : false;

  const initialFormState: Partial<Contact> = {
    company: '', address: '', neighborhood: '', zip: '', city: 'SALVADOR', state: 'BA', zone: 'Urbana', 
    phone: '', cellphone: '', email: '', cnpj: '',
    role: ActivityType.ARTESANATO, mainProduct: '', 
    menCount: 3, womenCount: 1, // Default from image example
    name: '', cpf: '', representativeRole: '',
    cadsol: true, situation: 'Em funcionamento', organization: 'Grupo Informal', partners: [],
    registeredByRole: '', registeredDate: new Date().toISOString().split('T')[0], notes: ''
  };

  const [contactForm, setContactForm] = useState<Partial<Contact>>(initialFormState);

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (contact?: Contact) => {
    if (contact) {
      setEditingId(contact.id);
      setContactForm({ ...contact, partners: contact.partners || [] });
    } else {
      setEditingId(null);
      setContactForm({ ...initialFormState, registeredByRole: currentUser?.role || UserRole.AUX_ADMIN });
    }
    setIsModalOpen(true);
  };

  const handleDelete = () => {
      if (editingId) {
          if (confirm('Deseja realmente excluir este empreendimento?')) {
              // In a real app, propagate delete up. For now just close.
              setIsModalOpen(false);
          }
      }
  }

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactForm.company) {
        if (editingId) {
            onUpdateContact({ ...contactForm, id: editingId } as Contact);
        } else {
            onAddContact({ ...contactForm, id: Math.random().toString(36).substr(2, 9), lastContacted: new Date().toISOString(), ownerId: currentUser?.id } as Contact);
        }
        setIsModalOpen(false);
    }
  };

  // Reusable Input Component to match image style
  const FormInput = ({ label, value, onChange, placeholder, type = 'text', className = '' }: any) => (
      <div className={`mb-3 ${className}`}>
          <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
          <input 
            type={type}
            className="w-full bg-[#f0f4f8] text-slate-700 text-sm p-2.5 rounded border-none focus:ring-1 focus:ring-brand-400 focus:bg-white transition-colors"
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
          />
      </div>
  );

  const FormSelect = ({ label, value, onChange, options, className = '' }: any) => (
      <div className={`mb-3 ${className}`}>
          <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
          <select 
            className="w-full bg-[#f0f4f8] text-slate-700 text-sm p-2.5 rounded border-none focus:ring-1 focus:ring-brand-400 focus:bg-white transition-colors appearance-none"
            value={value || ''}
            onChange={onChange}
          >
              {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
      </div>
  );

  return (
    <div className="space-y-6">
      {/* Header & Search */}
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

      {/* Table List */}
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

      {/* MODAL - FAITHFUL REPRODUCTION */}
      {isModalOpen && canEdit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <div className="relative bg-white shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden animate-scale-in border border-slate-200">
                {/* No Header in Image, just form content, but for UX we keep a minimal close button or rely on bottom actions */}
                
                <div className="flex-1 overflow-y-auto p-8 bg-white">
                    <form id="enterpriseForm" onSubmit={handleSubmitContact} className="space-y-4">
                        
                        <FormInput 
                            label="Nome do Empreendimento" 
                            value={contactForm.company} 
                            onChange={(e: any) => setContactForm({...contactForm, company: e.target.value})}
                        />

                        <FormInput 
                            label="Atividade" 
                            value={contactForm.role} 
                            onChange={(e: any) => setContactForm({...contactForm, role: e.target.value})}
                        />

                        <FormInput 
                            label="CNPJ" 
                            value={contactForm.cnpj} 
                            onChange={(e: any) => setContactForm({...contactForm, cnpj: e.target.value})}
                        />

                        {/* CADSOL Radio */}
                        <div className="bg-[#f0f4f8] p-4 rounded mb-4">
                            <label className="block text-xs font-bold text-slate-500 mb-2">O empreendimento está cadastrado no CADSOL?</label>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                                    <input type="radio" checked={contactForm.cadsol === true} onChange={() => setContactForm({...contactForm, cadsol: true})} className="w-4 h-4 text-[#5c7cfa]" /> Sim
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                                    <input type="radio" checked={contactForm.cadsol === false} onChange={() => setContactForm({...contactForm, cadsol: false})} className="w-4 h-4 text-[#5c7cfa]" /> Não
                                </label>
                            </div>
                        </div>

                        <FormInput 
                            label="Endereço" 
                            value={contactForm.address} 
                            onChange={(e: any) => setContactForm({...contactForm, address: e.target.value})}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormInput 
                                label="Bairro" 
                                value={contactForm.neighborhood} 
                                onChange={(e: any) => setContactForm({...contactForm, neighborhood: e.target.value})}
                            />
                            <FormInput 
                                label="CEP" 
                                value={contactForm.zip} 
                                onChange={(e: any) => setContactForm({...contactForm, zip: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <FormSelect 
                                label="UF" 
                                value={contactForm.state} 
                                options={['BA', 'SE', 'AL', 'PE']}
                                onChange={(e: any) => setContactForm({...contactForm, state: e.target.value})}
                                className="col-span-1"
                            />
                            <FormSelect 
                                label="MUNICÍPIO" 
                                value={contactForm.city} 
                                options={['SALVADOR', 'LAURO DE FREITAS', 'CAMAÇARI', 'FEIRA DE SANTANA']}
                                onChange={(e: any) => setContactForm({...contactForm, city: e.target.value})}
                                className="col-span-2"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <FormInput 
                                label="Telefone" 
                                value={contactForm.phone} 
                                onChange={(e: any) => setContactForm({...contactForm, phone: e.target.value})}
                            />
                            <FormInput 
                                label="Celular" 
                                value={contactForm.cellphone} 
                                onChange={(e: any) => setContactForm({...contactForm, cellphone: e.target.value})}
                            />
                            <FormInput 
                                label="Email" 
                                value={contactForm.email} 
                                onChange={(e: any) => setContactForm({...contactForm, email: e.target.value})}
                            />
                        </div>

                        {/* Situation Radio */}
                        <div className="bg-[#f0f4f8] p-4 rounded mb-4">
                            <label className="block text-xs font-bold text-slate-500 mb-2">Qual a situação atual do empreendimento?</label>
                            <div className="space-y-2">
                                {['Em funcionamento', 'Em implantação (ainda não iniciou sua atividade produtiva ou de prestação de serviço)', 'Em reestruturação', 'Outra. Qual?'].map((opt) => (
                                    <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                                        <input 
                                            type="radio" 
                                            checked={contactForm.situation === opt.split(' (')[0]} 
                                            onChange={() => setContactForm({...contactForm, situation: opt.split(' (')[0]})} 
                                            className="w-4 h-4 text-[#5c7cfa]" 
                                        /> 
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Partners Count */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2">Número de sócios</label>
                            <div className="grid grid-cols-3 gap-4 bg-[#f0f4f8] p-4 rounded">
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Homens</label>
                                    <input 
                                        type="number" 
                                        className="w-full p-2 bg-white rounded border border-slate-200"
                                        value={contactForm.menCount} 
                                        onChange={e => setContactForm({...contactForm, menCount: parseInt(e.target.value) || 0})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Mulheres</label>
                                    <input 
                                        type="number" 
                                        className="w-full p-2 bg-white rounded border border-slate-200"
                                        value={contactForm.womenCount} 
                                        onChange={e => setContactForm({...contactForm, womenCount: parseInt(e.target.value) || 0})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Total</label>
                                    <input 
                                        type="number" 
                                        disabled
                                        className="w-full p-2 bg-slate-100 rounded border-none text-slate-500 font-bold"
                                        value={(contactForm.menCount || 0) + (contactForm.womenCount || 0)} 
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">.................................................</p>
                                </div>
                            </div>
                        </div>

                        {/* Organization Radio */}
