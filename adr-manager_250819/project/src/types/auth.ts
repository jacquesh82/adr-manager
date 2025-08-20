export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar_url?: string;
  gitlab_id: number;
  access_token: string;
}

export interface SAMLConfig {
  entryPoint: string;
  issuer: string;
  callbackUrl: string;
  cert: string;
}

export interface GitLabProject {
  id: number;
  name: string;
  path_with_namespace: string;
  web_url: string;
  default_branch: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}