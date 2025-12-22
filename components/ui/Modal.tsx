import React, { useEffect } from 'react';
import {
  View,
  Modal as RNModal,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme';

const { height: screenHeight } = Dimensions.get('window');

export type ModalSize = 'sm' | 'md' | 'lg' | 'full';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: ModalSize;
  closeOnBackdropPress?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  size = 'md',
  closeOnBackdropPress = true,
  style,
  contentStyle,
}) => {
  const { theme } = useTheme();

  useEffect(() => {
    if (visible && Platform.OS === 'ios') {
      // Prevent body scroll on iOS when modal is open
    }
  }, [visible]);

  const getModalStyle = (): ViewStyle => {
    return {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      ...style,
    };
  };

  const getContentStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.backgroundPrimary,
      borderRadius: 12,
      maxHeight: screenHeight * 0.8,
    };

    const sizeStyles: Record<ModalSize, ViewStyle> = {
      sm: {
        width: '80%',
        maxWidth: 300,
        padding: 4,
      },
      md: {
        width: '85%',
        maxWidth: 400,
        padding: 4,
      },
      lg: {
        width: '90%',
        maxWidth: 500,
        padding: 4,
      },
      full: {
        width: '95%',
        height: '90%',
        padding: 4,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...contentStyle,
    };
  };

  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={getModalStyle()}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleBackdropPress}
        />

        <View style={getContentStyle()}>
          {children}
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
});
