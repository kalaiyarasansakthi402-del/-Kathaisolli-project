import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AudioPlayer } from './components/AudioPlayer';
import { ErrorBoundary } from './components/ErrorBoundary';

// Resilient lazy route loader with automatic retry on chunk fetch failure
const lazyWithRetry = <T extends { default: React.ComponentType<any> }>(
  factory: () => Promise<T>,
) =>
  lazy(async () => {
    try {
      return await factory();
    } catch (error) {
      console.warn('[Kathaisolli] Route chunk fetch failed, retrying once...', error);
      await new Promise((resolve) => setTimeout(resolve, 800));
      return await factory();
    }
  });

// Lazy-loaded routes for code splitting
const LandingPage = lazyWithRetry(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const HomePage = lazyWithRetry(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const MyLibraryPage = lazyWithRetry(() => import('./pages/MyLibraryPage').then((m) => ({ default: m.MyLibraryPage })));
const SearchPage = lazyWithRetry(() => import('./pages/SearchPage').then((m) => ({ default: m.SearchPage })));
const CategoriesPage = lazyWithRetry(() => import('./pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage })));
const LanguagesPage = lazyWithRetry(() => import('./pages/LanguagesPage').then((m) => ({ default: m.LanguagesPage })));
const StoryDetailsPage = lazyWithRetry(() => import('./pages/StoryDetailsPage').then((m) => ({ default: m.StoryDetailsPage })));
const EpisodeDetailsPage = lazyWithRetry(() => import('./pages/EpisodeDetailsPage').then((m) => ({ default: m.EpisodeDetailsPage })));
const FullPlayerPage = lazyWithRetry(() => import('./pages/FullPlayerPage').then((m) => ({ default: m.FullPlayerPage })));

// Authentication Pages
const LoginPage = lazyWithRetry(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazyWithRetry(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazyWithRetry(() => import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazyWithRetry(() => import('./pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));

// Content & Community
const AboutPage = lazyWithRetry(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazyWithRetry(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const PlaylistsPage = lazyWithRetry(() => import('./pages/PlaylistsPage').then((m) => ({ default: m.PlaylistsPage })));
const NotificationsPage = lazyWithRetry(() => import('./pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const CreatorApplyPage = lazyWithRetry(() => import('./pages/CreatorApplyPage').then((m) => ({ default: m.CreatorApplyPage })));
const SettingsPage = lazyWithRetry(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const ProfilePage = lazyWithRetry(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const HelpSupportPage = lazyWithRetry(() => import('./pages/HelpSupportPage').then((m) => ({ default: m.HelpSupportPage })));
const PrivacyPolicyPage = lazyWithRetry(() => import('./pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })));
const TermsConditionsPage = lazyWithRetry(() => import('./pages/TermsConditionsPage').then((m) => ({ default: m.TermsConditionsPage })));
const NotFoundPage = lazyWithRetry(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const RouteLoadingFallback = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
    <div className="w-8 h-8 border-2 border-[#064E3B] border-t-transparent rounded-full animate-spin" />
    <p className="text-xs font-semibold text-stone-500 font-tamil">ஏற்றுகிறது...</p>
  </div>
);

// Redirect client-side route transitions targeting /admin to full page reload so Vercel serves the Admin SPA
const AdminRedirect: React.FC = () => {
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.href = window.location.pathname + window.location.search;
    }
  }, []);
  return null;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const AppContent: React.FC = () => {
  const location = useLocation();
  const isDedicatedPlayerPage = location.pathname === '/player';
  const isHomePage = location.pathname === '/' || location.pathname === '/home';
  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/signup' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/reset-password';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7EE] dark:bg-[#03261C] text-[#173D2E] dark:text-[#F8F5E9] font-sans antialiased selection:bg-[#E8F0E2] selection:text-[#064E3B] transition-colors duration-200">
      {!isDedicatedPlayerPage && <Navbar />}

      <main className={`flex-1 ${isDedicatedPlayerPage || isHomePage || isAuthPage ? 'pb-0' : 'pb-28'}`}>
        <ErrorBoundary>
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              {/* Authentication Routes (Admin-controlled user accounts) */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<Navigate to="/login" replace />} />
              <Route path="/signup" element={<Navigate to="/login" replace />} />
              <Route path="/forgot-password" element={<Navigate to="/login" replace />} />
              <Route path="/reset-password" element={<Navigate to="/login" replace />} />

              {/* Public Main Website routes (Open & Accessible) */}
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/explore" element={<Navigate to="/categories" replace />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/languages" element={<LanguagesPage />} />
              <Route path="/stories/:slug" element={<StoryDetailsPage />} />
              <Route path="/series/:slug" element={<StoryDetailsPage />} />
              <Route path="/episodes/:episodeId" element={<EpisodeDetailsPage />} />
              <Route path="/player" element={<FullPlayerPage />} />

              {/* Informational & Community */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/help" element={<HelpSupportPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsConditionsPage />} />

              {/* Personal Library & Settings */}
              <Route path="/my-library" element={<MyLibraryPage />} />
              <Route path="/library" element={<Navigate to="/my-library" replace />} />
              <Route path="/favorites" element={<Navigate to="/my-library?tab=favorites" replace />} />
              <Route path="/history" element={<Navigate to="/my-library?tab=history" replace />} />
              <Route path="/playlists" element={<PlaylistsPage />} />
              <Route path="/playlists/:id" element={<PlaylistsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/creator/apply" element={<CreatorApplyPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Stories alias */}
              <Route path="/stories" element={<Navigate to="/categories" replace />} />

              {/* Public Website Isolation: Admin is hosted completely separately on Private Admin Website */}
              <Route path="/admin" element={<AdminRedirect />} />
              <Route path="/admin/*" element={<AdminRedirect />} />

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Global Mini Player docked at the bottom (hidden on dedicated player page, home page, and auth pages) */}
      {!isDedicatedPlayerPage && !isHomePage && !isAuthPage && <AudioPlayer />}

      {!isDedicatedPlayerPage && !isAuthPage && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PlayerProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </PlayerProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
