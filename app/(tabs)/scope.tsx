/**
 * Scope Screen
 * 
 * Main screen for room-by-room scoping tool
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  FlatList,
} from 'react-native';
import { useTheme } from '../../theme';
import { useScopeContext } from '../../context/ScopeContext';
import { usePropertyContext } from '../../context/PropertyContext';
import {
  RoomList,
  ComponentList,
  OptionSelector,
  ScopeItemForm,
  ScopeItemCard,
} from '../../components/scope';
import { Button, Loading } from '../../components/ui';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

export default function ScopeScreen() {
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
    loadRenovationOptions,
    createScopeItem,
    updateScopeItem,
    deleteScopeItem,
    loadScopeItems,
  } = useScopeContext();

  const { properties } = usePropertyContext();
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [skippedComponents, setSkippedComponents] = useState<Set<string>>(new Set());

  // Load property when propertyId is available
  React.useEffect(() => {
    if (propertyId) {
      const property = properties.find((p: any) => p.id === propertyId);
      if (property) {
        setSelectedProperty(property);
      }
    }
  }, [propertyId, properties]);

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

  // Load scope items when property is selected
  React.useEffect(() => {
    if (propertyId) {
      loadScopeItems(propertyId);
    }
  }, [propertyId, loadScopeItems]);

  const handleSelectRoom = useCallback(
    async (room: any) => {
      await selectRoom(room.name);
      setSelectedOption(null);
    },
    [selectRoom]
  );

  const handleSelectComponent = useCallback(
    async (component: any) => {
      if (skippedComponents.has(component.area)) {
        // Unskip
        setSkippedComponents((prev) => {
          const next = new Set(prev);
          next.delete(component.area);
          return next;
        });
      } else {
        await selectComponent(component.area);
      }
    },
    [selectComponent, skippedComponents]
  );

  const handleSkipComponent = useCallback((component: any) => {
    setSkippedComponents((prev) => new Set(prev).add(component.area));
    setSelectedOption(null);
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

  // Filter scope items for current room
  const currentRoomScopeItems = useMemo(() => {
    if (!currentRoom) return [];
    return scopeItems.filter((item) => item.roomName === currentRoom.name);
  }, [scopeItems, currentRoom]);

  // Show loading if no property selected
  if (!propertyId) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundPrimary }]}>
        <View style={styles.emptyState}>
          <Ionicons name="home-outline" size={64} color={theme.textTertiary} />
          <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
            No Property Selected
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: theme.textTertiary }]}>
            Please select a property from the Properties tab
          </Text>
          <Button
            title="Go to Properties"
            onPress={() => router.push('/(tabs)/properties')}
            style={styles.emptyButton}
          />
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

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundPrimary }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.borderPrimary }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            Room Scoping
          </Text>
          {selectedProperty && (
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              {selectedProperty.address || 'Loading...'}
            </Text>
          )}
        </View>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: theme.backgroundSecondary }]}
        >
          <Ionicons name="arrow-back" size={16} color={theme.textPrimary} />
          <Text style={[styles.backButtonText, { color: theme.textPrimary }]}>Back</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Left Panel - Rooms */}
        <View style={[styles.leftPanel, { backgroundColor: theme.backgroundSecondary }]}>
          <Text style={[styles.panelTitle, { color: theme.textPrimary }]}>Rooms</Text>
          <RoomList
            rooms={rooms}
            selectedRoom={currentRoom}
            onSelectRoom={handleSelectRoom}
          />
        </View>

        {/* Right Panel - Components, Options, and Scope Items */}
        <View style={styles.rightPanel}>
          {currentRoom ? (
            <>
              {/* Components */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                  Components - {currentRoom.name}
                </Text>
                <ComponentList
                  components={components}
                  selectedComponent={currentComponent}
                  onSelectComponent={handleSelectComponent}
                  onSkipComponent={handleSkipComponent}
                  skippedComponents={skippedComponents}
                  scopeItemsByComponent={scopeItemsByComponent}
                />
              </View>

              {/* Options */}
              {currentComponent && (
                <View style={styles.section}>
                  <OptionSelector
                    options={renovationOptions}
                    onSelectOption={handleSelectOption}
                    selectedOption={selectedOption}
                  />
                </View>
              )}

              {/* Scope Items */}
              {currentRoomScopeItems.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                    Scope Items ({currentRoomScopeItems.length})
                  </Text>
                  <FlatList
                    data={currentRoomScopeItems}
                    renderItem={({ item }) => (
                      <ScopeItemCard
                        item={item}
                        onEdit={() => handleEditItem(item)}
                        onDelete={() => handleDeleteItem(item)}
                      />
                    )}
                    keyExtractor={(item) => `scope-item-${item.id}`}
                    scrollEnabled={false}
                  />
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={64} color={theme.textTertiary} />
              <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                Select a room to start scoping
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: theme.textTertiary }]}>
                {selectedProperty?.address || 'Property'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Scope Item Form Modal */}
      <ScopeItemForm
        visible={formVisible}
        onClose={handleCloseForm}
        onSubmit={handleSubmitScopeItem}
        initialData={editingItem}
        renovationOption={selectedOption}
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  selectPropertyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 16,
    minWidth: 200,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    width: 200,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  rightPanel: {
    flex: 1,
    padding: 16,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 16,
  },
});

