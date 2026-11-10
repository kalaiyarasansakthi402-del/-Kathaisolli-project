export type UserRole =
  | 'LISTENER'
  | 'CREATOR'
  | 'MODERATOR'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export type ContentType =
  | 'STORY'
  | 'AUDIOBOOK'
  | 'PODCAST'
  | 'SHORT_STORY';

export type ContentStatus =
  | 'DRAFT'
  | 'PROCESSING'
  | 'PENDING_REVIEW'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'ARCHIVED';

export type AgeRating =
  | 'ALL_AGES'
  | 'AGE_7_PLUS'
  | 'AGE_13_PLUS'
  | 'AGE_16_PLUS'
  | 'AGE_18_PLUS';

export type UploadStatus =
  | 'INITIATED'
  | 'UPLOADED'
  | 'QUEUED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED';

export type NotificationType =
  | 'SYSTEM'
  | 'CONTENT_PUBLISHED'
  | 'CREATOR_STATUS'
  | 'REMINDER';

export interface User {
  id: string;
  username?: string | null;
  email: string;
  displayName: string;
  role: UserRole;
  isActive?: boolean;
  avatarUrl?: string | null;
  emailVerifiedAt?: string | null;
  disabledAt?: string | null;
  creatorProfile?: CreatorProfile | null;
  createdAt: string;
  publicId?: string;
}

export interface AdminManagedUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  disabledAt?: string | null;
  phoneNumber?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  username: string;
  password: string;
  phoneNumber?: string;
}

export interface UpdateUserInput {
  username?: string;
  displayName?: string;
}

export interface ResetUserPasswordInput {
  newPassword: string;
}

export interface UpdateUserStatusInput {
  isActive: boolean;
}

export interface CreatorProfile {
  id: string;
  userId: string;
  slug: string;
  bio?: string | null;
  approvedAt?: string | null;
}

export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface Episode {
  id: string;
  seasonId?: string;
  title: string;
  description?: string | null;
  episodeNumber: number;
  durationSec?: number | null;
  previewDuration?: number | null;
  premiumFlag?: boolean;
  status: ContentStatus;
  publishedAt?: string | null;
  mediaAssetId?: string | null;
  season?: Season;
}

export interface Season {
  id: string;
  seriesId: string;
  title: string;
  number: number;
  episodes?: Episode[];
  series?: Series;
}

export interface Series {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription?: string | null;
  coverImage?: string | null;
  bannerImage?: string | null;
  contentType: ContentType;
  languageId: string;
  categoryId: string;
  creatorId?: string | null;
  authorName?: string | null;
  narratorName?: string | null;
  tags: string[];
  ageRating: AgeRating;
  premiumFlag?: boolean;
  featuredFlag?: boolean;
  status: ContentStatus;
  publishedAt?: string | null;
  language?: Language;
  category?: Category;
  seasons?: Season[];
  creator?: User | null;
}

export interface PlaybackAuthResponse {
  episodeId: string;
  title: string;
  durationSec?: number | null;
  contentType: string;
  audioUrl: string;
  expiresIn: number;
}

export interface AuthSessionResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface FavoriteItem extends Series {
  favoriteId: string;
  savedAt: string;
}

export interface HistoryItem {
  progressId: string;
  positionSec: number;
  durationSec: number;
  completed: boolean;
  lastPlayedAt: string;
  episode: {
    id: string;
    title: string;
    number: number;
  };
  series: {
    id: string;
    slug: string;
    title: string;
    coverImage?: string | null;
    authorName?: string | null;
    narratorName?: string | null;
    category?: { name: string };
  };
}

export interface ContinueListeningItem {
  episodeId: string;
  episodeTitle: string;
  episodeNumber: number;
  positionSec: number;
  durationSec: number;
  progressPercentage: number;
  lastPlayedAt: string;
  series: {
    id: string;
    slug: string;
    title: string;
    coverImage?: string | null;
    authorName?: string | null;
    narratorName?: string | null;
  };
}

export interface Playlist {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  items?: PlaylistItem[];
  _count?: { items: number };
}

