import React, { createContext, useState, useEffect, useContext } from 'react';
import { getSystemConfig } from '../services/api.js';

const SystemContext = createContext();

export const useSystemContext = () => useContext(SystemContext);

export const SystemProvider = ({ children }) => {
    const [systemConfig, setSystemConfig] = useState({
        companyName: 'HeartAI',
        companyLogo: '',
    });
    const [isConfigLoading, setIsConfigLoading] = useState(true);

    const fetchConfig = async () => {
        try {
            const res = await getSystemConfig();
            if (res.status === 'success') {
                setSystemConfig(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch system config:', error);
        } finally {
            setIsConfigLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const updateConfigLocal = (newConfig) => {
        setSystemConfig(prev => ({ ...prev, ...newConfig }));
    };

    return (
        <SystemContext.Provider value={{
            systemConfig,
            companyName: systemConfig.companyName || 'HeartAI',
            companyLogo: systemConfig.companyLogo || '',
            isConfigLoading,
            updateConfigLocal,
            refreshConfig: fetchConfig
        }}>
            {children}
        </SystemContext.Provider>
    );
};
