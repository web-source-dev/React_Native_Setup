import React, { createContext, useContext, ReactNode } from 'react';
import { useDatabase } from './hooks/useDatabase';

interface DatabaseContextType {
  db: ReturnType<typeof useDatabase>['db'];
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

interface DatabaseProviderProps {
  children: ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const database = useDatabase();

  const value: DatabaseContextType = {
    db: database.db,
    isInitialized: database.isInitialized,
    isLoading: database.isLoading,
    error: database.error,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabaseContext(): DatabaseContextType {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabaseContext must be used within a DatabaseProvider');
  }
  return context;
}
