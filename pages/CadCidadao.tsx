import React, { useState, useEffect } from 'react';
import { Building2, ArrowRight, ArrowLeft, Users, Briefcase, DollarSign, Leaf, Trash2, Plus, FileText, Check, Printer, Save, Link as LinkIcon, MapPin } from 'lucide-react';
import { Contact } from '../types';

interface CadCidadaoProps {
    contacts?: Contact[];
    onComplete?: (contactId: string) => void;
    initialContactId?: string;
}

// --- Interfaces based on PDF Structure ---

interface Socio {
    id: string;
    nome: string;
    cpf: string;
    rg: string;
    racaCor: string;
    escolaridade: string;
    idade: string;
    genero: string;
    renda: string;
    endereco: string;
    celular: string;
    qtdFamiliares: string;
}

interface TraditionalPop {
    type: string;
    men: number;
    women: number;
}

// --- Options Constants ---
const TRADITIONAL_TYPES = [
    'Indígenas', 'População Negra', 'Quilombolas', 'Ribeirinhos', 'Fundos de Pasto', 
    'Povos de Terreiro', 'Ciganos', 'Pescadores', 'Marisqueiras', 'Outra'
];

const CHECKBOX_GROUPS = {
    redeProducao: ['Rede de produção', 'Rede de comercialização', 'Central de comercialização', 'Cadeia produtiva solidária', 'Complexo cooperativo', 'Cooperativa central', 'Rede de Consumo', 'Rede de crédito ou finanças solidárias', 'Rede de comércio justo'],
    equipamentos: ['Próprios', 'Arrendados ou alugados', 'Cedidos ou emprestados', 'Não se aplica'],
    ativEconomicas: ['Produção', 'Comercialização', 'Prestação de Serviços', 'Troca de produtos', 'Poupança/Crédito', 'Banco Comunitário', 'Consumo', 'Uso infraestrutura', 'Uso equipamentos', 'Aquisição conjunta', 'Consultoria'],
    origemRecursos: ['Dos próprios sócios', 'Empréstimo/Financiamento', 'Doação (ONG/Intl)', 'Recursos públicos (fundo perdido)', 'Doações físicas/empresas', 'Não se aplica'],
    origemMateria: ['Outras associações da região', 'Outras associações fora da região', 'Empresas', 'Doação', 'Coleta', 'Produzida pelos sócios', 'Não se aplica'],
    consumidores: ['Consumidor final', 'Varejistas locais', 'Comerciantes outras regiões', 'Comerciantes outros estados', 'Atravessador', 'Órgão governamental', 'Empresa Privada', 'Associações/Cooperativas', 'Não se aplica'],
    canaisVenda: ['Espaços próprios', 'Espaços Coletivos/Loja Colaborativa', 'Espaços Solidário CESOL', 'Comércio Local', 'Feiras livres', 'Feiras eventuais', 'Feira de Economia Solidária'],
    dificuldadeVenda: ['Falta de clientes', 'Falta de sócios para comercializar', 'Falta de conhecimento em vendas', 'Calotes', 'Preços inadequados', 'Exigência de prazo', 'Compradores exigem grande qtd', 'Regularidade de fornecimento', 'Capital de giro', 'Registro legal (NF)', 'Formas de pagamento (Cartão)', 'Registro sanitário', 'Concorrência', 'Custo transporte', 'Estradas precárias', 'Local inadequado', 'Equipamentos inadequados', 'Produtos desconhecidos'],
    destinoSobra: ['Investimento', 'Assistência técnica/educacional', 'Apoio a outros empreendimentos', 'Fundo de reserva', 'Distribuição entre sócios', 'Integralização de capital'],
    finalidadeCredito: ['Custeio', 'Capital de giro', 'Investimento'],
    fonteCredito: ['Banco público', 'Banco Privado', 'Banco do Povo', 'Cooperativa de crédito', 'Financeira privada', 'ONG ou OSCIP', 'Fundo solidário'],
    motivoNaoCredito: ['Não houve necessidade', 'Não houve acordo', 'Aconselhamento técnico', 'Inadimplência', 'Experiência fracassada', 'Investimento próprio', 'Recursos não reembolsáveis', 'Medo de dívidas'],
    dificuldadeCredito: ['Documentação', 'Taxas de juros', 'Carência inadequada', 'Falta de aval/garantia', 'Falta de projeto', 'Burocracia', 'Falta de linha de crédito'],
    tipoApoio: ['Assistência técnica', 'Qualificação profissional', 'Autogestão', 'Economia Solidária', 'Gestão', 'Jurídica', 'Marketing', 'Diagnóstico/Viabilidade', 'Formalização', 'Projetos'],
    quemApoio: ['ONGs/OSCIPs', 'Igrejas', 'Associações', 'Prefeitura', 'Governo Estadual', 'Governo Federal', 'Câmara Vereadores', 'Assembleia Leg.', 'Empresa Estatal', 'Universidades', 'Empresa Privada', 'Sistema S', 'Cooperativas técnicas', 'Sindicatos', 'Outro EES', 'Fornecedor', 'Fórum EcoSol'],
    instanciaGestao: ['Assembleia de sócios', 'Coordenação/Diretoria', 'Conselho Consultivo', 'Conselho Administrativo', 'Conselho Fiscal', 'Comissão de Ética', 'Grupos de Trabalho'],
    redeArticulacao: ['Fórum EcoSol', 'União/Associação', 'Federação/Cooperativa', 'Conselho de Gestão'],
    movimentoSocial: ['Luta pela terra', 'Sindical', 'Popular/Comunitário', 'Moradia', 'Étnico/Racial', 'Atingidos por barragens', 'Ambientalista', 'Mulheres/Gênero', 'Religioso', 'Desempregados', 'Catadores', 'Luta antimanicomial', 'GLBTI+', 'Cultural', 'Direitos Humanos', 'Juventude', 'Combate à fome'],
    acaoSocial: ['Educação', 'Saúde', 'Moradia', 'Trabalho', 'Redução violência', 'Meio ambiente', 'Esporte/Lazer', 'Cultura', 'Assistência social', 'Segurança alimentar'],
    residuos: ['Coleta normal', 'Coleta Seletiva', 'Estação de tratamento', 'Tratamento antes de eliminar', 'Reaproveitamento', 'Esgoto', 'Rios/Riachos', 'Venda', 'Doação', 'Queima'],
    motivacao: ['Desemprego', 'Maiores ganhos', 'Renda complementar', 'Ser dono', 'Atividade profissional', 'Acesso a financiamento', 'Falência empresa anterior', 'Social/Religiosa', 'Desenvolvimento comunitário', 'Alternativa organizativa', 'Incentivo política pública', 'Organização beneficiários', 'Grupo étnico', 'Produção orgânica'],
    conquistas: ['Geração de renda', 'Autogestão', 'Integração grupo', 'Compromisso social', 'Conquistas locais', 'Conscientização política'],
    desafios: ['Viabilidade econômica', 'Gerar renda adequada', 'Proteção social', 'Participação/Autogestão', 'Conscientização política', 'Conscientização ambiental', 'Articulação', 'Manter união']
};

