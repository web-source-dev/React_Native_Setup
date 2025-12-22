import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  Pressable,
} from 'react-native';
import { useTheme } from '../../theme';
import { useMediaContext, CameraMediaAsset, useLocationContext, useNetworkContext, useDeviceContext } from '../../hooks';
import {
  Button,
  Card,
  Loading,
  Alert as AlertComponent,
} from '../../components/ui';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function CameraTest() {
  const { theme } = useTheme();
  const {
    cameraMedia,
    location,
    selectedMedia,
    processedMedia,
    handleCameraResult,
    clearMedia,
    attachLocationToMedia,
    isProcessing,
    progress,
  } = useMediaContext();
  const { saveCurrentLocation, savedLocations, locationHistory } = useLocationContext();
  const { network, getConnectionQuality, isNetworkMetered } = useNetworkContext();
  const { device, getDeviceSummary, isLowEndDevice } = useDeviceContext();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [includeLocation, setIncludeLocation] = useState(false);

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const removeMedia = (index: number) => {
    clearMedia();
  };

  const getConnectionQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return theme.success;
      case 'good': return theme.primary;
      case 'fair': return theme.warning;
      case 'poor': return theme.error;
      default: return theme.textSecondary;
    }
  };

  const renderMediaItem = (asset: CameraMediaAsset, index: number) => {
    const isVideo = asset.type === 'video';

    return (
      <Card key={index} variant="outlined" style={styles.mediaCard}>
        <View style={styles.mediaHeader}>
          <View style={styles.mediaInfo}>
            <Ionicons
              name={isVideo ? 'videocam' : 'camera'}
              size={20}
              color={theme.primary}
            />
            <Text style={[styles.mediaType, { color: theme.textPrimary }]}>
              {isVideo ? 'Video' : 'Photo'}
            </Text>
            {asset.fileSize && (
              <Text style={[styles.mediaSize, { color: theme.textSecondary }]}>
                {Math.round(asset.fileSize / 1024)}KB
              </Text>
            )}
            {asset.duration && (
              <Text style={[styles.mediaDuration, { color: theme.textSecondary }]}>
                {Math.round(asset.duration)}s
              </Text>
            )}
          </View>
          <Pressable
            onPress={() => removeMedia(index)}
            style={[styles.removeButton, { backgroundColor: theme.primary + '20' }]}
          >
            <Ionicons name="close" size={16} color={theme.primary} />
          </Pressable>
        </View>

        <View style={styles.mediaContent}>
          {isVideo ? (
            <View style={[styles.videoPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
              <Ionicons name="play-circle" size={48} color={theme.primary} />
              <Text style={[styles.videoText, { color: theme.textSecondary }]}>
                Video Preview
              </Text>
              <Text style={[styles.videoSubtext, { color: theme.textTertiary }]}>
                Tap to play video
              </Text>
            </View>
          ) : (
            <Image
              source={{ uri: asset.uri }}
              style={styles.image}
              resizeMode="cover"
            />
          )}
        </View>

        <View style={styles.mediaDetails}>
          <Text style={[styles.fileName, { color: theme.textSecondary }]}>
            {asset.fileName || `File ${index + 1}`}
          </Text>
          <Text style={[styles.dimensions, { color: theme.textTertiary }]}>
            {asset.width} × {asset.height}
          </Text>
          {(asset as any).location && (
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={12} color={theme.primary} />
              <Text style={[styles.locationText, { color: theme.primary }]}>
                {(asset as any).location.latitude.toFixed(4)}, {(asset as any).location.longitude.toFixed(4)}
              </Text>
            </View>
          )}
        </View>
      </Card>
    );
  };

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
            Camera & Media Test
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Test all camera and media functionality
          </Text>
          <Text style={[styles.permissions, { color: theme.textSecondary }]}>
            Camera: {cameraMedia.permissions.camera ? '✅' : '❌'} |
            Media: {cameraMedia.permissions.mediaLibrary ? '✅' : '❌'} |
            Location: {location.permissions.granted ? '✅' : '❌'} |
            Network: {network.isOnline ? '✅' : '❌'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Camera Actions
          </Text>

          <View style={styles.buttonGrid}>
            <Button
              title="Take Photo"
              onPress={() => handleCameraResult(
                'Take Photo',
                cameraMedia.takePhoto,
                { images: { quality: 0.8, maxWidth: 1920, maxHeight: 1080 } },
                { publicAccess: true, publicDirectory: 'photos' },
                includeLocation
              )}
              style={styles.actionButton}
              loading={cameraMedia.isLoading || isProcessing}
              leftIcon={<Ionicons name="camera" size={16} color="white" />}
            />
            <Button
              title="Take Video"
              variant="secondary"
              onPress={() => handleCameraResult(
                'Take Video',
                cameraMedia.takeVideo,
                { videos: { compressVideos: true, quality: 0.7 } },
                { publicAccess: true, publicDirectory: 'videos' },
                includeLocation
              )}
              style={styles.actionButton}
              loading={cameraMedia.isLoading || isProcessing}
              leftIcon={<Ionicons name="videocam" size={16} color={theme.secondary} />}
            />
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Location Services
          </Text>

          <View style={styles.buttonGrid}>
            <Button
              title="Get Current Location"
              onPress={async () => {
                const loc = await location.getCurrentLocationWithAddress();
                if (loc) {
                  showAlert(`Location: ${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}\n${loc.address?.formattedAddress || 'No address'}`);
                } else {
                  showAlert('Failed to get location');
                }
              }}
              style={styles.actionButton}
              loading={location.isLoading}
              leftIcon={<Ionicons name="location" size={16} color={theme.primary} />}
            />
            <Button
              title="Save Location"
              onPress={async () => {
                await saveCurrentLocation();
                showAlert('Location saved to history');
              }}
              variant="outline"
              style={styles.actionButton}
              loading={location.isLoading}
              leftIcon={<Ionicons name="bookmark" size={16} color={theme.primary} />}
            />
            <Button
              title="Request Location Permissions"
              onPress={async () => {
                const perms = await location.requestPermissions();
                showAlert(`Location permissions: ${perms.granted ? 'Granted' : 'Denied'}`);
              }}
              variant="outline"
              style={styles.actionButton}
              loading={location.isLoading}
              leftIcon={<Ionicons name="key" size={16} color={theme.primary} />}
            />
            <Button
              title={location.isWatchingLocation ? "Stop Watching" : "Watch Location"}
              onPress={async () => {
                if (location.isWatchingLocation) {
                  location.stopWatchingLocation();
                  showAlert('Stopped watching location');
                } else {
                  const started = await location.startWatchingLocation();
                  showAlert(started ? 'Started watching location' : 'Failed to start watching');
                }
              }}
              variant={location.isWatchingLocation ? "danger" : "secondary"}
              style={styles.actionButton}
              loading={location.isLoading}
              leftIcon={<Ionicons name={location.isWatchingLocation ? "stop-circle" : "play-circle"} size={16} color={location.isWatchingLocation ? "white" : theme.secondary} />}
            />
          </View>

          {/* Location Toggle */}
          <View style={styles.toggleSection}>
            <Text style={[styles.toggleLabel, { color: theme.textPrimary }]}>
              Include location with media
            </Text>
            <Pressable
              onPress={() => setIncludeLocation(!includeLocation)}
              style={[styles.toggle, includeLocation && { backgroundColor: theme.primary }]}
            >
              <View style={[styles.toggleKnob, includeLocation && styles.toggleKnobActive]} />
            </Pressable>
          </View>

          {/* Current Location Display */}
          {location.currentLocation && (
            <View style={styles.locationDisplay}>
              <Text style={[styles.locationTitle, { color: theme.textPrimary }]}>
                Current Location
              </Text>
              <Text style={[styles.locationCoords, { color: theme.textSecondary }]}>
                {location.currentLocation.latitude.toFixed(6)}, {location.currentLocation.longitude.toFixed(6)}
              </Text>
              {location.currentLocation.address?.formattedAddress && (
                <Text style={[styles.locationAddress, { color: theme.textTertiary }]}>
                  {location.currentLocation.address.formattedAddress}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Network Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Network Status
          </Text>

          <View style={styles.buttonGrid}>
            <Button
              title="Check Network"
              onPress={() => network.refreshNetworkState()}
              style={styles.actionButton}
              loading={network.isLoading}
              leftIcon={<Ionicons name="wifi" size={16} color={network.isOnline ? theme.success : theme.error} />}
            />
            <Button
              title={network.isWatchingNetwork ? "Stop Watching" : "Watch Network"}
              onPress={() => {
                if (network.isWatchingNetwork) {
                  network.stopWatchingNetwork();
                  showAlert('Stopped watching network');
                } else {
                  network.startWatchingNetwork();
                  showAlert('Started watching network');
                }
              }}
              variant={network.isWatchingNetwork ? "danger" : "secondary"}
              style={styles.actionButton}
              loading={network.isLoading}
              leftIcon={<Ionicons name={network.isWatchingNetwork ? "stop-circle" : "play-circle"} size={16} color={network.isWatchingNetwork ? "white" : theme.secondary} />}
            />
          </View>

          {/* Network Status Display */}
          {network.networkState && (
            <View style={styles.networkDisplay}>
              <Text style={[styles.networkTitle, { color: theme.textPrimary }]}>
                Network Info
              </Text>
              <View style={styles.networkRow}>
                <Text style={[styles.networkLabel, { color: theme.textSecondary }]}>Status:</Text>
                <Text style={[styles.networkValue, { color: network.isOnline ? theme.success : theme.error }]}>
                  {network.isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
              <View style={styles.networkRow}>
                <Text style={[styles.networkLabel, { color: theme.textSecondary }]}>Type:</Text>
                <Text style={[styles.networkValue, { color: theme.textPrimary }]}>
                  {network.networkState.type}
                </Text>
              </View>
              <View style={styles.networkRow}>
                <Text style={[styles.networkLabel, { color: theme.textSecondary }]}>Quality:</Text>
                <Text style={[styles.networkValue, { color: getConnectionQualityColor(getConnectionQuality()) }]}>
                  {getConnectionQuality()}
                </Text>
              </View>
              <View style={styles.networkRow}>
                <Text style={[styles.networkLabel, { color: theme.textSecondary }]}>Metered:</Text>
                <Text style={[styles.networkValue, { color: isNetworkMetered() ? theme.warning : theme.success }]}>
                  {isNetworkMetered() ? 'Yes' : 'No'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Device Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Device Information
          </Text>

          <View style={styles.buttonGrid}>
            <Button
              title="Refresh Device Info"
              onPress={() => device.refreshDeviceInfo()}
              style={styles.actionButton}
              loading={device.isLoading}
              leftIcon={<Ionicons name="hardware-chip" size={16} color={theme.primary} />}
            />
          </View>

          {/* Device Info Display */}
          {device.deviceInfo && (
            <View style={styles.deviceDisplay}>
              <Text style={[styles.deviceTitle, { color: theme.textPrimary }]}>
                {getDeviceSummary()}
              </Text>

              <View style={styles.deviceGrid}>
                <View style={styles.deviceItem}>
                  <Text style={[styles.deviceLabel, { color: theme.textSecondary }]}>OS</Text>
                  <Text style={[styles.deviceValue, { color: theme.textPrimary }]}>
                    {device.deviceInfo.osName} {device.deviceInfo.osVersion}
                  </Text>
                </View>

                <View style={styles.deviceItem}>
                  <Text style={[styles.deviceLabel, { color: theme.textSecondary }]}>Model</Text>
                  <Text style={[styles.deviceValue, { color: theme.textPrimary }]}>
                    {device.deviceInfo.modelName}
                  </Text>
                </View>

                <View style={styles.deviceItem}>
                  <Text style={[styles.deviceLabel, { color: theme.textSecondary }]}>Screen</Text>
                  <Text style={[styles.deviceValue, { color: theme.textPrimary }]}>
                    {device.screenInfo.width}×{device.screenInfo.height}
                  </Text>
                </View>

                <View style={styles.deviceItem}>
                  <Text style={[styles.deviceLabel, { color: theme.textSecondary }]}>Real Device</Text>
                  <Text style={[styles.deviceValue, { color: device.isRealDevice ? theme.success : theme.warning }]}>
                    {device.isRealDevice ? 'Yes' : 'No'}
                  </Text>
                </View>

                <View style={styles.deviceItem}>
                  <Text style={[styles.deviceLabel, { color: theme.textSecondary }]}>Low End</Text>
                  <Text style={[styles.deviceValue, { color: isLowEndDevice() ? theme.warning : theme.success }]}>
                    {isLowEndDevice() ? 'Yes' : 'No'}
                  </Text>
                </View>

                <View style={styles.deviceItem}>
                  <Text style={[styles.deviceLabel, { color: theme.textSecondary }]}>App Version</Text>
                  <Text style={[styles.deviceValue, { color: theme.textPrimary }]}>
                    {device.appInfo.version}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Gallery Actions
          </Text>

          <View style={styles.buttonGrid}>
            <Button
              title="Pick Photo"
              variant="outline"
              onPress={() => handleCameraResult(
                'Pick Photo',
                cameraMedia.pickPhoto,
                { images: { quality: 0.8, maxWidth: 1920, maxHeight: 1080 } },
                { publicAccess: true, publicDirectory: 'photos' },
                includeLocation
              )}
              style={styles.actionButton}
              loading={cameraMedia.isLoading || isProcessing}
              leftIcon={<Ionicons name="images" size={16} color={theme.primary} />}
            />
            <Button
              title="Pick Video"
              variant="outline"
              onPress={() => handleCameraResult(
                'Pick Video',
                cameraMedia.pickVideo,
                { videos: { compressVideos: true, quality: 0.7 } },
                { publicAccess: true, publicDirectory: 'videos' },
                includeLocation
              )}
              style={styles.actionButton}
              loading={cameraMedia.isLoading || isProcessing}
              leftIcon={<Ionicons name="videocam" size={16} color={theme.primary} />}
            />
            <Button
              title="Pick Multiple Photos"
              variant="ghost"
              onPress={() => handleCameraResult(
                'Pick Multiple Photos',
                cameraMedia.pickMultiplePhotos,
                { images: { quality: 0.7, maxWidth: 1600, maxHeight: 900 } },
                { publicAccess: true, publicDirectory: 'photos' },
                includeLocation
              )}
              style={styles.actionButton}
              loading={cameraMedia.isLoading || isProcessing}
              leftIcon={<Ionicons name="copy" size={16} color={theme.textSecondary} />}
            />
            <Button
              title="Pick Multiple Videos"
              variant="ghost"
              onPress={() => handleCameraResult(
                'Pick Multiple Videos',
                cameraMedia.pickMultipleVideos,
                { videos: { compressVideos: true, quality: 0.6 } },
                { publicAccess: true, publicDirectory: 'videos' },
                includeLocation
              )}
              style={styles.actionButton}
              loading={cameraMedia.isLoading || isProcessing}
              leftIcon={<Ionicons name="videocam-outline" size={16} color={theme.textSecondary} />}
            />
            <Button
              title="Pick Any Media"
              variant="secondary"
              onPress={() => handleCameraResult(
                'Pick Any Media',
                cameraMedia.pickAnyMedia,
                {
                  images: { quality: 0.8, maxWidth: 1920, maxHeight: 1080 },
                  videos: { compressVideos: true, quality: 0.7 }
                },
                { publicAccess: true, publicDirectory: 'documents' },
                includeLocation
              )}
              style={styles.actionButton}
              loading={cameraMedia.isLoading || isProcessing}
              leftIcon={<Ionicons name="apps" size={16} color={theme.secondary} />}
            />
            <Button
              title="Request Permissions"
              variant="outline"
              onPress={async () => {
                const perms = await cameraMedia.requestPermissions();
                showAlert(`Permissions updated - Camera: ${perms.camera}, Media: ${perms.mediaLibrary}`);
              }}
              style={styles.actionButton}
              loading={cameraMedia.isLoading}
              leftIcon={<Ionicons name="key" size={16} color={theme.primary} />}
            />
          </View>
        </View>

        {/* Processing State */}
        {(cameraMedia.isLoading || isProcessing) && (
          <View style={styles.loadingSection}>
            <Loading text={isProcessing ? `Processing media... ${progress.toFixed(0)}%` : "Loading..."} />
            {isProcessing && (
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            )}
          </View>
        )}

        {/* Processed Media Display */}
        {processedMedia.length > 0 && (
          <View style={styles.section}>
            <View style={styles.mediaHeaderSection}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Processed Media ({processedMedia.length})
              </Text>
              <Button
                title="Clear All"
                size="sm"
                variant="danger"
                onPress={clearMedia}
              />
            </View>

            <View style={styles.mediaGrid}>
              {processedMedia.map((asset, index) => renderMediaItem(asset, index))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {processedMedia.length === 0 && !cameraMedia.isLoading && !isProcessing && (
          <View style={styles.emptyState}>
            <Ionicons name="images" size={64} color={theme.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>
              No Media Selected
            </Text>
            <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
              Use the buttons above to capture or pick media
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
    marginBottom: 8,
  },
  permissions: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: width * 0.45,
  },
  loadingSection: {
    alignItems: 'center',
    padding: 24,
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginTop: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  mediaHeaderSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mediaGrid: {
    gap: 12,
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
  mediaDuration: {
    fontSize: 12,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaContent: {
    aspectRatio: 4 / 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  videoSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  mediaDetails: {
    padding: 12,
    gap: 4,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
  },
  dimensions: {
    fontSize: 12,
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
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    marginTop: 8,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    transform: [{ translateX: 0 }],
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
  locationDisplay: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    marginTop: 8,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationCoords: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 11,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  networkDisplay: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    marginTop: 8,
  },
  networkTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  networkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  networkLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  networkValue: {
    fontSize: 12,
    fontWeight: '400',
  },
  deviceDisplay: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    marginTop: 8,
  },
  deviceTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  deviceGrid: {
    gap: 8,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
  },
  deviceLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  deviceValue: {
    fontSize: 11,
    fontWeight: '400',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
});
