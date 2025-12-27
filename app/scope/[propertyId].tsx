/**
 * Scope Screen (Property-Specific)
 * 
 * Mobile-optimized scoping tool with state-based navigation
 * Uses full-screen views instead of side-by-side panels
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../theme';
import { useScopeContext } from '../../context/ScopeContext';
import { usePropertyContext } from '../../context/PropertyContext';
import {
  ScopeItemForm,
  ScopeItemCard,
} from '../../components/scope';
import { Loading } from '../../components/ui';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

type ViewState = 'rooms' | 'components' | 'options' | 'scope-items';

export default function PropertyScopeScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const propertyId = params.propertyId ? Number(params.propertyId) : null;

  const {
    rooms,
    currentRoom,
    components,
    currentComponent,
    renovationOptions,
    scopeItems,
    isLoading,
    selectRoom,
    selectComponent,
    createScopeItem,
    updateScopeItem,
    deleteScopeItem,
    loadScopeItems,
  } = useScopeContext();

  const { properties, getPropertyById } = usePropertyContext();
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [viewState, setViewState] = useState<ViewState>('rooms');
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [skippedComponents, setSkippedComponents] = useState<Set<string>>(new Set());

  // Load property when propertyId is available
  useEffect(() => {
    if (propertyId) {
      loadPropertyAndScopeItems();
    }
  }, [propertyId]);

  const loadPropertyAndScopeItems = async () => {
    if (propertyId && getPropertyById) {
      const property = await getPropertyById(propertyId);
      if (property) {
        setSelectedProperty(property);
        loadScopeItems(propertyId);
      }
    } else if (propertyId) {
      const property = properties.find((p: any) => p.id === propertyId);
      if (property) {
        setSelectedProperty(property);
        loadScopeItems(propertyId);
      }
    }
  };

  // Group scope items by component
  const scopeItemsByComponent = useMemo(() => {
    const map = new Map<string, typeof scopeItems>();
    scopeItems.forEach((item) => {
      const key = item.componentArea;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(item);
    });
    return map;
  }, [scopeItems]);

  // Filter scope items for current room
  const currentRoomScopeItems = useMemo(() => {
    if (!currentRoom) return [];
    return scopeItems.filter((item) => item.roomName === currentRoom.name);
  }, [scopeItems, currentRoom]);

  const handleSelectRoom = useCallback(
    async (room: any) => {
      await selectRoom(room.name);
      setViewState('components');
      setSelectedOption(null);
    },
    [selectRoom]
  );

  const handleSelectComponent = useCallback(
    async (component: any) => {
      if (skippedComponents.has(component.area)) {
        setSkippedComponents((prev) => {
          const next = new Set(prev);
          next.delete(component.area);
          return next;
        });
      } else {
        await selectComponent(component.area);
        setViewState('options');
      }
    },
    [selectComponent, skippedComponents]
  );

  const handleSkipComponent = useCallback((component: any) => {
    setSkippedComponents((prev) => new Set(prev).add(component.area));
  }, []);

  const handleSelectOption = useCallback((option: any) => {
    setSelectedOption(option);
    setFormVisible(true);
  }, []);

  const handleSubmitScopeItem = useCallback(
    async (data: any) => {
      if (!currentRoom || !currentComponent) return;

      try {
        if (editingItem) {
          await updateScopeItem(editingItem.id, {
            ...data,
            propertyId: propertyId || undefined,
          });
        } else {
          await createScopeItem({
            ...data,
            propertyId: propertyId || undefined,
          });
        }
        setFormVisible(false);
        setEditingItem(null);
        setSelectedOption(null);
        setViewState('scope-items');
      } catch (error) {
        Alert.alert('Error', 'Failed to save scope item');
      }
    },
    [currentRoom, currentComponent, editingItem, propertyId, createScopeItem, updateScopeItem]
  );

  const handleEditItem = useCallback((item: any) => {
    setEditingItem(item);
    setFormVisible(true);
  }, []);

  const handleDeleteItem = useCallback(
    (item: any) => {
      Alert.alert(
        'Delete Scope Item',
        'Are you sure you want to delete this scope item?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await deleteScopeItem(item.id);
            },
          },
        ]
      );
    },
    [deleteScopeItem]
  );

  const handleCloseForm = useCallback(() => {
    setFormVisible(false);
    setEditingItem(null);
    setSelectedOption(null);
  }, []);

  const handleBack = useCallback(() => {
    if (viewState === 'components') {
      setViewState('rooms');
      setSkippedComponents(new Set());
    } else if (viewState === 'options') {
      setViewState('components');
    } else if (viewState === 'scope-items') {
      setViewState('components');
    }
  }, [viewState]);

  const handleViewScopeItems = useCallback(() => {
    setViewState('scope-items');
  }, []);

  // Memoized room item renderer
  const renderRoomItem = useCallback(({ item }: { item: any }) => {
    const roomScopeItems = scopeItems.filter(si => si.roomName === item.name);
    const hasItems = roomScopeItems.length > 0;

    return (
      <Pressable
        onPress={() => handleSelectRoom(item)}
        style={({ pressed }) => [
          styles.listItem,
          { backgroundColor: theme.backgroundPrimary },
          pressed && { opacity: 0.7 },
        ]}
      >
        <View style={styles.listItemContent}>
          <Text style={[styles.listItemTitle, { color: theme.textPrimary }]}>
            {item.name}
          </Text>
          {hasItems && (
            <View style={[styles.badge, { backgroundColor: theme.primary }]}>
              <Text style={styles.badgeText}>{roomScopeItems.length}</Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
      </Pressable>
    );
  }, [theme, handleSelectRoom, scopeItems]);

  // Memoized component item renderer
  const renderComponentItem = useCallback(({ item }: { item: any }) => {
    const isSkipped = skippedComponents.has(item.area);
    const hasScopeItems = (scopeItemsByComponent.get(item.area)?.length || 0) > 0;

    return (
      <Pressable
        onPress={() => handleSelectComponent(item)}
        onLongPress={() => handleSkipComponent(item)}
        style={({ pressed }) => [
          styles.listItem,
          { backgroundColor: theme.backgroundPrimary },
          isSkipped && { opacity: 0.5 },
          pressed && { opacity: 0.7 },
        ]}
      >
        <View style={styles.listItemContent}>
          <Text
            style={[
              styles.listItemTitle,
              { color: theme.textPrimary },
              isSkipped && { textDecorationLine: 'line-through' },
            ]}
          >
            {item.area}
          </Text>
          {hasScopeItems && (
            <View style={[styles.badge, { backgroundColor: theme.success || '#28a745' }]}>
              <Text style={styles.badgeText}>✓</Text>
            </View>
          )}
          {isSkipped && (
            <Ionicons name="remove-circle-outline" size={20} color={theme.textTertiary} style={{ marginLeft: 8 }} />
          )}
        </View>
        <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
      </Pressable>
    );
  }, [theme, handleSelectComponent, handleSkipComponent, skippedComponents, scopeItemsByComponent]);

  // Memoized option item renderer
  const renderOptionItem = useCallback(({ item }: { item: any }) => {
    return (
      <Pressable
        onPress={() => handleSelectOption(item)}
        style={({ pressed }) => [
          styles.listItem,
          { backgroundColor: theme.backgroundPrimary },
          pressed && { opacity: 0.7 },
        ]}
      >
        <View style={styles.listItemContent}>
          <Text style={[styles.listItemTitle, { color: theme.textPrimary }]}>
            {item.optionName}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
      </Pressable>
    );
  }, [theme, handleSelectOption]);

  // Memoized scope item renderer
  const renderScopeItem = useCallback(({ item }: { item: any }) => (
    <ScopeItemCard
      item={item}
      onEdit={() => handleEditItem(item)}
      onDelete={() => handleDeleteItem(item)}
    />
  ), [handleEditItem, handleDeleteItem]);

  // Show loading if no property selected
  if (!propertyId) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundPrimary }]}>
        <View style={styles.emptyState}>
          <Ionicons name="home-outline" size={64} color={theme.textTertiary} />
          <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
            No Property Selected
          </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.backLink, { color: theme.primary }]}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (isLoading && rooms.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundPrimary }]}>
        <Loading />
      </View>
    );
  }

  // Build breadcrumb path
  const breadcrumbs = [];
  if (currentRoom) breadcrumbs.push({ label: currentRoom.name, onPress: () => setViewState('components') });
  if (currentComponent) breadcrumbs.push({ label: currentComponent.area, onPress: () => setViewState('options') });

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundPrimary }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.borderPrimary }]}>
        <View style={styles.headerLeft}>
          {viewState !== 'rooms' && (
            <Pressable
              onPress={handleBack}
              style={[styles.backButton, { backgroundColor: theme.backgroundSecondary }]}
            >
              <Ionicons name="arrow-back" size={20} color={theme.textPrimary} />
            </Pressable>
          )}
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
              {viewState === 'rooms' ? 'Select Room' :
               viewState === 'components' ? 'Select Component' :
               viewState === 'options' ? 'Select Option' :
               'Scope Items'}
            </Text>
            {selectedProperty && (
              <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                {selectedProperty.address || 'Property'}
              </Text>
            )}
          </View>
        </View>
        {currentRoom && viewState !== 'rooms' && (
          <Pressable
            onPress={handleViewScopeItems}
            style={[styles.headerButton, { backgroundColor: theme.primary }]}
          >
            <Ionicons name="list" size={20} color="#fff" />
          </Pressable>
        )}
      </View>

      {/* Breadcrumb */}
      {breadcrumbs.length > 0 && (
        <View style={[styles.breadcrumb, { backgroundColor: theme.backgroundSecondary }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Pressable onPress={() => setViewState('rooms')} style={styles.breadcrumbItem}>
              <Text style={[styles.breadcrumbText, { color: theme.textSecondary }]}>Rooms</Text>
            </Pressable>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} style={{ marginHorizontal: 8 }} />
                <Pressable onPress={crumb.onPress} style={styles.breadcrumbItem}>
                  <Text style={[styles.breadcrumbText, { color: theme.textPrimary }]}>
                    {crumb.label}
                  </Text>
                </Pressable>
              </React.Fragment>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {viewState === 'rooms' && (
          <FlatList
            data={rooms}
            renderItem={renderRoomItem}
            keyExtractor={(item) => `room-${item.id}`}
            contentContainerStyle={styles.listContent}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={15}
            windowSize={5}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                  No rooms available
                </Text>
              </View>
            }
          />
        )}

        {viewState === 'components' && currentRoom && (
          <FlatList
            data={components}
            renderItem={renderComponentItem}
            keyExtractor={(item) => `component-${item.id}`}
            contentContainerStyle={styles.listContent}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={15}
            windowSize={5}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                  No components available
                </Text>
              </View>
            }
          />
        )}

        {viewState === 'options' && currentComponent && (
          <FlatList
            data={renovationOptions}
            renderItem={renderOptionItem}
            keyExtractor={(item) => `option-${item.id}`}
            contentContainerStyle={styles.listContent}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={15}
            windowSize={5}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                  No options available
                </Text>
              </View>
            }
          />
        )}

        {viewState === 'scope-items' && currentRoom && (
          <FlatList
            data={currentRoomScopeItems}
            renderItem={renderScopeItem}
            keyExtractor={(item) => `scope-item-${item.id}`}
            contentContainerStyle={styles.listContent}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={10}
            windowSize={5}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="clipboard-outline" size={64} color={theme.textTertiary} />
                <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                  No scope items yet
                </Text>
                <Text style={[styles.emptyStateSubtext, { color: theme.textTertiary }]}>
                  Select components and options to create scope items
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Scope Item Form Modal */}
      <ScopeItemForm
        visible={formVisible}
        onClose={handleCloseForm}
        onSubmit={handleSubmitScopeItem}
        initialData={editingItem}
        renovationOption={selectedOption}
        currentRoom={currentRoom}
        currentComponent={currentComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    paddingTop: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breadcrumb: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  breadcrumbItem: {
    paddingVertical: 4,
  },
  breadcrumbText: {
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
    minHeight: 300,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  backLink: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
});
