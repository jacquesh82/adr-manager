import React, { useState, useEffect } from 'react';
import { History, GitCommit, User, Calendar, ArrowLeft, Eye } from 'lucide-react';
import { ADR } from '../types/adr';

interface ADRHistoryViewProps {
  adr: ADR;
  onBack: () => void;
  onGetHistory: (adrId: string) => Promise<any[]>;
}

export const ADRHistoryView: React.FC<ADRHistoryViewProps> = ({ adr, onBack, onGetHistory }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);

  useEffect(() => {
    loadHistory();
  }, [adr.id]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const gitHistory = await onGetHistory(adr.id);
      setHistory(gitHistory);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCommitMessage = (message: string) => {
    // Extraire le type d'action du message de commit
    const match = message.match(/ADR-\d+: (\w+) (.+)/);
    if (match) {
      const [, action, title] = match;
      return { action, title };
    }
    return { action: 'UNKNOWN', title: message };
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'text-green-600 bg-green-50 border-green-200';
      case 'UPDATE': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'DELETE': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Historique Git</h1>
            <p className="text-slate-600">Chargement de l'historique...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Historique Git</h1>
          <p className="text-slate-600">ADR-{adr.id} - {adr.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline des commits */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-6">
            <History className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Commits Git</h2>
            <span className="text-sm text-slate-500">({history.length})</span>
          </div>

          {history.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <GitCommit className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>Aucun historique Git trouvé</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((commit, index) => {
                const { action, title } = formatCommitMessage(commit.message);
                const isSelected = selectedVersion?.commit === commit.commit;
                
                return (
                  <div
                    key={commit.commit}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                    onClick={() => setSelectedVersion(commit)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <GitCommit className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div className={`px-2 py-1 rounded text-xs font-medium border ${getActionColor(action)}`}>
                          {action}
                        </div>
                      </div>
                      <button
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Voir cette version"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <h4 className="font-medium text-slate-900 mb-2">{title}</h4>
                    
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{commit.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(commit.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-slate-400 font-mono">
                      {commit.commit.substring(0, 8)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Aperçu de la version sélectionnée */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            {selectedVersion ? 'Aperçu de la version' : 'Sélectionnez un commit'}
          </h2>

          {selectedVersion ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">
                  {selectedVersion.adrData.title}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-slate-500 mb-3">
                  <span>Version {selectedVersion.adrData.version}</span>
                  <span>•</span>
                  <span>Statut: {selectedVersion.adrData.status}</span>
                  <span>•</span>
                  <span>{selectedVersion.adrData.author}</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-slate-700 mb-2">Contexte</h4>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                  {selectedVersion.adrData.context.substring(0, 200)}
                  {selectedVersion.adrData.context.length > 200 && '...'}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-slate-700 mb-2">Décision</h4>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                  {selectedVersion.adrData.decision.substring(0, 200)}
                  {selectedVersion.adrData.decision.length > 200 && '...'}
                </p>
              </div>

              {selectedVersion.adrData.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedVersion.adrData.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-12">
              <GitCommit className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>Cliquez sur un commit pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};