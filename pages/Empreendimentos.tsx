import React, { useState } from 'react';
import { Contact, Appointment, User, UserRole, ActivityType } from '../types';
import { Plus, Search, MapPin, Edit, X, Building2, Trash2 } from 'lucide-react';

// --- STYLED COMPONENTS FOR EXACT MATCH ---

interface LabelProps {
  children: React.ReactNode;
}
const Label: React.FC<LabelProps> = ({ children }) => (
    <label className="block text-[11px] font-bold text-[#666] mb-1.5">{children}</label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input 
      {...props}
      className="w-full bg-[#f0f4f8] text-[#333] text-sm h-10 px-3 rounded-sm border-none outline-none focus:ring-1 focus:ring-blue-300 placeholder:text-gray-400"
    />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <div className="relative">
      <select 
          {...props}
          className="w-full bg-white border border-gray-200 text-[#333] text-sm h-10 px-3 pr-8 rounded-sm outline-none focus:ring-1 focus:ring-blue-300 appearance-none font-medium uppercase"
      />
      <div className="absolute right-3 top-3 pointer-events-none">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
      </div>
    </div>
);

interface RadioBlockProps {
  label: string;
  children: React.ReactNode;
}
const RadioBlock: React.FC<RadioBlockProps> = ({ label, children }) => (
    <div className="bg-[#f0f4f8] p-4 rounded-sm mb-4">
        <Label>{label}</Label>
        <div className="mt-2">
          {children}
        </div>
    </div>
);

