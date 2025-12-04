import React, { useState } from 'react';
import { ClipboardList, Calculator, TrendingUp, AlertTriangle, FileCheck, DollarSign } from 'lucide-react';

export const EVE: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start">
            <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-brand-600" />
                Estudo de Viabilidade Econômica (EVE)
            </h2>
            <p className="text-sm text-slate-500 mt-1">Ferramenta técnica para análise de empreendimentos solidários.</p>
            </div>
            <div className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-bold border border-brand-100">
                Fase de Diagnóstico
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sidebar Steps */}
        <div className="space-y-2">
            {[1, 2, 3, 4].map(step => (
                <button
                    key={step}
                    onClick={() => setActiveStep(step)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${
                        activeStep === step 
                        ? 'bg-brand-600 text-white border-brand-600 shadow-md' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:bg-brand-50'
                    }`}
                >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        activeStep === step ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                        {step}
                    </div>
                    <div>
                        <span className="block font-bold text-sm">
                            {step === 1 ? 'Dados Produtivos' : 
                             step === 2 ? 'Custos & Insumos' : 
                             step === 3 ? 'Precificação' : 'Análise Final'}
                        </span>
                        <span className={`text-xs ${activeStep === step ? 'text-brand-100' : 'text-slate-400'}`}>
                             {step === 1 ? 'Capacidade instalada' : 
                             step === 2 ? 'Matéria-prima e fixos' : 
                             step === 3 ? 'Markup e Venda' : 'Parecer Técnico'}
                        </span>
                    </div>
                </button>
            ))}
        </div>

        {/* Form Content */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 min-h-[500px]">
            {activeStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">1. Capacidade Produtiva</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Produto Principal</label>
                            <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Ex: Doce de Leite"/>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Unidade de Medida</label>
                            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                                <option>Unidade (un)</option>
                                <option>Quilo (kg)</option>
                                <option>Litro (l)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Produção Atual (Mensal)</label>
                            <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="0"/>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Capacidade Máxima</label>
                            <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="0"/>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Gargalos de Produção</label>
                        <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-24" placeholder="Descreva limitações de maquinário, pessoal ou espaço..."></textarea>
                    </div>
                </div>
            )}

            {activeStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">2. Estrutura de Custos</h3>
                    
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800">
                            <strong>Atenção:</strong> Liste todos os insumos para produzir 01 unidade do produto principal definido na etapa anterior.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-slate-600 uppercase">Custos Variáveis (Matéria Prima)</h4>
                        {/* Mock List */}
                        <div className="grid grid-cols-12 gap-2 items-center text-xs font-medium text-slate-500 mb-1">
                            <span className="col-span-6">Item</span>
                            <span className="col-span-3">Custo Unit.</span>
                            <span className="col-span-3">Total</span>
                        </div>
                        <div className="grid grid-cols-12 gap-2 items-center">
                            <input type="text" className="col-span-6 px-2 py-1.5 border border-slate-300 rounded text-sm" placeholder="Item A"/>
                            <input type="number" className="col-span-3 px-2 py-1.5 border border-slate-300 rounded text-sm" placeholder="0.00"/>
                            <span className="col-span-3 text-right font-bold text-slate-700">R$ 0,00</span>
                        </div>
                        <button className="text-xs text-brand-600 hover:underline">+ Adicionar Insumo</button>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                         <h4 className="text-sm font-bold text-slate-600 uppercase mb-3">Custos Fixos (Rateio)</h4>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Mão de Obra (R$/mês)</label>
                                <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"/>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Energia/Água (R$/mês)</label>
                                <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"/>
                            </div>
                         </div>
                    </div>
                </div>
            )}

            {activeStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">3. Precificação Sugerida</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                            <p className="text-xs text-slate-500 mb-1">Custo Total Unitário</p>
                            <p className="text-2xl font-bold text-slate-800">R$ 12,50</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-brand-200 text-center shadow-sm">
                            <label className="text-xs text-brand-600 font-bold mb-1 block uppercase">Margem de Lucro (%)</label>
                            <input type="number" className="w-20 mx-auto text-center font-bold text-xl border-b-2 border-brand-200 focus:border-brand-500 outline-none text-brand-800" defaultValue={30} />
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center">
                            <p className="text-xs text-emerald-600 mb-1 font-bold uppercase">Preço de Venda</p>
                            <p className="text-2xl font-black text-emerald-700">R$ 16,25</p>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-slate-200 mt-4">
                        <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-slate-400"/> Comparativo de Mercado
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Concorrente Local A</span>
                                <span className="font-medium">R$ 15,00</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Supermercado</span>
                                <span className="font-medium">R$ 18,90</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 relative">
                                <div className="absolute top-0 bottom-0 bg-emerald-500 w-1 rounded-full left-[40%]" title="Seu Preço"></div>
                                <div className="absolute top-0 bottom-0 bg-slate-400 w-1 rounded-full left-[35%]" title="Concorrente"></div>
                                <div className="absolute top-0 bottom-0 bg-slate-400 w-1 rounded-full left-[60%]" title="Mercado"></div>
                            </div>
                            <p className="text-xs text-center text-slate-400 mt-1">Seu preço está competitivo.</p>
                        </div>
                    </div>
                </div>
            )}

            {activeStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                     <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">4. Parecer Técnico</h3>
                     
                     <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Conclusão do Agente</label>
                        <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium mb-3">
                            <option>Viável - Seguir para Produção</option>
                            <option>Viável com Restrições (Ajustar Custos)</option>
                            <option>Inviável no Momento</option>
                        </select>
                        <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-32" placeholder="Justificativa técnica detalhada..."></textarea>
                     </div>

                     <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                                <FileCheck className="w-4 h-4 text-slate-500"/>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700">Validação da Coordenação</p>
                                <p className="text-xs text-slate-400">Necessária para liberar recursos</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <input type="checkbox" id="notify" className="rounded text-brand-600 focus:ring-brand-500"/>
                            <label htmlFor="notify" className="text-xs text-slate-600">Notificar Coordenação Geral automaticamente</label>
                        </div>
                     </div>

                     <button className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-colors flex justify-center items-center gap-2">
                        <FileCheck className="w-5 h-5"/> Finalizar Estudo EVE
                     </button>
                </div>
            )}
            
            {/* Nav Buttons */}
            <div className="flex justify-between mt-8 pt-4 border-t border-slate-100">
                <button 
                    disabled={activeStep === 1}
                    onClick={() => setActiveStep(prev => prev - 1)}
                    className="px-4 py-2 text-slate-500 font-medium text-sm hover:bg-slate-50 rounded-lg disabled:opacity-50"
                >
                    Voltar
                </button>
                {activeStep < 4 && (
                    <button 
                        onClick={() => setActiveStep(prev => prev + 1)}
                        className="px-6 py-2 bg-slate-800 text-white font-medium text-sm rounded-lg hover:bg-slate-900"
                    >
                        Próximo
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};