export const CadCidadao: React.FC<CadCidadaoProps> = ({ contacts = [], onComplete, initialContactId }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [importId, setImportId] = useState('');

  // --- BIG STATE OBJECT ---
  const [formData, setFormData] = useState({
      // HEADER
      projetoAcao: '',
      contrato: '',
      entrevistador: '',
      dataEntrevista: new Date().toISOString().split('T')[0],
      respondentes: [{ nome: '', telefone: '' }],

      // 1. IDENTIFICAÇÃO
      nomeEmpreendimento: '',
      endereco: '',
      cep: '',
      municipio: '',
      uf: 'BA',
      email: '',
      cnpj: '',
      semCnpj: false,

      // 2. SÓCIOS
      socios: [] as Socio[],
      sociosCriacaoH: 0, sociosCriacaoM: 0,
      sociosAtuaisH: 0, sociosAtuaisM: 0,
      sociosInativosH: 0, sociosInativosM: 0,
      evolucaoSocios: '', // Aumentou, Diminuiu, Igual
      
      tradicionais: false,
      tradicionaisDados: TRADITIONAL_TYPES.map(t => ({ type: t, men: 0, women: 0 })),
      tradicionaisOutra: '',

      beneficiosSociais: false,
      beneficiosQual: '',

      // 3. CARACTERÍSTICAS GERAIS
      inicioAtividades: '',
      participaRede: false,
      tipoRede: [] as string[], tipoRedeOutra: '',
      estruturaFisica: '', estruturaFisicaOutra: '',
      possuiEquipamentos: false,
      tipoEquipamentos: [] as string[],
      possuiVeiculo: false,
      reservaManutencao: false,
      reservaDepreciacao: false,

      // 4. ATIVIDADE ECONÔMICA
      atividadesRealizadas: [] as string[], atividadesOutra: '',
      origemRecursos: [] as string[],
      origemMateria: [] as string[], origemMateriaOutra: '',
      consumidores: [] as string[],
      canaisVenda: [] as string[], canaisVendaOutra: '',
      participouEventos: false,
      conhecePontoEquilibrio: false,
      dificuldadeVenda: false,
      motivosDificuldadeVenda: [] as string[], motivosDificuldadeVendaOutra: '',
      
      naturezaRenda: '', naturezaRendaOutra: '',
      
      trabalhadoresProducaoH: 0, trabalhadoresProducaoM: 0,
      trabalhadoresComercioH: 0, trabalhadoresComercioM: 0,
      sociosDirecaoH: 0, sociosDirecaoM: 0,

      faixaRenda: '', // 4.15
      resultadoAnoAnterior: '', // 4.16
      destinoSobra: [] as string[], destinoSobraOutra: '',

      // 5. INVESTIMENTO
      recebeuRecursoPublico: false, recursoPublicoQual: '',
      recebeuRecursoPrivado: false, recursoPrivadoQual: '',
      
      situacaoBuscaCredito: '', // 5.2
      finalidadeCredito: [] as string[], finalidadeCreditoOutra: '',
      finalidadeFinanciamento: [] as string[], finalidadeFinanciamentoOutra: '',
      
      fonteCredito: [] as string[], fonteCreditoOutra: '',
      situacaoPagamento: '',
      
      motivoNaoBuscou: [] as string[], motivoNaoBuscouOutro: '',
      necessidadeAtual: false,
      necessidadeAtualFinalidade: [] as string[], necessidadeAtualOutra: '',
      
      dificuldadeObter: false,
      dificuldadeObterMotivos: [] as string[],

      // 6. FORMAÇÃO
      teveAcessoApoio: false,
      tiposApoio: [] as string[], tiposApoioOutro: '',
      quemApoio: [] as string[], quemApoioOutro: '',

      // 7. GESTÃO
      instanciasGestao: [] as string[], instanciasGestaoOutra: '',
      periodicidadeReuniao: '',
      tempoMandato: '',
      sociosNaCoordH: 0, sociosNaCoordM: 0,

      // 8. SOCIOPOLÍTICA
      participaForum: false,
      redeArticulacao: [] as string[], redeArticulacaoOutra: '',
      
      participaMovimento: false,
      tipoMovimento: [] as string[], tipoMovimentoOutro: '',
      
      acaoSocial: false,
      tipoAcaoSocial: [] as string[], tipoAcaoSocialOutra: '',
      
      destinoResiduos: [] as string[], destinoResiduosOutro: '',

      // 9. COMPLEMENTARES
      motivacao: [] as string[], motivacaoOutra: '',
      conquistas: [] as string[], conquistasOutra: '',
      desafios: [] as string[], desafiosOutra: ''
  });

  // --- Handlers ---

  useEffect(() => {
      if (initialContactId) {
          loadContactData(initialContactId);
      }
  }, [initialContactId]);

  const loadContactData = (id: string) => {
      const c = contacts.find(contact => contact.id === id);
      if (c) {
          setImportId(id);
          setFormData(prev => ({
              ...prev,
              nomeEmpreendimento: c.company,
              endereco: c.address || '',
              municipio: c.city || '',
              cnpj: c.cnpj || '',
              respondentes: [{ nome: c.name, telefone: c.phone }],
              sociosAtuaisH: c.menCount || 0,
              sociosAtuaisM: c.womenCount || 0,
              // Map partners if available
              socios: c.partners ? c.partners.map(p => ({
                  id: p.id, nome: p.name, genero: p.gender, 
                  cpf: '', rg: '', racaCor: '', escolaridade: '', idade: '', renda: '', endereco: '', celular: '', qtdFamiliares: ''
              })) : []
          }));
      }
  };

  const handleChange = (field: string, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckbox = (group: string, value: string) => {
      // @ts-ignore
      const list = formData[group] as string[];
      if (list.includes(value)) {
          handleChange(group, list.filter(item => item !== value));
      } else {
          handleChange(group, [...list, value]);
      }
  };

  const handleTraditionalChange = (type: string, field: 'men' | 'women', val: string) => {
      const numVal = parseInt(val) || 0;
      setFormData(prev => ({
          ...prev,
          tradicionaisDados: prev.tradicionaisDados.map(t => t.type === type ? { ...t, [field]: numVal } : t)
      }));
  };

  const addSocio = () => {
      setFormData(prev => ({
          ...prev,
          socios: [...prev.socios, {
              id: Math.random().toString(), nome: '', cpf: '', rg: '', racaCor: '', escolaridade: '', 
              idade: '', genero: '', renda: '', endereco: '', celular: '', qtdFamiliares: ''
          }]
      }));
  };

  const updateSocio = (id: string, field: keyof Socio, value: string) => {
      setFormData(prev => ({
          ...prev,
          socios: prev.socios.map(s => s.id === id ? { ...s, [field]: value } : s)
      }));
  };

  const removeSocio = (id: string) => {
      setFormData(prev => ({ ...prev, socios: prev.socios.filter(s => s.id !== id) }));
  };

  const handlePrint = () => window.print();

  const handleSave = () => {
      if (onComplete && importId) onComplete(importId);
      alert("Questionário salvo com sucesso!");
      setActiveStep(6);
  };

  // --- Render Helpers ---

  const CheckboxGroup = ({ group, options, otherField }: { group: string, options: string[], otherField?: string }) => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
          {options.map(opt => (
              <label key={opt} className={`flex items-start gap-2 p-2 border rounded-md text-xs cursor-pointer hover:bg-slate-50 ${(formData as any)[group].includes(opt) ? 'bg-brand-50 border-brand-300' : 'border-slate-200'}`}>
                  <input type="checkbox" checked={(formData as any)[group].includes(opt)} onChange={() => handleCheckbox(group, opt)} className="mt-0.5 text-brand-600 rounded" />
                  <span className="leading-tight">{opt}</span>
              </label>
          ))}
          {otherField && (
              <label className="flex items-center gap-2 p-2 border rounded-md text-xs border-slate-200 col-span-full sm:col-span-1">
                  <span className="whitespace-nowrap font-bold">Outro:</span>
                  <input 
                      type="text" 
                      className="w-full border-b border-slate-300 outline-none bg-transparent text-slate-700" 
                      value={(formData as any)[otherField]}
                      onChange={(e) => handleChange(otherField, e.target.value)}
                  />
              </label>
          )}
      </div>
  );

  const SectionTitle = ({ num, title }: {num: number, title: string}) => (
      <div className="bg-slate-800 text-white p-3 rounded-t-lg mt-6 print:mt-4 print:bg-slate-200 print:text-black print:border-b-2 print:border-black">
          <h3 className="font-bold text-sm uppercase">{num}. {title}</h3>
      </div>
  );

  const Question = ({ text, children }: { text: string, children?: React.ReactNode }) => (
      <div className="mb-4 border-b border-slate-100 pb-4 last:border-0 print:break-inside-avoid">
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">{text}</label>
          {children}
      </div>
  );

  const YesNo = ({ field, label, children }: { field: string, label?: string, children?: React.ReactNode }) => (
      <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">{label}</label>
          <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" checked={(formData as any)[field] === true} onChange={() => handleChange(field, true)} className="text-brand-600" /> Sim
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" checked={(formData as any)[field] === false} onChange={() => handleChange(field, false)} className="text-brand-600" /> Não
              </label>
          </div>
          {(formData as any)[field] && children}
      </div>
  );

  return (
    <div className="flex flex-col min-h-full pb-10 max-w-5xl mx-auto px-4">
        
        {/* Controls - Hidden on Print */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex justify-between items-center print:hidden">
            <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-brand-600"/>
                <div>
                    <h1 className="font-bold text-slate-800">Questionário CadCidadão</h1>
                    <p className="text-xs text-slate-500">Etapa {activeStep} de 6</p>
                </div>
            </div>
            
            <div className="flex gap-2">
                <select className="text-xs border rounded p-2" onChange={(e) => loadContactData(e.target.value)} value={importId}>
                    <option value="">Carregar Pré-Cadastro...</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
                </select>
                <button onClick={handlePrint} className="flex items-center gap-1 bg-slate-800 text-white px-3 py-2 rounded text-xs hover:bg-slate-700">
                    <Printer className="w-4 h-4"/> Imprimir
                </button>
            </div>
        </div>

        {/* Wizard Nav - Hidden on Print */}
        <div className="flex gap-1 mb-6 print:hidden overflow-x-auto pb-2">
            {[1,2,3,4,5,6].map(step => (
                <button 
                    key={step}
                    onClick={() => setActiveStep(step)}
                    className={`flex-1 py-2 text-xs font-bold uppercase border-b-4 transition-colors whitespace-nowrap px-4 ${
                        activeStep === step 
                        ? 'border-brand-500 text-brand-600' 
                        : 'border-slate-200 text-slate-400 hover:text-slate-600'
                    }`}
                >
                    {step === 1 ? 'Identificação' :
                     step === 2 ? 'Sócios' :
                     step === 3 ? 'Geral & Produção' :
                     step === 4 ? 'Financeiro' :
                     step === 5 ? 'Social & Gestão' : 'Relatório'}
                </button>
            ))}
        </div>

        {/* --- FORM CONTENT --- */}
        <div className="bg-white p-8 shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-0">
            
            {/* Header - Always Visible in Print */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h1 className="text-2xl font-bold uppercase">Questionário Cad Cidadão</h1>
                <div className="border border-black mt-4 text-left p-2 text-xs grid grid-cols-2 gap-2">
                    <div className="col-span-2 font-bold bg-slate-100 p-1 border-b border-slate-300">INFORMAÇÕES SOBRE A APLICAÇÃO DESTE QUESTIONÁRIO</div>
                    <div className="col-span-2"><strong>INSTITUIÇÃO:</strong> Secretaria do Trabalho, Emprego, Renda e Esporte (SETRE)</div>
                    <div><strong>Projeto/Ação:</strong> <input type="text" className="border-b border-black w-32 outline-none" value={formData.projetoAcao} onChange={e=>handleChange('projetoAcao', e.target.value)}/></div>
                    <div><strong>Contrato nº:</strong> <input type="text" className="border-b border-black w-32 outline-none" value={formData.contrato} onChange={e=>handleChange('contrato', e.target.value)}/></div>
                    <div><strong>Entrevistador:</strong> <input type="text" className="border-b border-black w-32 outline-none" value={formData.entrevistador} onChange={e=>handleChange('entrevistador', e.target.value)}/></div>
                    <div><strong>Data:</strong> <input type="date" className="border-b border-black outline-none" value={formData.dataEntrevista} onChange={e=>handleChange('dataEntrevista', e.target.value)}/></div>
                </div>
            </div>

            {/* STEP 1 */}
            {(activeStep === 1 || activeStep === 6) && (
                <div className="animate-fade-in">
                    <div className="border border-black mb-6 text-xs">
                        <div className="bg-slate-200 font-bold p-1 border-b border-black">PESSOAS QUE RESPONDERAM O QUESTIONÁRIO</div>
                        <div className="grid grid-cols-2 gap-px bg-black">
                            <div className="bg-white p-1 font-bold text-center">NOME</div>
                            <div className="bg-white p-1 font-bold text-center">TELEFONE</div>
                            <div className="bg-white p-1"><input type="text" className="w-full outline-none" value={formData.respondentes[0].nome} onChange={e => {const r = [...formData.respondentes]; r[0].nome = e.target.value; handleChange('respondentes', r)}}/></div>
                            <div className="bg-white p-1"><input type="text" className="w-full outline-none" value={formData.respondentes[0].telefone} onChange={e => {const r = [...formData.respondentes]; r[0].telefone = e.target.value; handleChange('respondentes', r)}}/></div>
                        </div>
                    </div>

                    <SectionTitle num={1} title="IDENTIFICAÇÃO E ABRANGÊNCIA" />
                    <div className="border border-slate-300 p-4 space-y-3 text-sm">
                        <div>
                            <label className="font-bold">Nome do Empreendimento:</label>
                            <input type="text" className="w-full border-b border-slate-400 outline-none" value={formData.nomeEmpreendimento} onChange={e=>handleChange('nomeEmpreendimento', e.target.value)}/>
                        </div>
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-8">
                                <label className="font-bold">Endereço:</label>
                                <input type="text" className="w-full border-b border-slate-400 outline-none" value={formData.endereco} onChange={e=>handleChange('endereco', e.target.value)}/>
                            </div>
                            <div className="col-span-4">
                                <label className="font-bold">CEP:</label>
                                <input type="text" className="w-full border-b border-slate-400 outline-none" value={formData.cep} onChange={e=>handleChange('cep', e.target.value)}/>
                            </div>
                        </div>
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-8">
                                <label className="font-bold">Município:</label>
                                <input type="text" className="w-full border-b border-slate-400 outline-none" value={formData.municipio} onChange={e=>handleChange('municipio', e.target.value)}/>
                            </div>
                            <div className="col-span-4">
                                <label className="font-bold">UF:</label>
                                <input type="text" className="w-full border-b border-slate-400 outline-none" value={formData.uf} readOnly/>
                            </div>
                        </div>
                        <div>
                            <label className="font-bold">E-mail:</label>
                            <input type="text" className="w-full border-b border-slate-400 outline-none" value={formData.email} onChange={e=>handleChange('email', e.target.value)}/>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <label className="font-bold">CNPJ:</label>
                                <input type="text" className="w-full border-b border-slate-400 outline-none" value={formData.cnpj} disabled={formData.semCnpj} onChange={e=>handleChange('cnpj', e.target.value)}/>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.semCnpj} onChange={e=>handleChange('semCnpj', e.target.checked)}/> Não tem
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 2 */}
            {(activeStep === 2 || activeStep === 6) && (
                <div className="animate-fade-in">
                    <SectionTitle num={2} title="CARACTERÍSTICAS DOS SÓCIOS" />
                    
                    <div className="my-4">
                        <h4 className="font-bold text-sm mb-2">2.1 Pessoas que compõem o empreendimento</h4>
                        {formData.socios.map((s, idx) => (
                            <div key={s.id} className="border border-slate-400 mb-4 p-2 text-xs break-inside-avoid">
                                <div className="flex justify-between font-bold bg-slate-100 p-1 mb-2">
                                    <span>{String(idx + 1).padStart(2, '0')} - {s.nome || 'Nome do Sócio'}</span>
                                    {activeStep !== 6 && <button onClick={() => removeSocio(s.id)} className="text-red-500"><Trash2 className="w-4 h-4"/></button>}
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    <div>Nome: <input type="text" className="border-b w-full outline-none" value={s.nome} onChange={e=>updateSocio(s.id, 'nome', e.target.value)}/></div>
                                    <div>CPF: <input type="text" className="border-b w-24 outline-none" value={s.cpf} onChange={e=>updateSocio(s.id, 'cpf', e.target.value)}/></div>
                                    <div>Raça/Cor: <input type="text" className="border-b w-full outline-none" value={s.racaCor} onChange={e=>updateSocio(s.id, 'racaCor', e.target.value)}/></div>
                                    <div>RG: <input type="text" className="border-b w-24 outline-none" value={s.rg} onChange={e=>updateSocio(s.id, 'rg', e.target.value)}/></div>
                                    <div>Escolaridade: <input type="text" className="border-b w-full outline-none" value={s.escolaridade} onChange={e=>updateSocio(s.id, 'escolaridade', e.target.value)}/></div>
                                    <div>Idade: <input type="text" className="border-b w-12 outline-none" value={s.idade} onChange={e=>updateSocio(s.id, 'idade', e.target.value)}/></div>
                                    <div>Renda Mensal: <input type="text" className="border-b w-24 outline-none" value={s.renda} onChange={e=>updateSocio(s.id, 'renda', e.target.value)}/></div>
                                    <div>Gênero: <input type="text" className="border-b w-24 outline-none" value={s.genero} onChange={e=>updateSocio(s.id, 'genero', e.target.value)}/></div>
                                    <div className="col-span-2">Endereço: <input type="text" className="border-b w-full outline-none" value={s.endereco} onChange={e=>updateSocio(s.id, 'endereco', e.target.value)}/></div>
                                    <div>Cel: <input type="text" className="border-b w-32 outline-none" value={s.celular} onChange={e=>updateSocio(s.id, 'celular', e.target.value)}/></div>
                                </div>
                            </div>
                        ))}
                        {activeStep !== 6 && (
                            <button onClick={addSocio} className="text-xs bg-brand-600 text-white px-3 py-1 rounded flex items-center gap-1">
                                <Plus className="w-3 h-3"/> Adicionar Sócio
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm break-inside-avoid">
                        <div className="border p-2">
                            <p className="font-bold mb-1">2.3 Sócios na criação:</p>
                            <div className="flex gap-4">
                                <label>Mulheres: <input type="number" className="w-12 border-b text-center" value={formData.sociosCriacaoM} onChange={e=>handleChange('sociosCriacaoM', e.target.value)}/></label>
                                <label>Homens: <input type="number" className="w-12 border-b text-center" value={formData.sociosCriacaoH} onChange={e=>handleChange('sociosCriacaoH', e.target.value)}/></label>
                            </div>
                        </div>
                        <div className="border p-2">
                            <p className="font-bold mb-1">2.4 Sócios atuais trabalhando:</p>
                            <div className="flex gap-4">
                                <label>Mulheres: <input type="number" className="w-12 border-b text-center" value={formData.sociosAtuaisM} onChange={e=>handleChange('sociosAtuaisM', e.target.value)}/></label>
                                <label>Homens: <input type="number" className="w-12 border-b text-center" value={formData.sociosAtuaisH} onChange={e=>handleChange('sociosAtuaisH', e.target.value)}/></label>
                            </div>
                        </div>
                        <div className="border p-2">
                            <p className="font-bold mb-1">2.5 Sócios inativos:</p>
                            <div className="flex gap-4">
                                <label>Mulheres: <input type="number" className="w-12 border-b text-center" value={formData.sociosInativosM} onChange={e=>handleChange('sociosInativosM', e.target.value)}/></label>
                                <label>Homens: <input type="number" className="w-12 border-b text-center" value={formData.sociosInativosH} onChange={e=>handleChange('sociosInativosH', e.target.value)}/></label>
                            </div>
                        </div>
                        <div className="border p-2">
                            <p className="font-bold mb-1">2.7 Evolução (3 meses):</p>
                            <div className="flex gap-2 text-xs">
                                {['Aumentou', 'Diminuiu', 'Igual'].map(opt => (
                                    <label key={opt}><input type="radio" checked={formData.evolucaoSocios === opt} onChange={()=>handleChange('evolucaoSocios', opt)}/> {opt}</label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 border p-3 break-inside-avoid">
                        <YesNo field="tradicionais" label="2.8 Associados pertencentes a Povos/Comunidades Tradicionais">
                            <table className="w-full text-xs text-left mt-2">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="p-1">Povo/Comunidade</th>
                                        <th className="p-1 w-16">Homens</th>
                                        <th className="p-1 w-16">Mulheres</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.tradicionaisDados.map(t => (
                                        <tr key={t.type} className="border-b last:border-0">
                                            <td className="p-1">{t.type}</td>
                                            <td className="p-1"><input type="number" className="w-full bg-slate-50 text-center" value={t.men} onChange={e=>handleTraditionalChange(t.type, 'men', e.target.value)}/></td>
                                            <td className="p-1"><input type="number" className="w-full bg-slate-50 text-center" value={t.women} onChange={e=>handleTraditionalChange(t.type, 'women', e.target.value)}/></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </YesNo>
                    </div>

                    <div className="mt-4 border p-3 break-inside-avoid">
                        <YesNo field="beneficiosSociais" label="2.9 Predominância de beneficiários de programas sociais (Ex: Bolsa Família)">
                            <input type="text" className="w-full border-b border-slate-300 text-sm mt-1" placeholder="Qual?" value={formData.beneficiosQual} onChange={e=>handleChange('beneficiosQual', e.target.value)}/>
                        </YesNo>
                    </div>
                </div>
            )}

            {/* STEP 3 */}
            {(activeStep === 3 || activeStep === 6) && (
                <div className="animate-fade-in">
                    <SectionTitle num={3} title="CARACTERÍSTICAS GERAIS DO EMPREENDIMENTO" />
                    
                    <div className="p-4 space-y-4">
                        <Question text="3.3 Mês/Ano de Início das Atividades">
                            <input type="month" className="border rounded p-1" value={formData.inicioAtividades} onChange={e=>handleChange('inicioAtividades', e.target.value)}/>
                        </Question>

                        <YesNo field="participaRede" label="3.5 Participa de rede de produção/comercialização/crédito?">
                            <CheckboxGroup group="tipoRede" options={CHECKBOX_GROUPS.redeProducao} otherField="tipoRedeOutra"/>
                        </YesNo>

                        <Question text="3.6 Estrutura Física">
                            <div className="flex gap-4 text-sm flex-wrap">
                                {['Própria', 'Alugada', 'Emprestada', 'Outra'].map(opt => (
                                    <label key={opt} className="flex items-center gap-1 cursor-pointer">
                                        <input type="radio" checked={formData.estruturaFisica === opt} onChange={()=>handleChange('estruturaFisica', opt)}/> {opt}
                                    </label>
                                ))}
                            </div>
                            {formData.estruturaFisica === 'Outra' && <input type="text" className="border-b w-full mt-1 text-sm" placeholder="Especifique" value={formData.estruturaFisicaOutra} onChange={e=>handleChange('estruturaFisicaOutra', e.target.value)}/>}
                        </Question>

                        <YesNo field="possuiEquipamentos" label="3.7 Possui máquinas e equipamentos?">
                            <CheckboxGroup group="tipoEquipamentos" options={CHECKBOX_GROUPS.equipamentos}/>
                        </YesNo>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <YesNo field="possuiVeiculo" label="3.8 Possui veículo?"/>
                            <YesNo field="reservaManutencao" label="3.9 Reserva p/ manutenção?"/>
                            <YesNo field="reservaDepreciacao" label="3.10 Reserva p/ depreciação?"/>
                        </div>
                    </div>

                    <SectionTitle num={4} title="ATIVIDADE ECONÔMICA, PRODUÇÃO E COMERCIALIZAÇÃO" />
                    <div className="p-4 space-y-4">
                        <Question text="4.1 Atividades Econômicas Coletivas">
                            <CheckboxGroup group="atividadesRealizadas" options={CHECKBOX_GROUPS.ativEconomicas} otherField="atividadesOutra"/>
                        </Question>

                        <Question text="4.3 Origem dos Recursos Iniciais">
                            <CheckboxGroup group="origemRecursos" options={CHECKBOX_GROUPS.origemRecursos}/>
                        </Question>

                        <Question text="4.4 Origem da Matéria-Prima">
                            <CheckboxGroup group="origemMateria" options={CHECKBOX_GROUPS.origemMateria} otherField="origemMateriaOutra"/>
                        </Question>

                        <Question text="4.6 Consumidores">
                            <CheckboxGroup group="consumidores" options={CHECKBOX_GROUPS.consumidores}/>
                        </Question>

                        <Question text="4.7 Espaços de Comercialização">
                            <CheckboxGroup group="canaisVenda" options={CHECKBOX_GROUPS.canaisVenda} otherField="canaisVendaOutra"/>
                        </Question>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <YesNo field="participouEventos" label="4.8 Participou de eventos EcoSol?"/>
                            <YesNo field="conhecePontoEquilibrio" label="4.9 Conhece o Ponto de Equilíbrio?"/>
                        </div>

                        <YesNo field="dificuldadeVenda" label="4.11 Dificuldades na Comercialização?">
                            <CheckboxGroup group="motivosDificuldadeVenda" options={CHECKBOX_GROUPS.dificuldadeVenda} otherField="motivosDificuldadeVendaOutra"/>
                        </YesNo>

                        <Question text="4.13 Natureza preponderante da renda">
                            <div className="space-y-1 text-sm">
                                {['Fonte principal', 'Complementação (outras atividades)', 'Complementação (doações/programas)', 'Complementação (aposentadoria)', 'Outro'].map(opt => (
                                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={formData.naturezaRenda === opt} onChange={()=>handleChange('naturezaRenda', opt)}/> {opt}
                                    </label>
                                ))}
                            </div>
                        </Question>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border p-3 rounded bg-slate-50">
                            <div>
                                <label className="text-xs font-bold uppercase">4.14 Trabalhadores na Produção</label>
                                <div className="flex gap-2 mt-1">
                                    <input type="number" placeholder="H" className="w-12 p-1 border rounded text-center" value={formData.trabalhadoresProducaoH} onChange={e=>handleChange('trabalhadoresProducaoH', e.target.value)}/>
                                    <input type="number" placeholder="M" className="w-12 p-1 border rounded text-center" value={formData.trabalhadoresProducaoM} onChange={e=>handleChange('trabalhadoresProducaoM', e.target.value)}/>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase">Trabalhadores na Comercialização</label>
                                <div className="flex gap-2 mt-1">
                                    <input type="number" placeholder="H" className="w-12 p-1 border rounded text-center" value={formData.trabalhadoresComercioH} onChange={e=>handleChange('trabalhadoresComercioH', e.target.value)}/>
                                    <input type="number" placeholder="M" className="w-12 p-1 border rounded text-center" value={formData.trabalhadoresComercioM} onChange={e=>handleChange('trabalhadoresComercioM', e.target.value)}/>
                                </div>
                            </div>
                        </div>

                        <Question text="4.15 Rendimentos permitidos pela atividade">
                            <select className="border p-2 rounded w-full sm:w-1/2" value={formData.faixaRenda} onChange={e=>handleChange('faixaRenda', e.target.value)}>
                                <option value="">Selecione...</option>
                                <option>Até 01 salário mínimo</option>
                                <option>Até 02 salários mínimos</option>
                                <option>Até 03 salários mínimos</option>
                                <option>Acima de 03 salários mínimos</option>
                            </select>
                        </Question>

                        <Question text="4.16 Resultado econômico do ano anterior">
                            <select className="border p-2 rounded w-full sm:w-1/2 mb-2" value={formData.resultadoAnoAnterior} onChange={e=>handleChange('resultadoAnoAnterior', e.target.value)}>
                                <option value="">Selecione...</option>
                                <option>Sobra/Excedente</option>
                                <option>Não teve sobra</option>
                                <option>Prejuízo</option>
                                <option>Não se aplica</option>
                            </select>
                            {formData.resultadoAnoAnterior === 'Sobra/Excedente' && (
                                <div className="pl-4 border-l-2 border-brand-300">
                                    <label className="text-xs font-bold text-brand-700">Destino da Sobra:</label>
                                    <CheckboxGroup group="destinoSobra" options={CHECKBOX_GROUPS.destinoSobra} otherField="destinoSobraOutra"/>
                                </div>
                            )}
                        </Question>
                    </div>
                </div>
            )}

            {/* STEP 4 */}
            {(activeStep === 4 || activeStep === 6) && (
                <div className="animate-fade-in">
                    <SectionTitle num={5} title="INVESTIMENTO E ACESSO A CRÉDITO" />
                    
                    <div className="p-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <YesNo field="recebeuRecursoPublico" label="5.1 Recebeu recurso Público?">
                                <input type="text" placeholder="Qual?" className="border-b w-full text-sm" value={formData.recursoPublicoQual} onChange={e=>handleChange('recursoPublicoQual', e.target.value)}/>
                            </YesNo>
                            <YesNo field="recebeuRecursoPrivado" label="Recebeu recurso Privado?">
                                <input type="text" placeholder="Qual?" className="border-b w-full text-sm" value={formData.recursoPrivadoQual} onChange={e=>handleChange('recursoPrivadoQual', e.target.value)}/>
                            </YesNo>
                        </div>

                        <Question text="5.2 Busca de Crédito (últimos 12 meses)">
                            <select className="border p-2 rounded w-full" value={formData.situacaoBuscaCredito} onChange={e=>handleChange('situacaoBuscaCredito', e.target.value)}>
                                <option value="">Selecione...</option>
                                <option>Não buscou</option>
                                <option>Buscou e obteve</option>
                                <option>Buscou e não obteve</option>
                            </select>
                            
                            {formData.situacaoBuscaCredito.includes('Buscou') && (
                                <div className="mt-2 pl-4 border-l-2 border-slate-300">
                                    <label className="font-bold text-xs">Finalidade (Crédito):</label>
                                    <CheckboxGroup group="finalidadeCredito" options={CHECKBOX_GROUPS.finalidadeCredito} otherField="finalidadeCreditoOutra"/>
                                </div>
                            )}
                        </Question>

                        <Question text="5.3 Fonte do Crédito">
                            <CheckboxGroup group="fonteCredito" options={CHECKBOX_GROUPS.fonteCredito} otherField="fonteCreditoOutra"/>
                        </Question>

                        <Question text="5.4 Situação do Pagamento">
                            <div className="flex gap-4 text-sm flex-wrap">
                                {['Carência', 'Concluído', 'Em dia', 'Atrasado'].map(opt => (
                                    <label key={opt} className="flex items-center gap-1"><input type="radio" checked={formData.situacaoPagamento === opt} onChange={()=>handleChange('situacaoPagamento', opt)}/> {opt}</label>
                                ))}
                            </div>
                        </Question>

                        {formData.situacaoBuscaCredito === 'Não buscou' && (
                            <Question text="5.5 Motivo de não buscar">
                                <CheckboxGroup group="motivoNaoBuscou" options={CHECKBOX_GROUPS.motivoNaoCredito} otherField="motivoNaoBuscouOutro"/>
                            </Question>
                        )}

                        <YesNo field="necessidadeAtual" label="5.6 Existe necessidade atual de crédito?">
                            <CheckboxGroup group="necessidadeAtualFinalidade" options={CHECKBOX_GROUPS.finalidadeCredito} otherField="necessidadeAtualOutra"/>
                        </YesNo>

                        <YesNo field="dificuldadeObter" label="5.7 Enfrenta dificuldades para obter crédito?">
                            <CheckboxGroup group="dificuldadeObterMotivos" options={CHECKBOX_GROUPS.dificuldadeCredito}/>
                        </YesNo>
                    </div>
                </div>
            )}

            {/* STEP 5 */}
            {(activeStep === 5 || activeStep === 6) && (
                <div className="animate-fade-in">
                    <SectionTitle num={6} title="FORMAÇÃO E ASSISTÊNCIA TÉCNICA" />
                    <div className="p-4">
                        <YesNo field="teveAcessoApoio" label="6.2 Teve acesso a assessoria/formação?">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold">Tipo de Apoio:</label>
                                    <CheckboxGroup group="tiposApoio" options={CHECKBOX_GROUPS.tipoApoio} otherField="tiposApoioOutro"/>
                                </div>
                                <div>
                                    <label className="text-xs font-bold">Quem forneceu:</label>
                                    <CheckboxGroup group="quemApoio" options={CHECKBOX_GROUPS.quemApoio} otherField="quemApoioOutro"/>
                                </div>
                            </div>
                        </YesNo>
                    </div>

                    <SectionTitle num={7} title="GESTÃO DO EMPREENDIMENTO" />
                    <div className="p-4 space-y-4">
                        <Question text="7.1 Instâncias de Direção/Coordenação">
                            <CheckboxGroup group="instanciasGestao" options={CHECKBOX_GROUPS.instanciaGestao} otherField="instanciasGestaoOutra"/>
                        </Question>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Question text="7.2 Periodicidade das Reuniões">
                                <select className="border p-2 rounded w-full text-sm" value={formData.periodicidadeReuniao} onChange={e=>handleChange('periodicidadeReuniao', e.target.value)}>
                                    <option value="">Selecione...</option>
                                    <option>Semanal</option>
                                    <option>Mensal</option>
                                    <option>Bimestral</option>
                                    <option>Semestral</option>
                                    <option>Anual</option>
                                </select>
                            </Question>
                            <Question text="7.3 Tempo do mandato atual">
                                <select className="border p-2 rounded w-full text-sm" value={formData.tempoMandato} onChange={e=>handleChange('tempoMandato', e.target.value)}>
                                    <option value="">Selecione...</option>
                                    <option>Menos de 1 ano</option>
                                    <option>1 a 2 anos</option>
                                    <option>Mais de 2 anos</option>
                                </select>
                            </Question>
                        </div>
                    </div>

                    <SectionTitle num={8} title="DIMENSÃO SOCIOPOLÍTICA E AMBIENTAL" />
                    <div className="p-4 space-y-4">
                        <YesNo field="participaForum" label="8.1 Participa de Fórum/Rede?">
                            <CheckboxGroup group="redeArticulacao" options={CHECKBOX_GROUPS.redeArticulacao} otherField="redeArticulacaoOutra"/>
                        </YesNo>

                        <YesNo field="participaMovimento" label="8.2 Relação com Movimentos Sociais?">
                            <CheckboxGroup group="tipoMovimento" options={CHECKBOX_GROUPS.movimentoSocial} otherField="tipoMovimentoOutro"/>
                        </YesNo>

                        <YesNo field="acaoSocial" label="8.3 Desenvolve ação social?">
                            <CheckboxGroup group="tipoAcaoSocial" options={CHECKBOX_GROUPS.acaoSocial} otherField="tipoAcaoSocialOutra"/>
                        </YesNo>

                        <Question text="8.4 Tratamento/Destino de Resíduos">
                            <CheckboxGroup group="destinoResiduos" options={CHECKBOX_GROUPS.residuos} otherField="destinoResiduosOutro"/>
                        </Question>
                    </div>

                    <SectionTitle num={9} title="INFORMAÇÕES COMPLEMENTARES" />
                    <div className="p-4 space-y-4">
                        <Question text="9.1 Motivação para criação">
                            <CheckboxGroup group="motivacao" options={CHECKBOX_GROUPS.motivacao} otherField="motivacaoOutra"/>
                        </Question>
                        <Question text="9.2 Principais Conquistas">
                            <CheckboxGroup group="conquistas" options={CHECKBOX_GROUPS.conquistas} otherField="conquistasOutra"/>
                        </Question>
                        <Question text="9.3 Principais Desafios">
                            <CheckboxGroup group="desafios" options={CHECKBOX_GROUPS.desafios} otherField="desafiosOutra"/>
                        </Question>
                    </div>
                </div>
            )}

            {/* Print Footer */}
            {activeStep === 6 && (
                <div className="mt-8 pt-8 border-t-2 border-black flex justify-around text-center break-inside-avoid">
                    <div className="w-1/3">
                        <div className="border-b border-black mb-2"></div>
                        <p className="text-xs uppercase font-bold">{formData.respondentes[0].nome || 'Respondente'}</p>
                    </div>
                    <div className="w-1/3">
                        <div className="border-b border-black mb-2"></div>
                        <p className="text-xs uppercase font-bold">{formData.entrevistador || 'Entrevistador'}</p>
                    </div>
                </div>
            )}
        </div>

        {/* Footer Actions - Hidden on Print */}
        <div className="mt-6 flex justify-between print:hidden">
            <button 
                onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                disabled={activeStep === 1}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold disabled:opacity-50 hover:bg-slate-300 flex items-center gap-2"
            >
                <ArrowLeft className="w-4 h-4"/> Anterior
            </button>

            {activeStep < 6 ? (
                <button 
                    onClick={() => {
                        window.scrollTo(0, 0);
                        setActiveStep(prev => prev + 1);
                    }}
                    className="px-6 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 flex items-center gap-2"
                >
                    Próximo <ArrowRight className="w-4 h-4"/>
                </button>
            ) : (
                <button 
                    onClick={handleSave}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center gap-2"
                >
                    <Save className="w-4 h-4"/> Finalizar & Salvar
                </button>
            )}
        </div>
    </div>
  );
};