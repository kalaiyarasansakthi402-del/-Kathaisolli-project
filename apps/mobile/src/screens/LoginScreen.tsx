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
  ScrollView,
} from 'react-native';
import { BookOpen, Mail, Lock, Eye, EyeOff, CheckSquare, Square } from 'lucide-react-native';

interface LoginScreenProps {
  onSignIn?: (email: string, pass: string) => void;
  onNavigateToSignUp?: () => void;
  onForgotPassword?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSignIn,
  onNavigateToSignUp,
  onForgotPassword,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = () => {
    if (onSignIn) {
      onSignIn(email || 'listener@kathaisolli.com', password || 'password');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#063F30" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
          {/* Top Botanical Green Banner */}
          <View style={styles.topHeader}>
            <View style={styles.logoBadge}>
              <BookOpen size={24} color="#D7B45A" strokeWidth={2.5} />
            </View>
            <Text style={styles.brandTitle}>Kathaisolli</Text>
            <Text style={styles.brandSubtitle}>Stories • Knowledge • Life</Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            <View style={styles.greetingContainer}>
              <Text style={styles.welcomeTitle}>Welcome Back</Text>
              <Text style={styles.welcomeSubtitle}>Sign in to continue your journey</Text>
            </View>

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Mail size={18} color="#68756C" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#9EA8A1"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input with Visibility Toggle */}
            <View style={styles.inputWrapper}>
              <Lock size={18} color="#68756C" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#9EA8A1"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? (
                  <EyeOff size={18} color="#68756C" />
                ) : (
                  <Eye size={18} color="#68756C" />
                )}
              </TouchableOpacity>
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={styles.rowRemember}>
              <TouchableOpacity
                style={styles.rememberCheckbox}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                {rememberMe ? (
                  <CheckSquare size={16} color="#075C45" />
                ) : (
                  <Square size={16} color="#9EA8A1" />
                )}
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onForgotPassword}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity style={styles.signInButton} onPress={handleSubmit} activeOpacity={0.85}>
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Logins */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={styles.socialButton}
                activeOpacity={0.8}
                onPress={handleSubmit}
              >
                <Text style={styles.socialG}>G</Text>
                <Text style={styles.socialText}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                activeOpacity={0.8}
                onPress={handleSubmit}
              >
                <Text style={styles.socialApple}></Text>
                <Text style={styles.socialText}>Continue with Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Navigation to Sign Up */}
            <View style={styles.footerRow}>
              <Text style={styles.footerPrompt}>Don't have an account? </Text>
              <TouchableOpacity onPress={onNavigateToSignUp}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#063F30',
  },
  keyboardView: {
    flex: 1,
    backgroundColor: '#F7F4E8',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F7F4E8',
  },
  topHeader: {
    backgroundColor: '#063F30',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 36,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(215, 180, 90, 0.15)',
    borderWidth: 1.5,
    borderColor: '#D7B45A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'serif',
  },
  brandSubtitle: {
    fontSize: 10,
    color: '#D7B45A',
    fontWeight: '600',
    letterSpacing: 1.2,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 36,
  },
  greetingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#17251E',
    fontFamily: 'serif',
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#68756C',
    marginTop: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    marginBottom: 14,
    paddingHorizontal: 14,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#17251E',
  },
  eyeButton: {
    padding: 6,
  },
  rowRemember: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  rememberCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rememberText: {
    fontSize: 12,
    color: '#68756C',
  },
  forgotText: {
    fontSize: 12,
    color: '#075C45',
    fontWeight: '700',
  },
  signInButton: {
    backgroundColor: '#075C45',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    shadowColor: '#075C45',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2DBD0',
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 11,
    color: '#9EA8A1',
    fontWeight: '600',
  },
  socialRow: {
    gap: 10,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    gap: 10,
  },
  socialG: {
    fontSize: 18,
    fontWeight: '900',
    color: '#EA4335',
  },
  socialApple: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
  },
  socialText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#17251E',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerPrompt: {
    fontSize: 13,
    color: '#68756C',
  },
  signUpLink: {
    fontSize: 13,
    color: '#075C45',
    fontWeight: '800',
  },
});
