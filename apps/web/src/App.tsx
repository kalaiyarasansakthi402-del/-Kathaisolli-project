import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AudioPlayer } from './components/AudioPlayer';

// Primary entry page (eager for fast initial FCP/LCP)
import { LandingPage } from './pages/LandingPage';

// Lazy-loaded routes for code splitting
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const LibraryPage = lazy(() => import('./pages/LibraryPage').then((m) => ({ default: m.LibraryPage })));
const MyLibraryPage = lazy(() => import('./pages/MyLibraryPage').then((m) => ({ default: m.MyLibraryPage })));
const ExplorePage = lazy(() => import('./pages/ExplorePage').then((m) => ({ default: m.ExplorePage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then((m) => ({ default: m.SearchPage })));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage })));
const LanguagesPage = lazy(() => import('./pages/LanguagesPage').then((m) => ({ default: m.LanguagesPage })));
const StoryDetailsPage = lazy(() => import('./pages/StoryDetailsPage').then((m) => ({ default: m.StoryDetailsPage })));
const EpisodeDetailsPage = lazy(() => import('./pages/EpisodeDetailsPage').then((m) => ({ default: m.EpisodeDetailsPage })));
const FullPlayerPage = lazy(() => import('./pages/FullPlayerPage').then((m) => ({ default: m.FullPlayerPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const PlaylistsPage = lazy(() => import('./pages/PlaylistsPage').then((m) => ({ default: m.PlaylistsPage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const CreatorApplyPage = lazy(() => import('./pages/CreatorApplyPage').then((m) => ({ default: m.CreatorApplyPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const HelpSupportPage = lazy(() => import('./pages/HelpSupportPage').then((m) => ({ default: m.HelpSupportPage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })));
const TermsConditionsPage = lazy(() => import('./pages/TermsConditionsPage').then((m) => ({ default: m.TermsConditionsPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const RouteLoadingFallback = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
    <div className="w-8 h-8 border-2 border-[#064E3B] border-t-transparent rounded-full animate-spin" />
    <p className="text-xs font-semibold text-stone-500 font-tamil">ஏற்றுகிறது...</p>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PlayerProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-[#F8F5E9] dark:bg-[#033B2B] text-[#173D2E] dark:text-[#F8F5E9] font-sans antialiased selection:bg-[#E8F0E2] selection:text-[#064E3B] transition-colors duration-200">
              <Navbar />

              <main className="flex-1 pb-28">
                <Suspense fallback={<RouteLoadingFallback />}>
                  <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/languages" element={<LanguagesPage />} />
                  <Route path="/stories/:slug" element={<StoryDetailsPage />} />
                  <Route path="/series/:slug" element={<StoryDetailsPage />} />
                  <Route path="/episodes/:episodeId" element={<EpisodeDetailsPage />} />
                  <Route path="/player" element={<FullPlayerPage />} />

                  {/* Auth routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/signup" element={<Navigate to="/register" replace />} />

                  {/* Stories alias */}
                  <Route path="/stories" element={<Navigate to="/explore" replace />} />

                  {/* Admin Dashboard */}
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/admin/login" element={<LoginPage />} />
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

                  {/* User Library and Profile */}
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/library" element={<LibraryPage />} />
                  <Route path="/my-library" element={<MyLibraryPage />} />
                  <Route path="/favorites" element={<Navigate to="/my-library?tab=favorites" replace />} />
                  <Route path="/history" element={<Navigate to="/my-library?tab=history" replace />} />
                  <Route path="/playlists" element={<PlaylistsPage />} />
                  <Route path="/playlists/:id" element={<PlaylistsPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />

                  {/* Creator Apply */}
                  <Route path="/creator/apply" element={<CreatorApplyPage />} />

                  {/* Settings and Legal */}
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/help" element={<HelpSupportPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsConditionsPage />} />

                  {/* 404 Catch-All */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </main>

              {/* Global Mini Player docked at the bottom */}
              <AudioPlayer />

              <Footer />
            </div>
          </BrowserRouter>
        </PlayerProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
