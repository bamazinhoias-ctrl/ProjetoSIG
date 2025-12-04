import React, { useState } from 'react';
import { User, UserRole, View } from '../types';
import { Users, Save, Plus, Shield, ShieldCheck, User as UserIcon, Building2, Lock, Eye, Pencil, Trash2, X, CheckSquare, Square } from 'lucide-react';

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

const AVAILABLE_PERMISSIONS: { id: string; label: string; view: View }[] = [
    { id: '1', label: 'Financeiro / Administrativo', view: 'admin' },
    { id: '2', label: 'Comercial (Loja)', view: 'comercial' },
    { id: '3', label: 'Fomento (Fluxo)', view: 'fomento' },
    { id: '4', label: 'EVE (Estudo de Viabilidade)', view: 'eve' },
    { id: '5', label: 'Agenda Operacional', view: 'agenda' },
    { id: '6', label: 'Gestão de Equipe (RH)', view: 'users' },
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
    setIsEditing(true);
    setEditingId(user.id);
    setFormData({
        name: user.name,
        email: user.email,
        password: user.password || '', // Usually keep empty for security, but simple demo
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
          alert('Usuário atualizado com sucesso!');
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
          alert('Usuário cadastrado com sucesso!');
      }

      handleCancelEdit(); // Reset form
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.PRESIDENTE: return 'bg-purple-100 text-purple-700 border-purple-200';
      case UserRole.COORD_GERAL: 
      case UserRole.COORD_ADMIN:
        return 'bg-brand-100 text-brand-700 border-brand-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // RBAC Logic
  const getAllowedRolesToCreate = () => {
    if (currentUserRole === UserRole.PRESIDENTE) {
        return Object.values(UserRole); // Can create everyone
    }
    if (currentUserRole === UserRole.COORD_GERAL) {
        // Can create Operational and Specific roles
        return [
            UserRole.AGENTE_PRODUTIVO,
            UserRole.AGENTE_VENDA,
            UserRole.ESTAGIARIO,
            UserRole.MOTORISTA,
            UserRole.AUX_ADMIN
        ];
    }
    return []; // Others cannot create users
  };

  const allowedRoles = getAllowedRolesToCreate();
  const canManageCesol = currentUserRole === UserRole.PRESIDENTE;
  const canManageUsers = currentUserRole === UserRole.PRESIDENTE || currentUserRole === UserRole.COORD_GERAL;
  const canGrantPermissions = currentUserRole === UserRole.PRESIDENTE || currentUserRole === UserRole.COORD_GERAL;

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      
      {/* Configuração do CESOL (Only President) */}
      <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-opacity ${!canManageCesol ? 'opacity-60 grayscale' : ''}`}>
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-500" />
              Configuração da Unidade (Tenant)
            </h2>
            <p className="text-sm text-slate-500">Defina a identidade do Centro Público gerido por este sistema.</p>
          </div>
          {!canManageCesol && <Lock className="w-5 h-5 text-slate-400" />}
        </div>
        <div className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Nome do CESOL</label>
          <div className="flex gap-4">
            <input 
              type="text" 
              disabled={!canManageCesol}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none disabled:bg-slate-50"
              value={newCesolName}
              onChange={(e) => setNewCesolName(e.target.value)}
              placeholder="Ex: CESOL Litoral Sul"
            />
            {canManageCesol && (
                <button 
                onClick={handleSaveCesolName}
                className="px-6 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2"
                >
                <Save className="w-4 h-4" /> Salvar
                </button>
            )}
          </div>
        </div>
      </div>

      {/* Cadastro de Equipe */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-slate-500" />
            Gestão de Cargos e Acessos
          </h2>
          <p className="text-sm text-slate-500">Cadastre novos membros e defina suas permissões no sistema.</p>
        </div>
        
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-1 space-y-4">
             <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                    {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
                </h3>
                {allowedRoles.length === 0 && <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">Sem permissão</span>}
                {isEditing && (
                    <button type="button" onClick={handleCancelEdit} className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1">
                        <X className="w-3 h-3"/> Cancelar
                    </button>
                )}
             </div>
             
             <div className="space-y-4 opacity-100 disabled:opacity-50">
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Nome Completo</label>
                    <input 
                        required
                        disabled={allowedRoles.length === 0}
                        type="text" 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm disabled:bg-slate-50"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                    <input 
                        required
                        disabled={allowedRoles.length === 0}
                        type="email" 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm disabled:bg-slate-50"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Senha {isEditing ? '(Redefinir)' : ''}</label>
                    <input 
                        required
                        disabled={allowedRoles.length === 0}
                        type="text" 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm disabled:bg-slate-50"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Cargo / Função</label>
                    <select 
                        disabled={allowedRoles.length === 0}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm disabled:bg-slate-50"
                        value={formData.role}
                        onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                    >
                        {allowedRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>
                
                {/* Permissions Panel */}
                {canGrantPermissions && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                            <Lock className="w-3 h-3"/> Permissões Extras
                        </h4>
                        <div className="space-y-2">
                            {AVAILABLE_PERMISSIONS.map(perm => (
                                <button
                                    key={perm.id}
                                    type="button"
                                    onClick={() => togglePermission(perm.view)}
                                    className="w-full flex items-center gap-2 text-xs text-left text-slate-700 hover:text-slate-900"
                                >
                                    {formData.permissions?.includes(perm.view) ? (
                                        <CheckSquare className="w-4 h-4 text-brand-600" />
                                    ) : (
                                        <Square className="w-4 h-4 text-slate-300" />
                                    )}
                                    {perm.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                <button 
                    type="submit" 
                    disabled={allowedRoles.length === 0}
                    className={`w-full py-2.5 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${isEditing ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-brand-600 hover:bg-brand-700 text-white'}`}
                >
                    {isEditing ? <Save className="w-4 h-4"/> : <Plus className="w-4 h-4" />} 
                    {isEditing ? 'Salvar Alterações' : 'Adicionar Membro'}
                </button>
             </div>
          </form>

          {/* List */}
          <div className="lg:col-span-2 border-l border-slate-100 pl-8">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Equipe Atual ({users.length})</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-brand-200 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm overflow-hidden">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : (user.role === UserRole.PRESIDENTE ? <Shield className="w-5 h-5 text-purple-600"/> : <UserIcon className="w-5 h-5"/>)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{user.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-slate-500">{user.email}</p>
                        <span className={`text-[10px] px-2 py-0 rounded-full border font-semibold ${getRoleBadge(user.role)}`}>
                            {user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onViewProfile(user)}
                        title="Ver Perfil"
                        className="flex items-center justify-center w-8 h-8 text-slate-500 hover:text-brand-600 bg-white border border-slate-200 rounded-lg hover:border-brand-300 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {canManageUsers && (
                          <>
                             <button 
                                onClick={() => handleEditClick(user)}
                                title="Editar Usuário"
                                className="flex items-center justify-center w-8 h-8 text-slate-500 hover:text-amber-600 bg-white border border-slate-200 rounded-lg hover:border-amber-300 transition-all"
                             >
                                <Pencil className="w-4 h-4" />
                             </button>
                             <button 
                                onClick={() => onDeleteUser(user.id)}
                                title="Excluir Usuário"
                                className="flex items-center justify-center w-8 h-8 text-slate-500 hover:text-red-600 bg-white border border-slate-200 rounded-lg hover:border-red-300 transition-all"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};