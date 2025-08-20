import axios, { AxiosInstance } from 'axios';
import { authService } from './authService';
import { GitLabProject } from '../types/auth';
import { ADR } from '../types/adr';

class GitLabService {
  private api: AxiosInstance;
  private readonly GITLAB_URL = process.env.VITE_GITLAB_URL || 'https://gitlab.com';
  private projectId: string = '';

  constructor() {
    this.api = axios.create({
      baseURL: `${this.GITLAB_URL}/api/v4`,
      timeout: 10000,
    });

    // Intercepteur pour ajouter le token d'authentification
    this.api.interceptors.request.use((config) => {
      const token = authService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Intercepteur pour gérer l'expiration du token
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          try {
            await authService.refreshToken();
            return this.api.request(error.config);
          } catch {
            authService.logout();
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setProjectId(projectId: string): void {
    this.projectId = projectId;
  }

  getProjectId(): string {
    return this.projectId;
  }

  async getProjects(): Promise<GitLabProject[]> {
    try {
      const response = await this.api.get('/projects?membership=true&simple=true');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
      throw error;
    }
  }

  async getProject(projectId?: string): Promise<GitLabProject> {
    const id = projectId || this.projectId;
    if (!id) {
      throw new Error('Aucun projet configuré');
    }
    
    try {
      const response = await this.api.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du projet:', error);
      throw error;
    }
  }

  async getRepositoryFiles(projectId?: string, path: string = 'adrs'): Promise<any[]> {
    const id = projectId || this.projectId;
    if (!id) {
      throw new Error('Aucun projet configuré');
    }
    
    try {
      const response = await this.api.get(`/projects/${id}/repository/tree`, {
        params: { path, recursive: false }
      });
      return response.data.filter((file: any) => file.type === 'blob' && file.name.endsWith('.json'));
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers:', error);
      return [];
    }
  }

  async getFileContent(projectId: string, filePath: string, branch: string = 'main'): Promise<string> {
    try {
      const response = await this.api.get(`/projects/${projectId}/repository/files/${encodeURIComponent(filePath)}`, {
        params: { ref: branch }
      });
      return atob(response.data.content);
    } catch (error) {
      console.error('Erreur lors de la récupération du contenu du fichier:', error);
      throw error;
    }
  }

  async createFile(
    projectId: string,
    filePath: string,
    content: string,
    commitMessage: string,
    branch: string = 'main'
  ): Promise<void> {
    try {
      await this.api.post(`/projects/${projectId}/repository/files/${encodeURIComponent(filePath)}`, {
        branch,
        content: btoa(content),
        commit_message: commitMessage,
        encoding: 'base64'
      });
    } catch (error) {
      console.error('Erreur lors de la création du fichier:', error);
      throw error;
    }
  }

  async updateFile(
    projectId: string,
    filePath: string,
    content: string,
    commitMessage: string,
    branch: string = 'main'
  ): Promise<void> {
    try {
      await this.api.put(`/projects/${projectId}/repository/files/${encodeURIComponent(filePath)}`, {
        branch,
        content: btoa(content),
        commit_message: commitMessage,
        encoding: 'base64'
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du fichier:', error);
      throw error;
    }
  }

  async deleteFile(
    projectId: string,
    filePath: string,
    commitMessage: string,
    branch: string = 'main'
  ): Promise<void> {
    try {
      await this.api.delete(`/projects/${projectId}/repository/files/${encodeURIComponent(filePath)}`, {
        data: {
          branch,
          commit_message: commitMessage
        }
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      throw error;
    }
  }

  async getCommits(projectId?: string, filePath?: string, branch: string = 'main'): Promise<any[]> {
    const id = projectId || this.projectId;
    if (!id) {
      throw new Error('Aucun projet configuré');
    }
    
    try {
      const params: any = { ref_name: branch, per_page: 100 };
      if (filePath) {
        params.path = filePath;
      }

      const response = await this.api.get(`/projects/${id}/repository/commits`, { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des commits:', error);
      return [];
    }
  }

  async getCommitDiff(projectId: string, commitSha: string): Promise<any[]> {
    try {
      const response = await this.api.get(`/projects/${projectId}/repository/commits/${commitSha}/diff`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du diff:', error);
      return [];
    }
  }

  async loadADRs(projectId: string, adrPath: string = 'adrs', branch: string = 'main'): Promise<ADR[]> {
    try {
      const files = await this.getRepositoryFiles(projectId, adrPath);
      const adrs: ADR[] = [];

      for (const file of files) {
        try {
          const content = await this.getFileContent(projectId, `${adrPath}/${file.name}`, branch);
          const adr = JSON.parse(content);
          adrs.push(adr);
        } catch (error) {
          console.warn(`Erreur lors du chargement de ${file.name}:`, error);
        }
      }

      return adrs;
    } catch (error) {
      console.error('Erreur lors du chargement des ADR:', error);
      return [];
    }
  }

  async saveADR(adr: ADR, projectId: string, adrPath: string = 'adrs', branch: string = 'main', isNew: boolean = false): Promise<void> {
    const filePath = `${adrPath}/${adr.id}.json`;
    const content = JSON.stringify(adr, null, 2);
    const action = isNew ? 'CREATE' : 'UPDATE';
    const commitMessage = `ADR-${adr.id}: ${action} ${adr.title}`;

    try {
      if (isNew) {
        await this.createFile(projectId, filePath, content, commitMessage, branch);
      } else {
        await this.updateFile(projectId, filePath, content, commitMessage, branch);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'ADR:', error);
      throw error;
    }
  }

  async deleteADR(adrId: string, projectId: string, adrPath: string = 'adrs', branch: string = 'main'): Promise<void> {
    const filePath = `${adrPath}/${adrId}.json`;
    const commitMessage = `ADR-${adrId}: DELETE ADR`;

    try {
      await this.deleteFile(projectId, filePath, commitMessage, branch);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'ADR:', error);
      throw error;
    }
  }

  async getADRHistory(adrId: string, projectId: string, adrPath: string = 'adrs', branch: string = 'main'): Promise<any[]> {
    const filePath = `${adrPath}/${adrId}.json`;
    
    try {
      const commits = await this.getCommits(projectId, filePath, branch);
      const history = [];

      for (const commit of commits) {
        try {
          // Récupérer le contenu du fichier à ce commit
          const response = await this.api.get(
            `/projects/${projectId}/repository/files/${encodeURIComponent(filePath)}`,
            { params: { ref: commit.id } }
          );
          
          const content = atob(response.data.content);
          const adrData = JSON.parse(content);

          history.push({
            commit: commit.id,
            date: commit.committed_date,
            author: commit.author_name,
            message: commit.message,
            adrData
          });
        } catch (error) {
          console.warn(`Impossible de récupérer le contenu pour le commit ${commit.id}`);
        }
      }

      return history;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      return [];
    }
  }

  async getRepositoryStatus(projectId?: string, branch: string = 'main'): Promise<any> {
    const id = projectId || this.projectId;
    if (!id) {
      return null;
    }
    
    try {
      const commits = await this.getCommits(id, undefined, branch);
      const project = await this.getProject(id);

      return {
        totalCommits: commits.length,
        lastCommit: commits[0] || null,
        project: project,
        branch: branch
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du statut:', error);
      return null;
    }
  }

  async exportRepository(projectId: string, adrPath: string = 'adrs', branch: string = 'main'): Promise<string> {
    try {
      const adrs = await this.loadADRs(projectId, adrPath, branch);
      const status = await this.getRepositoryStatus(projectId, branch);

      const exportData = {
        timestamp: new Date().toISOString(),
        repository: {
          adrs,
          commits: status?.totalCommits || 0,
          lastCommit: status?.lastCommit || null,
          project: status?.project || null
        }
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      throw error;
    }
  }
}

export const gitlabService = new GitLabService();