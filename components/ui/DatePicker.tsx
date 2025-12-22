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
import { useTheme } from '../../theme';

export interface DatePickerProps extends Omit<TouchableOpacityProps, 'onPress'> {
  value?: Date;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  onDateChange: (date: Date) => void;
  containerStyle?: ViewStyle;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  placeholder = 'Select date...',
  label,
  error,
  helperText,
  minDate,
  maxDate,
  disabled = false,
  onDateChange,
  containerStyle,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(value || new Date());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day &&
           today.getMonth() === currentDate.getMonth() &&
           today.getFullYear() === currentDate.getFullYear();
  };

  const isSelected = (day: number) => {
    return value &&
           value.getDate() === day &&
           value.getMonth() === currentDate.getMonth() &&
           value.getFullYear() === currentDate.getFullYear();
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (!isDateDisabled(selectedDate)) {
      onDateChange(selectedDate);
      setIsOpen(false);
    }
  };

  const changeMonth = (increment: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  const changeYear = (increment: number) => {
    setCurrentDate(new Date(currentDate.getFullYear() + increment, currentDate.getMonth(), 1));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      maxHeight: '80%',
    };
  };

  const getHeaderStyle = (): ViewStyle => {
    return {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderPrimary,
    };
  };

  const getNavigationStyle = (): ViewStyle => {
    return {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    };
  };

  const getNavButtonStyle = (): ViewStyle => {
    return {
      padding: 8,
      borderRadius: 6,
      backgroundColor: theme.backgroundSecondary,
    };
  };

  const getNavButtonTextStyle = (): TextStyle => {
    return {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.textPrimary,
    };
  };

  const getMonthYearStyle = (): TextStyle => {
    return {
      fontSize: 18,
      fontWeight: '600',
      color: theme.textPrimary,
    };
  };

  const getCalendarStyle = (): ViewStyle => {
    return {
      marginBottom: 0,
    };
  };

  const getWeekdaysStyle = (): ViewStyle => {
    return {
      flexDirection: 'row',
      marginBottom: 8,
    };
  };

  const getWeekdayStyle = (): TextStyle => {
    return {
      flex: 1,
      textAlign: 'center',
      fontSize: 14,
      fontWeight: '600',
      color: theme.textSecondary,
    };
  };

  const getDaysGridStyle = (): ViewStyle => {
    return {
      flexDirection: 'row',
      flexWrap: 'wrap',
    };
  };

  const getDayStyle = (day: number | null, isSelected: boolean, isToday: boolean, isDisabled: boolean): ViewStyle => {
    const baseStyle: ViewStyle = {
      width: '14.28%', // 7 days in a week
      aspectRatio: 1,
      justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 0,
    };

    if (!day) {
      return baseStyle; // Empty cell
    }

    let backgroundColor = 'transparent';
    let borderRadius = 0;

    if (isSelected) {
      backgroundColor = theme.primary;
      borderRadius = 20;
    } else if (isToday) {
      backgroundColor = theme.primary + '20';
      borderRadius = 20;
    }

    return {
      ...baseStyle,
      backgroundColor,
      borderRadius,
      opacity: isDisabled ? 0.3 : 1,
    };
  };

  const getDayTextStyle = (day: number | null, isSelected: boolean, isToday: boolean): TextStyle => {
    if (!day) return {};

    return {
      fontSize: 16,
      color: isSelected ? theme.textInverse : isToday ? theme.primary : theme.textPrimary,
      fontWeight: isSelected || isToday ? '600' : '400',
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
          {value ? formatDate(value) : placeholder}
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
            {/* Header */}
            <View style={getHeaderStyle()}>
              <Text style={getMonthYearStyle()}>
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </Text>

              <View style={getNavigationStyle()}>
                <TouchableOpacity
                  style={getNavButtonStyle()}
                  onPress={() => changeYear(-1)}
                >
                  <Text style={getNavButtonTextStyle()}>«</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={getNavButtonStyle()}
                  onPress={() => changeMonth(-1)}
                >
                  <Text style={getNavButtonTextStyle()}>‹</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={getNavButtonStyle()}
                  onPress={() => changeMonth(1)}
                >
                  <Text style={getNavButtonTextStyle()}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={getNavButtonStyle()}
                  onPress={() => changeYear(1)}
                >
                  <Text style={getNavButtonTextStyle()}>»</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Calendar */}
            <View style={getCalendarStyle()}>
              {/* Weekdays */}
              <View style={getWeekdaysStyle()}>
                {daysOfWeek.map(day => (
                  <Text key={day} style={getWeekdayStyle()}>
                    {day}
                  </Text>
                ))}
              </View>

              {/* Days */}
              <View style={getDaysGridStyle()}>
                {getDaysInMonth(currentDate).map((day, index) => {
                  const date = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
                  const isDaySelected = day ? isSelected(day) : false;
                  const isDayToday = day ? isToday(day) : false;
                  const isDayDisabled = date ? isDateDisabled(date) : false;

                  return (
                    <TouchableOpacity
                      key={index}
                      style={getDayStyle(day, isDaySelected || false, isDayToday || false, isDayDisabled || false)}
                      onPress={() => day && handleDateSelect(day)}
                      disabled={!day || isDayDisabled}
                    >
                      <Text style={getDayTextStyle(day, isDaySelected || false, isDayToday || false)}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

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
                onPress={() => setIsOpen(false)}
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
