export interface SAMLConfig {
  applicationId: string;
  secret: string;
  callbackUrl: string;
  entryPoint: string;
  issuer: string;
  cert?: string;
  signatureAlgorithm: string;
  digestAlgorithm: string;
}

export const samlConfig: SAMLConfig = {
  // Application OAuth credentials
  applicationId: '',
  secret: 'gloas-',
  
  // Callback URL for SAML response
  callbackUrl: '',
  
  // GitLab.com SAML endpoints
  entryPoint: 'https://gitlab.com/oauth/authorize',
  issuer: 'adr-manager',
  
  // Security settings
  signatureAlgorithm: 'sha256',
  digestAlgorithm: 'sha256',
};

// OAuth 2.0 configuration for GitLab
export const oauthConfig = {
  clientId: samlConfig.applicationId,
  clientSecret: samlConfig.secret,
  redirectUri: samlConfig.callbackUrl,
  scope: 'api read_user read_repository write_repository',
  responseType: 'code',
  grantType: 'authorization_code',
};

// GitLab API configuration
export const gitlabApiConfig = {
  baseUrl: 'https://gitlab.com/api/v4',
  oauthUrl: 'https://gitlab.com/oauth',
  timeout: 10000,
};

// Configuration par défaut pour les Personal Access Tokens
export const defaultPATConfig = {
  // Token par défaut pour les tests (à remplacer par le token utilisateur)
  defaultToken: 'glpat-',
  scopes: ['api', 'read_user', 'read_repository', 'write_repository'],
  expiryDays: 30,
};