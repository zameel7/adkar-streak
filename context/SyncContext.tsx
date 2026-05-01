import React, { createContext, useCallback, useContext } from 'react';

type SyncContextType = {
  triggerSync: () => void;
};

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const useSync = (): SyncContextType | undefined => {
  return useContext(SyncContext);
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
