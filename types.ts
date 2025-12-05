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
  permissions?: string[]; // List of allowed View IDs (e.g. ['admin', 'comercial'])
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

export interface Partner {
  id: string;
  name: string;
  role: string; // e.g. Sócio, Presidente
  gender: 'Masculino' | 'Feminino' | 'Outro';
}

export interface Contact {
  id: string;
  name: string; // Nome do Representante
  email: string;
  phone: string;
  company: string; // Nome do Empreendimento
  role: ActivityType | string;
  lastContacted: string;
  notes: string;
  address?: string;
  
  // Novos Campos
  city?: string;
  zone?: 'Urbana' | 'Rural';
  cnpj?: string;
  menCount?: number;
  womenCount?: number;
  mainProduct?: string;
  cpf?: string;
  representativeRole?: string; // Cargo no empreendimento
  registeredByRole?: string; // Cargo de quem cadastrou
  registeredDate?: string;
  ownerId?: string; // ID of the user who registered or owns this contact

  // Campos EVE / CadCidadão Sincronizados
  cadsol?: boolean;
  situation?: string; // 'Em funcionamento', 'Em implantação', etc.
  organization?: string; // 'Grupo Informal', 'Associação', etc.
  partners?: Partner[]; // Tabela de Sócios
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

// --- NEW FINANCIAL TYPES ---
export type TransactionType = 'Receita' | 'Despesa';
export type TransactionStatus = 'Pendente' | 'Aprovado' | 'Pago' | 'Rejeitado';
export type TransactionCategory = 'Operacional' | 'Pessoal' | 'Materiais' | 'Transporte' | 'Serviços' | 'Vendas' | 'Repasse' | 'Outros';

export interface Transaction {
  id: string;
  description: string;
  type: TransactionType;
  category: TransactionCategory;
  value: number;
  date: string;
  status: TransactionStatus;
  requesterId: string; // User ID
  requesterName: string;
  approverId?: string; // User ID
  approvedDate?: string;
  attachmentUrl?: string;
  notes?: string;
}

export type View = 'dashboard' | 'agenda' | 'fomento' | 'cadcidadao' | 'eve' | 'comercial' | 'admin' | 'settings' | 'contacts' | 'users' | 'profile' | 'empreendimentos' | 'actionplan';