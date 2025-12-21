import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageSourcePropType,
} from 'react-native';
import { useTheme } from '../theme';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarVariant = 'circular' | 'rounded';

interface AvatarProps {
  source?: ImageSourcePropType;
  name?: string;
  size?: AvatarSize;
  variant?: AvatarVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  placeholder?: string;
  showOnlineIndicator?: boolean;
  isOnline?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  variant = 'circular',
  style,
  textStyle,
  placeholder,
  showOnlineIndicator = false,
  isOnline = false,
}) => {
  const { theme } = useTheme();

  const getContainerStyle = (): ViewStyle => {
    const sizeValues: Record<AvatarSize, number> = {
      xs: 24,
      sm: 32,
      md: 40,
      lg: 48,
      xl: 64,
    };

    const borderRadius = variant === 'circular' ? sizeValues[size] / 2 : 8;

    const baseStyle: ViewStyle = {
      width: sizeValues[size],
      height: sizeValues[size],
      borderRadius,
      backgroundColor: theme.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    };

    return {
      ...baseStyle,
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const fontSizes: Record<AvatarSize, number> = {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 20,
    };

    const baseStyle: TextStyle = {
      fontSize: fontSizes[size],
      fontWeight: '600',
      color: theme.textInverse,
    };

    return {
      ...baseStyle,
      ...textStyle,
    };
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const renderContent = () => {
    if (source) {
      return (
        <Image
          source={source}
          style={styles.image}
          resizeMode="cover"
        />
      );
    }

    if (name) {
      return (
        <Text style={getTextStyle()}>
          {getInitials(name)}
        </Text>
      );
    }

    if (placeholder) {
      return (
        <Text style={getTextStyle()}>
          {placeholder}
        </Text>
      );
    }

    // Default placeholder
    return (
      <Text style={getTextStyle()}>
        ?
      </Text>
    );
  };

  const getOnlineIndicatorStyle = (): ViewStyle => {
    const sizeValues: Record<AvatarSize, number> = {
      xs: 6,
      sm: 8,
      md: 10,
      lg: 12,
      xl: 14,
    };

    const positionValues: Record<AvatarSize, number> = {
      xs: 18,
      sm: 24,
      md: 30,
      lg: 36,
      xl: 48,
    };

    return {
      position: 'absolute',
      width: sizeValues[size],
      height: sizeValues[size],
      borderRadius: sizeValues[size] / 2,
      backgroundColor: isOnline ? theme.success : theme.textMuted,
      borderWidth: 2,
      borderColor: theme.backgroundPrimary,
      bottom: 0,
      right: -positionValues[size] + sizeValues[size],
    };
  };

  return (
    <View style={getContainerStyle()}>
      {renderContent()}
      {showOnlineIndicator && (
        <View style={getOnlineIndicatorStyle()} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});