interface CustomRadioProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}
const CustomRadio: React.FC<CustomRadioProps> = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-2 cursor-pointer group mb-2 last:mb-0">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${checked ? 'border-[#5c7cfa] bg-[#5c7cfa]' : 'border-[#a0aec0] bg-white'}`}>
            {/* No inner dot needed if full fill style, but let's do inner white dot for standard radio look or full fill based on image interpretation. Image looks solid blue. */}
        </div>
        <input type="radio" className="hidden" checked={checked} onChange={onChange} />
        <span className={`text-sm ${checked ? 'text-[#333] font-medium' : 'text-[#555]'}`}>{label}</span>
    </label>
);

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
  onAddContact, 
  onUpdateContact,
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
    menCount: 3, womenCount: 1,
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

  return (
    <div className="space-y-6 animate-fade-in">
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

      {/* MODAL - PIXEL PERFECT TO IMAGE */}
      {isModalOpen && canEdit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
            <div className="relative bg-white shadow-2xl w-full max-w-3xl h-[90vh] md:h-auto md:max-h-[95vh] flex flex-col overflow-hidden animate-scale-in rounded-sm">
                
                {/* Close Button - Top Right (Hidden in Image but needed for UX, kept subtle) */}
                <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10">
                    <X className="w-5 h-5" />
                </button>

                <div className="flex-1 overflow-y-auto p-8 md:p-10">
                    <form id="enterpriseForm" onSubmit={handleSubmitContact} className="space-y-4">
                        
                        <div className="mb-4">
                            <Label>Nome do Empreendimento</Label>
                            <Input value={contactForm.company} onChange={(e) => setContactForm({...contactForm, company: e.target.value})} />
                        </div>

                        <div className="mb-4">
                            <Label>Atividade</Label>
                            <Input value={contactForm.role} onChange={(e) => setContactForm({...contactForm, role: e.target.value})} />
                        </div>

                        <div className="mb-4">
                            <Label>CNPJ</Label>
                            <Input value={contactForm.cnpj} onChange={(e) => setContactForm({...contactForm, cnpj: e.target.value})} />
                        </div>

                        <RadioBlock label="O empreendimento está cadastrado no CADSOL?">
                            <div className="flex gap-6">
                                <CustomRadio label="Sim" checked={contactForm.cadsol === true} onChange={() => setContactForm({...contactForm, cadsol: true})} />
                                <CustomRadio label="Não" checked={contactForm.cadsol === false} onChange={() => setContactForm({...contactForm, cadsol: false})} />
                            </div>
                        </RadioBlock>

                        <div className="mb-4">
                            <Label>Endereço</Label>
                            <Input value={contactForm.address} onChange={(e) => setContactForm({...contactForm, address: e.target.value})} />
                        </div>

                        <div className="flex gap-4 mb-4">
                            <div className="w-[60%]">
                                <Label>Bairro</Label>
                                <Input value={contactForm.neighborhood} onChange={(e) => setContactForm({...contactForm, neighborhood: e.target.value})} />
                            </div>
                            <div className="w-[40%]">
                                <Label>CEP</Label>
                                <Input value={contactForm.zip} onChange={(e) => setContactForm({...contactForm, zip: e.target.value})} />
                            </div>
                        </div>

                        <div className="flex gap-4 mb-4">
                            <div className="w-[20%]">
                                <Select value={contactForm.state} onChange={(e) => setContactForm({...contactForm, state: e.target.value})}>
                                    <option value="BA">BA</option>
                                    <option value="SE">SE</option>
                                </Select>
                            </div>
                            <div className="w-[80%]">
                                <Select value={contactForm.city} onChange={(e) => setContactForm({...contactForm, city: e.target.value})}>
                                    <option value="SALVADOR">SALVADOR</option>
                                    <option value="CAMACARI">CAMAÇARI</option>
                                    <option value="LAURO DE FREITAS">LAURO DE FREITAS</option>
                                </Select>
                            </div>
                        </div>

                        <div className="flex gap-4 mb-4">
                            <div className="flex-1">
                                <Label>Telefone</Label>
                                <Input value={contactForm.phone} onChange={(e) => setContactForm({...contactForm, phone: e.target.value})} />
                            </div>
                            <div className="flex-1">
                                <Label>Celular</Label>
                                <Label><span className="text-[10px] font-normal absolute -mt-5 ml-10 text-gray-400"></span></Label> {/* Spacer for visual alignment if needed */}
                                <Input value={contactForm.cellphone} onChange={(e) => setContactForm({...contactForm, cellphone: e.target.value})} />
                            </div>
                            <div className="flex-[1.5]">
                                <Label>Email</Label>
                                <Input value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} />
                            </div>
                        </div>

                        <RadioBlock label="Qual a situação atual do empreendimento?">
                            <div className="flex flex-col gap-2">
                                {['Em funcionamento', 'Em implantação (ainda não iniciou sua atividade produtiva ou de prestação de serviço)', 'Em reestruturação', 'Outra. Qual?'].map((opt) => (
                                    <CustomRadio 
                                        key={opt}
                                        label={opt} 
                                        checked={contactForm.situation === opt.split(' (')[0]} 
                                        onChange={() => setContactForm({...contactForm, situation: opt.split(' (')[0]})} 
                                    />
                                ))}
                            </div>
                        </RadioBlock>

                        <div className="mb-4">
                            <Label>Número de sócios</Label>
                            <div className="flex gap-4 items-end">
                                <div className="w-24">
                                    <label className="text-[10px] text-gray-500 mb-1 block">Homens</label>
                                    <Input 
                                        type="number" 
                                        value={contactForm.menCount} 
                                        onChange={e => setContactForm({...contactForm, menCount: parseInt(e.target.value) || 0})}
                                        className="bg-[#f0f4f8] h-9 w-full px-2 rounded-sm outline-none"
                                    />
                                </div>
                                <div className="w-24">
                                    <label className="text-[10px] text-gray-500 mb-1 block">Mulheres</label>
                                    <Input 
                                        type="number" 
                                        value={contactForm.womenCount} 
                                        onChange={e => setContactForm({...contactForm, womenCount: parseInt(e.target.value) || 0})}
                                        className="bg-[#f0f4f8] h-9 w-full px-2 rounded-sm outline-none"
                                    />
                                </div>
                                <div className="w-24">
                                    <label className="text-[10px] text-gray-500 mb-1 block">Total</label>
                                    <div className="bg-[#f0f4f8] h-9 w-full px-2 flex items-center text-sm text-gray-400 font-bold border-b border-dotted border-gray-400">
                                        {(contactForm.menCount || 0) + (contactForm.womenCount || 0)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <RadioBlock label="Forma de Organização:">
                            <div className="flex flex-col gap-2">
                                {['Grupo Informal', 'Associação', 'Cooperativa', 'Rede, Central de Associações, Complexo Cooperativo e similares', 'Outra. Qual?'].map((opt) => (
                                    <CustomRadio 
                                        key={opt}
                                        label={opt} 
                                        checked={contactForm.organization === opt} 
                                        onChange={() => setContactForm({...contactForm, organization: opt})} 
                                    />
                                ))}
                            </div>
                        </RadioBlock>

                    </form>
                </div>

                {/* Footer Buttons Matching Image */}
                <div className="p-6 bg-white shrink-0 flex justify-center gap-4 border-t border-transparent">
                    {editingId && (
                        <button onClick={handleDelete} className="bg-[#6b829e] hover:bg-[#5a6e85] text-white font-bold py-2 px-6 rounded shadow-sm text-sm uppercase flex items-center gap-3 transition-transform active:scale-95">
                            EXCLUIR <div className="w-2.5 h-2.5 bg-white"></div>
                        </button>
                    )}
                    <button type="submit" form="enterpriseForm" className="bg-[#6b829e] hover:bg-[#5a6e85] text-white font-bold py-2 px-10 rounded shadow-sm text-sm uppercase transition-transform active:scale-95">
                        SALVAR
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};