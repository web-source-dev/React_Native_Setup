import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../theme';

export type ListItemVariant = 'default' | 'chevron' | 'switch' | 'radio';

interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
  variant?: ListItemVariant;
  disabled?: boolean;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onPress,
  variant = 'default',
  disabled = false,
  style,
  titleStyle,
  subtitleStyle,
}) => {
  const { theme } = useTheme();

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.backgroundPrimary,
      opacity: disabled ? 0.6 : 1,
    };

    return {
      ...baseStyle,
      ...style,
    };
  };

  const getTitleStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: 16,
      color: theme.textPrimary,
      fontWeight: '500',
      flex: 1,
    };

    return {
      ...baseStyle,
      ...titleStyle,
    };
  };

  const getSubtitleStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 2,
    };

    return {
      ...baseStyle,
      ...subtitleStyle,
    };
  };

  const renderRightElement = () => {
    switch (variant) {
      case 'chevron':
        return (
          <View style={styles.chevron}>
            <Text style={{ color: theme.textMuted, fontSize: 16 }}>›</Text>
          </View>
        );
      case 'switch':
      case 'radio':
        return rightIcon;
      default:
        return rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>;
    }
  };

  const handlePress = () => {
    if (!disabled && onPress) {
      onPress();
    }
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={getContainerStyle()}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      {leftIcon && (
        <View style={styles.leftIcon}>
          {leftIcon}
        </View>
      )}

      <View style={styles.content}>
        <Text style={getTitleStyle()}>{title}</Text>
        {subtitle && <Text style={getSubtitleStyle()}>{subtitle}</Text>}
      </View>

      {renderRightElement()}
    </Container>
  );
};

const styles = StyleSheet.create({
  leftIcon: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  rightIcon: {
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
