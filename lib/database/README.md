# Database System

A comprehensive database system using Expo SQLite + Drizzle ORM for local data storage and synchronization.

## Overview

This system provides:

- **SQLite Database**: Local storage using `expo-sqlite`
- **Drizzle ORM**: Type-safe database operations
- **Media Storage**: Schema for images, videos, PDFs, documents
- **Sync Management**: Track sync status for offline/online operations
- **React Hooks**: Easy integration with React components

## Architecture

### Core Components

```
lib/database/
├── config/                    # Database configuration
│   ├── sqlite.ts             # SQLite connection setup
│   └── drizzle.ts            # Drizzle ORM instance
│
├── schema/                   # Database schemas
│   ├── media.schema.ts       # Media files schema
│   └── index.ts              # Schema exports
│
├── repositories/             # Repository pattern operations
│   ├── media.ts              # Media repository operations
│   └── index.ts              # Repository exports
│
├── hooks/                    # React hooks
│   ├── useDatabase.ts        # Database connection hook
│   ├── useMedia.ts           # Media operations hook
│   └── index.ts              # Hook exports
│
├── services/                 # Business logic services
│   ├── databaseHealth.service.ts # Database health & diagnostics
│   └── index.ts              # Service exports
│
├── migrations/               # Database migrations
│   └── index.ts              # Migration exports (placeholder)
│
├── types/                    # TypeScript types
│   └── index.ts              # Type exports
│
├── DatabaseProvider.tsx      # React context provider
└── README.md                 # This file
```

## Database Schema

### Media Files Schema

```typescript
interface MediaFile {
  id: number;                    // Primary key
  filename: string;              // Current filename
  originalFilename: string;      // Original filename
  localUri: string;              // Local file path (file://)
  remoteUrl?: string;            // Server URL after sync
  type: 'image' | 'video' | 'document' | 'pdf';
  mimeType: string;              // MIME type
  size: number;                  // File size in bytes
  width?: number;                // Image/video width
  height?: number;               // Image/video height
  duration?: number;             // Video duration
  userId?: string;               // User ID (future auth)
  isPublic: boolean;             // Public access flag
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  createdAt: number;             // Creation timestamp (epoch ms)
  updatedAt: number;             // Update timestamp (epoch ms)
}
```

## Usage

### Basic Setup

```tsx
import { DatabaseProvider } from './lib/database/DatabaseProvider';

function App() {
  return (
    <DatabaseProvider>
      <MyApp />
    </DatabaseProvider>
  );
}
```

### Using Database Hooks

```tsx
import { useDatabase, useMedia } from './lib/database/hooks';

function MyComponent() {
  const { isInitialized, error } = useDatabase();
  const {
    mediaFiles,
    createMedia,
    updateSyncStatus,
    deleteMedia
  } = useMedia();

  if (!isInitialized) {
    return <Text>Loading database...</Text>;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  // Use media operations...
}
```

### Creating Media Records

```tsx
const saveMediaToDatabase = async (mediaAsset, storageUri) => {
  const mediaData = {
    filename: mediaAsset.fileName,
    originalFilename: mediaAsset.fileName,
    localUri: storageUri,        // file:// path (app sandbox)
    remoteUrl: undefined,        // Will be set after server sync
    type: mediaAsset.type,
    mimeType: getMimeType(mediaAsset.type),
    size: mediaAsset.fileSize,
    width: mediaAsset.width,
    height: mediaAsset.height,
    duration: mediaAsset.duration,
    userId: undefined,           // Set when authentication is added
    isPublic: true,
    syncStatus: 'pending',
    createdAt: Date.now(),       // Epoch milliseconds
    updatedAt: Date.now(),
  };

  const savedMedia = await createMedia(mediaData);
  return savedMedia;
};
```

## Configuration

### Dependencies

Add to your `package.json`:

```json
{
  "dependencies": {
    "expo-sqlite": "~13.0.0",
    "drizzle-orm": "^0.29.0",
    "drizzle-orm/expo-sqlite": "^0.29.0"
  }
}
```

### App Configuration

Add to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-sqlite",
        {
          "enableFTS": false,
          "android": {
            "databaseName": "apex_mobile.db"
          },
          "ios": {
            "databaseName": "apex_mobile.db"
          }
        }
      ]
    ]
  }
}
```

## Database Operations

### Media Repository Operations

- `createMediaFile(mediaData)` - Create new media record
- `getMediaFileById(id)` - Get media by ID
- `getAllMediaFiles()` - Get all media files
- `updateMediaFile(id, updates)` - Update media record
- `deleteMediaFile(id)` - Delete media record
- `updateMediaSyncStatus(id, status, remoteUrl?)` - Update sync status

### Database Health Services

- `checkDatabaseHealth()` - Comprehensive health check
- `getMediaStatistics()` - Media stats and counts
- `getDatabaseDiagnostics()` - Full diagnostic information

### Sync Management

Media files track their synchronization status:

- `pending` - Not yet synced to server
- `syncing` - Currently syncing
- `synced` - Successfully synced
- `failed` - Sync failed

```typescript
// Mark as synced
await updateSyncStatus(mediaId, 'synced', 'https://server.com/file.jpg');

// Get pending files for sync
const pendingFiles = await getPendingSync();
```

## Best Practices

### Error Handling

```typescript
const handleDatabaseOperation = async () => {
  try {
    const result = await databaseOperation();
    if (!result) {
      console.error('Operation failed');
    }
  } catch (error) {
    console.error('Database error:', error);
    // Handle error appropriately
  }
};
```

### Performance

- Use transactions for multiple operations
- Implement pagination for large datasets
- Cache frequently accessed data
- Clean up old records regularly

### Data Integrity

- Validate data before insertion
- Use foreign keys for relationships
- Implement proper error recovery
- Regular backup of important data

## Future Extensions

### Planned Features

- **User Authentication**: Add user-specific data isolation
- **Data Synchronization**: Two-way sync with remote server
- **Offline Support**: Queue operations for online sync
- **Data Migration**: Versioned schema migrations
- **Advanced Queries**: Full-text search, complex filters

### Additional Schemas

- **Rooms Schema**: Project room management
- **Scope Items Schema**: Work item tracking
- **User Schema**: User profile and preferences

## Troubleshooting

### Common Issues

1. **Database not initialized**
   - Check `expo-sqlite` plugin configuration
   - Verify database permissions

2. **Migration errors**
   - Check schema compatibility
   - Backup data before migrations

3. **Performance issues**
   - Add database indexes
   - Optimize query patterns
   - Implement pagination

### Debug Information

Enable detailed logging:

```typescript
import { checkDatabaseHealth, getMediaStatistics, getDatabaseDiagnostics } from './services/databaseHealth.service';

// Check database health
const health = await checkDatabaseHealth();
console.log('Database health:', health);

// Get media statistics
const stats = await getMediaStatistics();
console.log('Media stats:', stats);

// Get full diagnostics
const diagnostics = await getDatabaseDiagnostics();
console.log('Database diagnostics:', diagnostics);
```
