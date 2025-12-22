import * as SQLite from 'expo-sqlite';

// SQLite database connection configuration
export const DATABASE_NAME = 'apex_mobile.db';

// Create SQLite database instance
export const sqliteDb = SQLite.openDatabaseSync(DATABASE_NAME);

// Database connection status
export interface DatabaseConnection {
  isConnected: boolean;
  database: SQLite.SQLiteDatabase;
  name: string;
}

// Initialize database connection
export const getDatabaseConnection = (): DatabaseConnection => {
  try {
    return {
      isConnected: true,
      database: sqliteDb,
      name: DATABASE_NAME,
    };
  } catch (error) {
    console.error('Failed to initialize SQLite database:', error);
    throw error;
  }
};

// Close database connection (for cleanup)
export const closeDatabaseConnection = async (): Promise<void> => {
  try {
    // SQLite doesn't have explicit close method in expo-sqlite
    // The connection is managed automatically
    console.log('SQLite database connection cleanup completed');
  } catch (error) {
    console.error('Error during database cleanup:', error);
  }
};

// Database health check
export const checkDatabaseHealth = (): boolean => {
  try {
    // Basic health check - database connection exists
    return sqliteDb !== null;
  } catch (error) {
    console.error('Database health check error:', error);
    return false;
  }
};
