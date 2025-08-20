import { useState, useEffect } from 'react';
import { AppConfig } from '../types/config';
import { configService } from '../services/configService';

export const useConfig = () => {
  const [config, setConfig] = useState<AppConfig>(configService.getConfig());
  const [isConfigured, setIsConfigured] = useState(configService.isConfigured());

  useEffect(() => {
    const currentConfig = configService.getConfig();
    setConfig(currentConfig);
    setIsConfigured(configService.isConfigured());
  }, []);

  const updateConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    setIsConfigured(configService.isConfigured());
  };

  const resetConfig = () => {
    configService.resetConfig();
    const defaultConfig = configService.getConfig();
    setConfig(defaultConfig);
    setIsConfigured(false);
  };

  return {
    config,
    isConfigured,
    updateConfig,
    resetConfig
  };
};