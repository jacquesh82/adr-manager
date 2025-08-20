import Cookies from 'js-cookie';
import { User, AuthState } from '../types/auth';
import { samlConfig, oauthConfig, gitlabApiConfig } from '../config/saml';
import axios from 'axios';

class AuthService {
  private readonly TOKEN_KEY = 'gitlab_token';
  private readonly USER_KEY = 'gitlab_user';
  private readonly PAT_KEY = 'gitlab_pat';

  async initiateLogin(): Promise<void> {
    // Rediriger vers l'endpoint OAuth de GitLab
    const authUrl = new URL(samlConfig.entryPoint);
    authUrl.searchParams.set('client_id', oauthConfig.clientId);
    authUrl.searchParams.set('redirect_uri', oauthConfig.redirectUri);
    authUrl.searchParams.set('response_type', oauthConfig.responseType);
    authUrl.searchParams.set('scope', oauthConfig.scope);
    authUrl.searchParams.set('state', this.generateState());
    
    // Stocker l'état pour validation
    sessionStorage.setItem('oauth_state', authUrl.searchParams.get('state')!);
    
    window.location.href = authUrl.toString();
  }

  async loginWithPAT(token: string): Promise<User> {
    try {
      // Valider le token en récupérant les informations utilisateur
      const userInfo = await this.getUserInfoWithPAT(token);
      
      const user: User = {
        id: userInfo.id.toString(),
        email: userInfo.email,
        name: userInfo.name,
        username: userInfo.username,
        avatar_url: userInfo.avatar_url,
        gitlab_id: userInfo.id,
        access_token: token,
      };

      this.setUser(user);
      this.setPAT(token);
      return user;
    } catch (error) {
      console.error('Erreur lors de l\'authentification avec PAT:', error);
      throw new Error('Token d\'accès personnel invalide');
    }
  }

  private async getUserInfoWithPAT(token: string): Promise<any> {
    const response = await axios.get(`${gitlabApiConfig.baseUrl}/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      timeout: gitlabApiConfig.timeout,
    });
    
    if (response.status !== 200) {
      throw new Error('Token invalide ou expiré');
    }
    
    return response.data;
  }
  private generateState(): string {
    return btoa(JSON.stringify({
      timestamp: Date.now(),
      random: Math.random().toString(36).substr(2, 9),
      origin: window.location.origin
    }));
  }

  async handleCallback(code: string, state: string): Promise<User> {
    try {
      // Vérifier l'état pour prévenir les attaques CSRF
      const storedState = sessionStorage.getItem('oauth_state');
      if (!storedState || storedState !== state) {
        throw new Error('État OAuth invalide');
      }
      
      // Échanger le code contre un token d'accès
      const tokenResponse = await this.exchangeCodeForToken(code);
      const userInfo = await this.getUserInfo(tokenResponse.access_token);
      
      const user: User = {
        id: userInfo.id.toString(),
        email: userInfo.email,
        name: userInfo.name,
        username: userInfo.username,
        avatar_url: userInfo.avatar_url,
        gitlab_id: userInfo.id,
        access_token: tokenResponse.access_token,
      };

      this.setUser(user);
      sessionStorage.removeItem('oauth_state');
      return user;
    } catch (error) {
      console.error('Erreur lors du traitement du callback OAuth:', error);
      throw new Error('Échec de l\'authentification OAuth');
    }
  }

  private async exchangeCodeForToken(code: string): Promise<any> {
    const response = await fetch(`${gitlabApiConfig.oauthUrl}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: oauthConfig.clientId,
        client_secret: oauthConfig.clientSecret,
        code: code,
        grant_type: oauthConfig.grantType,
        redirect_uri: oauthConfig.redirectUri,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Échec de l\'échange du code OAuth');
    }
    
    return response.json();
  }

  private async getUserInfo(accessToken: string): Promise<any> {
    const response = await fetch(`${gitlabApiConfig.baseUrl}/user`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Échec de la récupération des informations utilisateur');
    }
    
    return response.json();
  }

  setPAT(token: string): void {
    Cookies.set(this.PAT_KEY, token, { expires: 30 }); // 30 jours pour les PAT
  }

  getPAT(): string | null {
    return Cookies.get(this.PAT_KEY) || null;
  }

  setUser(user: User): void {
    Cookies.set(this.TOKEN_KEY, user.access_token, { expires: 7 });
    Cookies.set(this.USER_KEY, JSON.stringify(user), { expires: 7 });
  }

  getUser(): User | null {
    try {
      const userStr = Cookies.get(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return Cookies.get(this.TOKEN_KEY) || null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }

  logout(): void {
    Cookies.remove(this.TOKEN_KEY);
    Cookies.remove(this.USER_KEY);
    Cookies.remove(this.PAT_KEY);
    window.location.href = '/';
  }

  async refreshToken(): Promise<void> {
    const user = this.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    try {
      const response = await fetch(`${gitlabApiConfig.oauthUrl}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: oauthConfig.clientId,
          client_secret: oauthConfig.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: user.access_token, // En réalité, il faudrait stocker le refresh_token séparément
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedUser = { ...user, access_token: data.access_token };
        this.setUser(updatedUser);
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      this.logout();
    }
  }
}

export const authService = new AuthService();