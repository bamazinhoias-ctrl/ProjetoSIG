import React from 'react';
import { LayoutDashboard, Kanban, ShoppingBag, Settings, Layers, Briefcase, LogOut, Calendar, Users, Shield } from 'lucide-react';
import { View, User, UserRole } from '../types';

interface LayoutProps {
  currentView: View;
  currentUser: User;
  cesolName: string;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const NavItem = ({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick 
}: { 
  icon: React.ElementType, 
  label: string, 
  isActive: boolean, 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
      isActive 
        ? 'bg-blue-50 text-blue-700 shadow-sm' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
    {label}
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ currentView, currentUser, cesolName, onNavigate, onLogout, children }) => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col z-20 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-blue-800">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">SIG-CESOL</span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wider truncate max-w-[150px] uppercase mt-1" title={cesolName}>{cesolName}</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Geral
          </div>
          <NavItem 
            icon={LayoutDashboard} 
            label="Visão Geral" 
            isActive={currentView === 'dashboard'} 
            onClick={() => onNavigate('dashboard')} 
          />
          <NavItem 
            icon={Calendar} 
            label="Agenda" 
            isActive={currentView === 'agenda'} 
            onClick={() => onNavigate('agenda')} 
          />
          
          {(currentUser.role === UserRole.PRESIDENTE || currentUser.role === UserRole.COORD_GERAL) && (
            <NavItem 
              icon={Users} 
              label="Gestão de Equipe" 
              isActive={currentView === 'users'} 
              onClick={() => onNavigate('users')} 
            />
          )}
          
          <div className="mt-6 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Módulos
          </div>
          <NavItem 
            icon={Kanban} 
            label="Fomento (Fluxo)" 
            isActive={currentView === 'fomento'} 
            onClick={() => onNavigate('fomento')} 
          />
          <NavItem 
            icon={ShoppingBag} 
            label="Comercial (Loja)" 
            isActive={currentView === 'comercial'} 
            onClick={() => onNavigate('comercial')} 
          />
          <NavItem 
            icon={Briefcase} 
            label="Administrativo" 
            isActive={currentView === 'admin'} 
            onClick={() => onNavigate('admin')} 
          />
        </nav>

        {/* User Profile Snippet */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-sm border border-slate-200 shadow-sm">
                  {currentUser.name.charAt(0)}
              </div>
              <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-500 truncate font-medium" title={currentUser.role}>{currentUser.role}</span>
              </div>
           </div>
           
           <div className="space-y-1">
             <NavItem 
              icon={Settings} 
              label="Configurações" 
              isActive={currentView === 'settings'} 
              onClick={() => onNavigate('settings')} 
            />
             <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="w-5 h-5 opacity-80" />
              Sair do Sistema
            </button>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900 capitalize tracking-tight">
            {currentView === 'fomento' ? 'Módulo 01: Fomento e Gestão Visual' : 
             currentView === 'comercial' ? 'Módulo 02: Comercial e Logística' :
             currentView === 'admin' ? 'Módulo 03: Administrativo' :
             currentView === 'agenda' ? 'Agenda de Campo' :
             currentView === 'users' ? 'Gestão de Usuários e Sistema' :
             'Dashboard Estratégico'}
          </h1>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Online (Sincronizado)
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};