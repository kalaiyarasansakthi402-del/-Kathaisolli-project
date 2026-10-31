import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MobileAuthProvider } from './src/context/MobileAuthContext';
import { MobilePlayerProvider } from './src/context/MobilePlayerContext';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { StoryPlayerScreen } from './src/screens/StoryPlayerScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<
    'welcome' | 'login' | 'register' | 'home' | 'player'
  >('welcome');

  return (
    <SafeAreaProvider>
      <MobileAuthProvider>
        <MobilePlayerProvider>
          {currentScreen === 'welcome' && (
            <WelcomeScreen
              onExplore={() => setCurrentScreen('home')}
              onLogin={() => setCurrentScreen('login')}
            />
          )}

          {currentScreen === 'login' && (
            <LoginScreen
              onSignIn={() => setCurrentScreen('home')}
              onNavigateToSignUp={() => setCurrentScreen('register')}
              onForgotPassword={() => alert('Password reset instructions sent')}
            />
          )}

          {currentScreen === 'register' && (
            <RegisterScreen
              onSignUp={() => setCurrentScreen('home')}
              onNavigateToLogin={() => setCurrentScreen('login')}
            />
          )}

          {currentScreen === 'home' && (
            <HomeScreen
              onOpenPlayer={() => setCurrentScreen('player')}
              onLogout={() => setCurrentScreen('welcome')}
            />
          )}

          {currentScreen === 'player' && (
            <StoryPlayerScreen
              onBack={() => setCurrentScreen('home')}
            />
          )}
        </MobilePlayerProvider>
      </MobileAuthProvider>
    </SafeAreaProvider>
  );
}
