import { useState, useEffect } from 'react';
import { ADR, ADRVersion, ADRFilter } from '../types/adr';
import { gitlabService } from '../services/gitlabService';
import { configService } from '../services/configService';
import { useAuth } from './useAuth';


export const useADRs = () => {
  const { isAuthenticated } = useAuth();
  const [adrs, setADRs] = useState<ADR[]>([]);
  const [loading, setLoading] = useState(true);
  const [gitStatus, setGitStatus] = useState<any>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const config = configService.getConfig();
      if (config.initialized && config.gitlab.projectId) {
        gitlabService.setProjectId(config.gitlab.projectId);
        loadADRs();
        loadGitStatus();
      } else {
        setConfigError('Configuration GitLab requise');
        setLoading(false);
      }
    }
  }, [isAuthenticated]);

  const loadADRs = async () => {
    if (!isAuthenticated) return;
    
    const config = configService.getConfig();
    if (!config.initialized || !config.gitlab.projectId) {
      setConfigError('Configuration GitLab requise');
      setLoading(false);
      return;
    }
    
    try {
      setConfigError(null);
      const loadedADRs = await gitlabService.loadADRs(
        config.gitlab.projectId,
        config.gitlab.adrPath,
        config.gitlab.branch
      );
      // Normalize ADR data to ensure authors is always an array
      const normalizedADRs = loadedADRs.map(adr => ({
        ...adr,
        authors: Array.isArray(adr.authors) ? adr.authors : [],
        reviewers: Array.isArray(adr.reviewers) ? adr.reviewers : [],
        tags: Array.isArray(adr.tags) ? adr.tags : [],
        alternatives: Array.isArray(adr.alternatives) ? adr.alternatives : [],
        conformity: Array.isArray(adr.conformity) ? adr.conformity : [],
        history: Array.isArray(adr.history) ? adr.history : []
      }));
      setADRs(normalizedADRs);
    } catch (error) {
      console.error('Erreur lors du chargement des ADR:', error);
      setConfigError('Erreur lors du chargement des ADR depuis GitLab');
    } finally {
      setLoading(false);
    }
  };

  const loadGitStatus = async () => {
    if (!isAuthenticated) return;
    
    const config = configService.getConfig();
    if (!config.initialized || !config.gitlab.projectId) {
      return;
    }
    
    try {
      const status = await gitlabService.getRepositoryStatus(
        config.gitlab.projectId,
        config.gitlab.branch
      );
      setGitStatus(status);
    } catch (error) {
      console.error('Erreur lors du chargement du statut Git:', error);
    }
  };

  const createADR = async (adrData: Omit<ADR, 'id' | 'history' | 'createdAt' | 'updatedAt'>) => {
    if (!isAuthenticated) throw new Error('Non authentifié');
    
    const config = configService.getConfig();
    if (!config.initialized || !config.gitlab.projectId) {
      throw new Error('Configuration GitLab requise');
    }
    
    // Générer l'ID automatiquement au format YYYY-NNNN
    const currentYear = new Date().getFullYear();
    const existingIds = adrs
      .map(adr => adr.id)
      .filter(id => id.startsWith(`${currentYear}-`))
      .map(id => parseInt(id.split('-')[1]))
      .filter(num => !isNaN(num));
    
    const nextNumber = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    const adrId = `${currentYear}-${nextNumber.toString().padStart(4, '0')}`;
    
    const now = new Date().toISOString();
    const newADR: ADR = {
      ...adrData,
      id: adrId,
      history: [],
      createdAt: now,
      updatedAt: now,
    };
    
    try {
      await gitlabService.saveADR(
        newADR,
        config.gitlab.projectId,
        config.gitlab.adrPath,
        config.gitlab.branch,
        true
      );
      const updatedADRs = [...adrs, newADR];
      setADRs(updatedADRs);
      await loadGitStatus();
    } catch (error) {
      console.error('Erreur lors de la création de l\'ADR:', error);
      throw error;
    }
    
    return newADR;
  };

  const updateADR = async (id: string, updates: Partial<ADR>, changeDescription: string) => {
    if (!isAuthenticated) throw new Error('Non authentifié');
    
    const config = configService.getConfig();
    if (!config.initialized || !config.gitlab.projectId) {
      throw new Error('Configuration GitLab requise');
    }
    
    const adrIndex = adrs.findIndex(adr => adr.id === id);
    if (adrIndex === -1) return null;

    const currentADR = adrs[adrIndex];
    const now = new Date().toISOString();
    
    // Create version snapshot
    const version: ADRVersion = {
      version: currentADR.version,
      date: currentADR.updatedAt,
      author: currentADR.author,
      changes: changeDescription,
      snapshot: { ...currentADR, history: [] }
    };

    const updatedADR: ADR = {
      ...currentADR,
      ...updates,
      version: parseFloat(currentADR.version) + 0.1 + '',
      updatedAt: now,
      history: [version, ...currentADR.history]
    };

    try {
      await gitlabService.saveADR(
        updatedADR,
        config.gitlab.projectId,
        config.gitlab.adrPath,
        config.gitlab.branch,
        false
      );
      const newADRs = [...adrs];
      newADRs[adrIndex] = updatedADR;
      setADRs(newADRs);
      await loadGitStatus();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'ADR:', error);
      throw error;
    }
    
    return updatedADR;
  };

  const deleteADR = async (id: string) => {
    if (!isAuthenticated) throw new Error('Non authentifié');
    
    const config = configService.getConfig();
    if (!config.initialized || !config.gitlab.projectId) {
      throw new Error('Configuration GitLab requise');
    }
    
    try {
      await gitlabService.deleteADR(
        id,
        config.gitlab.projectId,
        config.gitlab.adrPath,
        config.gitlab.branch
      );
      const newADRs = adrs.filter(adr => adr.id !== id);
      setADRs(newADRs);
      await loadGitStatus();
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'ADR:', error);
      throw error;
    }
  };

  const getADRHistory = async (adrId: string) => {
    if (!isAuthenticated) return [];
    
    const config = configService.getConfig();
    if (!config.initialized || !config.gitlab.projectId) {
      return [];
    }
    
    try {
      return await gitlabService.getADRHistory(
        adrId,
        config.gitlab.projectId,
        config.gitlab.adrPath,
        config.gitlab.branch
      );
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      return [];
    }
  };

  const exportRepository = async () => {
    if (!isAuthenticated) throw new Error('Non authentifié');
    
    const config = configService.getConfig();
    if (!config.initialized || !config.gitlab.projectId) {
      throw new Error('Configuration GitLab requise');
    }
    
    try {
      return await gitlabService.exportRepository(
        config.gitlab.projectId,
        config.gitlab.adrPath,
        config.gitlab.branch
      );
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      throw error;
    }
  };

  const filterADRs = (filter: ADRFilter) => {
    return adrs.filter(adr => {
      const matchesSearch = !filter.search || 
        adr.id.toLowerCase().includes(filter.search.toLowerCase()) ||
        adr.title.toLowerCase().includes(filter.search.toLowerCase()) ||
        adr.context.toLowerCase().includes(filter.search.toLowerCase()) ||
        adr.decision.toLowerCase().includes(filter.search.toLowerCase());
      
      const matchesStatus = !filter.status || adr.status === filter.status;
      const matchesAuthor = !filter.author || adr.author.toLowerCase().includes(filter.author.toLowerCase());
      const matchesTags = filter.tags.length === 0 || filter.tags.some(tag => adr.tags.includes(tag));
      
      const matchesDateFrom = !filter.dateFrom || new Date(adr.date) >= new Date(filter.dateFrom);
      const matchesDateTo = !filter.dateTo || new Date(adr.date) <= new Date(filter.dateTo);

      return matchesSearch && matchesStatus && matchesAuthor && matchesTags && matchesDateFrom && matchesDateTo;
    });
  };

  const generateId = () => {
    return 'adr-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  };

  return {
    adrs,
    loading,
    configError,
    gitStatus,
    createADR,
    updateADR,
    deleteADR,
    getADRHistory,
    exportRepository,
    filterADRs,
    refreshADRs: loadADRs,
    refreshGitStatus: loadGitStatus
  };
};