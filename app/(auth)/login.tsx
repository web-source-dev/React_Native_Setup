import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../theme/ThemeContext';
import { Button, Input, Alert } from '../../components/ui';
import { useAuth } from '../../context/authcontext';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleLogin = async () => {
    setEmailError(null);
    setPasswordError(null);
    clearError();

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!email.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      return;
    }

    try {
      await login({ email: email.trim(), password });
      router.replace('/(tabs)');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
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
              Welcome Back
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Sign in to your account
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

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError(null);
                clearError();
              }}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              error={passwordError || undefined}
              variant="outlined"
              size="md"
              containerStyle={styles.input}
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} />}
            />

            <Button
              title={isLoading ? 'Signing in...' : 'Sign In'}
              onPress={handleLogin}
              disabled={isLoading}
              loading={isLoading}
              variant="primary"
              size="md"
              fullWidth
              style={styles.button}
              leftIcon={!isLoading ? <Ionicons name="log-in" size={18} color={theme.textInverse} /> : undefined}
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

