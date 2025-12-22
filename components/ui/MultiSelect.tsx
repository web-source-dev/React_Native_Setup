import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface MultiSelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export type MultiSelectSize = 'sm' | 'md' | 'lg';

interface MultiSelectProps extends Omit<TouchableOpacityProps, 'onPress'> {
  options: MultiSelectOption[];
  value?: (string | number)[];
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  size?: MultiSelectSize;
  disabled?: boolean;
  searchable?: boolean;
  maxDisplayItems?: number;
  onValueChange: (value: (string | number)[]) => void;
  containerStyle?: ViewStyle;
  dropdownStyle?: ViewStyle;
  chipStyle?: ViewStyle;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value = [],
  placeholder = 'Select options...',
  label,
  error,
  helperText,
  size = 'md',
  disabled = false,
  searchable = false,
  maxDisplayItems = 3,
  onValueChange,
  containerStyle,
  dropdownStyle,
  chipStyle,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [triggerLayout, setTriggerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const triggerRef = useRef<View>(null);

  const selectedOptions = options.filter(option => value.includes(option.value));

  const filteredOptions = searchable && searchText
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchText.toLowerCase())
      )
    : options;

  // Update dropdown position when it opens
  useEffect(() => {
    if (isOpen) {
      const dropdownHeight = Math.min(filteredOptions.length * 48 + 8, 250);
      const spaceBelow = screenHeight - (triggerLayout.y + triggerLayout.height);
      const spaceAbove = triggerLayout.y;

      // Position directly under the input
      let top = triggerLayout.y + triggerLayout.height;

      // If not enough space below, position above
      if (spaceBelow < dropdownHeight && spaceAbove >= dropdownHeight) {
        top = triggerLayout.y - dropdownHeight;
      }

      setDropdownPosition({
        top: Math.max(10, top),
        left: Math.max(0, triggerLayout.x),
        width: Math.min(triggerLayout.width, screenWidth - 20),
      });
    }
  }, [isOpen, triggerLayout, filteredOptions.length]);

  const handleTriggerLayout = (event: any) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setTriggerLayout({ x, y, width, height });
  };

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      width: '100%',
    };

    return {
      ...baseStyle,
      ...containerStyle,
    };
  };

  const getTriggerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: error
        ? theme.error
        : isOpen
        ? theme.primary
        : theme.borderPrimary,
      backgroundColor: disabled ? theme.backgroundTertiary : theme.backgroundPrimary,
      opacity: disabled ? 0.6 : 1,
      minHeight: 44,
      paddingHorizontal: 12,
      paddingVertical: 8,
    };

    return {
      ...baseStyle,
      ...(style as ViewStyle),
    };
  };

  const getSelectedContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 4,
    };

    return baseStyle;
  };

  const getChipStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
    };

    return {
      ...baseStyle,
      ...chipStyle,
    };
  };

  const getChipTextStyle = (): TextStyle => {
    return {
      fontSize: 12,
      color: theme.textInverse,
      fontWeight: '500',
    };
  };

  const getPlaceholderStyle = (): TextStyle => {
    return {
      color: theme.textPrimary,
      fontSize: 16,
    };
  };

  const getLabelStyle = (): TextStyle => {
    return {
      fontSize: 14,
      fontWeight: '500',
      color: error ? theme.error : theme.textSecondary,
      marginBottom: 4,
    };
  };

  const getHelperTextStyle = (): TextStyle => {
    return {
      fontSize: 12,
      color: error ? theme.error : theme.textTertiary,
      marginTop: 4,
    };
  };

  const getDropdownStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      top: dropdownPosition.top,
      left: dropdownPosition.left,
      width: dropdownPosition.width,
      backgroundColor: theme.backgroundPrimary,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.borderPrimary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
      overflow: 'hidden',
    };

    return {
      ...baseStyle,
      ...dropdownStyle,
    };
  };

  const getOptionStyle = (isSelected: boolean, isDisabled: boolean): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderPrimary,
    };

    if (isSelected) {
      return {
        ...baseStyle,
        backgroundColor: theme.primary + '20', // Add transparency
      };
    }

    if (isDisabled) {
      return {
        ...baseStyle,
        opacity: 0.5,
      };
    }

    return baseStyle;
  };

  const getOptionTextStyle = (isSelected: boolean): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: 16,
      color: isSelected ? theme.primary : theme.textPrimary,
      fontWeight: isSelected ? '600' : '400',
    };

    return baseStyle;
  };

  const handleToggleOption = (option: MultiSelectOption) => {
    if (!option.disabled) {
      const newValue = value.includes(option.value)
        ? value.filter(v => v !== option.value)
        : [...value, option.value];

      onValueChange(newValue);
    }
  };

  const handleRemoveChip = (optionValue: string | number) => {
    const newValue = value.filter(v => v !== optionValue);
    onValueChange(newValue);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const renderSelectedItems = () => {
    if (selectedOptions.length === 0) {
      return (
        <Text style={getPlaceholderStyle()}>
          {placeholder}
        </Text>
      );
    }

    const displayOptions = selectedOptions.slice(0, maxDisplayItems);
    const remainingCount = selectedOptions.length - maxDisplayItems;

    return (
      <View style={getSelectedContainerStyle()}>
        {displayOptions.map(option => (
          <View key={option.value} style={getChipStyle()}>
            <Text style={getChipTextStyle()}>
              {option.label}
            </Text>
            <TouchableOpacity
              onPress={() => handleRemoveChip(option.value)}
              style={{ marginLeft: 4 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={{ color: theme.textInverse, fontSize: 14, fontWeight: 'bold' }}>
                ×
              </Text>
            </TouchableOpacity>
          </View>
        ))}
        {remainingCount > 0 && (
          <Text style={getChipTextStyle()}>
            +{remainingCount} more
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={getContainerStyle()}>
      {label && <Text style={getLabelStyle()}>{label}</Text>}

      <View ref={triggerRef} onLayout={handleTriggerLayout}>
        <TouchableOpacity
          style={getTriggerStyle()}
          onPress={handleToggle}
          disabled={disabled}
          activeOpacity={0.7}
          {...props}
        >
          {renderSelectedItems()}
          <Text style={{ color: theme.textMuted, fontSize: 16 }}>
            {isOpen ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>
      </View>

      {(error || helperText) && (
        <Text style={getHelperTextStyle()}>
          {error || helperText}
        </Text>
      )}

      {isOpen && (
        <>
          {/* Backdrop to handle clicks outside */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            activeOpacity={1}
            onPress={() => setIsOpen(false)}
          />
          {/* Dropdown */}
          <View style={[getDropdownStyle(), { position: 'absolute', zIndex: 1000 }]}>
            <ScrollView
              style={{ maxHeight: 250 }}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {filteredOptions.map((item) => {
                const isSelected = value.includes(item.value);
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={getOptionStyle(isSelected, item.disabled || false)}
                    onPress={() => handleToggleOption(item)}
                    disabled={item.disabled}
                    activeOpacity={0.7}
                  >
                    <Text style={getOptionTextStyle(isSelected)}>
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Text style={{ color: theme.primary, fontSize: 16, fontWeight: 'bold', marginLeft: 8 }}>
                        ✓
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});
