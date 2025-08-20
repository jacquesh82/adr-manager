export interface GitLabConfig {
  projectId: string;
  projectName: string;
  projectPath: string;
  adrPath: string;
  branch: string;
}

export interface AppConfig {
  gitlab: GitLabConfig;
  initialized: boolean;
}

export const defaultConfig: AppConfig = {
  gitlab: {
    projectId: '',
    projectName: '',
    projectPath: '',
    adrPath: 'adrs',
    branch: 'main'
  },
  initialized: false
};