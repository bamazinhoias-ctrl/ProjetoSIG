import React, { useState } from 'react';
import { User, FileText, UserPlus, Save, Search, MapPin, Phone, Mail } from 'lucide-react';

export const CadCidadao: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    nis: '',
    dataNascimento: '',
    telefone: '',
    email: '',
    endereco: '',
    comunidade: '',
    rendaFamiliar: '',
    escolaridade: 'Fundamental Incompleto'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Cadastro realizado com sucesso! (Simulação)');
    // Reset form logic would go here
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-brand-600" />
            CadCidadão
          </h2>
          <p className="text-sm text-slate-500">Cadastro Socioeconômico de Beneficiários</p>
        </div>
        <div className="flex gap-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <input 
                    type="text" 
                    placeholder="Buscar por CPF..." 
                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Ficha de Identificação</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Nome Completo</label>
                    <input 
                        type="text" 
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        value={formData.nome}
                        onChange={e => setFormData({...formData, nome: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">CPF</label>
                    <input 
                        type="text" 
                        required
                        placeholder="000.000.000-00"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        value={formData.cpf}
                        onChange={e => setFormData({...formData, cpf: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">NIS / PIS</label>
                    <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        value={formData.nis}
                        onChange={e => setFormData({...formData, nis: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Data de Nascimento</label>
                    <input 
                        type="date" 
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        value={formData.dataNascimento}
                        onChange={e => setFormData({...formData, dataNascimento: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Escolaridade</label>
                    <select 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        value={formData.escolaridade}
                        onChange={e => setFormData({...formData, escolaridade: e.target.value})}
                    >
                        <option>Fundamental Incompleto</option>
                        <option>Fundamental Completo</option>
                        <option>Médio Incompleto</option>
                        <option>Médio Completo</option>
                        <option>Superior</option>
                    </select>
                </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" /> Contato e Localização
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Endereço Residencial</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                            value={formData.endereco}
                            onChange={e => setFormData({...formData, endereco: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Comunidade / Associação</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                            value={formData.comunidade}
                            onChange={e => setFormData({...formData, comunidade: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                value={formData.telefone}
                                onChange={e => setFormData({...formData, telefone: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input 
                                type="email" 
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button 
                    type="submit" 
                    className="bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-sm flex items-center gap-2 transition-all"
                >
                    <Save className="w-4 h-4" /> Salvar Cadastro
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};