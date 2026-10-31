import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MobileAuthProvider } from './src/context/MobileAuthContext';
import { MobilePlayerProvider, useMobilePlayer } from './src/context/MobilePlayerContext';
import { TabName } from './src/components/BottomTabBar';
import { LibraryBook, COMPLETE_LIBRARY_CATALOG } from './src/data/mobileCatalog';

// 14 Screens
import { SplashScreen } from './src/screens/SplashScreen';
import { OnboardingScreen1 } from './src/screens/OnboardingScreen1';
import { OnboardingScreen2 } from './src/screens/OnboardingScreen2';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { BookDetailsScreen } from './src/screens/BookDetailsScreen';
import { StoryPlayerScreen } from './src/screens/StoryPlayerScreen';
import { CategoriesScreen } from './src/screens/CategoriesScreen';
import { DownloadsScreen } from './src/screens/DownloadsScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

type ScreenName =
  | 'splash'
  | 'onboarding1'
  | 'onboarding2'
  | 'login'
  | 'register'
  | 'home'
  | 'library'
  | 'bookDetails'
  | 'player'
  | 'categories'
  | 'downloads'
  | 'favorites'
  | 'profile'
  | 'settings';

const AppNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('splash');
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [selectedBook, setSelectedBook] = useState<LibraryBook>(COMPLETE_LIBRARY_CATALOG[0]);
  const [libraryFilterCategory, setLibraryFilterCategory] = useState<string>('All');

  const { isFullPlayerVisible, closeFullPlayer, openFullPlayer } = useMobilePlayer();

  const handleTabChange = (tab: TabName) => {
    setActiveTab(tab);
    if (tab === 'home') setCurrentScreen('home');
    if (tab === 'library') {
      setLibraryFilterCategory('All');
      setCurrentScreen('library');
    }
    if (tab === 'downloads') setCurrentScreen('downloads');
    if (tab === 'profile') setCurrentScreen('profile');
  };

  const handleNavigate = (screen: string, params?: any) => {
    if (screen === 'bookDetails' && params?.book) {
      setSelectedBook(params.book);
      setCurrentScreen('bookDetails');
      return;
    }
    if (screen === 'categories') {
      setCurrentScreen('categories');
      return;
    }
    if (screen === 'favorites') {
      setCurrentScreen('favorites');
      return;
    }
    if (screen === 'settings') {
      setCurrentScreen('settings');
      return;
    }
    if (screen === 'player') {
      openFullPlayer();
      return;
    }
    if (screen === 'notifications') {
      alert('Kathaisolli Notifications: You are up to date with the latest Tamil audiobooks.');
      return;
    }
    setCurrentScreen(screen as ScreenName);
  };

  // Full-screen Audio Player Overlay
  if (isFullPlayerVisible || currentScreen === 'player') {
    return (
      <StoryPlayerScreen
        onBack={() => {
          closeFullPlayer();
          if (currentScreen === 'player') setCurrentScreen('home');
        }}
      />
    );
  }

  // Screen 1: Splash Screen
  if (currentScreen === 'splash') {
    return <SplashScreen onFinish={() => setCurrentScreen('onboarding1')} />;
  }

  // Screen 2: Onboarding 1
  if (currentScreen === 'onboarding1') {
    return (
      <OnboardingScreen1
        onNext={() => setCurrentScreen('onboarding2')}
        onSkip={() => setCurrentScreen('home')}
      />
    );
  }

  // Screen 3: Onboarding 2
  if (currentScreen === 'onboarding2') {
    return (
      <OnboardingScreen2
        onNext={() => setCurrentScreen('home')}
        onBack={() => setCurrentScreen('onboarding1')}
        onSkip={() => setCurrentScreen('home')}
      />
    );
  }

  // Screen 4: Login
  if (currentScreen === 'login') {
    return (
      <LoginScreen
        onSignIn={() => setCurrentScreen('home')}
        onNavigateToSignUp={() => setCurrentScreen('register')}
        onForgotPassword={() => alert('Password reset link sent to your email.')}
      />
    );
  }

  // Screen 5: Sign Up
  if (currentScreen === 'register') {
    return (
      <RegisterScreen
        onSignUp={() => setCurrentScreen('home')}
        onNavigateToLogin={() => setCurrentScreen('login')}
      />
    );
  }

  // Screen 7: Library
  if (currentScreen === 'library') {
    return (
      <LibraryScreen
        onBack={() => setCurrentScreen('home')}
        initialCategory={libraryFilterCategory}
        onSelectBook={(book) => {
          setSelectedBook(book);
          setCurrentScreen('bookDetails');
        }}
        onTabChange={handleTabChange}
      />
    );
  }

  // Screen 8: Book Details
  if (currentScreen === 'bookDetails') {
    return (
      <BookDetailsScreen
        book={selectedBook}
        onBack={() => setCurrentScreen('library')}
        onOpenPlayer={() => openFullPlayer()}
      />
    );
  }

  // Screen 10: Categories
  if (currentScreen === 'categories') {
    return (
      <CategoriesScreen
        onBack={() => setCurrentScreen('home')}
        onSelectCategory={(catName) => {
          setLibraryFilterCategory(catName);
          setCurrentScreen('library');
        }}
      />
    );
  }

  // Screen 11: Downloads
  if (currentScreen === 'downloads') {
    return (
      <DownloadsScreen
        onBack={() => setCurrentScreen('home')}
        onTabChange={handleTabChange}
        onOpenPlayer={() => openFullPlayer()}
      />
    );
  }

  // Screen 12: Favorites
  if (currentScreen === 'favorites') {
    return (
      <FavoritesScreen
        onBack={() => setCurrentScreen('profile')}
        onSelectBook={(book) => {
          setSelectedBook(book);
          setCurrentScreen('bookDetails');
        }}
      />
    );
  }

  // Screen 13: Profile
  if (currentScreen === 'profile') {
    return (
      <ProfileScreen
        onBack={() => setCurrentScreen('home')}
        onTabChange={handleTabChange}
        onNavigate={handleNavigate}
        onLogout={() => setCurrentScreen('login')}
      />
    );
  }

  // Screen 14: Settings
  if (currentScreen === 'settings') {
    return <SettingsScreen onBack={() => setCurrentScreen('profile')} />;
  }

  // Default: Screen 6: Home
  return (
    <HomeScreen
      onNavigate={handleNavigate}
      onTabChange={handleTabChange}
    />
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <MobileAuthProvider>
        <MobilePlayerProvider>
          <AppNavigator />
        </MobilePlayerProvider>
      </MobileAuthProvider>
    </SafeAreaProvider>
  );
}
