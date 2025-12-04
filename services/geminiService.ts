import { GoogleGenAI, Type } from "@google/genai";
import { Contact, Deal, DealStage, AIAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLeadAnalysis = async (contact: Contact, deal?: Deal): Promise<AIAnalysis> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Atue como um Especialista Técnico do CESOL (Centro Público de Economia Solidária).
    Analise os dados do beneficiário abaixo para criar um 'Plano de Ação' e um 'Estudo de Viabilidade Econômica (EVE)' resumido.

    Beneficiário/Empreendimento:
    Nome: ${contact.name}
    Atividade: ${contact.role}
    Comunidade/Associação: ${contact.company}
    Notas de Campo (ASP): ${contact.notes}
    
    ${deal ? `
    Contexto da Visita:
    Objetivo: ${deal.title}
    Etapa Atual: ${deal.stage}
    ` : ''}

    Gere uma análise JSON contendo:
    1. 'score': Nota de 0 a 100 da maturidade do empreendimento.
    2. 'summary': Diagnóstico técnico breve (2 frases).
    3. 'suggestedAction': Próximo passo prioritário para a equipe de Fomento.
    4. 'emailDraft': Texto completo para o campo 'Plano de Ação' (formatação técnica), focando em melhorias de produto, gestão ou mercado.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Score de Maturidade (0-100)" },
            summary: { type: Type.STRING, description: "Diagnóstico técnico curto" },
            suggestedAction: { type: Type.STRING, description: "Ação sugerida para o ASP" },
            emailDraft: { type: Type.STRING, description: "Texto do Plano de Ação Estratégico" }
          },
          required: ["score", "summary", "suggestedAction", "emailDraft"]
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as AIAnalysis;
    }
    throw new Error("No response text generated");
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      score: 0,
      summary: "Não foi possível analisar os dados de campo.",
      suggestedAction: "Verificar conexão com a Central.",
      emailDraft: ""
    };
  }
};

export const generatePipelineInsights = async (deals: Deal[]): Promise<string> => {
  const model = "gemini-2.5-flash";
  
  const dealsSummary = deals.map(d => `${d.title} (${d.stage})`).join('\n');

  const prompt = `
    Você é o Coordenador Geral do CESOL. Analise o fluxo de atendimento (Kanban) dos Agentes de Fomento (ASPs).
    Dê um resumo executivo de 3 pontos sobre gargalos no fluxo, focando em:
    1. Acúmulo de visitas na fase de Coleta (Tablet).
    2. Pendências de Aprovação (Gestão).
    3. Sugestão de alocação de equipe.
    
    Dados do Kanban:
    ${dealsSummary}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "Sem insights disponíveis.";
  } catch (e) {
    return "Falha ao gerar relatório de gestão.";
  }
};