import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../theme/ThemeContext';
import { Button, Alert } from '../../components/ui';
import { useAuth } from '../../context/authcontext';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyOTPScreen() {
  const { theme } = useTheme();
  const { verifyOTP, isLoading, error, clearError } = useAuth();
  const params = useLocalSearchParams();
  const email = (params.email as string) || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((char, i) => {
        if (index + i < 6) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      // Focus last input
      if (index + pastedOtp.length < 6) {
        inputRefs.current[index + pastedOtp.length]?.focus();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    clearError();

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      showAlert('Please enter the complete 6-digit OTP');
      return;
    }

    if (!email) {
      showAlert('Email is required');
      return;
    }

    try {
      clearError();
      const result = await verifyOTP({ email, otp: otpString });
      
      // Navigate to reset password with token
      router.push({
        pathname: '/(auth)/reset-password',
        params: { token: result.token, email },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'OTP verification failed';
      showAlert(errorMessage);
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.backgroundPrimary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Verify OTP
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Enter the 6-digit code sent to{'\n'}
              <Text style={{ fontWeight: '600' }}>{email || 'your email'}</Text>
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.otpInput,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      borderColor: digit ? theme.primary : theme.borderPrimary,
                      color: theme.textPrimary,
                    },
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(index, value)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            <Button
              title={isLoading ? 'Verifying...' : 'Verify OTP'}
              onPress={handleVerify}
              disabled={isLoading}
              loading={isLoading}
              variant="primary"
              size="md"
              fullWidth
              style={styles.button}
              leftIcon={!isLoading ? <Ionicons name="checkmark-circle" size={18} color={theme.textInverse} /> : undefined}
            />
          </View>

        <Alert
          visible={alertVisible}
          message={alertMessage}
          variant="error"
          position="top"
          onDismiss={() => setAlertVisible(false)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 8,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
  },
  button: {
    marginTop: 8,
  },
});

