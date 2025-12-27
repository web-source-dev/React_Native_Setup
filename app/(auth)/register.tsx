import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../theme/ThemeContext';
import { Button, Input, Alert } from '../../components/ui';
import { useAuth } from '../../context/authcontext';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const { theme } = useTheme();
  const { register, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
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

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      clearError();
      await register({
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim() || undefined,
        lastName: formData.lastName.trim() || undefined,
      });
      router.replace('/(tabs)');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
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
              Create Account
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Sign up to get started
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.nameRow}>
              <Input
                label="First Name"
                placeholder="First name"
                value={formData.firstName}
                onChangeText={(text) => handleChange('firstName', text)}
                autoCapitalize="words"
                variant="outlined"
                size="md"
                containerStyle={{ ...styles.input, ...styles.nameInput }}
                leftIcon={<Ionicons name="person-outline" size={20} color={theme.textSecondary} />}
              />
              <Input
                label="Last Name"
                placeholder="Last name"
                value={formData.lastName}
                onChangeText={(text) => handleChange('lastName', text)}
                autoCapitalize="words"
                variant="outlined"
                size="md"
                containerStyle={{ ...styles.input, ...styles.nameInput }}
                leftIcon={<Ionicons name="person-outline" size={20} color={theme.textSecondary} />}
              />
            </View>

            <Input
              label="Email"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email || undefined}
              variant="outlined"
              size="md"
              containerStyle={styles.input}
              leftIcon={<Ionicons name="mail-outline" size={20} color={theme.textSecondary} />}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
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
              placeholder="Confirm your password"
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
              title={isLoading ? 'Creating Account...' : 'Sign Up'}
              onPress={handleRegister}
              disabled={isLoading}
              loading={isLoading}
              variant="primary"
              size="md"
              fullWidth
              style={styles.button}
              leftIcon={!isLoading ? <Ionicons name="person-add" size={18} color={theme.textInverse} /> : undefined}
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
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

