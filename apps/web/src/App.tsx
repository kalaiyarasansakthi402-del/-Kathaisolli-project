import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AudioPlayer } from './components/AudioPlayer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { SearchPage } from './pages/SearchPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { LanguagesPage } from './pages/LanguagesPage';
import { StoryDetailsPage } from './pages/StoryDetailsPage';
import { EpisodeDetailsPage } from './pages/EpisodeDetailsPage';
import { FullPlayerPage } from './pages/FullPlayerPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { LibraryPage } from './pages/LibraryPage';
import { MyLibraryPage } from './pages/MyLibraryPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { PlaylistsPage } from './pages/PlaylistsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { CreatorApplyPage } from './pages/CreatorApplyPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpSupportPage } from './pages/HelpSupportPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsConditionsPage } from './pages/TermsConditionsPage';
import { NotFoundPage } from './pages/NotFoundPage';

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
