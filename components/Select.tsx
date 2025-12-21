import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useTheme } from '../theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export type SelectSize = 'sm' | 'md' | 'lg';

interface SelectProps extends Omit<TouchableOpacityProps, 'onPress'> {
  options: SelectOption[];
  value?: string | number;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  size?: SelectSize;
  disabled?: boolean;
  searchable?: boolean;
  onValueChange: (value: string | number) => void;
  containerStyle?: ViewStyle;
  dropdownStyle?: ViewStyle;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  placeholder = 'Select an option...',
  label,
  error,
  helperText,
  size = 'md',
  disabled = false,
  searchable = false,
  onValueChange,
  containerStyle,
  dropdownStyle,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [triggerLayout, setTriggerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const triggerRef = useRef<View>(null);

  const selectedOption = options.find(option => option.value === value);

  const filteredOptions = searchable && searchText
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchText.toLowerCase())
      )
    : options;

  // Update dropdown position when it opens
  useEffect(() => {
    if (isOpen) {
      const dropdownHeight = Math.min(filteredOptions.length * 48 + 8, 200);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = () => setIsOpen(false);
      // This would need a proper click outside handler in a real implementation
      // For now, we'll use a timeout to close after interaction
    }
  }, [isOpen]);

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
    };

    const sizeStyles: Record<SelectSize, ViewStyle> = {
      sm: { paddingHorizontal: 8, paddingVertical: 6, minHeight: 36 },
      md: { paddingHorizontal: 12, paddingVertical: 10, minHeight: 44 },
      lg: { paddingHorizontal: 16, paddingVertical: 14, minHeight: 52 },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...(style as ViewStyle),
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      flex: 1,
      color: selectedOption ? theme.textPrimary : theme.textMuted,
    };

    const sizeTextStyles: Record<SelectSize, TextStyle> = {
      sm: { fontSize: 14 },
      md: { fontSize: 16 },
      lg: { fontSize: 18 },
    };

    return {
      ...baseStyle,
      ...sizeTextStyles[size],
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
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: filteredOptions.length > 1 ? 1 : 0,
      borderBottomColor: theme.borderPrimary,
    };

    if (isSelected) {
      return {
        ...baseStyle,
        backgroundColor: theme.primary + '15',
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

  const handleSelect = (option: SelectOption) => {
    if (!option.disabled) {
      onValueChange(option.value);
      setIsOpen(false);
      setSearchText('');
    }
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
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
          <Text style={getTextStyle()}>
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
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
              style={{ maxHeight: 200 }}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {filteredOptions.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={getOptionStyle(
                    selectedOption?.value === item.value,
                    item.disabled || false
                  )}
                  onPress={() => handleSelect(item)}
                  disabled={item.disabled}
                  activeOpacity={0.7}
                >
                  <Text style={getOptionTextStyle(selectedOption?.value === item.value)}>
                    {item.label}
                  </Text>
                  {selectedOption?.value === item.value && (
                    <Text style={{ color: theme.primary, fontSize: 16, fontWeight: 'bold', marginLeft: 8 }}>
                      ✓
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
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
