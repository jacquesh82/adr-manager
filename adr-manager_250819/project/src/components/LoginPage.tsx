import React from 'react';
import { FileText, GitBranch, Shield, Users, Key, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
  onLoginWithPAT: (token: string) => void;
  loading: boolean;
  error: string | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onLoginWithPAT, loading, error }) => {
  const [showPATForm, setShowPATForm] = React.useState(false);
  const [patToken, setPATToken] = React.useState('');
  const [showToken, setShowToken] = React.useState(false);

  const handlePATSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (patToken.trim()) {
      onLoginWithPAT(patToken.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo et titre */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">ADR Manager</h1>
          <p className="text-slate-600">Architecture Decision Records</p>
        </div>

        {/* Carte de connexion */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Connexion requise
              </h2>
              <p className="text-slate-600 text-sm">
                Connectez-vous avec votre compte GitLab pour accéder à vos ADR
              </p>
            </div>

            {/* Fonctionnalités */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm text-slate-600">
                <GitBranch className="w-5 h-5 text-blue-500" />
                <span>Stockage et versioning Git intégré</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-slate-600">
                <Shield className="w-5 h-5 text-green-500" />
                <span>Authentification sécurisée OAuth 2.0</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-slate-600">
                <Users className="w-5 h-5 text-orange-500" />
                <span>Collaboration d'équipe</span>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {!showPATForm ? (
              <div className="space-y-4">
                {/* Bouton de connexion OAuth */}
                <button
                  onClick={onLogin}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Connexion en cours...</span>
                    </>
                  ) : (
                    <>
                      <GitBranch className="w-5 h-5" />
                      <span>Se connecter avec GitLab</span>
                    </>
                  )}
                </button>

                {/* Séparateur */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">ou</span>
                  </div>
                </div>

                {/* Bouton PAT */}
                <button
                  onClick={() => setShowPATForm(true)}
                  className="w-full bg-slate-100 text-slate-700 py-3 px-4 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <Key className="w-5 h-5" />
                  <span>Utiliser un Personal Access Token</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Formulaire PAT */}
                <form onSubmit={handlePATSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Personal Access Token GitLab
                    </label>
                    <div className="relative">
                      <input
                        type={showToken ? 'text' : 'password'}
                        value={patToken}
                        onChange={(e) => setPATToken(e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="glpat-xxxxxxxxxxxxxxxxxxxx"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Créez un PAT sur GitLab.com avec les scopes : api, read_user, read_repository, write_repository
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !patToken.trim()}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Vérification...</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-5 h-5" />
                        <span>Se connecter avec le token</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Retour */}
                <button
                  onClick={() => {
                    setShowPATForm(false);
                    setPATToken('');
                  }}
                  className="w-full text-slate-600 hover:text-slate-800 py-2 text-sm"
                >
                  ← Retour aux options de connexion
                </button>
              </div>
            )}

            <div className="text-center">
              <p className="text-xs text-slate-500">
                {showPATForm 
                  ? 'Votre token sera stocké de manière sécurisée et utilisé pour accéder à l\'API GitLab'
                  : 'Utilisez vos identifiants GitLab.com pour accéder à vos projets et gérer vos ADR'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="text-center text-sm text-slate-500">
          <p>Besoin d'aide ? Contactez votre administrateur système</p>
        </div>
      </div>
    </div>
  );
};