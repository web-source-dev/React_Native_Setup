import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../theme';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  title: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  title,
  variant = 'default',
  size = 'md',
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'flex-start',
    };

    const sizeStyles: Record<BadgeSize, ViewStyle> = {
      sm: { paddingHorizontal: 6, paddingVertical: 2, minHeight: 18 },
      md: { paddingHorizontal: 8, paddingVertical: 4, minHeight: 22 },
      lg: { paddingHorizontal: 12, paddingVertical: 6, minHeight: 28 },
    };

    const variantStyles: Record<BadgeVariant, ViewStyle> = {
      default: {
        backgroundColor: theme.backgroundTertiary,
        borderWidth: 1,
        borderColor: theme.borderPrimary,
      },
      primary: {
        backgroundColor: theme.primary,
      },
      secondary: {
        backgroundColor: theme.secondary,
      },
      success: {
        backgroundColor: theme.success,
      },
      warning: {
        backgroundColor: theme.warning,
      },
      danger: {
        backgroundColor: theme.error,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    const sizeTextStyles: Record<BadgeSize, TextStyle> = {
      sm: { fontSize: 10 },
      md: { fontSize: 12 },
      lg: { fontSize: 14 },
    };

    const variantTextStyles: Record<BadgeVariant, TextStyle> = {
      default: { color: theme.textSecondary },
      primary: { color: theme.textInverse },
      secondary: { color: theme.textInverse },
      success: { color: theme.textInverse },
      warning: { color: theme.textPrimary },
      danger: { color: theme.textInverse },
    };

    return {
      ...baseStyle,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
      ...textStyle,
    };
  };

  return (
    <View style={getContainerStyle()}>
      <Text style={getTextStyle()}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});
