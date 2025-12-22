import { checkDrizzleHealth } from '../config/drizzle';
import { checkDatabaseHealth as checkSQLiteHealth } from '../config/sqlite';
import { getMediaStats } from '../repositories/media';

export interface DatabaseHealthStatus {
  sqlite: boolean;
  drizzle: boolean;
  overall: boolean;
}

export interface MediaStats {
  total: number;
  images: number;
  videos: number;
  documents: number;
  pdfs: number;
  withLocation: number;
  pendingSync: number;
  synced: number;
  totalSize: number;
}

/**
 * Comprehensive database health check
 */
export const checkDatabaseHealth = async (): Promise<DatabaseHealthStatus> => {
  try {
    const [sqliteHealth, drizzleHealth] = await Promise.all([
      checkSQLiteHealth(),
      checkDrizzleHealth(),
    ]);

    return {
      sqlite: sqliteHealth,
      drizzle: drizzleHealth,
      overall: sqliteHealth && drizzleHealth,
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      sqlite: false,
      drizzle: false,
      overall: false,
    };
  }
};

/**
 * Get media statistics
 */
export const getMediaStatistics = async (): Promise<MediaStats | null> => {
  try {
    const stats = await getMediaStats();
    return stats as MediaStats | null;
  } catch (error) {
    console.error('Failed to get media statistics:', error);
    return null;
  }
};

/**
 * Get database diagnostics information
 */
export const getDatabaseDiagnostics = async () => {
  try {
    const health = await checkDatabaseHealth();
    const stats = await getMediaStatistics();

    return {
      health,
      stats,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Failed to get database diagnostics:', error);
    return {
      health: { sqlite: false, drizzle: false, overall: false },
      stats: null,
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
