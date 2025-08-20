import git from 'isomorphic-git';
import { ADR } from '../types/adr';

// Configuration Git
const GIT_CONFIG = {
  author: {
    name: 'ADR Manager',
    email: 'adr@example.com'
  },
  dir: '/adr-repo',
  fs: {} as any // Will be set dynamically
};

// Interface pour le système de fichiers en mémoire
interface MemoryFS {
  [path: string]: string | Uint8Array;
}

class GitService {
  private fs: MemoryFS = {};
  private initialized = false;

  constructor() {
    // Simuler un système de fichiers en mémoire pour isomorphic-git
    GIT_CONFIG.fs = {
      promises: {
        readFile: async (path: string) => {
          const content = this.fs[path];
          if (content === undefined) {
            throw new Error(`File not found: ${path}`);
          }
          return typeof content === 'string' ? new TextEncoder().encode(content) : content;
        },
        writeFile: async (path: string, data: Uint8Array | string) => {
          this.fs[path] = data;
        },
        unlink: async (path: string) => {
          delete this.fs[path];
        },
        readdir: async (path: string) => {
          const entries = Object.keys(this.fs)
            .filter(p => p.startsWith(path) && p !== path)
            .map(p => p.substring(path.length + 1))
            .filter(p => !p.includes('/'))
            .filter((p, i, arr) => arr.indexOf(p) === i);
          return entries;
        },
        mkdir: async (path: string) => {
          // Créer un dossier virtuel
          this.fs[path] = '';
        },
        rmdir: async (path: string) => {
          Object.keys(this.fs)
            .filter(p => p.startsWith(path))
            .forEach(p => delete this.fs[p]);
        },
        stat: async (path: string) => {
          if (this.fs[path] === undefined) {
            throw new Error(`File not found: ${path}`);
          }
          return {
            isFile: () => path.includes('.'),
            isDirectory: () => !path.includes('.'),
            size: typeof this.fs[path] === 'string' 
              ? this.fs[path].length 
              : (this.fs[path] as Uint8Array).length
          };
        },
        lstat: async (path: string) => {
          return this.fs[path] ? { isFile: () => true, isDirectory: () => false } : null;
        }
      }
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialiser le repository Git
      await git.init({ 
        ...GIT_CONFIG,
        defaultBranch: 'main'
      });

      // Créer le dossier ADR
      await GIT_CONFIG.fs.promises.mkdir('/adr-repo/adrs');

      // Créer un README initial
      const readmeContent = `# Architecture Decision Records

Ce repository contient les ADR (Architecture Decision Records) du projet.

## Structure

- \`adrs/\` : Contient tous les fichiers ADR au format JSON
- Chaque ADR est versionné avec Git pour un historique complet
- Les commits suivent le format : "ADR-XXX: [action] titre"

## Utilisation

Utilisez l'interface ADR Manager pour créer, modifier et consulter les ADR.
`;

      await GIT_CONFIG.fs.promises.writeFile('/adr-repo/README.md', readmeContent);

      // Premier commit
      await git.add({ 
        ...GIT_CONFIG, 
        filepath: 'README.md' 
      });

      await git.commit({
        ...GIT_CONFIG,
        message: 'Initial commit: Setup ADR repository',
        author: GIT_CONFIG.author
      });

      this.initialized = true;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation Git:', error);
      throw error;
    }
  }

  async saveADR(adr: ADR, isNew: boolean = false): Promise<void> {
    await this.initialize();

    const filename = `adrs/${adr.id}.json`;
    const content = JSON.stringify(adr, null, 2);

    try {
      // Écrire le fichier
      await GIT_CONFIG.fs.promises.writeFile(`/adr-repo/${filename}`, content);

      // Ajouter au staging
      await git.add({ 
        ...GIT_CONFIG, 
        filepath: filename 
      });

      // Créer le commit
      const action = isNew ? 'CREATE' : 'UPDATE';
      const message = `ADR-${adr.id.split('-')[1]}: ${action} ${adr.title}`;

      await git.commit({
        ...GIT_CONFIG,
        message,
        author: {
          name: adr.author,
          email: `${adr.author.toLowerCase().replace(' ', '.')}@example.com`
        }
      });

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }
  }

  async loadADRs(): Promise<ADR[]> {
    await this.initialize();

    try {
      const files = await GIT_CONFIG.fs.promises.readdir('/adr-repo/adrs');
      const adrs: ADR[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const content = await GIT_CONFIG.fs.promises.readFile(`/adr-repo/adrs/${file}`);
            const adrData = JSON.parse(new TextDecoder().decode(content as Uint8Array));
            adrs.push(adrData);
          } catch (error) {
            console.warn(`Erreur lors du chargement de ${file}:`, error);
          }
        }
      }

      return adrs;
    } catch (error) {
      console.error('Erreur lors du chargement des ADR:', error);
      return [];
    }
  }

  async deleteADR(adrId: string): Promise<void> {
    await this.initialize();

    const filename = `adrs/${adrId}.json`;

    try {
      // Supprimer le fichier
      await GIT_CONFIG.fs.promises.unlink(`/adr-repo/${filename}`);

      // Ajouter la suppression au staging
      await git.remove({ 
        ...GIT_CONFIG, 
        filepath: filename 
      });

      // Créer le commit
      const message = `ADR-${adrId.split('-')[1]}: DELETE ADR`;

      await git.commit({
        ...GIT_CONFIG,
        message,
        author: GIT_CONFIG.author
      });

    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
    }
  }

  async getADRHistory(adrId: string): Promise<any[]> {
    await this.initialize();

    const filename = `adrs/${adrId}.json`;

    try {
      // Récupérer l'historique des commits pour ce fichier
      const commits = await git.log({
        ...GIT_CONFIG,
        filepath: filename
      });

      const history = [];

      for (const commit of commits) {
        try {
          // Récupérer le contenu du fichier à ce commit
          const { blob } = await git.readBlob({
            ...GIT_CONFIG,
            oid: commit.oid,
            filepath: filename
          });

          const content = new TextDecoder().decode(blob);
          const adrData = JSON.parse(content);

          history.push({
            commit: commit.oid,
            date: new Date(commit.commit.author.timestamp * 1000).toISOString(),
            author: commit.commit.author.name,
            message: commit.commit.message,
            adrData
          });
        } catch (error) {
          // Le fichier n'existait peut-être pas à ce commit
          console.warn(`Impossible de récupérer le contenu pour le commit ${commit.oid}`);
        }
      }

      return history;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      return [];
    }
  }

  async getRepositoryStatus(): Promise<any> {
    await this.initialize();

    try {
      const status = await git.statusMatrix({ ...GIT_CONFIG });
      const commits = await git.log({ ...GIT_CONFIG });

      return {
        totalCommits: commits.length,
        lastCommit: commits[0] || null,
        status: status.map(([filepath, head, workdir, stage]) => ({
          filepath,
          head,
          workdir,
          stage
        }))
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du statut:', error);
      return null;
    }
  }

  async exportRepository(): Promise<string> {
    await this.initialize();

    try {
      // Créer un export JSON de tout le repository
      const adrs = await this.loadADRs();
      const status = await this.getRepositoryStatus();

      const exportData = {
        timestamp: new Date().toISOString(),
        repository: {
          adrs,
          commits: status?.totalCommits || 0,
          lastCommit: status?.lastCommit || null
        }
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      throw error;
    }
  }
}

export const gitService = new GitService();