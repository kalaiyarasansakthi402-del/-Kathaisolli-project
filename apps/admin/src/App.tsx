import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

// Creator Studio Pages
import { CreatorDashboard } from './pages/CreatorDashboard';
import { CreatorSeriesPage } from './pages/CreatorSeriesPage';
import { CreateSeriesPage } from './pages/CreateSeriesPage';
import { ManageEpisodesPage } from './pages/ManageEpisodesPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { CreatorAnalyticsPage } from './pages/CreatorAnalyticsPage';

// Super Admin Pages
import { AdminOverviewPage } from './pages/AdminOverviewPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminCreatorApplicationsPage } from './pages/AdminCreatorApplicationsPage';
import { AdminModerationQueuePage } from './pages/AdminModerationQueuePage';
import { AdminAudioQueuePage } from './pages/AdminAudioQueuePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const MainLayout: React.FC = () => {
  const { activeMode } = useAdminAuth();

  return (
    <div className="flex min-h-screen bg-[#F8FAF7] dark:bg-[#0A1612] text-zinc-900 dark:text-zinc-100 font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            {/* Root redirect */}
            <Route
              path="/"
              element={<Navigate to={activeMode === 'admin' ? '/admin' : '/creator'} replace />}
            />

            {/* Creator Studio routes */}
            <Route path="/creator" element={<CreatorDashboard />} />
            <Route path="/creator/series" element={<CreatorSeriesPage />} />
            <Route path="/creator/series/new" element={<CreateSeriesPage />} />
            <Route path="/creator/series/:seriesId/episodes" element={<ManageEpisodesPage />} />
            <Route path="/creator/ai-assistant" element={<AiAssistantPage />} />
            <Route path="/creator/analytics" element={<CreatorAnalyticsPage />} />

            {/* Super Admin routes */}
            <Route path="/admin" element={<AdminOverviewPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/creators" element={<AdminCreatorApplicationsPage />} />
            <Route path="/admin/moderation" element={<AdminModerationQueuePage />} />
            <Route path="/admin/audio-queue" element={<AdminAudioQueuePage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <BrowserRouter>
          <MainLayout />
        </BrowserRouter>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
};

export default App;
