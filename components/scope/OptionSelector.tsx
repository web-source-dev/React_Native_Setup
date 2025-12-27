/**
 * Option Selector Component
 * 
 * Quick selection buttons for renovation options
 * Shows common options: Repair, Replace, Upgrade, Add, Remove
 */

import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import type { RenovationOption } from '../../lib/database/repositories/scope';

interface OptionSelectorProps {
  options: RenovationOption[];
  onSelectOption: (option: RenovationOption) => void;
  selectedOption?: RenovationOption | null;
}

const OptionButton = memo(({
  option,
  isSelected,
  onPress,
  theme,
}: {
  option: RenovationOption;
  isSelected: boolean;
  onPress: () => void;
  theme: any;
}) => {
  // Map option names to icons
  const getIcon = (optionName: string) => {
    const name = optionName.toLowerCase();
    if (name.includes('repair') || name.includes('fix')) return 'build';
    if (name.includes('replace')) return 'refresh';
    if (name.includes('upgrade')) return 'trending-up';
    if (name.includes('add')) return 'add-circle';
    if (name.includes('remove')) return 'remove-circle';
    return 'radio-button-on';
  };

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.optionButton,
        {
          backgroundColor: isSelected ? theme.primary : theme.backgroundSecondary || '#f5f5f5',
          borderColor: isSelected ? theme.primary : theme.borderPrimary,
        },
      ]}
    >
      <Ionicons
        name={getIcon(option.optionName)}
        size={20}
        color={isSelected ? '#fff' : theme.textPrimary}
        style={styles.optionIcon}
      />
      <Text
        style={[
          styles.optionText,
          { color: isSelected ? '#fff' : theme.textPrimary },
        ]}
      >
        {option.optionName}
      </Text>
      {option.defaultPermitLikely && option.defaultPermitLikely !== 'No' && (
        <View
          style={[
            styles.permitBadge,
            {
              backgroundColor: isSelected ? '#fff' : theme.warning || '#ffc107',
            },
          ]}
        >
          <Text
            style={[
              styles.permitBadgeText,
              { color: isSelected ? theme.warning || '#ffc107' : '#fff' },
            ]}
          >
            Permit
          </Text>
        </View>
      )}
    </Pressable>
  );
});

OptionButton.displayName = 'OptionButton';

export const OptionSelector = memo(({ options, onSelectOption, selectedOption }: OptionSelectorProps) => {
  const { theme } = useTheme();

  if (options.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={{ color: theme.textSecondary }}>No options available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>Select Renovation Option</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((option) => (
          <OptionButton
            key={option.id}
            option={option}
            isSelected={selectedOption?.id === option.id}
            onPress={() => onSelectOption(option)}
            theme={theme}
          />
        ))}
      </ScrollView>
    </View>
  );
});

OptionSelector.displayName = 'OptionSelector';

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 120,
    gap: 8,
  },
  optionIcon: {
    marginRight: 4,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  permitBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  permitBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

