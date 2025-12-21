import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Dimensions,
} from 'react-native';
import { useTheme } from '../theme';

const { width: screenWidth } = Dimensions.get('window');

export type AlertVariant = 'success' | 'warning' | 'error' | 'info';
export type AlertPosition = 'top' | 'bottom';

interface AlertProps {
  visible: boolean;
  title?: string;
  message: string;
  variant?: AlertVariant;
  position?: AlertPosition;
  duration?: number;
  onDismiss?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  messageStyle?: TextStyle;
  closable?: boolean;
}

export const Alert: React.FC<AlertProps> = ({
  visible,
  title,
  message,
  variant = 'info',
  position = 'top',
  duration = 4000,
  onDismiss,
  style,
  titleStyle,
  messageStyle,
  closable = true,
}) => {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      // Show alert
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto dismiss after duration
      if (duration > 0) {
        timeoutRef.current = setTimeout(() => {
          dismissAlert();
        }, duration);
      }
    } else {
      // Hide alert
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, animatedValue, duration]);

  const dismissAlert = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDismiss?.();
    });
  };

  const getContainerStyle = (): Animated.AnimatedProps<ViewStyle> => {
    const translateY = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: position === 'top' ? [-100, 0] : [100, 0],
    });

    const baseStyle: ViewStyle = {
      position: 'absolute',
      left: 16,
      right: 16,
      zIndex: 1000,
      borderRadius: 8,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'flex-start',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    };

    if (position === 'top') {
      baseStyle.top = 50;
    } else {
      baseStyle.bottom = 50;
    }

    const variantStyles: Record<AlertVariant, ViewStyle> = {
      success: {
        backgroundColor: theme.success,
      },
      warning: {
        backgroundColor: theme.warning,
      },
      error: {
        backgroundColor: theme.error,
      },
      info: {
        backgroundColor: theme.info,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      transform: [{ translateY }],
      ...style,
    };
  };

  const getTitleStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textInverse,
      marginBottom: 4,
    };

    return {
      ...baseStyle,
      ...titleStyle,
    };
  };

  const getMessageStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: 14,
      color: theme.textInverse,
      flex: 1,
    };

    return {
      ...baseStyle,
      ...messageStyle,
    };
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View style={getContainerStyle()}>
      <View style={styles.content}>
        {title && <Text style={getTitleStyle()}>{title}</Text>}
        <Text style={getMessageStyle()}>{message}</Text>
      </View>

      {closable && (
        <TouchableOpacity
          onPress={dismissAlert}
          style={styles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={{ color: theme.textInverse, fontSize: 18, fontWeight: 'bold' }}>
            ×
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  closeButton: {
    marginLeft: 12,
    padding: 2,
  },
});
