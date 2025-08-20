import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { AuthState, User } from '../types/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const isAuthenticated = authService.isAuthenticated();
      const user = authService.getUser();

      setAuthState({
        isAuthenticated,
        user,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: 'Erreur lors de la vérification de l\'authentification',
      });
    }
  };

  const login = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.initiateLogin();
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Erreur lors de l\'initiation de la connexion',
      }));
    }
  };

  const loginWithPAT = async (token: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const user = await authService.loginWithPAT(token);
      
      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'authentification avec le token',
      }));
    }
  };
  const handleCallback = async (code: string, state: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const user = await authService.handleCallback(code, state);
      
      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: 'Erreur lors du traitement de la réponse OAuth',
      });
    }
  };

  const logout = () => {
    authService.logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    });
  };

  const refreshAuth = () => {
    checkAuthStatus();
  };

  return {
    ...authState,
    login,
    loginWithPAT,
    logout,
    handleCallback,
    refreshAuth,
  };
};