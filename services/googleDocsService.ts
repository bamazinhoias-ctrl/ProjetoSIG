import { Contact } from "../types";

// Types for Google API simulation
export interface GoogleAuthResponse {
    accessToken: string;
    user: {
        name: string;
        email: string;
        avatar: string;
    }
}

export interface GoogleDoc {
    id: string;
    title: string;
    url: string;
    lastModified: string;
}

// Simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authenticateGoogle = async (): Promise<GoogleAuthResponse> => {
    await delay(1500); // Simulate popup and auth flow
    return {
        accessToken: "ya29.mock_token_xyz_123",
        user: {
            name: "Usuário CESOL",
            email: "tecnico@cesol.ba.gov.br",
            avatar: "https://lh3.googleusercontent.com/a/default-user"
        }
    };
};

export const createDocument = async (title: string, contentHTML: string, contact?: Contact): Promise<GoogleDoc> => {
    await delay(2000); // Simulate API call to create and insert content

    // In a real scenario, this would POST to https://docs.googleapis.com/v1/documents
    // and then use batchUpdate to insert text/html.

    console.log(`[GoogleDocs API] Creating doc: ${title}`);
    console.log(`[GoogleDocs API] Content length: ${contentHTML.length}`);

    return {
        id: `1${Math.random().toString(36).substr(2, 9)}`,
        title: title,
        url: "https://docs.google.com/document/d/mock-doc-id/edit", // Mock URL
        lastModified: new Date().toISOString()
    };
};

export const listDocuments = async (): Promise<GoogleDoc[]> => {
    await delay(1000);
    return [
        { id: 'doc-001', title: 'Plano de Ação - Assoc. Mulheres', url: '#', lastModified: new Date(Date.now() - 86400000).toISOString() },
        { id: 'doc-002', title: 'Diagnóstico Inicial - Vale Verde', url: '#', lastModified: new Date(Date.now() - 86400000 * 5).toISOString() }
    ];
};