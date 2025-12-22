import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../theme';

export type LoadingSize = 'sm' | 'md' | 'lg';
export type LoadingVariant = 'default' | 'overlay';

interface LoadingProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  text?: string;
  color?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'default',
  text,
  color,
  style,
  textStyle,
  fullScreen = false,
}) => {
  const { theme } = useTheme();

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      justifyContent: 'center',
      alignItems: 'center',
    };

    if (variant === 'overlay') {
      return {
        ...baseStyle,
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
        ...style,
      };
    }

    if (fullScreen) {
      return {
        ...baseStyle,
        flex: 1,
        backgroundColor: theme.backgroundPrimary,
        ...style,
      };
    }

    return {
      ...baseStyle,
      ...style,
    };
  };

  const getIndicatorSize = (): 'small' | 'large' => {
    switch (size) {
      case 'sm':
        return 'small';
      case 'lg':
        return 'large';
      default:
        return 'small';
    }
  };

  const getIndicatorColor = (): string => {
    return color || theme.primary;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      marginTop: 12,
      textAlign: 'center',
    };

    const sizeTextStyles: Record<LoadingSize, TextStyle> = {
      sm: { fontSize: 12 },
      md: { fontSize: 14 },
      lg: { fontSize: 16 },
    };

    return {
      ...baseStyle,
      ...sizeTextStyles[size],
      color: theme.textSecondary,
      ...textStyle,
    };
  };

  return (
    <View style={getContainerStyle()}>
      <ActivityIndicator
        size={getIndicatorSize()}
        color={getIndicatorColor()}
      />
      {text && <Text style={getTextStyle()}>{text}</Text>}
    </View>
  );
};

// Full screen loading component
export const FullScreenLoading: React.FC<{ text?: string }> = ({ text }) => {
  return <Loading variant="default" fullScreen text={text} size="lg" />;
};

// Overlay loading component
export const OverlayLoading: React.FC<{ text?: string }> = ({ text }) => {
  return <Loading variant="overlay" text={text} />;
};

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});
