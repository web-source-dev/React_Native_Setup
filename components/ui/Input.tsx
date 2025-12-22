import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../theme';

export type InputVariant = 'default' | 'filled' | 'outlined';
export type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: InputVariant;
  size?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  variant = 'outlined',
  size = 'md',
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  fullWidth = true,
  style,
  placeholderTextColor,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      width: fullWidth ? '100%' : undefined,
    };

    return {
      ...baseStyle,
      ...containerStyle,
    };
  };

  const getInputContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 8,
    };

    const sizeStyles: Record<InputSize, ViewStyle> = {
      sm: { minHeight: 36, paddingHorizontal: 8 },
      md: { minHeight: 44, paddingHorizontal: 12 },
      lg: { minHeight: 52, paddingHorizontal: 16 },
    };

    const variantStyles: Record<InputVariant, ViewStyle> = {
      default: {
        backgroundColor: theme.backgroundSecondary,
        borderWidth: 0,
      },
      filled: {
        backgroundColor: theme.backgroundTertiary,
        borderWidth: 1,
        borderColor: isFocused ? theme.primary : theme.borderPrimary,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: error
          ? theme.error
          : isFocused
          ? theme.primary
          : theme.borderPrimary,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getInputStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      flex: 1,
      color: theme.textPrimary,
      paddingVertical: 0, // Remove default padding
    };

    const sizeTextStyles: Record<InputSize, TextStyle> = {
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

  return (
    <View style={getContainerStyle()}>
      {label && <Text style={getLabelStyle()}>{label}</Text>}

      <View style={getInputContainerStyle()}>
        {leftIcon && (
          <View style={{ marginRight: 8, justifyContent: 'center' }}>
            {leftIcon}
          </View>
        )}

        <TextInput
          style={[getInputStyle(), style]}
          placeholderTextColor={placeholderTextColor || theme.textMuted}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={{ marginLeft: 8, justifyContent: 'center' }}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {(error || helperText) && (
        <Text style={getHelperTextStyle()}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});