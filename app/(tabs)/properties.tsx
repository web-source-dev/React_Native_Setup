import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../../theme';
import { useProperty } from '../../hooks';
import { useSync } from '../../lib/database/sync';
import { useAuth } from '../../context/authcontext';
import {
  Button,
  Card,
  Loading,
  Alert as AlertComponent,
} from '../../components/ui';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert } from 'react-native';

export default function Properties() {
  const { theme } = useTheme();
  const {
    properties,
    isLoading,
    error,
    refreshProperties,
    syncProperties,
    getPropertiesByStatus,
    getPropertiesByPhase,
    clearError,
  } = useProperty();
  
  const { isAuthenticated } = useAuth();
  
  const { isSyncing } = useSync();

  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [filteredProperties, setFilteredProperties] = useState(properties);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  useEffect(() => {
    applyFilters();
  }, [properties, selectedStatus, selectedPhase]);

  const applyFilters = async () => {
    try {
      let filtered = properties;

      if (selectedStatus) {
        const statusFiltered = await getPropertiesByStatus(selectedStatus);
        filtered = statusFiltered;
      } else if (selectedPhase) {
        const phaseFiltered = await getPropertiesByPhase(selectedPhase);
        filtered = phaseFiltered;
      }

      setFilteredProperties(filtered);
    } catch (err) {
      console.error('Failed to apply filters:', err);
      // Fallback to showing all properties
      setFilteredProperties(properties);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshProperties();
      showAlert('Properties refreshed');
    } catch (err) {
      showAlert('Failed to refresh properties');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSync = async () => {
    if (!isAuthenticated) {
      showAlert('Please login to sync properties');
      return;
    }

    try {
      showAlert('Syncing properties...');
      await syncProperties();
      showAlert('Properties synced successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sync failed';
      showAlert(`Sync failed: ${errorMessage}`);
    }
  };

  const clearFilters = () => {
    setSelectedStatus(null);
    setSelectedPhase(null);
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'new': theme.info || '#17a2b8',
      'contacted': theme.info || '#17a2b8',
      'scheduled': theme.warning || '#ffc107',
      'qualified': theme.success || '#28a745',
      'disqualified': theme.error,
      'in-contract': theme.success || '#28a745',
      'in-progress': theme.primary,
      'listing': theme.info || '#17a2b8',
      'on-market': theme.success || '#28a745',
      'under-contract': theme.success || '#28a745',
      'closing': theme.success || '#28a745',
      'closed': theme.success || '#28a745',
      'cancelled': theme.error,
    };
    return statusColors[status] || theme.textSecondary;
  };

  const getPhaseColor = (phase: string) => {
    const phaseColors: Record<string, string> = {
      'inquiry': theme.info || '#17a2b8',
      'intake': theme.info || '#17a2b8',
      'site-visit': theme.warning || '#ffc107',
      'scoping': theme.warning || '#ffc107',
      'pricing': theme.warning || '#ffc107',
      'contract': theme.success || '#28a745',
      'pre-construction': theme.primary,
      'construction': theme.primary,
      'listing-prep': theme.info || '#17a2b8',
      'on-market': theme.success || '#28a745',
      'backstop': theme.warning || '#ffc107',
      'contract-to-close': theme.success || '#28a745',
      'closing': theme.success || '#28a745',
      'post-close': theme.success || '#28a745',
    };
    return phaseColors[phase] || theme.textSecondary;
  };

  const formatAddress = (property: any) => {
    const parts = [property.address, property.city, property.state, property.zipCode].filter(Boolean);
    return parts.join(', ');
  };

  const handlePropertyPress = async (property: any) => {
    // Navigate to scope screen with property ID
    // Properties from context already have local database ID (property.id)
    try {
      // Use the local database ID directly (properties are always synced from web)
      const localPropertyId = property.id || property.localId;
      
      if (localPropertyId) {
        router.push({
          pathname: '/scope/[propertyId]',
          params: { propertyId: localPropertyId.toString() },
        });
      } else {
        // Fallback: show error if no local ID found
        Alert.alert(
          'Property Error',
          'Unable to find property. Please sync properties and try again.'
        );
      }
    } catch (error) {
      console.error('Failed to navigate to scope:', error);
      Alert.alert('Error', 'Failed to open scope screen');
    }
  };

  const renderPropertyCard = (property: any) => (
    <Pressable onPress={() => handlePropertyPress(property)}>
      <Card
        variant="elevated"
        style={styles.propertyCard}
        title={formatAddress(property)}
        titleStyle={styles.propertyAddress}
      >
      <View style={styles.propertyContent}>
        <View style={styles.propertyRow}>
          <View style={styles.propertyInfo}>
            <Text style={[styles.propertyLabel, { color: theme.textSecondary }]}>Property Type</Text>
            <Text style={[styles.propertyValue, { color: theme.textPrimary }]}>
              {property.propertyType || 'N/A'}
            </Text>
          </View>
          {(property.bedrooms || property.bathrooms) && (
            <View style={styles.propertyInfo}>
              <Text style={[styles.propertyLabel, { color: theme.textSecondary }]}>Bedrooms / Bathrooms</Text>
              <Text style={[styles.propertyValue, { color: theme.textPrimary }]}>
                {property.bedrooms || '0'} / {property.bathrooms || '0'}
              </Text>
            </View>
          )}
        </View>

        {property.squareFootage && (
          <View style={styles.propertyRow}>
            <View style={styles.propertyInfo}>
              <Text style={[styles.propertyLabel, { color: theme.textSecondary }]}>Square Footage</Text>
              <Text style={[styles.propertyValue, { color: theme.textPrimary }]}>
                {property.squareFootage.toLocaleString()} sq ft
              </Text>
            </View>
          </View>
        )}

        <View style={styles.propertyRow}>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(property.status) + '20' },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(property.status) },
                ]}
              >
                {property.status.replace('-', ' ').toUpperCase()}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getPhaseColor(property.phase) + '20' },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getPhaseColor(property.phase) },
                ]}
              >
                {property.phase.replace('-', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {property.notes && (
          <View style={styles.notesContainer}>
            <Text style={[styles.notesLabel, { color: theme.textSecondary }]}>Notes</Text>
            <Text
              style={[styles.notesText, { color: theme.textPrimary }]}
              numberOfLines={2}
            >
              {property.notes}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.propertyActions}>
        <Pressable
          onPress={() => handlePropertyPress(property)}
          style={[styles.scopeButton, { backgroundColor: theme.primary }]}
        >
          <Ionicons name="clipboard" size={16} color="#fff" />
          <Text style={styles.scopeButtonText}>Start Scoping</Text>
        </Pressable>
      </View>
    </Card>
    </Pressable>
  );

  const statusOptions = [
    'new',
    'contacted',
    'scheduled',
    'qualified',
    'disqualified',
    'in-contract',
    'in-progress',
    'listing',
    'on-market',
    'under-contract',
    'closing',
    'closed',
    'cancelled',
  ];

  const phaseOptions = [
    'inquiry',
    'intake',
    'site-visit',
    'scoping',
    'pricing',
    'contract',
    'pre-construction',
    'construction',
    'listing-prep',
    'on-market',
    'backstop',
    'contract-to-close',
    'closing',
    'post-close',
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundPrimary }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {/* Header Actions */}
        <View style={styles.headerSection}>
          <Card variant="outlined" style={styles.actionsCard}>
            <View style={styles.actionsRow}>
              <Button
                title="Sync"
                variant="primary"
                size="sm"
                onPress={handleSync}
                loading={isSyncing}
                disabled={!isAuthenticated || isSyncing}
                leftIcon={<Ionicons name="sync" size={16} color="#fff" />}
                style={styles.actionButton}
              />
              <Button
                title="Refresh"
                variant="outline"
                size="sm"
                onPress={handleRefresh}
                disabled={isLoading}
                leftIcon={<Ionicons name="refresh" size={16} color={theme.primary} />}
                style={styles.actionButton}
              />
            </View>
          </Card>
        </View>

        {/* Filters */}
        <View style={styles.filtersSection}>
          <Card variant="outlined" style={styles.filtersCard}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Filters</Text>
            
            <View style={styles.filterRow}>
              <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Status:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                <Pressable
                  onPress={() => {
                    setSelectedStatus(null);
                    setSelectedPhase(null);
                  }}
                  style={[
                    styles.filterChip,
                    !selectedStatus && !selectedPhase && { backgroundColor: theme.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      !selectedStatus && !selectedPhase && { color: '#fff' },
                      (selectedStatus || selectedPhase) && { color: theme.textPrimary },
                    ]}
                  >
                    All
                  </Text>
                </Pressable>
                {statusOptions.map((status) => (
                  <Pressable
                    key={status}
                    onPress={() => {
                      setSelectedStatus(status);
                      setSelectedPhase(null);
                    }}
                    style={[
                      styles.filterChip,
                      selectedStatus === status && { backgroundColor: theme.primary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedStatus === status && { color: '#fff' },
                        selectedStatus !== status && { color: theme.textPrimary },
                      ]}
                    >
                      {status.replace('-', ' ')}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.filterRow}>
              <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Phase:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                {phaseOptions.map((phase) => (
                  <Pressable
                    key={phase}
                    onPress={() => {
                      setSelectedPhase(phase);
                      setSelectedStatus(null);
                    }}
                    style={[
                      styles.filterChip,
                      selectedPhase === phase && { backgroundColor: theme.primary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedPhase === phase && { color: '#fff' },
                        selectedPhase !== phase && { color: theme.textPrimary },
                      ]}
                    >
                      {phase.replace('-', ' ')}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Card>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <Card variant="outlined" style={styles.statsCard}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Statistics</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.textPrimary }]}>
                  {filteredProperties.length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  {selectedStatus || selectedPhase ? 'Filtered' : 'Total'} Properties
                </Text>
              </View>
              {!selectedStatus && !selectedPhase && (
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.textPrimary }]}>
                    {properties.filter(p => p.status === 'new').length}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>New</Text>
                </View>
              )}
            </View>
          </Card>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingSection}>
            <Loading text="Loading properties..." />
          </View>
        )}

        {/* Error State */}
        {error && (
          <Card variant="outlined" style={styles.errorCard}>
            <View style={styles.errorContent}>
              <Ionicons name="alert-circle" size={24} color={theme.error} />
              <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
              <Button
                title="Dismiss"
                variant="outline"
                size="sm"
                onPress={clearError}
                style={styles.errorButton}
              />
            </View>
          </Card>
        )}

        {/* Properties List */}
        {filteredProperties.length > 0 && (
          <View style={styles.propertiesSection}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Properties ({filteredProperties.length})
            </Text>
            {filteredProperties.map((property) => (
              <React.Fragment key={property._id}>
                {renderPropertyCard(property)}
              </React.Fragment>
            ))}
          </View>
        )}

        {/* Empty State */}
        {!isLoading && filteredProperties.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="home-outline" size={64} color={theme.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>
              No Properties Found
            </Text>
            <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
              {selectedStatus || selectedPhase
                ? 'No properties match the selected filters'
                : 'Properties will appear here after syncing'}
            </Text>
            {!selectedStatus && !selectedPhase && isAuthenticated && (
              <Button
                title="Sync Properties"
                variant="primary"
                size="md"
                onPress={handleSync}
                style={styles.emptyButton}
                leftIcon={<Ionicons name="sync" size={20} color="#fff" />}
              />
            )}
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
  headerSection: {
    padding: 16,
  },
  actionsCard: {
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  filtersSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filtersCard: {
    marginBottom: 8,
  },
  filterRow: {
    marginTop: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  filterScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statsCard: {
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 24,
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  propertiesSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  propertyCard: {
    marginBottom: 16,
  },
  propertyAddress: {
    fontSize: 16,
    fontWeight: '600',
  },
  propertyContent: {
    gap: 12,
  },
  propertyRow: {
    flexDirection: 'row',
    gap: 16,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyLabel: {
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  propertyValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesContainer: {
    marginTop: 4,
  },
  notesLabel: {
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingSection: {
    padding: 32,
  },
  errorCard: {
    margin: 16,
    borderColor: '#ff4444',
  },
  errorContent: {
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorButton: {
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    minHeight: 300,
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
    marginBottom: 24,
  },
  emptyButton: {
    minWidth: 200,
  },
  propertyActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  scopeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  scopeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

