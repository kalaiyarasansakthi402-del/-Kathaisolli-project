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

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type NotificationType =
  | 'SYSTEM'
  | 'CONTENT_PUBLISHED'
  | 'CREATOR_STATUS'
  | 'REMINDER';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string | null;
  emailVerifiedAt?: string | null;
  disabledAt?: string | null;
  creatorProfile?: CreatorProfile | null;
  createdAt: string;
  publicId?: string;
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
  pendingCreatorApprovals: number;
  totalStories: number;
  totalEpisodes: number;
  publishedStories: number;
  publishedEpisodes: number;
  pendingModeration: number;
  totalUploadJobs: number;
  failedUploadJobs: number;
  totalListeningHours: number;
}
