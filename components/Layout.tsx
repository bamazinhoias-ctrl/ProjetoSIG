import React, { useState } from 'react';
import { LayoutDashboard, Kanban, ShoppingBag, Settings, Layers, Briefcase, LogOut, Calendar, Users, ChevronLeft, ChevronRight, Menu, Moon, Sun } from 'lucide-react';
import { View, User, UserRole } from '../types';

interface LayoutProps {
  currentView: View;
  currentUser: User;
  cesolName: string;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  children: React.ReactNode;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

const NavItem = ({ icon: Icon, label, isActive, isCollapsed, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    title={isCollapsed ? label : ''}
    className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden
      ${isActive 
        ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/30' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-brand-300'
      }
      ${isCollapsed ? 'justify-center' : 'justify-start'}
    `}
  >
    <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-100' : 'group-hover:scale-110'} ${isCollapsed ? '' : ''}`} />
    
    {!isCollapsed && (
      <span className="whitespace-nowrap animate-fade-in origin-left">
        {label}
      </span>
    )}

    {/* Active Indicator for Collapsed Mode */}
    {isCollapsed && isActive && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-200 rounded-r-full"></div>
    )}
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ currentView, currentUser, cesolName, onNavigate, onLogout, children, isDarkMode, onToggleTheme }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'dark' : ''} bg-slate-50 dark:bg-slate-950 transition-colors duration-300`}>
      {/* Sidebar - Dark Mode & Collapsible */}
      <aside 
        className={`bg-slate-900 border-r border-slate-800 flex flex-col z-20 shadow-xl transition-all duration-300 ease-in-out relative
          ${isCollapsed ? 'w-20' : 'w-72'}
        `}
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-9 bg-slate-800 text-slate-400 border border-slate-700 rounded-full p-1 shadow-md hover:text-white hover:bg-brand-500 transition-colors z-30"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* Header / Logo */}
        <div className={`p-6 border-b border-slate-800 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="p-2 bg-gradient-to-br from-brand-600 to-brand-400 rounded-xl shadow-lg shadow-brand-500/20 shrink-0">
            <Layers className="w-6 h-6 text-white" />
          </div>
          
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden animate-fade-in">
                <span className="text-lg font-bold tracking-tight text-white leading-none">SIG-CESOL</span>
                <span className="text-[10px] text-brand-400 font-medium tracking-wider truncate max-w-[160px] uppercase mt-1">
                  Gestão Integrada
                </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Section: Geral */}
          <div className={`px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 ${isCollapsed ? 'text-center' : ''}`}>
            {isCollapsed ? '...' : 'Geral'}
          </div>
          
          <NavItem 
            icon={LayoutDashboard} 
            label="Visão Geral" 
            isActive={currentView === 'dashboard'} 
            isCollapsed={isCollapsed}
            onClick={() => onNavigate('dashboard')} 
          />
          <NavItem 
            icon={Calendar} 
            label="Agenda" 
            isActive={currentView === 'agenda'} 
            isCollapsed={isCollapsed}
            onClick={() => onNavigate('agenda')} 
          />
          
          {(currentUser.role === UserRole.PRESIDENTE || currentUser.role === UserRole.COORD_GERAL) && (
            <NavItem 
              icon={Users} 
              label="Gestão de Equipe" 
              isActive={currentView === 'users'} 
              isCollapsed={isCollapsed}
              onClick={() => onNavigate('users')} 
            />
          )}
          
          {/* Section: Módulos */}
          <div className={`px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-6 ${isCollapsed ? 'text-center' : ''}`}>
            {isCollapsed ? '...' : 'Módulos'}
          </div>
          
          <NavItem 
            icon={Kanban} 
            label="Fomento (Fluxo)" 
            isActive={currentView === 'fomento'} 
            isCollapsed={isCollapsed}
            onClick={() => onNavigate('fomento')} 
          />
          <NavItem 
            icon={ShoppingBag} 
            label="Comercial (Loja)" 
            isActive={currentView === 'comercial'} 
            isCollapsed={isCollapsed}
            onClick={() => onNavigate('comercial')} 
          />
          <NavItem 
            icon={Briefcase} 
            label="Administrativo" 
            isActive={currentView === 'admin'} 
            isCollapsed={isCollapsed}
            onClick={() => onNavigate('admin')} 
          />
        </nav>

        {/* User Footer */}
        <div className="p-4 bg-slate-950/50 border-t border-slate-800">
           <div className={`flex items-center gap-3 mb-4 transition-all ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="relative group cursor-pointer" onClick={() => onNavigate('settings')}>
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-sm border border-slate-700 shadow-sm ring-2 ring-transparent group-hover:ring-brand-500 transition-all overflow-hidden">
                    {currentUser.avatar ? <img src={currentUser.avatar} alt="User" className="w-full h-full object-cover"/> : currentUser.name.charAt(0)}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
              </div>
              
              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden animate-fade-in">
                    <span className="text-sm font-bold text-white truncate max-w-[140px]">{currentUser.name}</span>
                    <span className="text-[10px] text-slate-500 truncate font-medium max-w-[140px]" title={currentUser.role}>{currentUser.role}</span>
                </div>
              )}
           </div>
           
           <div className="space-y-1">
             {!isCollapsed ? (
                <>
                  <button
                    onClick={() => onNavigate('settings')} 
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-slate-400 hover:bg-slate-800 hover:text-white"
                  >
                    <Settings className="w-4 h-4" /> Configurações
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <LogOut className="w-4 h-4" /> Sair
                  </button>
                </>
             ) : (
                <button
                    onClick={onLogout}
                    className="w-full flex justify-center p-2 rounded-lg text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors"
                    title="Sair"
                >
                    <LogOut className="w-5 h-5" />
                </button>
             )}
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950 relative transition-colors duration-300">
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 sticky top-0 z-10 flex justify-between items-center shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Trigger */}
            <Menu className="w-6 h-6 text-slate-400 lg:hidden" />
            
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 capitalize tracking-tight transition-colors">
              {currentView === 'fomento' ? 'Módulo 01: Fomento' : 
              currentView === 'comercial' ? 'Módulo 02: Comercial' :
              currentView === 'admin' ? 'Módulo 03: Administrativo' :
              currentView === 'agenda' ? 'Agenda de Campo' :
              currentView === 'users' ? 'Gestão de Usuários' :
              currentView === 'settings' ? 'Meu Perfil' :
              'Dashboard Estratégico'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Dark Mode Toggle */}
             <button 
                onClick={onToggleTheme}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={isDarkMode ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
             >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>

             <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Unidade</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors">{cesolName}</span>
             </div>
             <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 transition-colors">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Online
            </div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};