import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert as RNAlert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../theme/ThemeContext';
import { Button, Input, Alert } from '../../components/ui';
import { useAuth } from '../../context/authcontext';
import { Ionicons } from '@expo/vector-icons';

export default function ResetPasswordScreen() {
  const { theme } = useTheme();
  const { resetPassword, isLoading, error, clearError } = useAuth();
  const params = useLocalSearchParams();
  const token = (params.token as string) || '';
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    clearError();
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else {
      const hasUpperCase = /[A-Z]/.test(formData.password);
      const hasLowerCase = /[a-z]/.test(formData.password);
      const hasNumber = /\d/.test(formData.password);

      if (!hasUpperCase || !hasLowerCase || !hasNumber) {
        newErrors.password = 'Password must contain uppercase, lowercase, and a number';
      }
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!token) {
      showAlert('Reset token is missing. Please request a new password reset.');
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      clearError();
      await resetPassword({
        token,
        password: formData.password,
      });
      
      RNAlert.alert(
        'Success',
        'Your password has been reset successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed';
      showAlert(errorMessage);
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
              Reset Password
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Enter your new password
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="New Password"
              placeholder="Enter your new password"
              value={formData.password}
              onChangeText={(text) => handleChange('password', text)}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              error={errors.password || undefined}
              variant="outlined"
              size="md"
              containerStyle={styles.input}
              helperText="Must contain uppercase, lowercase, and a number"
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} />}
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your new password"
              value={formData.confirmPassword}
              onChangeText={(text) => handleChange('confirmPassword', text)}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              error={errors.confirmPassword || undefined}
              variant="outlined"
              size="md"
              containerStyle={styles.input}
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} />}
            />

            <Button
              title={isLoading ? 'Resetting...' : 'Reset Password'}
              onPress={handleResetPassword}
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
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

