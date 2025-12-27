/**
 * Component List Component
 * 
 * Optimized list/grid for selecting components per room
 * Supports quick skip action
 */

import React, { memo, useEffect } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import type { Component, ScopeItem } from '../../lib/database/repositories/scope';

interface ComponentListProps {
  components: Component[];
  selectedComponent: Component | null;
  onSelectComponent: (component: Component) => void;
  onSkipComponent?: (component: Component) => void;
  skippedComponents?: Set<string>; // Set of skipped component areas
  scopeItemsByComponent?: Map<string, ScopeItem[]>; // Existing scope items
}

const ComponentItem = memo(({
  component,
  isSelected,
  isSkipped,
  hasScopeItems,
  onPress,
  onSkip,
  theme,
}: {
  component: Component;
  isSelected: boolean;
  isSkipped: boolean;
  hasScopeItems: boolean;
  onPress: () => void;
  onSkip: () => void;
  theme: any;
}) => {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onSkip}
      style={[
        styles.componentItem,
        { backgroundColor: theme.backgroundPrimary },
        isSelected && { backgroundColor: theme.primary + '20', borderColor: theme.primary },
        isSkipped && { opacity: 0.5 },
      ]}
    >
      <View style={styles.componentContent}>
        <Text
          style={[
            styles.componentName,
            { color: theme.textPrimary },
            isSelected && { color: theme.primary, fontWeight: '600' },
            isSkipped && { textDecorationLine: 'line-through' },
          ]}
        >
          {component.area}
        </Text>
        {hasScopeItems && (
          <View style={[styles.badge, { backgroundColor: theme.success || '#28a745' }]}>
            <Text style={styles.badgeText}>✓</Text>
          </View>
        )}
      </View>
      {isSelected && <Ionicons name="checkmark-circle" size={24} color={theme.primary} />}
      {isSkipped && <Ionicons name="remove-circle-outline" size={24} color={theme.textTertiary} />}
    </Pressable>
  );
});

ComponentItem.displayName = 'ComponentItem';

export const ComponentList = memo(({
  components,
  selectedComponent,
  onSelectComponent,
  onSkipComponent,
  skippedComponents = new Set(),
  scopeItemsByComponent = new Map(),
}: ComponentListProps) => {
  const { theme } = useTheme();

  const renderItem = ({ item }: { item: Component }) => {
    const isSkipped = skippedComponents.has(item.area);
    const hasScopeItems = (scopeItemsByComponent.get(item.area)?.length || 0) > 0;

    return (
      <ComponentItem
        component={item}
        isSelected={selectedComponent?.id === item.id}
        isSkipped={isSkipped}
        hasScopeItems={hasScopeItems}
        onPress={() => onSelectComponent(item)}
        onSkip={() => onSkipComponent?.(item)}
        theme={theme}
      />
    );
  };

  const keyExtractor = (item: Component) => `component-${item.id}`;

  if (components.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          No components available
        </Text>
        <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
          Components may still be loading...
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={components}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      removeClippedSubviews={false}
      maxToRenderPerBatch={15}
      updateCellsBatchingPeriod={50}
      initialNumToRender={25}
      windowSize={10}
      nestedScrollEnabled={true}
    />
  );
});

ComponentList.displayName = 'ComponentList';

const styles = StyleSheet.create({
  list: {
    flex: 1,
    height: '100%',
  },
  listContent: {
    padding: 8,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 12,
    textAlign: 'center',
  },
  componentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  componentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  componentName: {
    fontSize: 16,
    flex: 1,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

