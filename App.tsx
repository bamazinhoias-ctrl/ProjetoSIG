import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './pages/Dashboard';
import { Pipeline } from './pages/Pipeline';
import { Contacts } from './pages/Contacts';
import { Agenda } from './pages/Agenda';
import { Administrative } from './pages/Administrative';
import { UserManagement } from './pages/UserManagement';
import { Commercial } from './pages/Commercial';
import { Profile } from './pages/Profile';
import { Contact, Deal, DealStage, View, ActivityType, Appointment, AppointmentType, User, UserRole, Product } from './types';

// Mock Data Initialization (SIG-CESOL Context)
const INITIAL_USERS: User[] = [
  {
    id: '0',
    name: 'Presidente Executivo',
    email: 'admin@cesol.ba.gov.br',
    password: '123456',
    role: UserRole.PRESIDENTE,
  },
  {
    id: '1',
    name: 'Maria Coordenadora',
    email: 'coord@cesol.ba.gov.br',
    password: '123456',
    role: UserRole.COORD_GERAL,
  },
  {
    id: '2',
    name: 'João ASP',
    email: 'joao.asp@cesol.ba.gov.br',
    password: '123',
    role: UserRole.AGENTE_PRODUTIVO,
    avatar: 'https://ui-avatars.com/api/?name=Joao+ASP&background=random'
  },
  {
    id: '3',
    name: 'Ana ASP',
    email: 'ana.asp@cesol.ba.gov.br',
    password: '123',
    role: UserRole.AGENTE_PRODUTIVO,
    avatar: 'https://ui-avatars.com/api/?name=Ana+ASP&background=random'
  }
];

const INITIAL_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Assoc. Mulheres de Fibra',
    email: 'contato@mulheresfibra.org',
    phone: '(71) 99988-7766',
    company: 'Comunidade Quilombola Rio das Rãs',
    role: ActivityType.ARTESANATO,
    lastContacted: new Date().toISOString(),
    notes: 'Produção de biojóias em baixa. Necessitam de design para novas coleções. Equipamentos quebrados.'
  },
  {
    id: '2',
    name: 'Coop. Agricultores Vale Verde',
    email: 'vendas@valeverde.coop',
    phone: '(75) 98877-6655',
    company: 'Vale do Capão',
    role: ActivityType.AGRICULTURA,
    lastContacted: new Date(Date.now() - 86400000 * 5).toISOString(),
    notes: 'Produção de mel orgânico. Precisam de certificação sanitária para venda na Loja CESOL.'
  },
  {
    id: '3',
    name: 'Dona Maria dos Bolos',
    email: 'maria.bolos@gmail.com',
    phone: '(73) 91122-3344',
    company: 'Bairro da Paz',
    role: ActivityType.CULINARIA,
    lastContacted: new Date(Date.now() - 86400000 * 12).toISOString(),
    notes: 'Individual. Precisa de MEI e rotulagem nutricional.'
  },
  {
    id: '4',
    name: 'Grupo de Costura Esperança',
    email: 'esperanca@costura.com',
    phone: '(74) 97766-5544',
    company: 'Comunidade Rural Esperança',
    role: ActivityType.SERVICOS,
    lastContacted: new Date(Date.now() - 86400000 * 2).toISOString(),
    notes: 'Falta matéria-prima. Solicitaram adiantamento de insumos.'
  }
];

