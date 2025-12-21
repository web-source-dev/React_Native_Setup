import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '../theme';

export interface TimePickerProps extends Omit<TouchableOpacityProps, 'onPress'> {
  value?: Date;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  is24Hour?: boolean;
  minuteInterval?: number;
  disabled?: boolean;
  onTimeChange: (time: Date) => void;
  containerStyle?: ViewStyle;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  placeholder = 'Select time...',
  label,
  error,
  helperText,
  is24Hour = false,
  minuteInterval = 1,
  disabled = false,
  onTimeChange,
  containerStyle,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(value ? value.getHours() : 12);
  const [selectedMinute, setSelectedMinute] = useState(value ? value.getMinutes() : 0);
  const [isAM, setIsAM] = useState(value ? value.getHours() < 12 : true);

  const hours = is24Hour
    ? Array.from({ length: 24 }, (_, i) => i)
    : Array.from({ length: 12 }, (_, i) => i + 1);

  const minutes = Array.from({ length: 60 / minuteInterval }, (_, i) => i * minuteInterval);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: !is24Hour
    });
  };

  const handleTimeConfirm = () => {
    let hour = selectedHour;

    if (!is24Hour) {
      if (isAM) {
        hour = hour === 12 ? 0 : hour;
      } else {
        hour = hour === 12 ? 12 : hour + 12;
      }
    }

    const time = new Date();
    time.setHours(hour, selectedMinute, 0, 0);

    onTimeChange(time);
    setIsOpen(false);
  };

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      width: '100%',
    };

    return {
      ...baseStyle,
      ...containerStyle,
    };
  };

  const getTriggerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: error
        ? theme.error
        : isOpen
        ? theme.primary
        : theme.borderPrimary,
      backgroundColor: disabled ? theme.backgroundTertiary : theme.backgroundPrimary,
      opacity: disabled ? 0.6 : 1,
      paddingHorizontal: 12,
      paddingVertical: 10,
      minHeight: 44,
    };

    return {
      ...baseStyle,
      ...(style as ViewStyle),
    };
  };

  const getTextStyle = (): TextStyle => {
    return {
      fontSize: 16,
      color: value ? theme.textPrimary : theme.textMuted,
    };
  };

  const getLabelStyle = (): TextStyle => {
    return {
      fontSize: 14,
      fontWeight: '500',
      color: error ? theme.error : theme.textSecondary,
      marginBottom: 4,
    };
  };

  const getHelperTextStyle = (): TextStyle => {
    return {
      fontSize: 12,
      color: error ? theme.error : theme.textTertiary,
      marginTop: 4,
    };
  };

  const getModalStyle = (): ViewStyle => {
    return {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    };
  };

  const getPickerStyle = (): ViewStyle => {
    return {
      backgroundColor: theme.backgroundPrimary,
      borderRadius: 12,
      padding: 20,
      width: '90%',
      maxWidth: 400,
    };
  };

  const getTimeDisplayStyle = (): ViewStyle => {
    return {
      alignItems: 'center',
      marginBottom: 24,
      padding: 20,
      backgroundColor: theme.backgroundSecondary,
      borderRadius: 8,
    };
  };

  const getTimeTextStyle = (): TextStyle => {
    return {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.textPrimary,
    };
  };

  const getColumnsStyle = (): ViewStyle => {
    return {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 24,
    };
  };

  const getColumnStyle = (): ViewStyle => {
    return {
      alignItems: 'center',
      flex: 1,
    };
  };

  const getColumnTitleStyle = (): TextStyle => {
    return {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textSecondary,
      marginBottom: 8,
    };
  };

  const getScrollViewStyle = (): ViewStyle => {
    return {
      height: 120,
    };
  };

  const getTimeOptionStyle = (isSelected: boolean): ViewStyle => {
    return {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginVertical: 2,
      backgroundColor: isSelected ? theme.primary : 'transparent',
      minWidth: 60,
      alignItems: 'center',
    };
  };

  const getTimeOptionTextStyle = (isSelected: boolean): TextStyle => {
    return {
      fontSize: 18,
      color: isSelected ? theme.textInverse : theme.textPrimary,
      fontWeight: isSelected ? '600' : '400',
    };
  };

  const getAmPmStyle = (): ViewStyle => {
    return {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 24,
    };
  };

  const getAmPmButtonStyle = (isSelected: boolean): ViewStyle => {
    return {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: isSelected ? theme.primary : theme.backgroundSecondary,
      minWidth: 60,
      alignItems: 'center',
    };
  };

  const getAmPmTextStyle = (isSelected: boolean): TextStyle => {
    return {
      fontSize: 16,
      color: isSelected ? theme.textInverse : theme.textPrimary,
      fontWeight: isSelected ? '600' : '400',
    };
  };

  const getActionsStyle = (): ViewStyle => {
    return {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
    };
  };

  return (
    <View style={getContainerStyle()}>
      {label && <Text style={getLabelStyle()}>{label}</Text>}

      <TouchableOpacity
        style={getTriggerStyle()}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        activeOpacity={0.7}
        {...props}
      >
        <Text style={getTextStyle()}>
          {value ? formatTime(value) : placeholder}
        </Text>
        <Text style={{ color: theme.textMuted, fontSize: 16 }}>
          ▼
        </Text>
      </TouchableOpacity>

      {(error || helperText) && (
        <Text style={getHelperTextStyle()}>
          {error || helperText}
        </Text>
      )}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={getModalStyle()}>
          <View style={getPickerStyle()}>
            {/* Time Display */}
            <View style={getTimeDisplayStyle()}>
              <Text style={getTimeTextStyle()}>
                {String(selectedHour).padStart(2, '0')}:{String(selectedMinute).padStart(2, '0')}
                {!is24Hour && ` ${isAM ? 'AM' : 'PM'}`}
              </Text>
            </View>

            {/* Time Columns */}
            <View style={getColumnsStyle()}>
              {/* Hours */}
              <View style={getColumnStyle()}>
                <Text style={getColumnTitleStyle()}>Hour</Text>
                <ScrollView
                  style={getScrollViewStyle()}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={44}
                  decelerationRate="fast"
                >
                  {hours.map(hour => (
                    <TouchableOpacity
                      key={hour}
                      style={getTimeOptionStyle(selectedHour === hour)}
                      onPress={() => setSelectedHour(hour)}
                    >
                      <Text style={getTimeOptionTextStyle(selectedHour === hour)}>
                        {String(hour).padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Minutes */}
              <View style={getColumnStyle()}>
                <Text style={getColumnTitleStyle()}>Minute</Text>
                <ScrollView
                  style={getScrollViewStyle()}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={44}
                  decelerationRate="fast"
                >
                  {minutes.map(minute => (
                    <TouchableOpacity
                      key={minute}
                      style={getTimeOptionStyle(selectedMinute === minute)}
                      onPress={() => setSelectedMinute(minute)}
                    >
                      <Text style={getTimeOptionTextStyle(selectedMinute === minute)}>
                        {String(minute).padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* AM/PM Selector */}
            {!is24Hour && (
              <View style={getAmPmStyle()}>
                <TouchableOpacity
                  style={getAmPmButtonStyle(isAM)}
                  onPress={() => setIsAM(true)}
                >
                  <Text style={getAmPmTextStyle(isAM)}>AM</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={getAmPmButtonStyle(!isAM)}
                  onPress={() => setIsAM(false)}
                >
                  <Text style={getAmPmTextStyle(!isAM)}>PM</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Actions */}
            <View style={getActionsStyle()}>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                style={{ padding: 12 }}
              >
                <Text style={{ color: theme.textSecondary, fontSize: 16 }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleTimeConfirm}
                style={{ padding: 12 }}
              >
                <Text style={{ color: theme.primary, fontSize: 16, fontWeight: '600' }}>
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});
