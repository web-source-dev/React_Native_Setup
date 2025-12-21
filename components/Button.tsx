import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  View,
  GestureResponderEvent,
} from 'react-native';
import { useTheme } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      opacity: disabled || loading ? 0.6 : 1,
      width: fullWidth ? '100%' : undefined,
    };

    const sizeStyles: Record<ButtonSize, ViewStyle> = {
      sm: { paddingHorizontal: 12, paddingVertical: 8, minHeight: 36 },
      md: { paddingHorizontal: 16, paddingVertical: 12, minHeight: 44 },
      lg: { paddingHorizontal: 20, paddingVertical: 16, minHeight: 52 },
    };

    const variantStyles: Record<ButtonVariant, ViewStyle> = {
      primary: {
        backgroundColor: theme.primary,
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: theme.secondary,
        borderWidth: 0,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
      danger: {
        backgroundColor: theme.error,
        borderWidth: 0,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    const sizeTextStyles: Record<ButtonSize, TextStyle> = {
      sm: { fontSize: 14 },
      md: { fontSize: 16 },
      lg: { fontSize: 18 },
    };

    const variantTextStyles: Record<ButtonVariant, TextStyle> = {
      primary: { color: theme.textInverse },
      secondary: { color: theme.textInverse },
      outline: { color: theme.primary },
      ghost: { color: theme.primary },
      danger: { color: theme.textInverse },
    };

    return {
      ...baseTextStyle,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
    };
  };

  const handlePress = () => {
    if (!disabled && !loading && props.onPress) {
      props.onPress(null as unknown as GestureResponderEvent);
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'ghost'
              ? theme.primary
              : theme.textInverse
          }
          style={{ marginRight: 8 }}
        />
      )}
      {!loading && leftIcon && <View style={{ marginRight: 8 }}>{leftIcon}</View>}
      <Text style={getTextStyle()}>{title}</Text>
      {!loading && rightIcon && <View style={{ marginLeft: 8 }}>{rightIcon}</View>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});