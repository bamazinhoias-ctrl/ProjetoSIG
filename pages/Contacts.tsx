import React, { useState } from 'react';
import { Contact, Deal, AIAnalysis, View } from '../types';
import { Mail, Phone, MapPin, User, Sparkles, X, Send, FileText, ClipboardList } from 'lucide-react';
import { generateLeadAnalysis } from '../services/geminiService';

interface ContactsProps {
  contacts: Contact[];
  deals: Deal[];
  onNavigate?: (view: View, contextId?: string) => void;
}

export const Contacts: React.FC<ContactsProps> = ({ contacts, deals, onNavigate }) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const handleAnalyze = async (contact: Contact) => {
    setLoadingAnalysis(true);
    setAnalysis(null);
    const activeDeal = deals.find(d => d.contactId === contact.id);
    const result = await generateLeadAnalysis(contact, activeDeal);
    setAnalysis(result);
    setLoadingAnalysis(false);
  };

  const closeDrawer = () => {
    setSelectedContact(null);
    setAnalysis(null);
  }

  const handleOpenActionPlan = () => {
      if (onNavigate && selectedContact) {
          onNavigate('actionplan', selectedContact.id);
      }
  };

  return (
    <div className="relative h-full">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Beneficiário / Empreendimento</th>
              <th className="px-6 py-4">Comunidade</th>
              <th className="px-6 py-4">Atividade</th>
              <th className="px-6 py-4">Última Visita</th>
              <th className="px-6 py-4">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contacts.map((contact) => (
              <tr 
                key={contact.id} 
                className="hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => setSelectedContact(contact)}
              >
                <td className="px-6 py-4 font-medium text-slate-900">{contact.name}</td>
                <td className="px-6 py-4 text-slate-600">{contact.company}</td>
                <td className="px-6 py-4 text-slate-500">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {contact.role}
                    </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{new Date(contact.lastContacted).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">Detalhes</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-over Drawer */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={closeDrawer} />
          <div className="relative w-full max-w-lg bg-white shadow-2xl h-full overflow-y-auto flex flex-col animate-slide-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedContact.name}</h2>
                <p className="text-slate-500">{selectedContact.role} • {selectedContact.company}</p>
              </div>
              <button onClick={closeDrawer} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8 flex-1">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-sm truncate">{selectedContact.email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">{selectedContact.phone}</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Notas do ASP (Campo)</h3>
                  <div className="bg-amber-50 p-4 rounded-lg text-sm text-slate-600 leading-relaxed border border-amber-100 font-mono">
                      {selectedContact.notes}
                  </div>
              </div>

              {/* AI Section */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        Assistente Técnico (IA)
                    </h3>
                    <button 
                        onClick={() => handleAnalyze(selectedContact)}
                        disabled={loadingAnalysis}
                        className="text-sm bg-purple-600 text-white px-3 py-1.5 rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                        {loadingAnalysis ? 'Gerando...' : 'Gerar Análise'}
                    </button>
                </div>

                {analysis ? (
                    <div className="space-y-4 animate-fade-in">
                        {/* Score */}
                        <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-slate-100 border-4 border-purple-100">
                                <span className={`text-xl font-bold ${analysis.score > 70 ? 'text-green-600' : analysis.score > 40 ? 'text-amber-600' : 'text-red-600'}`}>
                                    {analysis.score}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Maturidade EVE</p>
                                <p className="text-xs text-slate-400">Viabilidade Econômica</p>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                            <h4 className="text-xs font-bold text-purple-800 uppercase tracking-wide mb-1">Diagnóstico</h4>
                            <p className="text-sm text-purple-900">{analysis.summary}</p>
                        </div>

                        {/* Action */}
                        <div className="flex items-start gap-3">
                             <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <ClipboardList className="w-4 h-4" />
                             </div>
                             <div>
                                 <p className="text-xs font-bold text-slate-500 uppercase">Ação Recomendada (Fluxo)</p>
                                 <p className="text-sm font-medium text-slate-900">{analysis.suggestedAction}</p>
                             </div>
                        </div>

                        {/* Email Draft */}
                        <div className="mt-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                                <FileText className="w-3 h-3" /> Minuta do Plano de Ação
                            </h4>
                            <textarea 
                                readOnly
                                className="w-full h-48 p-3 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-xs"
                                value={analysis.emailDraft}
                            />
                            {onNavigate && (
                                <button 
                                    onClick={handleOpenActionPlan}
                                    className="mt-2 w-full py-2 bg-brand-600 border border-transparent text-white font-medium rounded-lg hover:bg-brand-700 text-sm shadow-sm transition-all"
                                >
                                    Abrir no Editor de Plano de Ação
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    !loadingAnalysis && (
                        <div className="text-center py-8 text-slate-400">
                            <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">Clique em "Gerar Análise" para processar dados de campo.</p>
                        </div>
                    )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};