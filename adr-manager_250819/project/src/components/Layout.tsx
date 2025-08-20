import React from 'react';
import { FileText, Search, Plus, BarChart3, Archive, GitBranch, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useConfig } from '../hooks/useConfig';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const { user, logout } = useAuth();
  const { isConfigured } = useConfig();
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'list', label: 'ADR List', icon: FileText },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'create', label: 'Create ADR', icon: Plus },
    { id: 'history', label: 'History', icon: Archive },
    { id: 'git', label: 'Git Status', icon: GitBranch },
    { id: 'config', label: 'Configuration', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm border-r border-slate-200 min-h-screen">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">ADR Manager</h1>
                <p className="text-sm text-slate-500">GitLab Integration</p>
              </div>
            </div>
          </div>
          
          <nav className="p-4 space-y-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isDisabled = !isConfigured && item.id !== 'config';
              
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  disabled={isDisabled}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    currentView === item.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : isDisabled
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isDisabled && item.id !== 'config' && (
                    <span className="ml-auto text-xs text-slate-400">Config requise</span>
                  )}
                </button>
              );
            })}
          </nav>
          
          {/* Alerte de configuration */}
          {!isConfigured && (
            <div className="p-4 mx-4 mb-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-orange-600" />
                <p className="text-sm text-orange-800 font-medium">⚠️ Configuration requise</p>
              </div>
              <p className="text-xs text-orange-700 mt-1">
                Configurez votre projet GitLab pour utiliser l'application.
              </p>
            </div>
          )}
          
          {/* User Info */}
          <div className="p-4 border-t border-slate-200 mt-auto">
            <div className="flex items-center space-x-3 mb-3">
              {user?.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">@{user?.username}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};