export interface PlaylistItem {
  id: string;
  playlistId: string;
  episodeId: string;
  position: number;
  addedAt: string;
  episode?: Episode;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export interface CreatorAnalytics {
  totalStories: number;
  totalEpisodes: number;
  publishedEpisodes: number;
  totalPlays: number;
  listeningHours: number;
  completionRate: number;
  topSeries: Array<{ id: string; title: string; status: ContentStatus }>;
}

export interface AdminMetrics {
  totalUsers: number;
  activeListeners: number;
  totalCreators: number;
  totalStories: number;
  totalEpisodes: number;
  publishedStories: number;
  publishedEpisodes: number;
  pendingModeration: number;
  totalUploadJobs: number;
  failedUploadJobs: number;
  totalListeningHours: number;
}

export interface AdminDashboardStats {
  totalStories: number;
  totalCategories: number;
  totalAudioFiles: number;
  totalAudioStorageUsage: number;
  storageUsageFormatted: string;
  totalPublishedStories: number;
  totalDraftStories: number;
  coverImageCount: number;
  recentlyUploadedStories: Array<{
    id: string;
    slug: string;
    title: string;
    shortDescription?: string;
    coverImage?: string | null;
    authorName: string;
    narratorName: string;
    status: ContentStatus;
    categoryName: string;
    languageName: string;
    totalEpisodes: number;
    totalDurationSec: number;
    publishedAt?: string | null;
    createdAt: string;
  }>;
  recentAdminActivities: Array<{
    id: string;
    action: string;
    targetType: string;
    targetId?: string | null;
    details?: any;
    createdAt: string;
    actorName: string;
    actorEmail: string;
    actorRole: string;
  }>;
  storageUsageStatistics: {
    totalBytes: number;
    audioCount: number;
    imageCount: number;
    audioBytes: number;
    imageBytesApprox: number;
  };
  monthlyUploadAnalytics: Array<{
    month: string;
    stories: number;
    episodes: number;
  }>;
}

export interface AdminStoryListItem {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  fullDescription?: string;
  coverImage?: string;
  coverImageUrl?: string;
  authorName: string;
  narratorName: string;
  categoryId: string;
  categoryName?: string;
  languageId: string;
  languageName?: string;
  status: ContentStatus;
  publishedAt?: string | null;
  totalEpisodes: number;
  totalDurationSec: number;
  totalStorageBytes: number;
  chapters?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminStorageOverview {
  totalStorageBytes: number;
  audioFilesCount: number;
  imageFilesCount: number;
  totalFilesCount: number;
  audioStorageBytes: number;
  imageStorageBytes: number;
  bucket: string;
  provider: string;
}

export interface AdminStorageFile {
  id: string;
  name: string;
  path: string;
  url: string;
  contentType: string;
  sizeBytes: number;
  durationSec: number;
  isProcessed: boolean;
  associatedStory?: string | null;
  associatedStoryId?: string | null;
  associatedChapter?: string | null;
  createdAt: string;
}

export interface AdminStaffMember {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  roleName: string;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSystemHealth {
  status: 'ok' | 'degraded';
  database: {
    status: string;
    latencyMs: number;
  };
  storage: {
    provider: string;
    bucket: string;
    status: string;
  };
  system: {
    nodeVersion: string;
    platform: string;
    uptimeSeconds: number;
    environment: string;
    memoryUsageMb: number;
  };
  timestamp: string;
}

export interface AdminReportsData {
  timeframe: string;
  dateRange: { start: string; end: string };
  metrics: {
    periodStoriesCreated: number;
    periodPublishedStories: number;
    periodDraftStories: number;
    periodAudioUploads: number;
    totalAllTimeStories: number;
    totalCategories: number;
  };
  categoryDistribution: {
    id: string;
    name: string;
    slug: string;
    count: number;
    percentage: number;
  }[];
  monthlyTrends: {
    key: string;
    label: string;
    tamilMonth: string;
    storiesCount: number;
    audioFilesCount: number;
    storageMb: number;
  }[];
  recentAuditLogs: {
    id: string;
    action: string;
    targetType: string;
    targetId?: string | null;
    details?: any;
    createdAt: string;
    user?: {
      displayName: string;
      email: string;
      role: string;
    } | null;
  }[];
}


