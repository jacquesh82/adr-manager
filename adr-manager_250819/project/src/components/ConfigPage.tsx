import React, { useState, useEffect } from 'react';
import { Settings, GitBranch, FolderOpen, Save, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { GitLabProject } from '../types/auth';
import { AppConfig } from '../types/config';
import { gitlabService } from '../services/gitlabService';
import { configService } from '../services/configService';

interface ConfigPageProps {
  onConfigSaved: (config: AppConfig) => void;
}

export const ConfigPage: React.FC<ConfigPageProps> = ({ onConfigSaved }) => {
  const [config, setConfig] = useState<AppConfig>(configService.getConfig());
  const [projects, setProjects] = useState<GitLabProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const userProjects = await gitlabService.getProjects();
      setProjects(userProjects);
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (project: GitLabProject) => {
    setConfig(prev => ({
      ...prev,
      gitlab: {
        ...prev.gitlab,
        projectId: project.id.toString(),
        projectName: project.name,
        projectPath: project.path_with_namespace
      }
    }));
  };

  const handleConfigChange = (field: keyof AppConfig['gitlab'], value: string) => {
    setConfig(prev => ({
      ...prev,
      gitlab: {
        ...prev.gitlab,
        [field]: value
      }
    }));
  };

  const testConfiguration = async () => {
    try {
      setTesting(true);
      setTestResult(null);

      // Tester l'accès au projet
      const project = await gitlabService.getProject(config.gitlab.projectId);
      
      // Tester l'accès au dossier ADR
      try {
        await gitlabService.getRepositoryFiles(config.gitlab.projectId, config.gitlab.adrPath);
        setTestResult({
          success: true,
          message: `Configuration valide ! Projet "${project.name}" accessible avec le dossier "${config.gitlab.adrPath}".`
        });
      } catch (error) {
        // Le dossier n'existe pas, on peut le créer
        setTestResult({
          success: true,
          message: `Projet "${project.name}" accessible. Le dossier "${config.gitlab.adrPath}" sera créé automatiquement.`
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Erreur : ${error instanceof Error ? error.message : 'Impossible d\'accéder au projet'}`
      });
    } finally {
      setTesting(false);
    }
  };

  const saveConfiguration = () => {
    const savedConfig = configService.updateGitLabConfig(config.gitlab);
    onConfigSaved(savedConfig);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Configuration</h1>
        <p className="text-slate-600">Configurez l'emplacement de stockage des ADR sur GitLab</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6">
        {/* Sélection du projet */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-slate-700">
              Projet GitLab
            </label>
            <button
              onClick={loadProjects}
              disabled={loading}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors flex items-center space-x-1"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-4 text-slate-500">
              Chargement des projets...
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {projects.map(project => (
                <div
                  key={project.id}
                  onClick={() => handleProjectSelect(project)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    config.gitlab.projectId === project.id.toString()
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <GitBranch className="w-5 h-5 text-slate-400" />
                    <div>
                      <h4 className="font-medium text-slate-900">{project.name}</h4>
                      <p className="text-sm text-slate-600">{project.path_with_namespace}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Configuration détaillée */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ID du projet
            </label>
            <input
              type="text"
              value={config.gitlab.projectId}
              onChange={(e) => handleConfigChange('projectId', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Branche
            </label>
            <input
              type="text"
              value={config.gitlab.branch}
              onChange={(e) => handleConfigChange('branch', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="main"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Dossier des ADR
            </label>
            <div className="flex items-center space-x-2">
              <FolderOpen className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={config.gitlab.adrPath}
                onChange={(e) => handleConfigChange('adrPath', e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="adrs"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Dossier dans le projet où seront stockés les fichiers ADR
            </p>
          </div>
        </div>

        {/* Test de configuration */}
        <div className="border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Test de configuration</h3>
            <button
              onClick={testConfiguration}
              disabled={testing || !config.gitlab.projectId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {testing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Test en cours...</span>
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4" />
                  <span>Tester la configuration</span>
                </>
              )}
            </button>
          </div>

          {testResult && (
            <div className={`p-4 rounded-lg border ${
              testResult.success 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center space-x-2">
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <p className={`text-sm ${
                  testResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {testResult.message}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sauvegarde */}
        <div className="flex items-center justify-end space-x-4 border-t border-slate-200 pt-6">
          <button
            onClick={saveConfiguration}
            disabled={!config.gitlab.projectId || !testResult?.success}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Sauvegarder la configuration</span>
          </button>
        </div>
      </div>

      {/* Informations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Informations importantes</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Les ADR seront stockés dans le dossier spécifié de votre projet GitLab</li>
          <li>• Chaque ADR sera un fichier JSON avec un historique Git complet</li>
          <li>• Assurez-vous d'avoir les permissions d'écriture sur le projet</li>
          <li>• La configuration est sauvegardée localement dans votre navigateur</li>
        </ul>
      </div>
    </div>
  );
};