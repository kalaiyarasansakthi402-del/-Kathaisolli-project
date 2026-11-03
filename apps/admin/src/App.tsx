import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

// Authentication
import { AdminLoginPage } from './pages/AdminLoginPage';

// Admin Core Pages
import { AdminOverviewPage } from './pages/AdminOverviewPage';
import { AdminBooksPage } from './pages/AdminBooksPage';
import { CreateBookPage } from './pages/CreateBookPage';
import { AdminBookChaptersPage } from './pages/AdminBookChaptersPage';
import { AdminAudioUploadPage } from './pages/AdminAudioUploadPage';

// Admin Management Pages
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminCreatorApplicationsPage } from './pages/AdminCreatorApplicationsPage';
import { AdminModerationQueuePage } from './pages/AdminModerationQueuePage';
import { AdminAudioQueuePage } from './pages/AdminAudioQueuePage';

// Creator Studio Pages
import { CreatorDashboard } from './pages/CreatorDashboard';
import { CreatorSeriesPage } from './pages/CreatorSeriesPage';
import { CreateSeriesPage } from './pages/CreateSeriesPage';
import { ManageEpisodesPage } from './pages/ManageEpisodesPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { CreatorAnalyticsPage } from './pages/CreatorAnalyticsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const ProtectedLayout: React.FC = () => {
  const { user } = useAdminAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAF7] dark:bg-[#0A1612] text-zinc-900 dark:text-zinc-100 font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
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
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<AdminLoginPage />} />

            {/* Protected Admin Routes */}
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Navigate to="/admin" replace />} />
              <Route path="/admin" element={<AdminOverviewPage />} />
              <Route path="/admin/books" element={<AdminBooksPage />} />
              <Route path="/books" element={<Navigate to="/admin/books" replace />} />
              <Route path="/admin/books/new" element={<CreateBookPage />} />
              <Route path="/books/new" element={<Navigate to="/admin/books/new" replace />} />
              <Route path="/admin/books/:bookId/chapters" element={<AdminBookChaptersPage />} />
              <Route path="/books/:bookId/chapters" element={<AdminBookChaptersPage />} />
              <Route path="/admin/audio-upload" element={<AdminAudioUploadPage />} />
              <Route path="/audio-upload" element={<Navigate to="/admin/audio-upload" replace />} />

              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/creators" element={<AdminCreatorApplicationsPage />} />
              <Route path="/admin/moderation" element={<AdminModerationQueuePage />} />
              <Route path="/admin/audio-queue" element={<AdminAudioQueuePage />} />

              {/* Creator Studio routes */}
              <Route path="/creator" element={<CreatorDashboard />} />
              <Route path="/creator/series" element={<CreatorSeriesPage />} />
              <Route path="/creator/series/new" element={<CreateSeriesPage />} />
              <Route path="/creator/series/:seriesId/episodes" element={<ManageEpisodesPage />} />
              <Route path="/creator/ai-assistant" element={<AiAssistantPage />} />
              <Route path="/creator/analytics" element={<CreatorAnalyticsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
};

export default App;