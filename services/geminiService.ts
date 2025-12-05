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
            score: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            suggestedAction: { type: Type.STRING },
            emailDraft: { type: Type.STRING },
          }
        }
      }
    });

    const text = response.text || "{}";
    // Cleanup markdown if present (though responseMimeType should handle it, redundancy is good)
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString) as AIAnalysis;

  } catch (error) {
    console.error("Erro na IA:", error);
    return {
      score: 50,
      summary: "Não foi possível gerar análise automática no momento.",
      suggestedAction: "Realizar diagnóstico manual.",
      emailDraft: "Erro ao conectar com a IA."
    };
  }
};

export const generatePipelineInsights = async (deals: Deal[]): Promise<string> => {
    const model = "gemini-2.5-flash";
    const prompt = `
      Analise este pipeline de fomento do CESOL.
      Total de Atendimentos: ${deals.length}
      
      Dados:
      ${deals.map(d => `- ${d.title} (${d.stage}) - Probabilidade: ${d.probability}%`).join('\n')}
  
      Forneça um insight curto (max 3 frases) para o Coordenador sobre onde focar esforços esta semana.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt
      });
      return response.text || "Sem insights disponíveis.";
    } catch (error) {
      console.error(error);
      return "Erro ao gerar insights.";
    }
  };