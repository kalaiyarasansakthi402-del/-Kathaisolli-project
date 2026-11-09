import React, { Suspense, lazy, useState } from 'react';
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

// Module 1: Admin Authentication
const AdminLoginPage = lazyWithRetry(() =>
  import('./pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage }))
);

// Module 2: Dashboard & Analytics
const AdminOverviewPage = lazyWithRetry(() =>
  import('./pages/AdminOverviewPage').then((m) => ({ default: m.AdminOverviewPage }))
);

// Module 3: Audiobook Upload & Management
const AdminAudioUploadPage = lazyWithRetry(() =>
  import('./pages/AdminAudioUploadPage').then((m) => ({ default: m.AdminAudioUploadPage }))
);
const AdminBookChaptersPage = lazyWithRetry(() =>
  import('./pages/AdminBookChaptersPage').then((m) => ({ default: m.AdminBookChaptersPage }))
);

// Module 4: Story Management
const AdminBooksPage = lazyWithRetry(() =>
  import('./pages/AdminBooksPage').then((m) => ({ default: m.AdminBooksPage }))
);
const CreateBookPage = lazyWithRetry(() =>
  import('./pages/CreateBookPage').then((m) => ({ default: m.CreateBookPage }))
);

// Module 5: Category Management
const AdminCategoriesPage = lazyWithRetry(() =>
  import('./pages/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage }))
);

// Module 6: Audio Storage Management
const AdminStoragePage = lazyWithRetry(() =>
  import('./pages/AdminStoragePage').then((m) => ({ default: m.AdminStoragePage }))
);

// Module 7: Reports & Analytics
const AdminReportsPage = lazyWithRetry(() =>
  import('./pages/AdminReportsPage').then((m) => ({ default: m.AdminReportsPage }))
);

// Module 8: Admin Roles & Permissions
const AdminRolesPage = lazyWithRetry(() =>
  import('./pages/AdminRolesPage').then((m) => ({ default: m.AdminRolesPage }))
);

// Module 9: Settings & Security
const AdminSettingsPage = lazyWithRetry(() =>
  import('./pages/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage }))
);

const RouteLoadingFallback = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
    <div className="w-9 h-9 border-3 border-[#064E3B] border-t-transparent rounded-full animate-spin" />
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#FAF7EE] text-zinc-900 font-sans antialiased">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
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
            {/* Public Login Routes */}
            <Route
              path="/login"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <AdminLoginPage />
                </Suspense>
              }
            />
            <Route
              path="/admin/login"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <AdminLoginPage />
                </Suspense>
              }
            />

            {/* Protected Admin Routes */}
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Navigate to="/admin" replace />} />
              
              {/* Module 2: Dashboard */}
              <Route path="/admin" element={<AdminOverviewPage />} />
              <Route path="/admin/dashboard" element={<AdminOverviewPage />} />

              {/* Module 3: Audiobook Upload */}
              <Route path="/admin/audio-upload" element={<AdminAudioUploadPage />} />
              <Route path="/admin/audio" element={<Navigate to="/admin/audio-upload" replace />} />
              <Route path="/admin/uploads" element={<Navigate to="/admin/audio-upload" replace />} />
              <Route path="/audio-upload" element={<Navigate to="/admin/audio-upload" replace />} />

              {/* Module 4: Story Management */}
              <Route path="/admin/stories" element={<AdminBooksPage />} />
              <Route path="/admin/books" element={<AdminBooksPage />} />
              <Route path="/books" element={<Navigate to="/admin/stories" replace />} />
              <Route path="/admin/stories/new" element={<CreateBookPage />} />
              <Route path="/admin/books/new" element={<CreateBookPage />} />
              <Route path="/admin/books/create" element={<CreateBookPage />} />
              <Route path="/books/new" element={<Navigate to="/admin/stories/new" replace />} />
              <Route path="/admin/stories/:bookId" element={<CreateBookPage />} />
              <Route path="/admin/books/:bookId" element={<CreateBookPage />} />
              <Route path="/admin/stories/:bookId/chapters" element={<AdminBookChaptersPage />} />
              <Route path="/admin/books/:bookId/chapters" element={<AdminBookChaptersPage />} />
              <Route path="/books/:bookId/chapters" element={<AdminBookChaptersPage />} />

              {/* Module 5: Category Management */}
              <Route path="/admin/categories" element={<AdminCategoriesPage />} />

              {/* Module 6: Audio Storage Management */}
              <Route path="/admin/storage" element={<AdminStoragePage />} />

              {/* Module 7: Reports & Analytics */}
              <Route path="/admin/reports" element={<AdminReportsPage />} />
              <Route path="/admin/analytics" element={<AdminReportsPage />} />

              {/* Module 8: Admin Roles & Permissions */}
              <Route path="/admin/roles" element={<AdminRolesPage />} />
              <Route path="/admin/permissions" element={<AdminRolesPage />} />

              {/* Module 9: Settings & Security */}
              <Route path="/admin/settings" element={<AdminSettingsPage />} />

              {/* Redirect removed modules to admin overview */}
              <Route path="/admin/users" element={<Navigate to="/admin" replace />} />
              <Route path="/admin/subscriptions" element={<Navigate to="/admin" replace />} />
              <Route path="/admin/payments" element={<Navigate to="/admin" replace />} />
              <Route path="/admin/creators" element={<Navigate to="/admin" replace />} />
              <Route path="/admin/moderation" element={<Navigate to="/admin" replace />} />
              <Route path="/admin/audio-queue" element={<Navigate to="/admin" replace />} />
              <Route path="/creator/*" element={<Navigate to="/admin" replace />} />
              <Route path="/admin/creator/*" element={<Navigate to="/admin" replace />} />
            </Route>

            {/* Global 404 / Fallback Route */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
};

export default App;
