import React, { useEffect } from 'react';
import { FileText } from 'lucide-react';

interface AuthCallbackProps {
  onCallback: (samlResponse: string) => void;
}

export const AuthCallback: React.FC<AuthCallbackProps> = ({ onCallback }) => {
  useEffect(() => {
    // Récupérer le code OAuth et l'état depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      onCallback(code, state);
    } else {
      // Rediriger vers la page de connexion si pas de réponse SAML
      window.location.href = '/';
    }
  }, [onCallback]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Traitement de l'authentification</h1>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600">Vérification des informations OAuth...</span>
        </div>
      </div>
    </div>
  );
};