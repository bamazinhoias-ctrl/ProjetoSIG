export enum DealStage {
  AGENDAMENTO = 'Agendamento',
  COLETA_EVE = 'Coleta EVE',
  COLETA_CAD = 'Coleta CadCidadão',
  PLANO_ACAO = 'Plano de Ação',
  APROVACAO = 'Em Aprovação',
  CONCLUIDO = 'Concluído'
}

export enum ActivityType {
  ARTESANATO = 'Artesanato',
  AGRICULTURA = 'Agricultura Familiar',
  SERVICOS = 'Serviços',
  CULINARIA = 'Culinária'
}

export enum AppointmentType {
  VISITA = 'Visita Técnica',
  REUNIAO = 'Reunião',
  ENTREGA = 'Entrega Técnica',
  OUTROS = 'Outros'
}

export enum UserRole {
  PRESIDENTE = 'Presidente', // Super Admin
  COORD_GERAL = 'Coordenadora Geral', // Tático
  COORD_ADMIN = 'Coordenadora Administrativa', // Financeiro/RH
  AGENTE_PRODUTIVO = 'Agente Socioprodutivo (ASP)', // Operacional Campo
  AGENTE_VENDA = 'Agente de Venda (Loja)', // Operacional Loja
  ESTAGIARIO = 'Estagiário',
  MOTORISTA = 'Motorista',
  AUX_ADMIN = 'Auxiliar Administrativo'
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number; // Preço Final
  cost: number; // Custo Produtor
  stock: number;
  producerId: string; // Link to Contact
  sku: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
}

export interface Appointment {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: AppointmentType;
  contactId: string;
  assigneeId?: string; // New: ID of the ASP responsible
  notes?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: ActivityType | string;
  lastContacted: string;
  notes: string;
  address?: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  contactId: string;
  expectedCloseDate: string;
  probability: number;
  assigneeId?: string; // ID of the User (ASP) responsible
  tags?: string[];
}

export interface AIAnalysis {
  score: number;
  summary: string;
  suggestedAction: string;
  emailDraft: string;
}

export type View = 'dashboard' | 'agenda' | 'fomento' | 'cadcidadao' | 'eve' | 'comercial' | 'admin' | 'settings' | 'contacts' | 'users' | 'profile';