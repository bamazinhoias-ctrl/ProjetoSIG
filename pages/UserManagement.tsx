import React, { useState } from 'react';
import { User, UserRole, View } from '../types';
import { Users, Save, Plus, Shield, ShieldCheck, User as UserIcon, Building2, Lock, Eye, Pencil, Trash2, X, CheckSquare, Square, Briefcase, Mail, CheckCircle } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  cesolName: string;
  onUpdateCesolName: (name: string) => void;
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onViewProfile: (user: User) => void;
  currentUserRole: UserRole;
}

const AVAILABLE_PERMISSIONS: { id: string; label: string; view: string }[] = [
    { id: '1', label: 'Financeiro / Administrativo', view: 'admin' },
    { id: '2', label: 'Comercial (Loja)', view: 'comercial' },
    { id: '3', label: 'Fomento (Fluxo)', view: 'fomento' },
    { id: '4', label: 'EVE (Estudo de Viabilidade)', view: 'eve' },
    { id: '5', label: 'Agenda Operacional', view: 'agenda' },
    { id: '6', label: 'Gestão de Equipe (RH)', view: 'users' },
    { id: '7', label: 'Editar Empreendimentos', view: 'edit_empreendimentos' },
];

export const UserManagement: React.FC<UserManagementProps> = ({ 
  users, 
  cesolName, 
  onUpdateCesolName, 
  onAddUser, 
  onUpdateUser,
  onDeleteUser,
  onViewProfile,
  currentUserRole 
}) => {
  const [newCesolName, setNewCesolName] = useState(cesolName);
  
  // State for Form (Create/Edit)
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    password: '',
    role: UserRole.AGENTE_PRODUTIVO,
    permissions: []
  });

  const handleSaveCesolName = () => {
    onUpdateCesolName(newCesolName);
    alert('Nome do CESOL atualizado com sucesso!');
  };

  const handleEditClick = (user: User) => {
    // Permission check: Prevents Admin Coord from editing President
    if (currentUserRole === UserRole.COORD_ADMIN && user.role === UserRole.PRESIDENTE) {
        alert("Você não tem permissão para editar o Presidente.");
        return;
    }

    setIsEditing(true);
    setEditingId(user.id);
    setFormData({
        name: user.name,
        email: user.email,
        password: user.password || '', 
        role: user.role,
        permissions: user.permissions || []
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
        name: '',
        email: '',
        password: '',
        role: UserRole.AGENTE_PRODUTIVO,
        permissions: []
    });
  };

  const togglePermission = (view: string) => {
      setFormData(prev => {
          const current = prev.permissions || [];
          if (current.includes(view)) {
              return { ...prev, permissions: current.filter(p => p !== view) };
          } else {
              return { ...prev, permissions: [...current, view] };
          }
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.password && formData.role) {
      
      if (isEditing && editingId) {
          // Update Existing
          const updatedUser: User = {
              id: editingId,
              name: formData.name,
              email: formData.email,
              password: formData.password,
              role: formData.role,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
              permissions: formData.permissions
          };
          onUpdateUser(updatedUser);
      } else {
          // Create New
          onAddUser({
            id: Math.random().toString(36).substr(2, 9),
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
            permissions: formData.permissions || []
          });
      }

      handleCancelEdit(); 
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.PRESIDENTE: return 'bg-purple-100 text-purple-700 border-purple-200';
      case UserRole.COORD_GERAL: return 'bg-blue-100 text-blue-700 border-blue-200';
      case UserRole.COORD_ADMIN: return 'bg-brand-100 text-brand-700 border-brand-200';
      case UserRole.AGENTE_PRODUTIVO: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case UserRole.AGENTE_VENDA: return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Logic: Who can manage users?
  // President: Everyone
  // General Coord: Everyone except President
  // Admin Coord: Everyone except President and General Coord (Updated per request)
  const canManageUsers = currentUserRole === UserRole.PRESIDENTE || currentUserRole === UserRole.COORD_GERAL || currentUserRole === UserRole.COORD_ADMIN;

  const getAvailableRoles = () => {
      if (currentUserRole === UserRole.PRESIDENTE) return Object.values(UserRole);
      if (currentUserRole === UserRole.COORD_GERAL) return Object.values(UserRole).filter(r => r !== UserRole.PRESIDENTE);
      if (currentUserRole === UserRole.COORD_ADMIN) return Object.values(UserRole).filter(r => r !== UserRole.PRESIDENTE && r !== UserRole.COORD_GERAL);
      return [];
  }

  const handleDelete = (user: User) => {
      if (user.role === UserRole.PRESIDENTE || (currentUserRole === UserRole.COORD_ADMIN && user.role === UserRole.COORD_GERAL)) {
          alert("Ação não permitida para este cargo superior.");
          return;
      }
      onDeleteUser(user.id);
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Header Info */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-brand-600" />
                  Gestão de Equipe & RH
              </h2>
              <p className="text-sm text-slate-500">Controle de colaboradores e permissões de acesso.</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
               <Users className="w-5 h-5 text-slate-400"/>
               <span className="font-bold text-slate-700">{users.length} Colaboradores Ativos</span>
          </div>
      </div>

      {/* Configuração do CESOL (Tenant) */}
      <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden`}>
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-500" /> Identidade da Unidade
          </h3>
          {currentUserRole !== UserRole.PRESIDENTE && <Lock className="w-4 h-4 text-slate-300" />}
        </div>
        <div className="p-4 flex gap-4">
            <input 
              type="text" 
              disabled={currentUserRole !== UserRole.PRESIDENTE}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none disabled:bg-slate-50"
              value={newCesolName}
              onChange={(e) => setNewCesolName(e.target.value)}
            />
            {currentUserRole === UserRole.PRESIDENTE && (
                <button 
                onClick={handleSaveCesolName}
                className="px-4 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition-colors flex items-center gap-2"
                >
                <Save className="w-4 h-4" /> Salvar
                </button>
            )}
        </div>
      </div>

      {/* Main Content: Form & List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* User Form (Left Sidebar) */}
          <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-4">
                  <div className="p-4 border-b border-slate-100 bg-slate-50">
                      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex justify-between items-center">
                          {isEditing ? 'Editar Ficha' : 'Novo Colaborador'}
                          {isEditing && <button onClick={handleCancelEdit}><X className="w-4 h-4 text-slate-400 hover:text-red-500"/></button>}
                      </h3>
                  </div>
                  
                  {canManageUsers ? (
                      <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nome Completo</label>
                                <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Maria Silva"/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">E-mail Corporativo</label>
                                <input required type="email" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Senha de Acesso</label>
                                <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Definir senha provisória"/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Cargo / Função</label>
                                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                    value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                                    {getAvailableRoles().map(role => <option key={role} value={role}>{role}</option>)}
                                </select>
                            </div>

                            <div className="pt-2">
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Permissões Especiais</label>
                                <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100 max-h-48 overflow-y-auto">
                                    {AVAILABLE_PERMISSIONS.map(perm => (
                                        <div key={perm.id} onClick={() => togglePermission(perm.view)} className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded">
                                            {formData.permissions?.includes(perm.view) ? <CheckSquare className="w-4 h-4 text-brand-600"/> : <Square className="w-4 h-4 text-slate-300"/>}
                                            <span className="text-xs text-slate-700">{perm.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className={`w-full py-3 rounded-lg text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${isEditing ? 'bg-amber-500 hover:bg-amber-600' : 'bg-brand-600 hover:bg-brand-700'}`}>
                                {isEditing ? <Save className="w-4 h-4"/> : <Plus className="w-4 h-4"/>} 
                                {isEditing ? 'Atualizar Dados' : 'Cadastrar Funcionário'}
                            </button>
                      </form>
                  ) : (
                      <div className="p-8 text-center text-slate-400 text-sm">
                          Você não possui permissão para gerenciar usuários.
                      </div>
                  )}
              </div>
          </div>

          {/* User List (Right Content) */}
          <div className="lg:col-span-2 space-y-4">
             {users.map(user => (
                 <div key={user.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col sm:flex-row items-start sm:items-center gap-4">
                     {/* Avatar */}
                     <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                         {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover"/> : <UserIcon className="w-6 h-6 text-slate-300"/>}
                     </div>

                     {/* Info */}
                     <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2 mb-1">
                             <h3 className="font-bold text-slate-800 text-base truncate">{user.name}</h3>
                             <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getRoleBadge(user.role)}`}>
                                 {user.role}
                             </span>
                         </div>
                         <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-500">
                             <span className="flex items-center gap-1"><Mail className="w-3 h-3"/> {user.email}</span>
                             <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> {user.permissions?.length || 0} Permissões</span>
                         </div>
                     </div>

                     {/* Actions */}
                     <div className="flex items-center gap-2 self-end sm:self-center">
                         <button onClick={() => onViewProfile(user)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Ver Perfil Completo">
                             <Eye className="w-5 h-5"/>
                         </button>
                         
                         {canManageUsers && (
                             <>
                                <button onClick={() => handleEditClick(user)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Editar Dados">
                                    <Pencil className="w-5 h-5"/>
                                </button>
                                <button onClick={() => handleDelete(user)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Desligar Colaborador">
                                    <Trash2 className="w-5 h-5"/>
                                </button>
                             </>
                         )}
                     </div>
                 </div>
             ))}
          </div>
      </div>

    </div>
  );
};