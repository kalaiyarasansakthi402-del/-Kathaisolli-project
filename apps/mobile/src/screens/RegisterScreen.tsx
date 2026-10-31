import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface RegisterScreenProps {
  onSignUp?: (name: string, email: string, pass: string) => void;
  onNavigateToLogin?: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onSignUp,
  onNavigateToLogin,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F5E9" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoEmoji}>🌿</Text>
              </View>
              <Text style={styles.brandText}>Kathaisolli</Text>
            </View>

            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.tamilSubtitle}>புதிய வாசகர் பதிவு</Text>
            <Text style={styles.subtitle}>
              Join thousands of Tamil audio story lovers. 100% Free.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Anzles Kumar"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="anzles@gmail.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.signUpButton}
              onPress={() => onSignUp?.(name, email, password)}
              activeOpacity={0.8}
            >
              <Text style={styles.signUpButtonText}>Create Free Account</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already registered?{' '}
              <Text style={styles.footerLink} onPress={onNavigateToLogin}>
                Log In
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5E9',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingVertical: 32,
  },
  header: {
    marginTop: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 16,
  },
  brandText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#064E3B',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#064E3B',
  },
  tamilSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 18,
  },
  form: {
    marginVertical: 18,
    gap: 14,
  },
  inputGroup: {
    gap: 5,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 11,
    fontSize: 14,
    color: '#111827',
  },
  signUpButton: {
    backgroundColor: '#064E3B',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#4B5563',
  },
  footerLink: {
    color: '#064E3B',
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
});
