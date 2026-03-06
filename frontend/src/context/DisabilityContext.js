import { createContext, useContext } from 'react';

export const DisabilityContext = createContext();

export const useDisability = () => {
    const context = useContext(DisabilityContext);
    if (!context) {
        throw new Error('useDisability must be used within a DisabilityProvider');
    }
    return context;
};
