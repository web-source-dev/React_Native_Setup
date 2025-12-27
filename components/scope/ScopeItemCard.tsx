/**
 * Scope Item Card Component
 * 
 * Displays a scope item in a card format
 */

import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import type { ScopeItem } from '../../lib/database/repositories/scope';

interface ScopeItemCardProps {
  item: ScopeItem;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ScopeItemCard = memo(({ item, onPress, onEdit, onDelete }: ScopeItemCardProps) => {
  const { theme } = useTheme();

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'High':
        return theme.error || '#dc3545';
      case 'Medium':
        return theme.warning || '#ffc107';
      case 'Low':
        return theme.success || '#28a745';
      default:
        return theme.textSecondary;
    }
  };

  const getPermitColor = (permitLikely: string) => {
    switch (permitLikely) {
      case 'Yes':
        return theme.error || '#dc3545';
      case 'Maybe':
        return theme.warning || '#ffc107';
      case 'No':
        return theme.success || '#28a745';
      default:
        return theme.textSecondary;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundPrimary,
          borderColor: theme.borderPrimary,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.componentName, { color: theme.textPrimary }]}>
            {item.componentArea}
          </Text>
          <Text style={[styles.optionName, { color: theme.textSecondary }]}>
            {item.optionName}
          </Text>
        </View>
        <View style={styles.actions}>
          {onEdit && (
            <Pressable onPress={onEdit} style={styles.actionButton}>
              <Ionicons name="pencil" size={18} color={theme.primary} />
            </Pressable>
          )}
          {onDelete && (
            <Pressable onPress={onDelete} style={styles.actionButton}>
              <Ionicons name="trash" size={18} color={theme.error || '#dc3545'} />
            </Pressable>
          )}
        </View>
      </View>

      {(item.quantity || item.unit) && (
        <View style={styles.quantityRow}>
          <Text style={[styles.quantity, { color: theme.textPrimary }]}>
            {item.quantity} {item.unit}
          </Text>
        </View>
      )}

      <View style={styles.badges}>
        <View
          style={[
            styles.badge,
            { backgroundColor: getComplexityColor(item.complexity) + '20' },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: getComplexityColor(item.complexity) },
            ]}
          >
            {item.complexity}
          </Text>
        </View>
        <View
          style={[
            styles.badge,
            { backgroundColor: getPermitColor(item.permitLikely) + '20' },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: getPermitColor(item.permitLikely) },
            ]}
          >
            Permit: {item.permitLikely}
          </Text>
        </View>
      </View>

      {item.notes && (
        <Text style={[styles.notes, { color: theme.textSecondary }]} numberOfLines={2}>
          {item.notes}
        </Text>
      )}

      {item.primaryTrades && (
        <View style={styles.tradesRow}>
          <Ionicons name="construct" size={14} color={theme.textTertiary} />
          <Text style={[styles.trades, { color: theme.textTertiary }]}>
            {item.primaryTrades}
          </Text>
        </View>
      )}
    </Pressable>
  );
});

ScopeItemCard.displayName = 'ScopeItemCard';

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  componentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionName: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  quantityRow: {
    marginBottom: 8,
  },
  quantity: {
    fontSize: 14,
    fontWeight: '500',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  notes: {
    fontSize: 13,
    marginBottom: 8,
  },
  tradesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trades: {
    fontSize: 12,
  },
});

