import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type {
  AdminDashboardStats,
  AdminMetrics,
  AdminReportsData,
  AdminStaffMember,
  AdminManagedUser,
  CreateUserInput,
  UpdateUserInput,
  ResetUserPasswordInput,
  UpdateUserStatusInput,
  AdminStorageFile,
  AdminStorageOverview,
  AdminStoryListItem,
  AdminSystemHealth,
  AuthSessionResponse,
  Category,
  ContinueListeningItem,
  CreatorAnalytics,
  Episode,
  FavoriteItem,
  HistoryItem,
  Language,
  NotificationItem,
  PlaybackAuthResponse,
  Playlist,
  Series,
  User,
} from '@kathaisolli/shared-types';

export interface ApiClientConfig {
  baseURL?: string;
  getToken?: () => string | null | Promise<string | null>;
  onUnauthorized?: () => void;
}

export class KathaisolliApiClient {
  private client: AxiosInstance;

  constructor(config: ApiClientConfig = {}) {
    const defaultBaseUrl =
      typeof window !== 'undefined' &&
      window.location &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
        ? '/api/v1'
        : 'http://localhost:3000/api/v1';

    let resolvedBaseUrl = (config.baseURL || defaultBaseUrl).trim().replace(/\/+$/, '');
    if (resolvedBaseUrl.endsWith('/api/v1')) {
      // correctly suffixed
    } else if (resolvedBaseUrl.endsWith('/api')) {
      resolvedBaseUrl = `${resolvedBaseUrl}/v1`;
    } else {
      resolvedBaseUrl = `${resolvedBaseUrl}/api/v1`;
    }

    this.client = axios.create({
      baseURL: resolvedBaseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(async (reqConfig) => {
      if (config.getToken) {
        const token = await config.getToken();
        if (token) {
          reqConfig.headers.Authorization = `Bearer ${token}`;
        }
      }
      return reqConfig;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && config.onUnauthorized) {
          config.onUnauthorized();
        }
        return Promise.reject(error);
      },
    );
  }

  // --- Auth & Profile ---
  auth = {
    register: (data: {
      username?: string;
      email?: string;
      password: string;
      displayName?: string;
      phoneNumber?: string;
    }) =>
      this.client.post<AuthSessionResponse>('/auth/register', data).then((r) => r.data),

    login: (data: { email?: string; username?: string; password: string }) =>
      this.client.post<AuthSessionResponse>('/auth/login', data).then((r) => r.data),

    getProfile: () => this.client.get<User>('/auth/me').then((r) => r.data),

    updateProfile: (data: { displayName?: string; avatarUrl?: string }) =>
      this.client.patch<User>('/auth/profile', data).then((r) => r.data),

    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      this.client.post<{ success: boolean }>('/auth/change-password', data).then((r) => r.data),

    deleteAccount: () =>
      this.client.delete<{ success: boolean }>('/auth/account').then((r) => r.data),

    forgotPassword: (email: string) =>
      this.client
        .post<{ success: boolean; message: string; resetToken?: string }>('/auth/forgot-password', { email })
        .then((r) => r.data),

    resetPassword: (data: { token: string; newPassword: string }) =>
      this.client
        .post<{ success: boolean; message: string }>('/auth/reset-password', data)
        .then((r) => r.data),

    refreshToken: () =>
      this.client.post<AuthSessionResponse>('/auth/refresh').then((r) => r.data),

    logout: () =>
      this.client
        .post<{ success: boolean; message?: string }>('/auth/logout')
        .then((r) => r.data),
  };

  // --- Public Catalog ---
  catalog = {
    getHome: () =>
      this.client.get<{
        featured: Series[];
        latest: Series[];
        categories: Category[];
        featuredSeries?: Series[];
        trendingSeries?: Series[];
        popularCategories?: Category[];
        popularCreators?: User[];
      }>('/home').then((r) => r.data),

    getCategories: () => this.client.get<Category[]>('/categories').then((r) => r.data),

    getLanguages: () => this.client.get<Language[]>('/languages').then((r) => r.data),

    listSeries: (params?: {
      q?: string;
      category?: string;
      language?: string;
      contentType?: string;
      page?: number;
      pageSize?: number;
    }) =>
      this.client.get<{
        items: Series[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      }>('/series', { params }).then((r) => r.data),

    search: (params: {
      q?: string;
      category?: string;
      language?: string;
      contentType?: string;
      page?: number;
      pageSize?: number;
    }) =>
      this.client.get<{
        items: Series[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      }>('/search', { params }).then((r) => r.data),

    getSeries: (slug: string) =>
      this.client.get<Series>(`/series/${slug}`).then((r) => r.data),

    getEpisodes: (slug: string) =>
      this.client.get<any[]>(`/series/${slug}/episodes`).then((r) => r.data),
  };

  // --- Playback (100% Free) ---
  playback = {
    authorize: (episodeId: string) =>
      this.client
        .post<PlaybackAuthResponse>('/playback/authorize', { episodeId })
        .then((r) => r.data),
  };

  // --- User Library ---
  library = {
    getFavorites: () =>
      this.client.get<FavoriteItem[]>('/library/favorites').then((r) => r.data),

    addFavorite: (seriesId: string) =>
      this.client.post(`/library/favorites/${seriesId}`).then((r) => r.data),

    removeFavorite: (seriesId: string) =>
      this.client.delete(`/library/favorites/${seriesId}`).then((r) => r.data),

    getHistory: () =>
      this.client.get<HistoryItem[]>('/library/history').then((r) => r.data),

    updateProgress: (data: {
      episodeId: string;
      positionSec: number;
      durationSec: number;
      completedFlag?: boolean;
    }) => this.client.put('/library/progress', data).then((r) => r.data),

    getContinueListening: () =>
      this.client
        .get<ContinueListeningItem[]>('/library/continue-listening')
        .then((r) => r.data),
  };

  // --- Playlists ---
  playlists = {
    list: () => this.client.get<Playlist[]>('/playlists').then((r) => r.data),

    get: (id: string) => this.client.get<Playlist>(`/playlists/${id}`).then((r) => r.data),

    create: (data: { title: string; description?: string; isPublic?: boolean }) =>
      this.client.post<Playlist>('/playlists', data).then((r) => r.data),

    update: (id: string, data: Partial<{ title: string; description?: string; isPublic?: boolean }>) =>
      this.client.patch<Playlist>(`/playlists/${id}`, data).then((r) => r.data),

    delete: (id: string) =>
      this.client.delete(`/playlists/${id}`).then((r) => r.data),

    addItem: (playlistId: string, episodeId: string) =>
      this.client.post(`/playlists/${playlistId}/items`, { episodeId }).then((r) => r.data),

    removeItem: (playlistId: string, itemId: string) =>
      this.client.delete(`/playlists/${playlistId}/items/${itemId}`).then((r) => r.data),
  };

  // --- Creator Studio ---
  creator = {
    getStatus: () =>
      this.client.get<{ isCreator: boolean; creatorProfile: any }>('/creator/status').then((r) => r.data),

    getAnalytics: () =>
      this.client.get<CreatorAnalytics>('/creator/analytics').then((r) => r.data),

    listSeries: () => this.client.get<Series[]>('/creator/series').then((r) => r.data),

    createSeries: (data: any) =>
      this.client.post<Series>('/creator/series', data).then((r) => r.data),

    createSeason: (seriesId: string, data: { title: string; number: number }) =>
      this.client.post(`/creator/series/${seriesId}/seasons`, data).then((r) => r.data),

    createEpisode: (data: any) =>
      this.client.post<Episode>('/creator/episodes', data).then((r) => r.data),

    submitSeries: (seriesId: string) =>
      this.client.post(`/creator/series/${seriesId}/submit`).then((r) => r.data),
  };

  // --- Uploads ---
  uploads = {
    initiate: (data: {
      episodeId: string;
      filename: string;
      contentType: string;
      sizeBytes: number;
    }) =>
      this.client.post('/uploads/initiate', data).then((r) => r.data),

    complete: (uploadJobId: string) =>
      this.client.post(`/uploads/${uploadJobId}/complete`).then((r) => r.data),

    getStatus: (uploadJobId: string) =>
      this.client.get(`/uploads/${uploadJobId}/status`).then((r) => r.data),
  };

  // --- Admin (Full Admin API) ---
  admin = {
    getStatus: () =>
      this.client.get<AdminSystemHealth>('/admin/status').then((r) => r.data),

    getSystemHealth: () =>
      this.client.get<AdminSystemHealth>('/admin/system/health').then((r) => r.data),

    getDashboard: () =>
      this.client.get<AdminDashboardStats>('/admin/dashboard').then((r) => r.data),

    getMetrics: () =>
      this.client.get<AdminDashboardStats>('/admin/metrics').then((r) => r.data),

    // Stories CRUD
    listStories: (params?: {
      page?: number;
      pageSize?: number;
      search?: string;
      categoryId?: string;
      status?: string;
      languageId?: string;
    }) =>
      this.client.get<{
        items: AdminStoryListItem[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      }>('/admin/stories', { params }).then((r) => r.data),

    getStory: (id: string) =>
      this.client.get<any>(`/admin/stories/${id}`).then((r) => r.data),

    createStory: (data: any) =>
      this.client.post<any>('/admin/stories', data).then((r) => r.data),

    updateStory: (id: string, data: any) =>
      this.client.patch<any>(`/admin/stories/${id}`, data).then((r) => r.data),

    deleteStory: (id: string) =>
      this.client.delete<{ success: boolean; message?: string }>(`/admin/stories/${id}`).then((r) => r.data),

    togglePublishStory: (id: string) =>
      this.client.post<{ success: boolean; id: string; status: string }>(`/admin/stories/${id}/publish`).then((r) => r.data),

    unpublishStory: (id: string) =>
      this.client.post<any>(`/admin/stories/${id}/unpublish`).then((r) => r.data),

    // Chapters & Audio
    createChapter: (storyId: string, data: any) =>
      this.client.post<any>(`/admin/stories/${storyId}/chapters`, data).then((r) => r.data),

    updateChapter: (storyId: string, chapterId: string, data: any) =>
      this.client.patch<any>(`/admin/stories/${storyId}/chapters/${chapterId}`, data).then((r) => r.data),

    deleteChapter: (storyId: string, chapterId: string) =>
      this.client.delete<any>(`/admin/stories/${storyId}/chapters/${chapterId}`).then((r) => r.data),

    saveChapterAudio: (storyId: string, chapterId: string, data: { audioUrl: string; storagePath?: string; durationSec?: number; fileSizeBytes?: number; fileName?: string }) =>
      this.client.post<any>(`/admin/stories/${storyId}/chapters/${chapterId}/audio`, data).then((r) => r.data),

    deleteChapterAudio: (storyId: string, chapterId: string) =>
      this.client.delete<any>(`/admin/stories/${storyId}/chapters/${chapterId}/audio`).then((r) => r.data),

    // Categories
    listCategories: () =>
      this.client.get<any[]>('/admin/categories').then((r) => r.data),

    createCategory: (data: { name: string; slug: string; description?: string; isActive?: boolean }) =>
      this.client.post<any>('/admin/categories', data).then((r) => r.data),

    updateCategory: (id: string, data: { name?: string; slug?: string; description?: string; isActive?: boolean }) =>
      this.client.patch<any>(`/admin/categories/${id}`, data).then((r) => r.data),

    deleteCategory: (id: string) =>
      this.client.delete<any>(`/admin/categories/${id}`).then((r) => r.data),

    // Audio Storage
    getStorageOverview: () =>
      this.client.get<AdminStorageOverview>('/admin/storage/overview').then((r) => r.data),

    listStorageFiles: (params?: { page?: number; pageSize?: number; search?: string; type?: string }) =>
      this.client.get<{ items: AdminStorageFile[]; total: number; page: number; pageSize: number; totalPages: number }>('/admin/storage/files', { params }).then((r) => r.data),

    deleteStorageFile: (id: string) =>
      this.client.delete<any>(`/admin/storage/files/${id}`).then((r) => r.data),

    // Reports & Analytics
    getReports: (params?: { timeframe?: string; startDate?: string; endDate?: string }) =>
      this.client.get<AdminReportsData>('/admin/reports', { params }).then((r) => r.data),

    // Staff & Roles
    listStaff: () =>
      this.client.get<AdminStaffMember[]>('/admin/staff').then((r) => r.data),

    createStaff: (data: { email: string; password: string; displayName: string; role: string }) =>
      this.client.post<any>('/admin/staff', data).then((r) => r.data),

    updateStaffRole: (id: string, role: string) =>
      this.client.patch<any>(`/admin/staff/${id}/role`, { role }).then((r) => r.data),

    deleteStaff: (id: string) =>
      this.client.delete<any>(`/admin/staff/${id}`).then((r) => r.data),

    // User Management (Admin-Controlled Users)
    listUsers: (params?: { query?: string; page?: number; limit?: number }) =>
      this.client
        .get<{ users: AdminManagedUser[]; total: number; page: number; limit: number; totalPages: number }>(
          '/admin/users',
          { params },
        )
        .then((r) => r.data),

    getUser: (id: string) =>
      this.client.get<AdminManagedUser>(`/admin/users/${id}`).then((r) => r.data),

    createUser: (data: CreateUserInput) =>
      this.client.post<AdminManagedUser>('/admin/users', data).then((r) => r.data),

    updateUser: (id: string, data: UpdateUserInput) =>
      this.client.patch<AdminManagedUser>(`/admin/users/${id}`, data).then((r) => r.data),

    resetUserPassword: (id: string, data: ResetUserPasswordInput) =>
      this.client
        .post<{ success: boolean; message: string }>(`/admin/users/${id}/reset-password`, data)
        .then((r) => r.data),

    updateUserStatus: (id: string, data: UpdateUserStatusInput) =>
      this.client.patch<AdminManagedUser>(`/admin/users/${id}/status`, data).then((r) => r.data),

    deleteUser: (id: string) =>
      this.client
        .delete<{ success: boolean; message: string }>(`/admin/users/${id}`)
        .then((r) => r.data),
  };

  // --- Notifications ---
  notifications = {
    list: () => this.client.get<NotificationItem[]>('/notifications').then((r) => r.data),

    markAsRead: (id: string) =>
      this.client.patch(`/notifications/${id}/read`).then((r) => r.data),

    markAllAsRead: () =>
      this.client.post('/notifications/mark-all-read').then((r) => r.data),
  };

  // --- AI Story Assistant ---
  aiAssistant = {
    generateIdeas: (data: { genre: string; theme?: string; tone?: string }) =>
      this.client.post('/ai-assistant/generate-ideas', data).then((r) => r.data),

    suggestTitles: (data: { synopsis: string; genre?: string }) =>
      this.client.post('/ai-assistant/suggest-titles', data).then((r) => r.data),

    grammarCheck: (data: { text: string }) =>
      this.client.post('/ai-assistant/grammar-check', data).then((r) => r.data),

    summarize: (data: { content: string }) =>
      this.client.post('/ai-assistant/summarize', data).then((r) => r.data),
  };
}

export const createApiClient = (config?: ApiClientConfig) =>
  new KathaisolliApiClient(config);

export const apiClient = createApiClient();
