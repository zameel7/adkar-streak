import React, { createContext, useCallback, useContext } from 'react';

type SyncContextType = {
  triggerSync: () => void;
};

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};

export const SyncProvider: React.FC<{ children: React.ReactNode; onSync: () => void }> = ({ 
  children, 
  onSync 
}) => {
  const triggerSync = useCallback(() => {
    onSync();
  }, [onSync]);

  return (
    <SyncContext.Provider value={{ triggerSync }}>
      {children}
    </SyncContext.Provider>
  );
};
