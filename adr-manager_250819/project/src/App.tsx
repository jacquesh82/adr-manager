import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './components/LoginPage';
import { AuthCallback } from './components/AuthCallback';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ADRList } from './components/ADRList';
import { ADRForm } from './components/ADRForm';
import { ADRView } from './components/ADRView';
import { SearchView } from './components/SearchView';
import { ADRHistoryView } from './components/ADRHistoryView';
import { GitStatus } from './components/GitStatus';
import { ConfigPage } from './components/ConfigPage';
import { useADRs } from './hooks/useADRs';
import { useConfig } from './hooks/useConfig';
import { ADR } from './types/adr';

// Détection de la route de callback
const isCallbackRoute = window.location.pathname === '/auth/callback';

type View = 'dashboard' | 'list' | 'search' | 'create' | 'edit' | 'view' | 'history' | 'git' | 'git-history' | 'config';

function App() {
  const { isAuthenticated, loading: authLoading, error: authError, login, loginWithPAT, handleCallback } = useAuth();
  const { config, isConfigured, updateConfig } = useConfig();
  const { 
    adrs, 
    loading, 
    configError,
    gitStatus,
    createADR, 
    updateADR, 
    deleteADR, 
    getADRHistory,
    exportRepository,
    filterADRs,
    refreshGitStatus
  } = useADRs();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedADR, setSelectedADR] = useState<ADR | null>(null);

  // Rediriger vers la configuration si pas configuré
  React.useEffect(() => {
    if (isAuthenticated && !isConfigured && currentView !== 'config') {
      setCurrentView('config');
    }
  }, [isAuthenticated, isConfigured, currentView]);

  // Gestion du callback SAML
  if (isCallbackRoute) {
    return <AuthCallback onCallback={handleCallback} />;
  }

  // Page de connexion si non authentifié
  if (!isAuthenticated) {
    return (
      <LoginPage 
        onLogin={login}
        onLoginWithPAT={loginWithPAT}
        loading={authLoading}
        error={authError}
      />
    );
  }

  const handleCreateADR = async (adrData: any) => {
    await createADR(adrData);
    setCurrentView('list');
  };

  const handleUpdateADR = async (adrData: any, changeDescription: string) => {
    if (selectedADR) {
      await updateADR(selectedADR.id, adrData, changeDescription);
      setCurrentView('view');
    }
  };

  const handleViewADR = (adr: ADR) => {
    setSelectedADR(adr);
    setCurrentView('view');
  };

  const handleEditADR = (adr: ADR) => {
    setSelectedADR(adr);
    setCurrentView('edit');
  };

  const handleViewGitHistory = (adr: ADR) => {
    setSelectedADR(adr);
    setCurrentView('git-history');
  };

  const handleDeleteADR = async (id: string) => {
    await deleteADR(id);
    if (selectedADR?.id === id) {
      setSelectedADR(null);
      setCurrentView('list');
    }
  };

  const handleExportRepository = async () => {
    try {
      const exportData = await exportRepository();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `adr-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export du repository');
    }
  };

  const handleNavigation = (view: string) => {
    setCurrentView(view as View);
    if (view !== 'edit' && view !== 'view' && view !== 'git-history') {
      setSelectedADR(null);
    }
  };

  const handleConfigSaved = (newConfig: any) => {
    updateConfig(newConfig);
    setCurrentView('dashboard');
    // Recharger les ADRs avec la nouvelle configuration
    window.location.reload();
  };

  const renderContent = () => {
    // Afficher la configuration si pas configuré
    if (!isConfigured && currentView !== 'config') {
      return (
        <ConfigPage onConfigSaved={handleConfigSaved} />
      );
    }

    // Afficher l'erreur de configuration
    if (configError && currentView !== 'config') {
      return (
        <div className="text-center py-12">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 max-w-md mx-auto">
            <Settings className="w-12 h-12 mx-auto mb-4 text-orange-600" />
            <h3 className="text-lg font-semibold text-orange-900 mb-2">Configuration requise</h3>
            <p className="text-orange-800 mb-4">{configError}</p>
            <button
              onClick={() => setCurrentView('config')}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Configurer maintenant
            </button>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading...</div>
        </div>
      );
    }

    switch (currentView) {
      case 'config':
        return (
          <ConfigPage onConfigSaved={handleConfigSaved} />
        );
        
      case 'dashboard':
        return (
          <Dashboard 
            adrs={adrs} 
            gitStatus={gitStatus}
            onRefreshGitStatus={refreshGitStatus}
            onExportRepository={exportRepository}
          />
        );
      
      case 'list':
        return (
          <ADRList
            adrs={adrs}
            onViewADR={handleViewADR}
            onEditADR={handleEditADR}
            onDeleteADR={handleDeleteADR}
          />
        );
      
      case 'search':
        return (
          <SearchView
            adrs={adrs}
            onViewADR={handleViewADR}
            onEditADR={handleEditADR}
            onDeleteADR={handleDeleteADR}
            onFilter={filterADRs}
          />
        );
      
      case 'create':
        return (
          <ADRForm
            onSave={handleCreateADR}
            onCancel={() => setCurrentView('list')}
          />
        );
      
      case 'edit':
        return (
          <ADRForm
            adr={selectedADR}
            onSave={handleUpdateADR}
            onCancel={() => setCurrentView('view')}
          />
        );
      
      case 'view':
        return selectedADR ? (
          <ADRView
            adr={selectedADR}
            onBack={() => setCurrentView('list')}
            onEdit={handleEditADR}
            onViewGitHistory={handleViewGitHistory}
          />
        ) : (
          <div className="text-center text-slate-500">
            No ADR selected
          </div>
        );
      
      case 'git':
        return (
          <GitStatus
            gitStatus={gitStatus}
            onRefresh={refreshGitStatus}
            onExport={handleExportRepository}
          />
        );

      case 'git-history':
        return selectedADR ? (
          <ADRHistoryView
            adr={selectedADR}
            onBack={() => setCurrentView('view')}
            onGetHistory={getADRHistory}
          />
        ) : (
          <div className="text-center text-slate-500">
            No ADR selected
          </div>
        );

      default:
        return (
          <Dashboard 
            adrs={adrs} 
            gitStatus={gitStatus}
            onRefreshGitStatus={refreshGitStatus}
            onExportRepository={exportRepository}
          />
        );
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={handleNavigation}>
      {renderContent()}
    </Layout>
  );
}

export default App;