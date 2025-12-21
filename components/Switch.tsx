import React from 'react';
import {
  TouchableOpacity,
  View,
  Animated,
  StyleSheet,
  ViewStyle,
  ColorValue,
} from 'react-native';
import { useTheme } from '../theme';

export type SwitchSize = 'sm' | 'md' | 'lg';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  size?: SwitchSize;
  disabled?: boolean;
  style?: ViewStyle;
  trackStyle?: ViewStyle;
  thumbStyle?: ViewStyle;
}

export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  size = 'md',
  disabled = false,
  style,
  trackStyle,
  thumbStyle,
}) => {
  const { theme } = useTheme();
  const animatedValue = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, animatedValue]);

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      justifyContent: 'center',
      opacity: disabled ? 0.6 : 1,
    };

    return {
      ...baseStyle,
      ...style,
    };
  };

  const getTrackStyle = (): ViewStyle => {
    const sizeValues: Record<SwitchSize, { width: number; height: number }> = {
      sm: { width: 36, height: 20 },
      md: { width: 44, height: 24 },
      lg: { width: 52, height: 28 },
    };

    const baseStyle: ViewStyle = {
      width: sizeValues[size].width,
      height: sizeValues[size].height,
      borderRadius: sizeValues[size].height / 2,
      justifyContent: 'center',
      paddingHorizontal: 2,
    };

    const backgroundColor = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.borderSecondary, theme.primary],
    });

    return {
      ...baseStyle,
      backgroundColor: backgroundColor as unknown as ColorValue,
      ...trackStyle,
    };
  };

  const getThumbStyle = (): ViewStyle => {
    const sizeValues: Record<SwitchSize, { thumbSize: number; trackWidth: number }> = {
      sm: { thumbSize: 16, trackWidth: 36 },
      md: { thumbSize: 20, trackWidth: 44 },
      lg: { thumbSize: 24, trackWidth: 52 },
    };

    const translateX = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, sizeValues[size].trackWidth - sizeValues[size].thumbSize - 4],
    });

    const baseStyle: ViewStyle = {
      width: sizeValues[size].thumbSize,
      height: sizeValues[size].thumbSize,
      borderRadius: sizeValues[size].thumbSize / 2,
      backgroundColor: theme.backgroundPrimary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    };

    return {
      ...baseStyle,
      transform: [{ translateX }],
      ...thumbStyle,
    };
  };

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <TouchableOpacity
      style={getContainerStyle()}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Animated.View style={getTrackStyle()}>
        <Animated.View style={getThumbStyle()} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});
