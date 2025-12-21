import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal as RNModal,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ViewStyle,
  Dimensions,
  PanResponder,
  PanResponderInstance,
} from 'react-native';
import { useTheme } from '../theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'full';

interface DrawerProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: DrawerPosition;
  size?: DrawerSize;
  closeOnBackdropPress?: boolean;
  swipeToClose?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export const Drawer: React.FC<DrawerProps> = ({
  visible,
  onClose,
  children,
  position = 'left',
  size = 'md',
  closeOnBackdropPress = true,
  swipeToClose = true,
  style,
  contentStyle,
}) => {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const panResponder = useRef<PanResponderInstance>(null);

  useEffect(() => {
    if (visible) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [visible, animatedValue]);

  // Setup pan responder for swipe to close
  panResponder.current = PanResponder.create({
    onStartShouldSetPanResponder: () => false, // Don't start responder automatically
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      if (!swipeToClose) return false;

      const { dx, dy } = gestureState;
      const threshold = 15;

      switch (position) {
        case 'left':
          return dx > threshold && Math.abs(dy) < threshold;
        case 'right':
          return dx < -threshold && Math.abs(dy) < threshold;
        case 'top':
          return dy > threshold && Math.abs(dx) < threshold;
        case 'bottom':
          return dy < -threshold && Math.abs(dx) < threshold;
        default:
          return false;
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      const { dx, dy } = gestureState;
      let progress = 0;

      switch (position) {
        case 'left':
          progress = Math.max(0, dx) / getDrawerWidth();
          break;
        case 'right':
          progress = Math.max(0, -dx) / getDrawerWidth();
          break;
        case 'top':
          progress = Math.max(0, dy) / getDrawerHeight();
          break;
        case 'bottom':
          progress = Math.max(0, -dy) / getDrawerHeight();
          break;
      }

      progress = Math.min(progress, 1);
      animatedValue.setValue(1 - progress);
    },
    onPanResponderRelease: (evt, gestureState) => {
      const { dx, dy, vx, vy } = gestureState;
      let shouldClose = false;
      let velocity = 0;

      switch (position) {
        case 'left':
        case 'right':
          velocity = Math.abs(vx);
          shouldClose = dx > getDrawerWidth() * 0.4 || (dx > 50 && velocity > 0.5);
          break;
        case 'top':
        case 'bottom':
          velocity = Math.abs(vy);
          shouldClose = Math.abs(dy) > getDrawerHeight() * 0.4 || (Math.abs(dy) > 50 && velocity > 0.5);
          break;
      }

      if (shouldClose) {
        onClose();
      } else {
        Animated.spring(animatedValue, {
          toValue: 1,
          useNativeDriver: false,
          bounciness: 0,
        }).start();
      }
    },
  });

  const getModalStyle = (): ViewStyle => {
    return {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    };
  };

  const getDrawerWidth = (): number => {
    const sizeValues: Record<DrawerSize, number> = {
      sm: screenWidth * 0.4,
      md: screenWidth * 0.6,
      lg: screenWidth * 0.8,
      full: screenWidth,
    };
    return sizeValues[size];
  };

  const getDrawerHeight = (): number => {
    const sizeValues: Record<DrawerSize, number> = {
      sm: screenHeight * 0.4,
      md: screenHeight * 0.6,
      lg: screenHeight * 0.8,
      full: screenHeight,
    };
    return sizeValues[size];
  };

  const getDrawerStyle = (): Animated.AnimatedProps<ViewStyle> => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.backgroundPrimary,
      position: 'absolute',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
      borderWidth: 1,
      borderColor: theme.borderPrimary + '40', // Very subtle border
    };

    // Apply border radius based on position
    switch (position) {
      case 'left':
        baseStyle.borderTopRightRadius = 16;
        baseStyle.borderBottomRightRadius = 16;
        break;
      case 'right':
        baseStyle.borderTopLeftRadius = 16;
        baseStyle.borderBottomLeftRadius = 16;
        break;
      case 'top':
        baseStyle.borderBottomLeftRadius = 16;
        baseStyle.borderBottomRightRadius = 16;
        break;
      case 'bottom':
        baseStyle.borderTopLeftRadius = 16;
        baseStyle.borderTopRightRadius = 16;
        break;
    }

    let transform: any[] = [];

    switch (position) {
      case 'left':
        baseStyle.left = 0;
        baseStyle.top = 0;
        baseStyle.bottom = 0;
        baseStyle.width = getDrawerWidth();
        transform = [{
          translateX: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [-getDrawerWidth(), 0],
          }),
        }];
        break;
      case 'right':
        baseStyle.right = 0;
        baseStyle.top = 0;
        baseStyle.bottom = 0;
        baseStyle.width = getDrawerWidth();
        transform = [{
          translateX: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [getDrawerWidth(), 0],
          }),
        }];
        break;
      case 'top':
        baseStyle.top = 0;
        baseStyle.left = 0;
        baseStyle.right = 0;
        baseStyle.height = getDrawerHeight();
        transform = [{
          translateY: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [-getDrawerHeight(), 0],
          }),
        }];
        break;
      case 'bottom':
        baseStyle.bottom = 0;
        baseStyle.left = 0;
        baseStyle.right = 0;
        baseStyle.height = getDrawerHeight();
        transform = [{
          translateY: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [getDrawerHeight(), 0],
          }),
        }];
        break;
    }

    return {
      ...baseStyle,
      transform,
      ...style,
    };
  };

  const getContentStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flex: 1,
    };

    return {
      ...baseStyle,
      ...contentStyle,
    };
  };

  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={getModalStyle()}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleBackdropPress}
        />

        <Animated.View
          style={getDrawerStyle()}
          {...(panResponder.current?.panHandlers)}
        >
          <View style={getContentStyle()}>
            {children}
          </View>
        </Animated.View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
});
