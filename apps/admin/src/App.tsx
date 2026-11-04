import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

// Resilient lazy route loader with automatic retry on chunk fetch failure
const lazyWithRetry = <T extends { default: React.ComponentType<any> }>(
  factory: () => Promise<T>,
) =>
  lazy(async () => {
    try {
      return await factory();
    } catch (error) {
      console.warn('[Kathaisolli Admin] Route chunk fetch failed, retrying once...', error);
      await new Promise((resolve) => setTimeout(resolve, 800));
      return await factory();
    }
  });

// Authentication (Lazy Loaded)
const AdminLoginPage = lazyWithRetry(() =>
  import('./pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage }))
);

// Admin Core Pages (Lazy Loaded for Fast Initial Bundle)
const AdminOverviewPage = lazyWithRetry(() =>
  import('./pages/AdminOverviewPage').then((m) => ({ default: m.AdminOverviewPage }))
);
const AdminBooksPage = lazyWithRetry(() =>
  import('./pages/AdminBooksPage').then((m) => ({ default: m.AdminBooksPage }))
);
const CreateBookPage = lazyWithRetry(() =>
  import('./pages/CreateBookPage').then((m) => ({ default: m.CreateBookPage }))
);
const AdminBookChaptersPage = lazyWithRetry(() =>
  import('./pages/AdminBookChaptersPage').then((m) => ({ default: m.AdminBookChaptersPage }))
);
const AdminAudioUploadPage = lazyWithRetry(() =>
  import('./pages/AdminAudioUploadPage').then((m) => ({ default: m.AdminAudioUploadPage }))
);
const AdminCategoriesPage = lazyWithRetry(() =>
  import('./pages/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage }))
);
const AdminAnalyticsPage = lazyWithRetry(() =>
  import('./pages/AdminAnalyticsPage').then((m) => ({ default: m.AdminAnalyticsPage }))
);
const AdminSettingsPage = lazyWithRetry(() =>
  import('./pages/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage }))
);

// Admin Management Pages (Lazy Loaded)
const AdminUsersPage = lazyWithRetry(() =>
  import('./pages/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage }))
);
const AdminCreatorApplicationsPage = lazyWithRetry(() =>
  import('./pages/AdminCreatorApplicationsPage').then((m) => ({ default: m.AdminCreatorApplicationsPage }))
);
const AdminModerationQueuePage = lazyWithRetry(() =>
  import('./pages/AdminModerationQueuePage').then((m) => ({ default: m.AdminModerationQueuePage }))
);
const AdminAudioQueuePage = lazyWithRetry(() =>
  import('./pages/AdminAudioQueuePage').then((m) => ({ default: m.AdminAudioQueuePage }))
);

// Creator Studio Pages (Lazy Loaded)
const CreatorDashboard = lazyWithRetry(() =>
  import('./pages/CreatorDashboard').then((m) => ({ default: m.CreatorDashboard }))
);
const CreatorSeriesPage = lazyWithRetry(() =>
  import('./pages/CreatorSeriesPage').then((m) => ({ default: m.CreatorSeriesPage }))
);
const CreateSeriesPage = lazyWithRetry(() =>
  import('./pages/CreateSeriesPage').then((m) => ({ default: m.CreateSeriesPage }))
);
const ManageEpisodesPage = lazyWithRetry(() =>
  import('./pages/ManageEpisodesPage').then((m) => ({ default: m.ManageEpisodesPage }))
);
const AiAssistantPage = lazyWithRetry(() =>
  import('./pages/AiAssistantPage').then((m) => ({ default: m.AiAssistantPage }))
);
const CreatorAnalyticsPage = lazyWithRetry(() =>
  import('./pages/CreatorAnalyticsPage').then((m) => ({ default: m.CreatorAnalyticsPage }))
);

const RouteLoadingFallback = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
    <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    <p className="text-xs font-semibold text-zinc-500 font-tamil">ஏற்றுகிறது...</p>
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
          <Suspense fallback={<RouteLoadingFallback />}>
            <Outlet />
          </Suspense>
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
            <Route
              path="/login"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <AdminLoginPage />
                </Suspense>
              }
            />

            {/* Protected Admin Routes */}
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Navigate to="/admin" replace />} />
              <Route path="/admin" element={<AdminOverviewPage />} />
              <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
              <Route path="/admin/books" element={<AdminBooksPage />} />
              <Route path="/books" element={<Navigate to="/admin/books" replace />} />
              <Route path="/admin/books/new" element={<CreateBookPage />} />
              <Route path="/admin/books/create" element={<CreateBookPage />} />
              <Route path="/books/new" element={<Navigate to="/admin/books/new" replace />} />
              <Route path="/admin/books/:bookId" element={<CreateBookPage />} />
              <Route path="/admin/books/:bookId/chapters" element={<AdminBookChaptersPage />} />
              <Route path="/books/:bookId/chapters" element={<AdminBookChaptersPage />} />
              <Route path="/admin/categories" element={<AdminCategoriesPage />} />
              <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
              <Route path="/admin/audio" element={<Navigate to="/admin/audio-upload" replace />} />
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