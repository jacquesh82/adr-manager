import React from 'react';
import { GitBranch, GitCommit, Download, RefreshCw, ExternalLink } from 'lucide-react';

interface GitStatusProps {
  gitStatus: any;
  onRefresh: () => void;
  onExport: () => void;
}

export const GitStatus: React.FC<GitStatusProps> = ({ gitStatus, onRefresh, onExport }) => {
  if (!gitStatus) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <GitBranch className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900">Statut Git</h3>
        </div>
        <p className="text-slate-500">Chargement du statut Git...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <GitBranch className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900">GitLab Status</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Actualiser"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={onExport}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Projet GitLab */}
      {gitStatus.project && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-slate-900">{gitStatus.project.name}</h4>
              <p className="text-sm text-slate-600">{gitStatus.project.path_with_namespace}</p>
            </div>
            <a
              href={gitStatus.project.web_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
              title="Voir sur GitLab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Total des commits</span>
            <span className="text-sm font-bold text-slate-900">{gitStatus.totalCommits}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Branche</span>
            <span className="text-sm font-bold text-green-600">{gitStatus.branch || 'main'}</span>
          </div>
        </div>

        {gitStatus.lastCommit && (
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-slate-600 block mb-1">Dernier commit</span>
              <div className="flex items-center space-x-2">
                <GitCommit className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-700 truncate">
                  {gitStatus.lastCommit.message}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                par {gitStatus.lastCommit.author_name} • {' '}
                {new Date(gitStatus.lastCommit.committed_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Connecté à GitLab et synchronisé</span>
        </div>
      </div>
    </div>
  );
};