const INITIAL_DEALS: Deal[] = [
  {
    id: 'EVE-101',
    title: 'Diagnóstico: Biojóias',
    value: 5000,
    stage: DealStage.PLANO_ACAO,
    contactId: '1',
    expectedCloseDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    probability: 60,
    assigneeId: '2' // Assigned to João ASP
  },
  {
    id: 'EVE-102',
    title: 'Certificação do Mel',
    value: 2500,
    stage: DealStage.COLETA_EVE,
    contactId: '2',
    expectedCloseDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    probability: 20,
    assigneeId: '3' // Assigned to Ana ASP
  },
  {
    id: 'CAD-103',
    title: 'Formalização MEI',
    value: 0,
    stage: DealStage.AGENDAMENTO,
    contactId: '3',
    expectedCloseDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    probability: 0
  },
  {
    id: 'EVE-104',
    title: 'Compra de Tecidos',
    value: 1200,
    stage: DealStage.APROVACAO,
    contactId: '4',
    expectedCloseDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    probability: 90,
    assigneeId: '2' // Assigned to João ASP
  }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    title: 'Visita Técnica - Diagnóstico',
    date: new Date().toISOString().split('T')[0], // Today
    time: '09:00',
    type: AppointmentType.VISITA,
    contactId: '1',
    assigneeId: '2',
    notes: 'Avaliar produção de biojóias.'
  },
  {
    id: '2',
    title: 'Reunião de Alinhamento',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    time: '14:30',
    type: AppointmentType.REUNIAO,
    contactId: '2',
    assigneeId: '3',
    notes: 'Discutir certificação.'
  }
];

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Mel Orgânico Silvestre', sku: 'AGR-001', category: 'Agricultura', price: 25.00, cost: 18.00, stock: 45, producerId: '2' },
  { id: '2', name: 'Colar de Sementes', sku: 'ART-004', category: 'Artesanato', price: 45.00, cost: 30.00, stock: 12, producerId: '1' },
  { id: '3', name: 'Bolo de Rolo Regional', sku: 'CUL-020', category: 'Culinária', price: 18.00, cost: 12.00, stock: 8, producerId: '3' },
  { id: '4', name: 'Kit Pano de Prato Bordado', sku: 'ART-015', category: 'Artesanato', price: 35.00, cost: 22.00, stock: 20, producerId: '4' },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [cesolName, setCesolName] = useState('CESOL - Centro Público');
  
  // Theme Management
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage or system preference
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  const [view, setView] = useState<View>('dashboard');
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  
  // State to handle viewing ANOTHER user's profile (Coordinator viewing ASP)
  const [profileUser, setProfileUser] = useState<User | null>(null);

  // Redirect unauthorized users away from restricted views
  useEffect(() => {
    if (view === 'users' && currentUser) {
      const allowed = currentUser.role === UserRole.PRESIDENTE || currentUser.role === UserRole.COORD_GERAL;
      if (!allowed) {
        setView('dashboard');
      }
    }
  }, [view, currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setProfileUser(null);
    setView('dashboard'); 
  };

  const handleAddUser = (newUser: User) => {
    setUsers([...users, newUser]);
  }
  
  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    // If updating current user, update session
    if (currentUser && currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
    // If updating profile being viewed, update that state too
    if (profileUser && profileUser.id === updatedUser.id) {
        setProfileUser(updatedUser);
    }
  };

  const handleDeleteUser = (userId: string) => {
     if (userId === currentUser?.id) {
         alert("Você não pode excluir seu próprio usuário.");
         return;
     }
     if (window.confirm("Tem certeza que deseja excluir este usuário permanentemente?")) {
         setUsers(prev => prev.filter(u => u.id !== userId));
     }
  };

  const handleUpdateDeal = (updatedDeal: Deal) => {
    setDeals(prev => prev.map(d => d.id === updatedDeal.id ? updatedDeal : d));
  };

  const handleSelectDeal = (deal: Deal) => {
    console.log("Selecionado:", deal);
  };

  const handleAddAppointment = (appointment: Appointment) => {
    // 1. Add to Agenda
    setAppointments([...appointments, appointment]);

    // 2. SYNC: Automatically add to Pipeline (Fomento) in 'Agendamento' stage
    if (appointment.contactId) {
        const newDeal: Deal = {
            id: `EVE-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            title: appointment.title, // Use appointment title (e.g., "Visita Técnica")
            value: 0,
            stage: DealStage.AGENDAMENTO, // Force start at Agendamento
            contactId: appointment.contactId,
            expectedCloseDate: appointment.date, // Set deadline to appointment date
            probability: 10,
            assigneeId: appointment.assigneeId
        };
        setDeals(prev => [...prev, newDeal]);
    }
  };

  const handleAddProduct = (product: Product) => {
    setProducts([...products, product]);
  };
  
  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto do estoque?')) {
        setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const handleUpdateStock = (productId: string, quantity: number) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, stock: p.stock + quantity } : p
    ));
  };

  // Navigates to a specific user profile
  const handleViewProfile = (targetUser: User) => {
    setProfileUser(targetUser);
    setView('profile');
  };

  // Navigate to my own profile
  const handleViewMyProfile = () => {
    setProfileUser(currentUser);
    setView('profile');
  }

  if (!currentUser) {
    return <Login users={users} onLogin={handleLogin} cesolName={cesolName} />;
  }

  return (
    <Layout 
      currentView={view} 
      onNavigate={(v) => {
          if (v === 'settings') {
             // Reusing Profile as a "Settings/Profile" view for now or navigate to My Profile
             handleViewMyProfile();
          } else {
             setView(v);
          }
      }} 
      onLogout={handleLogout} 
      currentUser={currentUser}
      cesolName={cesolName}
      isDarkMode={isDarkMode}
      onToggleTheme={toggleTheme}
    >
      {view === 'dashboard' && (
        <Dashboard 
          deals={deals} 
          totalContacts={contacts.length} 
          users={users} 
          currentUser={currentUser} 
        />
      )}
      
      {view === 'agenda' && (
        <Agenda 
            appointments={appointments}
            contacts={contacts}
            users={users}
            onAddAppointment={handleAddAppointment}
        />
      )}

      {view === 'fomento' && (
        <Pipeline 
          deals={deals} 
          contacts={contacts}
          users={users}
          currentUser={currentUser}
          onUpdateDeal={handleUpdateDeal}
          onSelectDeal={handleSelectDeal}
        />
      )}
      
      {view === 'comercial' && (
        <Commercial 
          products={products}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onUpdateStock={handleUpdateStock}
          contacts={contacts}
        />
      )}

      {view === 'admin' && (
        <Administrative />
      )}

      {view === 'users' && (currentUser.role === UserRole.PRESIDENTE || currentUser.role === UserRole.COORD_GERAL) && (
        <UserManagement 
          users={users}
          cesolName={cesolName}
          onUpdateCesolName={setCesolName}
          onAddUser={handleAddUser}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          currentUserRole={currentUser.role}
          onViewProfile={handleViewProfile}
        />
      )}
      
      {view === 'profile' && profileUser && (
        <Profile 
            user={profileUser} 
            deals={deals} 
            contacts={contacts} 
            isOwnProfile={profileUser.id === currentUser.id}
            onUpdateUser={handleUpdateUser}
        />
      )}
      
      {(view === 'contacts') && (
        <Contacts contacts={contacts} deals={deals} />
      )}
    </Layout>
  );
}