import { useState, useEffect, useCallback } from 'react';
import { initializeDrizzle, type Database } from '../config/drizzle';
import { checkDatabaseHealth } from '../services/databaseHealth.service';

export interface DatabaseHookReturn {
  db: Database;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  checkHealth: () => Promise<boolean>;
  reinitialize: () => Promise<void>;
}

export function useDatabase(): DatabaseHookReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [db, setDb] = useState<Database | null>(null);

  const initializeDatabase = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const drizzleConfig = await initializeDrizzle();

      if (drizzleConfig.isInitialized) {
        setDb(drizzleConfig.database);
        setIsInitialized(true);
        console.log('Database initialized successfully');
      } else {
        throw new Error('Failed to initialize database connection');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown database error';
      setError(errorMessage);
      console.error('Database initialization failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkHealth = useCallback(async (): Promise<boolean> => {
    if (!isInitialized) return false;

    try {
      const health = await checkDatabaseHealth();
      return health.overall;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }, [isInitialized]);

  const reinitialize = useCallback(async () => {
    setIsInitialized(false);
    setDb(null);
    await initializeDatabase();
  }, [initializeDatabase]);

  useEffect(() => {
    initializeDatabase();
  }, [initializeDatabase]);

  return {
    db: db!,
    isInitialized,
    isLoading,
    error,
    checkHealth,
    reinitialize,
  };
}
