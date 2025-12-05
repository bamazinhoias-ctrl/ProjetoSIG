import React, { useState } from 'react';
import { LayoutDashboard, Kanban, ShoppingBag, Settings, Layers, Briefcase, LogOut, Calendar, Users, ChevronLeft, ChevronRight, Menu, Moon, Sun, FileText, ClipboardList, Database, ChevronDown, PenTool } from 'lucide-react';
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

  // Helper to get Context Label
  const getContextLabel = (view: View) => {
    switch (view) {
        case 'dashboard': return 'Inteligência de Dados';
        case 'agenda': return 'Operação de Campo';
        case 'fomento': return 'Técnico';
        case 'cadcidadao': return 'Cadastro Social';
        case 'eve': return 'Estudo Econômico';
        case 'comercial': return 'Mercado';
        case 'admin': return 'Financeiro';
        case 'users': return 'Administração';
        case 'empreendimentos': return 'Banco de Dados';
        case 'actionplan': return 'Planejamento';
        default: return 'Sistema Integrado';
    }
  };

  // Helper Check Access
  const checkAccess = (target: View) => {
      // Super Admins
      if (currentUser.role === UserRole.PRESIDENTE || currentUser.role === UserRole.COORD_GERAL) return true;
      
      // Explicit Permissions
      if (currentUser.permissions?.includes(target)) return true;

      // Role Defaults
      switch(target) {
          case 'agenda': return currentUser.role === UserRole.AGENTE_PRODUTIVO || currentUser.role === UserRole.AUX_ADMIN;
          case 'fomento': return currentUser.role === UserRole.AGENTE_PRODUTIVO;
          case 'cadcidadao': return currentUser.role === UserRole.AGENTE_PRODUTIVO;
          case 'eve': return currentUser.role === UserRole.AGENTE_PRODUTIVO;
          case 'actionplan': return currentUser.role === UserRole.AGENTE_PRODUTIVO;
          case 'comercial': return currentUser.role === UserRole.AGENTE_VENDA || currentUser.role === UserRole.COORD_ADMIN;
          case 'admin': return currentUser.role === UserRole.COORD_ADMIN;
          case 'users': return currentUser.role === UserRole.COORD_ADMIN;
          // Updated Access: COORD_ADMIN and AGENTE_PRODUTIVO can see Empreendimentos
          case 'empreendimentos': return currentUser.role === UserRole.AUX_ADMIN || currentUser.role === UserRole.AGENTE_VENDA || currentUser.role === UserRole.COORD_ADMIN || currentUser.role === UserRole.AGENTE_PRODUTIVO;
          default: return false;
      }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'dark' : ''} bg-slate-50 dark:bg-slate-950 transition-colors duration-300`}>
      {/* Sidebar - Dark Mode & Collapsible */}
      <aside 
        className={`bg-slate-900 border-r border-slate-800 flex flex-col z-50 shadow-2xl transition-all duration-300 ease-in-out relative shrink-0
          ${isCollapsed ? 'w-20' : 'w-72'}
        `}
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-9 bg-slate-800 text-slate-400 border border-slate-700 rounded-full p-1 shadow-md hover:text-white hover:bg-brand-500 transition-colors z-50 flex items-center justify-center"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* Header / Logo - MODERNIZED */}
        <div className={`h-24 flex items-center border-b border-slate-800/50 ${isCollapsed ? 'justify-center px-0' : 'px-6 gap-3'}`}>
          <div className="relative flex items-center justify-center shrink-0">
             {/* Glow effect behind logo */}
             <div className="absolute inset-0 bg-brand-500 rounded-xl blur-lg opacity-20 animate-pulse"></div>
             {/* Icon Container */}
             <div className="relative p-2.5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 shadow-xl group cursor-pointer hover:border-brand-500/50 transition-colors">
                <Layers className="w-7 h-7 text-brand-500" />
             </div>
          </div>
          
          {!isCollapsed && (
            <div className="flex flex-col animate-fade-in select-none">
               <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-black tracking-tight text-white">SIG</span>
                  <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600 drop-shadow-sm">CESOL</span>
               </div>
               <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.25em] leading-none ml-0.5">
                 Gestão Integrada
               </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Section: Geral */}
          <div className={`px-3 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-2 ${isCollapsed ? 'text-center' : ''}`}>
            {isCollapsed ? '...' : 'Visão Geral'}
          </div>
          
          <NavItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            isActive={currentView === 'dashboard'} 
            isCollapsed={isCollapsed}
            onClick={() => onNavigate('dashboard')} 
          />
          
          {checkAccess('agenda') && (
            <NavItem 
              icon={Calendar} 
              label="Agenda" 
              isActive={currentView === 'agenda'} 
              isCollapsed={isCollapsed}
              onClick={() => onNavigate('agenda')} 
            />
          )}
          
          {checkAccess('users') && (
            <NavItem 
              icon={Users} 
              label="Equipe e RH" 
              isActive={currentView === 'users'} 
              isCollapsed={isCollapsed}
              onClick={() => onNavigate('users')} 
            />
          )}

          {checkAccess('empreendimentos') && (
            <NavItem 
              icon={Database} 
              label="Empreendimentos" 
              isActive={currentView === 'empreendimentos'} 
              isCollapsed={isCollapsed}
              onClick={() => onNavigate('empreendimentos')} 
            />
          )}
          
          {/* Section: Módulos */}
          <div className={`px-3 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-6 ${isCollapsed ? 'text-center' : ''}`}>
            {isCollapsed ? '...' : 'Operacional'}
          </div>
          
          {/* New Order: Fomento -> CadCidadão -> EVE -> Plano de Ação */}
          
          {checkAccess('fomento') && (
            <NavItem 
                icon={Kanban} 
                label="Fomento (Fluxo)" 
                isActive={currentView === 'fomento'} 
                isCollapsed={isCollapsed}
                onClick={() => onNavigate('fomento')} 
            />
          )}

          {checkAccess('cadcidadao') && (
              <NavItem 
                icon={FileText} 
                label="CadCidadão" 
                isActive={currentView === 'cadcidadao'} 
                isCollapsed={isCollapsed}
                onClick={() => onNavigate('cadcidadao')} 
              />
          )}

          {checkAccess('eve') && (
              <NavItem 
                icon={ClipboardList} 
                label="EVE (Viabilidade)" 
                isActive={currentView === 'eve'} 
                isCollapsed={isCollapsed}
                onClick={() => onNavigate('eve')} 
              />
          )}

          {checkAccess('actionplan') && (
            <NavItem 
                icon={PenTool} 
                label="Planos de Ação (Docs)" 
                isActive={currentView === 'actionplan'} 
                isCollapsed={isCollapsed}
                onClick={() => onNavigate('actionplan')} 
            />
          )}

          {/* Section: Comercial / Admin */}
          
          {checkAccess('comercial') && (
            <NavItem 
              icon={ShoppingBag} 
              label="Comercial (Loja)" 
              isActive={currentView === 'comercial'} 
              isCollapsed={isCollapsed}
              onClick={() => onNavigate('comercial')} 
            />
          )}

          {checkAccess('admin') && (
            <NavItem 
                icon={Briefcase} 
                label="Administrativo" 
                isActive={currentView === 'admin'} 
                isCollapsed={isCollapsed}
                onClick={() => onNavigate('admin')} 
            />
          )}
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
                    <span className="text-xs text-slate-500 truncate font-medium max-w-[140px]" title={currentUser.role}>{currentUser.role}</span>
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

      {/* Main Content Area - Solid Background & Fixed Header */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-w-0">
        
        {/* Fixed Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm z-30 shrink-0">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Trigger */}
              <button 
                className="lg:hidden p-1 text-slate-400 hover:text-slate-600"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                  <Menu className="w-6 h-6" />
              </button>
              
              {/* Modern Header Titles */}
              <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-0.5 animate-fade-in hidden sm:block">
                      {getContextLabel(currentView)}
                  </span>
                  <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 capitalize tracking-tight transition-colors leading-none truncate max-w-[200px] sm:max-w-none">
                  {currentView === 'fomento' ? 'Fomento' : 
                  currentView === 'cadcidadao' ? 'CadCidadão' :
                  currentView === 'eve' ? 'Estudo de Viabilidade (EVE)' :
                  currentView === 'comercial' ? 'Comercial' :
                  currentView === 'admin' ? 'Administrativo' :
                  currentView === 'agenda' ? 'Agenda' :
                  currentView === 'users' ? 'Gestão de Equipe & RH' :
                  currentView === 'empreendimentos' ? 'Gestão de Empreendimentos' :
                  currentView === 'settings' ? 'Perfil' :
                  currentView === 'actionplan' ? 'Plano de Ação (Docs)' :
                  'Dashboard'}
                  </h1>
              </div>
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
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Unidade Operacional</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors">{cesolName}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 transition-colors shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/40"></span>
                  <span className="hidden sm:inline">Online</span>
              </div>
            </div>
        </header>
        
        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 pt-4 lg:pt-6 pb-20 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {children}
        </div>
      </main>
    </div>
  );
};