import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../theme';

export type CardVariant = 'default' | 'elevated' | 'outlined';
export type CardSize = 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  onPress?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  titleStyle?: TextStyle;
  footerStyle?: ViewStyle;
  fullWidth?: boolean;
  showTitleUnderline?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  footer,
  variant = 'default',
  size = 'md',
  onPress,
  style,
  contentStyle,
  titleStyle,
  footerStyle,
  fullWidth = true,
  showTitleUnderline = false,
}) => {
  const { theme } = useTheme();

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 4,
      width: fullWidth ? '100%' : undefined,
      overflow: 'hidden',
    };

    const sizeStyles: Record<CardSize, ViewStyle> = {
      sm: { padding: 6 },
      md: { padding: 6 },
      lg: { padding: 6 },
    };

    const variantStyles: Record<CardVariant, ViewStyle> = {
      default: {
        backgroundColor: theme.backgroundPrimary,
        borderWidth: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
      elevated: {
        backgroundColor: theme.backgroundPrimary,
        borderWidth: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      },
      outlined: {
        backgroundColor: theme.backgroundPrimary,
        borderWidth: 1,
        borderColor: theme.borderPrimary,
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    };
  };

  const getContentStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flex: 1,
    };

    // Adjust padding based on whether title or footer exist
    if (title || footer) {
      return {
        ...baseStyle,
        paddingTop: title ? 8 : 0,
        paddingBottom: footer ? 8 : 0,
        ...contentStyle,
      };
    }

    return {
      ...baseStyle,
      ...contentStyle,
    };
  };

  const getTitleStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: 18,
      fontWeight: '600',
      color: theme.textPrimary,
      marginBottom: showTitleUnderline ? 8 : 0,
    };

    return {
      ...baseStyle,
      ...titleStyle,
    };
  };

  const getFooterStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.borderPrimary,
    };

    return {
      ...baseStyle,
      ...footerStyle,
    };
  };

  const CardContent = () => (
    <View style={getCardStyle()}>
      {title && (
        <View>
          <Text style={getTitleStyle()}>{title}</Text>
          {showTitleUnderline && (
            <View
              style={{
                height: 2,
                backgroundColor: theme.primary,
                borderRadius: 1,
                marginTop: 4,
              }}
            />
          )}
        </View>
      )}

      <View style={getContentStyle()}>
        {children}
      </View>

      {footer && (
        <View style={getFooterStyle()}>
          {footer}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
      >
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});
