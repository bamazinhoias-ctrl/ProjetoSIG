import React, { useState } from 'react';
import { Layers, Lock, Mail, ArrowRight, CheckCircle, AlertCircle, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
  cesolName: string;
}

export const Login: React.FC<LoginProps> = ({ users, onLogin, cesolName }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API authentication delay
    setTimeout(() => {
      const user = users.find(u => 
        u.email.toLowerCase().trim() === email.toLowerCase().trim() && 
        u.password === password
      );
      
      if (user) {
        setLoading(false);
        onLogin(user);
      } else {
        setLoading(false);
        setError('Credenciais inválidas. Verifique e tente novamente.');
      }
    }, 1000);
  };

  const handleDemoLogin = (role: string) => {
      if (role === 'admin') {
          setEmail('admin@cesol.ba.gov.br');
          setPassword('123456');
      } else if (role === 'aux') {
          setEmail('aux@cesol.ba.gov.br');
          setPassword('123');
      } else if (role === 'asp') {
          setEmail('joao.asp@cesol.ba.gov.br');
          setPassword('123');
      }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header / Brand */}
        <div className="bg-slate-900 p-8 flex flex-col items-center justify-center relative overflow-hidden">
          {/* New Brand Gradient Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-600 via-brand-400 to-brand-600"></div>
          
          <div className="relative flex items-center justify-center mb-4 z-10">
             {/* Glow effect behind logo */}
             <div className="absolute inset-0 bg-brand-500 rounded-xl blur-lg opacity-20 animate-pulse"></div>
             {/* Icon Container */}
             <div className="relative p-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 shadow-xl">
                <Layers className="w-8 h-8 text-brand-500" />
             </div>
          </div>
          
          <div className="flex flex-col items-center animate-fade-in select-none relative z-10">
               <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black tracking-tight text-white">SIG</span>
                  <span className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600 drop-shadow-sm">CESOL</span>
               </div>
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] leading-none mt-1">
                 Gestão Integrada
               </span>
               <div className="mt-3 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
                  <p className="text-slate-300 text-xs font-medium">{cesolName}</p>
               </div>
          </div>
          
          {/* Decorative circles updated to warm tones */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-brand-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-brand-400/10 rounded-full blur-3xl"></div>
        </div>

        {/* Form */}
        <div className="p-8">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-semibold text-slate-800">Acesso Restrito</h2>
            <p className="text-sm text-slate-500">Entre com suas credenciais institucionais</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Email Corporativo</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-all outline-none"
                  placeholder="usuario@cesol.ba.gov.br"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Senha</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 animate-fade-in">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Autenticando...
                </>
              ) : (
                <>
                  Entrar no Sistema <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-3">Acesso Rápido (Demo)</p>
             <div className="grid grid-cols-1 gap-2">
                 <button 
                    onClick={() => handleDemoLogin('admin')}
                    className="flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition-colors text-left group"
                 >
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs group-hover:bg-purple-200">P</div>
                        <div>
                            <p className="text-xs font-bold text-slate-700">Presidente</p>
                            <p className="text-[10px] text-slate-500">Gestão Completa</p>
                        </div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-brand-500"/>
                 </button>

                 <button 
                    onClick={() => handleDemoLogin('aux')}
                    className="flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition-colors text-left group"
                 >
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs group-hover:bg-indigo-200">A</div>
                        <div>
                            <p className="text-xs font-bold text-slate-700">Aux. Administrativo</p>
                            <p className="text-[10px] text-slate-500">Empreendimentos & Agenda</p>
                        </div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-brand-500"/>
                 </button>

                 <button 
                    onClick={() => handleDemoLogin('asp')}
                    className="flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition-colors text-left group"
                 >
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs group-hover:bg-orange-200">T</div>
                        <div>
                            <p className="text-xs font-bold text-slate-700">Técnico (ASP)</p>
                            <p className="text-[10px] text-slate-500">Campo & Fomento</p>
                        </div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-brand-500"/>
                 </button>
             </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Ambiente Seguro
            </div>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-400">v2.1.0</span>
        </div>
      </div>
    </div>
  );
};