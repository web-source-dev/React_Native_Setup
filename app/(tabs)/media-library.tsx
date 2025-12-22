import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  Pressable,
  Alert,
} from 'react-native';
import { useTheme } from '../../theme';
import { useMedia } from '../../lib/database/hooks';
import {
  Button,
  Card,
  Loading,
  Alert as AlertComponent,
} from '../../components/ui';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function MediaLibrary() {
  const { theme } = useTheme();
  const {
    mediaFiles,
    isLoading,
    error,
    getAllMedia,
    deleteMedia,
    getStats,
    refresh,
  } = useMedia();

  const [stats, setStats] = useState<any>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  useEffect(() => {
    loadStats();
  }, [mediaFiles]);

  const loadStats = async () => {
    const statsData = await getStats();
    setStats(statsData);
  };

  const handleRefresh = async () => {
    await refresh();
    await loadStats();
  };

  const handleDelete = async (id: number, filename: string) => {
    Alert.alert(
      'Delete Media',
      `Are you sure you want to delete "${filename}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteMedia(id);
            if (success) {
              showAlert('Media deleted successfully');
              await loadStats();
            } else {
              showAlert('Failed to delete media');
            }
          },
        },
      ]
    );
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'synced':
        return theme.success || '#28a745';
      case 'syncing':
        return theme.warning || '#ffc107';
      case 'failed':
        return theme.error || '#dc3545';
      default:
        return theme.textSecondary;
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return 'checkmark-circle';
      case 'syncing':
        return 'refresh-circle';
      case 'failed':
        return 'close-circle';
      default:
        return 'time';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderMediaItem = (item: any) => {
    const isVideo = item.type === 'video';

    return (
      <Card key={item.id} variant="outlined" style={styles.mediaCard}>
        <View style={styles.mediaHeader}>
          <View style={styles.mediaInfo}>
            <Ionicons
              name={
                item.type === 'image' ? 'image' :
                item.type === 'video' ? 'videocam' :
                item.type === 'pdf' ? 'document-text' :
                'document'
              }
              size={20}
              color={theme.primary}
            />
            <Text style={[styles.mediaType, { color: theme.textPrimary }]}>
              {item.type.toUpperCase()}
            </Text>
            <Text style={[styles.mediaSize, { color: theme.textSecondary }]}>
              {formatFileSize(item.size)}
            </Text>
          </View>
          <View style={styles.mediaActions}>
            <View style={[styles.syncStatus, { backgroundColor: getSyncStatusColor(item.syncStatus) + '20' }]}>
              <Ionicons
                name={getSyncStatusIcon(item.syncStatus)}
                size={14}
                color={getSyncStatusColor(item.syncStatus)}
              />
              <Text style={[styles.syncText, { color: getSyncStatusColor(item.syncStatus) }]}>
                {item.syncStatus}
              </Text>
            </View>
            <Pressable
              onPress={() => handleDelete(item.id, item.filename)}
              style={[styles.deleteButton, { backgroundColor: theme.error + '20' }]}
            >
              <Ionicons name="trash" size={16} color={theme.error} />
            </Pressable>
          </View>
        </View>

        <View style={styles.mediaContent}>
          {item.type === 'image' ? (
            <Image
              source={{ uri: item.localUri }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.mediaPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
              <Ionicons
                name={
                  item.type === 'video' ? 'play-circle' :
                  item.type === 'pdf' ? 'document-text' :
                  'document'
                }
                size={48}
                color={theme.primary}
              />
              <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
                {item.type === 'video' ? 'Video File' :
                 item.type === 'pdf' ? 'PDF Document' :
                 'Document'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.mediaDetails}>
          <Text style={[styles.filename, { color: theme.textPrimary }]}>
            {item.filename}
          </Text>
          {item.originalFilename && item.originalFilename !== item.filename && (
            <Text style={[styles.originalFilename, { color: theme.textSecondary }]}>
              Original: {item.originalFilename}
            </Text>
          )}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Created:</Text>
            <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
          {item.width && item.height && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Dimensions:</Text>
              <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                {item.width} × {item.height}
              </Text>
            </View>
          )}
          {item.duration && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Duration:</Text>
              <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                {Math.round(item.duration)}s
              </Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>MIME Type:</Text>
            <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
              {item.mimeType}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Public:</Text>
            <Text style={[styles.detailValue, { color: item.isPublic ? theme.success : theme.error }]}>
              {item.isPublic ? 'Yes' : 'No'}
            </Text>
          </View>
          {(item.latitude && item.longitude) && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Location:</Text>
              <Text style={[styles.detailValue, { color: theme.primary }]}>
                {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
              </Text>
            </View>
          )}
          {item.locationAddress && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Address:</Text>
              <Text style={[styles.detailValue, { color: theme.textPrimary }]} numberOfLines={2}>
                {item.locationAddress}
              </Text>
            </View>
          )}
          {item.locationTimestamp && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Captured:</Text>
              <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                {new Date(item.locationTimestamp).toLocaleString()}
              </Text>
            </View>
          )}
          {item.remoteUrl && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Remote URL:</Text>
              <Text style={[styles.detailValue, { color: theme.primary }]} numberOfLines={1}>
                {item.remoteUrl}
              </Text>
            </View>
          )}
        </View>
      </Card>
    );
  };

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundPrimary }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.error} />
          <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>
            Database Error
          </Text>
          <Text style={[styles.errorText, { color: theme.textSecondary }]}>
            {error}
          </Text>
          <Button title="Retry" onPress={handleRefresh} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundPrimary }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Media Library
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Database-stored media files
          </Text>
          <Button
            title="Refresh"
            onPress={handleRefresh}
            size="sm"
            variant="outline"
            leftIcon={<Ionicons name="refresh" size={14} color={theme.primary} />}
          />
        </View>

        {/* Stats */}
        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>{stats.total}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Files</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: theme.success }]}>{stats.synced}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Synced</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: theme.warning }]}>{stats.pendingSync}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: theme.info || '#17a2b8' }]}>{stats.withLocation}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>With Location</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: theme.textSecondary }]}>{formatFileSize(stats.totalSize)}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Size</Text>
            </View>
          </View>
        )}

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingSection}>
            <Loading text="Loading media from database..." />
          </View>
        )}

        {/* Media Grid */}
        {mediaFiles.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Media Files ({mediaFiles.length})
            </Text>
            <View style={styles.mediaGrid}>
              {mediaFiles.map(renderMediaItem)}
            </View>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && mediaFiles.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="images" size={64} color={theme.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>
              No Media Files
            </Text>
            <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
              Media files stored in the database will appear here
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Alert */}
      <AlertComponent
        visible={alertVisible}
        message={alertMessage}
        variant="info"
        position="bottom"
        onDismiss={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  loadingSection: {
    alignItems: 'center',
    padding: 24,
  },
  mediaGrid: {
    gap: 16,
  },
  mediaCard: {
    margin: 0,
    padding: 0,
  },
  mediaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  mediaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mediaType: {
    fontSize: 14,
    fontWeight: '600',
  },
  mediaSize: {
    fontSize: 12,
  },
  mediaActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  syncText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaContent: {
    aspectRatio: 16 / 9,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  mediaPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  mediaDetails: {
    padding: 12,
    gap: 8,
  },
  filename: {
    fontSize: 16,
    fontWeight: '600',
  },
  originalFilename: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '400',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 280,
  },
});
