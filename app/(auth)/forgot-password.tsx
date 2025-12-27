import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert as RNAlert } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../theme/ThemeContext';
import { Button, Input, Alert } from '../../components/ui';
import { useAuth } from '../../context/authcontext';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const { forgotPassword, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState<'success' | 'error'>('success');

  const showAlert = (message: string, variant: 'success' | 'error' = 'error') => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setAlertVisible(true);
  };

  const handleForgotPassword = async () => {
    setEmailError(null);
    clearError();

    if (!email.trim()) {
      setEmailError('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      await forgotPassword({ email: email.trim() });
      RNAlert.alert(
        'Email Sent',
        'If an account with that email exists, a password reset OTP has been sent to your email.',
        [
          {
            text: 'OK',
            onPress: () => router.push({
              pathname: '/(auth)/verify-otp',
              params: { email: email.trim() },
            }),
          },
        ]
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email';
      showAlert(errorMessage, 'error');
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
              Forgot Password
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Enter your email address and we'll send you an OTP to reset your password
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError(null);
                clearError();
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={emailError || undefined}
              variant="outlined"
              size="md"
              containerStyle={styles.input}
              leftIcon={<Ionicons name="mail-outline" size={20} color={theme.textSecondary} />}
            />

            <Button
              title={isLoading ? 'Sending...' : 'Send OTP'}
              onPress={handleForgotPassword}
              disabled={isLoading}
              loading={isLoading}
              variant="primary"
              size="md"
              fullWidth
              style={styles.button}
              leftIcon={!isLoading ? <Ionicons name="mail" size={18} color={theme.textInverse} /> : undefined}
            />
          </View>

        <Alert
          visible={alertVisible}
          message={alertMessage}
          variant={alertVariant}
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
    marginBottom: 24,
  },
  button: {
    marginTop: 8,
  },
});

