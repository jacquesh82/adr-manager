import { AppConfig, defaultConfig, GitLabConfig } from '../types/config';

class ConfigService {
  private readonly CONFIG_KEY = 'adr_app_config';

  getConfig(): AppConfig {
    try {
      const stored = localStorage.getItem(this.CONFIG_KEY);
      if (stored) {
        return { ...defaultConfig, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
    }
    return defaultConfig;
  }

  saveConfig(config: AppConfig): void {
    try {
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration:', error);
    }
  }

  updateGitLabConfig(gitlabConfig: Partial<GitLabConfig>): AppConfig {
    const currentConfig = this.getConfig();
    const updatedConfig: AppConfig = {
      ...currentConfig,
      gitlab: { ...currentConfig.gitlab, ...gitlabConfig },
      initialized: true
    };
    this.saveConfig(updatedConfig);
    return updatedConfig;
  }

  resetConfig(): void {
    localStorage.removeItem(this.CONFIG_KEY);
  }

  isConfigured(): boolean {
    const config = this.getConfig();
    return config.initialized && !!config.gitlab.projectId;
  }
}

export const configService = new ConfigService();