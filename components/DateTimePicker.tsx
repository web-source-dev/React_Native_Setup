import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  ScrollView,
} from 'react-native';
import { useTheme } from '../theme';

export interface DateTimePickerProps extends Omit<TouchableOpacityProps, 'onPress'> {
  value?: Date;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  minDate?: Date;
  maxDate?: Date;
  is24Hour?: boolean;
  minuteInterval?: number;
  disabled?: boolean;
  onDateTimeChange: (dateTime: Date) => void;
  containerStyle?: ViewStyle;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  placeholder = 'Select date and time...',
  label,
  error,
  helperText,
  minDate,
  maxDate,
  is24Hour = false,
  minuteInterval = 1,
  disabled = false,
  onDateTimeChange,
  containerStyle,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'date' | 'time'>('date');
  const [tempDate, setTempDate] = useState(value || new Date());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const hours = is24Hour
    ? Array.from({ length: 24 }, (_, i) => i)
    : Array.from({ length: 12 }, (_, i) => i + 1);

  const minutes = Array.from({ length: 60 / minuteInterval }, (_, i) => i * minuteInterval);

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
           today.getMonth() === tempDate.getMonth() &&
           today.getFullYear() === tempDate.getFullYear();
  };

  const isDateSelected = (day: number) => {
    return tempDate.getDate() === day &&
           tempDate.getMonth() === tempDate.getMonth() &&
           tempDate.getFullYear() === tempDate.getFullYear();
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), day);
    if (!isDateDisabled(selectedDate)) {
      setTempDate(selectedDate);
    }
  };

  const handleTimeSelect = (hour: number, minute: number, isAM: boolean) => {
    let adjustedHour = hour;

    if (!is24Hour) {
      if (isAM) {
        adjustedHour = hour === 12 ? 0 : hour;
      } else {
        adjustedHour = hour === 12 ? 12 : hour + 12;
      }
    }

    const newDateTime = new Date(tempDate);
    newDateTime.setHours(adjustedHour, minute, 0, 0);
    setTempDate(newDateTime);
  };

  const changeMonth = (increment: number) => {
    setTempDate(new Date(tempDate.getFullYear(), tempDate.getMonth() + increment, 1));
  };

  const changeYear = (increment: number) => {
    setTempDate(new Date(tempDate.getFullYear() + increment, tempDate.getMonth(), 1));
  };

  const handleConfirm = () => {
    onDateTimeChange(tempDate);
    setIsOpen(false);
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: !is24Hour
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

  const getTabsStyle = (): ViewStyle => {
    return {
      flexDirection: 'row',
      marginBottom: 20,
      backgroundColor: theme.backgroundSecondary,
      borderRadius: 8,
      padding: 4,
    };
  };

  const getTabStyle = (isActive: boolean): ViewStyle => {
    return {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
      backgroundColor: isActive ? theme.primary : 'transparent',
      alignItems: 'center',
    };
  };

  const getTabTextStyle = (isActive: boolean): TextStyle => {
    return {
      fontSize: 16,
      fontWeight: isActive ? '600' : '400',
      color: isActive ? theme.textInverse : theme.textPrimary,
    };
  };

  const getContentStyle = (): ViewStyle => {
    return {
      flex: 1,
      minHeight: 300,
    };
  };

  const getActionsStyle = (): ViewStyle => {
    return {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
      marginTop: 20,
    };
  };

  // Date picker styles (same as DatePicker component)
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
      marginBottom: 20,
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
      marginVertical: 2,
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

  // Time picker styles
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
          {value ? formatDateTime(value) : placeholder}
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
            {/* Tabs */}
            <View style={getTabsStyle()}>
              <TouchableOpacity
                style={getTabStyle(activeTab === 'date')}
                onPress={() => setActiveTab('date')}
              >
                <Text style={getTabTextStyle(activeTab === 'date')}>Date</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={getTabStyle(activeTab === 'time')}
                onPress={() => setActiveTab('time')}
              >
                <Text style={getTabTextStyle(activeTab === 'time')}>Time</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={getContentStyle()}>
              {activeTab === 'date' ? (
                <>
                  {/* Date Picker Header */}
                  <View style={getHeaderStyle()}>
                    <Text style={getMonthYearStyle()}>
                      {months[tempDate.getMonth()]} {tempDate.getFullYear()}
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
                      {getDaysInMonth(tempDate).map((day, index) => {
                        const date = day ? new Date(tempDate.getFullYear(), tempDate.getMonth(), day) : null;
                        const isDaySelected = day ? isDateSelected(day) : false;
                        const isDayToday = day ? isToday(day) : false;
                        const isDayDisabled = date ? isDateDisabled(date) : false;

                        return (
                          <TouchableOpacity
                            key={index}
                            style={getDayStyle(day, isDaySelected, isDayToday, isDayDisabled)}
                            onPress={() => day && handleDateSelect(day)}
                            disabled={!day || isDayDisabled}
                          >
                            <Text style={getDayTextStyle(day, isDaySelected, isDayToday)}>
                              {day}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </>
              ) : (
                <>
                  {/* Time Display */}
                  <View style={getTimeDisplayStyle()}>
                    <Text style={getTimeTextStyle()}>
                      {String(tempDate.getHours() % (is24Hour ? 24 : 12) || (is24Hour ? 0 : 12)).padStart(2, '0')}:
                      {String(tempDate.getMinutes()).padStart(2, '0')}
                      {!is24Hour && ` ${tempDate.getHours() < 12 ? 'AM' : 'PM'}`}
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
                            style={getTimeOptionStyle((tempDate.getHours() % (is24Hour ? 24 : 12) || (is24Hour ? 0 : 12)) === hour)}
                            onPress={() => handleTimeSelect(hour, tempDate.getMinutes(), tempDate.getHours() < 12)}
                          >
                            <Text style={getTimeOptionTextStyle((tempDate.getHours() % (is24Hour ? 24 : 12) || (is24Hour ? 0 : 12)) === hour)}>
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
                            style={getTimeOptionStyle(tempDate.getMinutes() === minute)}
                            onPress={() => handleTimeSelect(tempDate.getHours(), minute, tempDate.getHours() < 12)}
                          >
                            <Text style={getTimeOptionTextStyle(tempDate.getMinutes() === minute)}>
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
                        style={getAmPmButtonStyle(tempDate.getHours() < 12)}
                        onPress={() => handleTimeSelect(tempDate.getHours() % 12 || 12, tempDate.getMinutes(), true)}
                      >
                        <Text style={getAmPmTextStyle(tempDate.getHours() < 12)}>AM</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={getAmPmButtonStyle(tempDate.getHours() >= 12)}
                        onPress={() => handleTimeSelect(tempDate.getHours() % 12 || 12, tempDate.getMinutes(), false)}
                      >
                        <Text style={getAmPmTextStyle(tempDate.getHours() >= 12)}>PM</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
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
                onPress={handleConfirm}
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
