import React, { useState, useRef, useEffect } from 'react';
import { Contact, AIAnalysis } from '../types';
import { generateLeadAnalysis } from '../services/geminiService';
import { authenticateGoogle, createDocument, GoogleDoc } from '../services/googleDocsService';
import { 
    Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, 
    Save, FileText, Share, Bot, Check, AlertCircle, ExternalLink, Loader2, Cloud 
} from 'lucide-react';

interface ActionPlanProps {
    contacts: Contact[];
    currentUserRole?: string;
    onComplete?: (contactId: string) => void;
    initialContactId?: string;
}

export const ActionPlan: React.FC<ActionPlanProps> = ({ contacts, onComplete, initialContactId }) => {
    // State
    const [selectedContactId, setSelectedContactId] = useState<string>(initialContactId || '');
    const [docTitle, setDocTitle] = useState('Novo Plano de Ação');
    const [content, setContent] = useState('');
    const [isGoogleConnected, setIsGoogleConnected] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [exportedDoc, setExportedDoc] = useState<GoogleDoc | null>(null);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    // Refs for Editor
    const editorRef = useRef<HTMLDivElement>(null);

    // Update selection if prop changes
    useEffect(() => {
        if (initialContactId) {
            setSelectedContactId(initialContactId);
        }
    }, [initialContactId]);

    // Helper: Execute command for Rich Text (simulated via execCommand for demo)
    const execCmd = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            editorRef.current.focus();
        }
    };

    // Google Auth Handler
    const handleConnectGoogle = async () => {
        try {
            const response = await authenticateGoogle();
            setIsGoogleConnected(true);
            // alert(`Conectado como ${response.user.email}`);
        } catch (error) {
            console.error("Auth failed", error);
        }
    };

    // AI Generation Handler
    const handleGenerateAI = async () => {
        const contact = contacts.find(c => c.id === selectedContactId);
        if (!contact) {
            alert("Selecione um empreendimento primeiro.");
            return;
        }

        setIsGeneratingAI(true);
        try {
            // Using existing service to get a draft
            const analysis = await generateLeadAnalysis(contact);
            
            // Format HTML for the editor
            const htmlContent = `
                <h2>Plano de Ação Estratégico</h2>
                <p><strong>Empreendimento:</strong> ${contact.company}</p>
                <p><strong>Responsável:</strong> ${contact.name}</p>
                <hr/>
                <h3>1. Diagnóstico Técnico</h3>
                <p>${analysis.summary}</p>
                <p><strong>Nível de Maturidade:</strong> ${analysis.score}/100</p>
                <br/>
                <h3>2. Ações Prioritárias</h3>
                <ul>
                    <li>${analysis.suggestedAction}</li>
                    <li>Regularização da documentação base</li>
                    <li>Revisão de custos e precificação</li>
                </ul>
                <br/>
                <h3>3. Detalhamento</h3>
                <p>${analysis.emailDraft.replace(/\n/g, '<br/>')}</p>
            `;
            
            if (editorRef.current) {
                editorRef.current.innerHTML = htmlContent;
                setContent(htmlContent);
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao gerar conteúdo com IA.");
        } finally {
            setIsGeneratingAI(false);
        }
    };

    // Export Handler
    const handleExport = async () => {
        if (!docTitle) return;
        
        setIsExporting(true);
        try {
            const html = editorRef.current?.innerHTML || '';
            const contact = contacts.find(c => c.id === selectedContactId);
            
            const doc = await createDocument(docTitle, html, contact);
            setExportedDoc(doc);
            setLastSaved(new Date().toLocaleTimeString());
            
            // Trigger completion logic
            if (onComplete && selectedContactId) {
                onComplete(selectedContactId);
            }

        } catch (error) {
            alert("Erro ao exportar documento.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 animate-fade-in">
            
            {/* LEFT SIDEBAR: Controls & Context */}
            <div className="w-full md:w-80 flex flex-col gap-4 shrink-0">
                
                {/* 1. Select Context */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Empreendimento Alvo</label>
                    <div className="relative">
                        <select 
                            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-brand-500 outline-none appearance-none"
                            value={selectedContactId}
                            onChange={(e) => setSelectedContactId(e.target.value)}
                        >
                            <option value="">Selecione...</option>
                            {contacts.map(c => (
                                <option key={c.id} value={c.id}>{c.company}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

                {/* 2. Google Connection Status */}
                <div className={`p-5 rounded-xl border transition-all ${isGoogleConnected ? 'bg-blue-50 border-blue-100' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${isGoogleConnected ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                            <Cloud className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-700">Google Workspace</h3>
                            <p className="text-xs text-slate-500">{isGoogleConnected ? 'Conta Conectada' : 'Integração disponível'}</p>
                        </div>
                    </div>
                    
                    {!isGoogleConnected ? (
                        <button 
                            onClick={handleConnectGoogle}
                            className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" className="w-4 h-4" alt="G" />
                            Conectar Conta
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 text-xs text-blue-700 font-medium bg-white/50 p-2 rounded border border-blue-100">
                            <Check className="w-3 h-3" /> Pronto para exportar
                        </div>
                    )}
                </div>

                {/* 3. AI Assistant */}
                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-5 rounded-xl text-white shadow-lg">
                    <div className="flex items-center gap-2 mb-3">
                        <Bot className="w-5 h-5 text-purple-200" />
                        <h3 className="font-bold text-sm">IA Assistente</h3>
                    </div>
                    <p className="text-xs text-purple-100 mb-4 leading-relaxed">
                        Gere um esboço completo do plano de ação baseado no histórico do empreendimento selecionado.
                    </p>
                    <button 
                        onClick={handleGenerateAI}
                        disabled={!selectedContactId || isGeneratingAI}
                        className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        {isGeneratingAI ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <FileText className="w-4 h-4" />
                        )}
                        {isGeneratingAI ? 'Gerando...' : 'Gerar Rascunho'}
                    </button>
                </div>

                {/* 4. Export Success Status */}
                {exportedDoc && (
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 animate-fade-in">
                        <div className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-emerald-600 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-emerald-800">Exportado com Sucesso!</h4>
                                <p className="text-xs text-emerald-600 mt-1 mb-2">Documento criado no Google Docs.</p>
                                <a 
                                    href={exportedDoc.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1"
                                >
                                    Abrir Documento <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* CENTER: Editor Area */}
            <div className="flex-1 flex flex-col bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative">
                
                {/* Editor Toolbar */}
                <div className="bg-white border-b border-slate-200 p-2 flex flex-wrap items-center gap-1 sticky top-0 z-10">
                    <div className="flex items-center border-r border-slate-200 pr-2 mr-2 gap-1">
                        <button onClick={() => execCmd('bold')} className="p-2 hover:bg-slate-100 rounded text-slate-600" title="Negrito"><Bold className="w-4 h-4"/></button>
                        <button onClick={() => execCmd('italic')} className="p-2 hover:bg-slate-100 rounded text-slate-600" title="Itálico"><Italic className="w-4 h-4"/></button>
                        <button onClick={() => execCmd('underline')} className="p-2 hover:bg-slate-100 rounded text-slate-600" title="Sublinhado"><Underline className="w-4 h-4"/></button>
                    </div>
                    
                    <div className="flex items-center border-r border-slate-200 pr-2 mr-2 gap-1">
                        <button onClick={() => execCmd('justifyLeft')} className="p-2 hover:bg-slate-100 rounded text-slate-600"><AlignLeft className="w-4 h-4"/></button>
                        <button onClick={() => execCmd('justifyCenter')} className="p-2 hover:bg-slate-100 rounded text-slate-600"><AlignCenter className="w-4 h-4"/></button>
                        <button onClick={() => execCmd('justifyRight')} className="p-2 hover:bg-slate-100 rounded text-slate-600"><AlignRight className="w-4 h-4"/></button>
                    </div>

                    <div className="flex items-center gap-1">
                        <button onClick={() => execCmd('insertUnorderedList')} className="p-2 hover:bg-slate-100 rounded text-slate-600"><List className="w-4 h-4"/></button>
                        <button onClick={() => execCmd('insertOrderedList')} className="p-2 hover:bg-slate-100 rounded text-slate-600"><ListOrdered className="w-4 h-4"/></button>
                    </div>
                    
                    <div className="ml-auto flex items-center gap-2">
                        {lastSaved && <span className="text-xs text-slate-400 mr-2 hidden sm:inline">Salvo às {lastSaved}</span>}
                        <button 
                            onClick={handleExport}
                            disabled={!isGoogleConnected || isExporting}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                                isGoogleConnected 
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' 
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            {isExporting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Share className="w-4 h-4" />}
                            {isExporting ? 'Exportando...' : 'Exportar & Finalizar'}
                        </button>
                    </div>
                </div>

                {/* Document Header Input */}
                <div className="bg-white px-8 pt-6 pb-2 border-b border-transparent">
                    <input 
                        type="text" 
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        className="w-full text-2xl font-bold text-slate-800 placeholder-slate-300 outline-none bg-transparent"
                        placeholder="Título do Documento..."
                    />
                </div>

                {/* Editor Page (A4 Simulation) */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-slate-100" onClick={() => editorRef.current?.focus()}>
                    <div 
                        ref={editorRef}
                        contentEditable
                        className="w-full max-w-[21cm] min-h-[29.7cm] bg-white shadow-lg p-[2.5cm] outline-none text-slate-800 leading-relaxed text-sm print:shadow-none"
                        style={{ fontFamily: '"Times New Roman", Times, serif' }}
                        onInput={(e) => setContent(e.currentTarget.innerHTML)}
                    >
                        {/* Initial Placeholder Content */}
                        <p>Comece a digitar o plano de ação ou utilize a IA para gerar um rascunho...</p>
                    </div>
                </div>
            </div>
        </div>
    );
};