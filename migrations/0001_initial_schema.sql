-- Cloudflare D1 Initial Migration for Kathaisolli
-- Database: kathaisolli (1446e71e-f6f2-4835-956d-07704f141f44)
-- Engine: SQLite / Cloudflare D1

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'LISTENER' CHECK (role IN ('LISTENER', 'CREATOR', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN')),
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  email_verified_at TEXT,
  disabled_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role, created_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- 3. Languages Table
CREATE TABLE IF NOT EXISTS languages (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  native_name TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Series / Books Table
CREATE TABLE IF NOT EXISTS series (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  tamil_title TEXT,
  short_description TEXT,
  full_description TEXT,
  cover_image TEXT,
  banner_image TEXT,
  content_type TEXT NOT NULL DEFAULT 'AUDIOBOOK' CHECK (content_type IN ('STORY', 'AUDIOBOOK', 'PODCAST', 'SHORT_STORY')),
  language_id TEXT NOT NULL REFERENCES languages(id),
  category_id TEXT NOT NULL REFERENCES categories(id),
  creator_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  author_name TEXT,
  narrator_name TEXT,
  tags TEXT DEFAULT '[]',
  age_rating TEXT NOT NULL DEFAULT 'ALL_AGES',
  premium_flag INTEGER NOT NULL DEFAULT 0,
  featured_flag INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PROCESSING', 'PENDING_REVIEW', 'SCHEDULED', 'PUBLISHED', 'REJECTED', 'ARCHIVED')),
  published_at TEXT,
  moderation_note TEXT,
  reviewed_at TEXT,
  reviewed_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_series_status_published ON series(status, published_at);
CREATE INDEX IF NOT EXISTS idx_series_category ON series(category_id, status);
CREATE INDEX IF NOT EXISTS idx_series_language ON series(language_id, status);
CREATE INDEX IF NOT EXISTS idx_series_creator ON series(creator_id, status);

-- 5. Seasons Table
CREATE TABLE IF NOT EXISTS seasons (
  id TEXT PRIMARY KEY,
  series_id TEXT NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  number INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(series_id, number)
);

-- 6. Episodes / Chapters Table
CREATE TABLE IF NOT EXISTS episodes (
  id TEXT PRIMARY KEY,
  season_id TEXT NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  tamil_title TEXT,
  description TEXT,
  episode_number INTEGER NOT NULL,
  duration_sec INTEGER DEFAULT 0,
  file_size_bytes INTEGER DEFAULT 0,
  audio_url TEXT,
  media_asset_id TEXT,
  preview_duration INTEGER,
  premium_flag INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PROCESSING', 'PENDING_REVIEW', 'SCHEDULED', 'PUBLISHED', 'REJECTED', 'ARCHIVED')),
  published_at TEXT,
  moderation_note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(season_id, episode_number)
);

CREATE INDEX IF NOT EXISTS idx_episodes_season_number ON episodes(season_id, episode_number);
CREATE INDEX IF NOT EXISTS idx_episodes_status ON episodes(status, published_at);

-- 7. Media Assets Table
CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  object_key TEXT UNIQUE NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  duration_sec INTEGER,
  is_processed INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. Upload Jobs Table
CREATE TABLE IF NOT EXISTS upload_jobs (
  id TEXT PRIMARY KEY,
  requester_id TEXT NOT NULL REFERENCES users(id),
  episode_id TEXT NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  object_key TEXT NOT NULL,
  original_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('INITIATED', 'UPLOADED', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED')),
  failure_reason TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  series_id TEXT NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, series_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id, created_at);

-- 10. Playback Progress Table
CREATE TABLE IF NOT EXISTS playback_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  episode_id TEXT NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  position_sec INTEGER NOT NULL DEFAULT 0,
  duration_sec INTEGER NOT NULL DEFAULT 0,
  completed_flag INTEGER NOT NULL DEFAULT 0,
  last_played_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, episode_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user ON playback_progress(user_id, last_played_at);

-- 11. Playlists Table
CREATE TABLE IF NOT EXISTS playlists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_public INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. Playlist Items Table
CREATE TABLE IF NOT EXISTS playlist_items (
  id TEXT PRIMARY KEY,
  playlist_id TEXT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  episode_id TEXT NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed Essential Languages
INSERT OR IGNORE INTO languages (id, code, name, native_name) VALUES
('lang-ta', 'ta', 'Tamil', 'தமிழ்'),
('lang-en', 'en', 'English', 'English');

-- Seed Essential Categories
INSERT OR IGNORE INTO categories (id, slug, name, description) VALUES
('cat-history', 'history', 'வரலாறு (History)', 'வரலாற்றுப் புதினங்கள் மற்றும் சம்பவங்கள்'),
('cat-motivation', 'motivation', 'சுயமுன்னேற்றம் (Motivation)', 'தனிமனித மேன்மை மற்றும் தன்னம்பிக்கைக் கதைகள்'),
('cat-literature', 'literature', 'இலக்கியம் (Literature)', 'செவ்வியல் தமிழ் இலக்கியக் கதைகள்'),
('cat-moral', 'moral-stories', 'நீதிக் கதைகள் (Moral Stories)', 'வாழ்வியல் நீதிகளை விளக்கும் பஞ்சதந்திரம் மற்றும் முல்லா கதைகள்'),
('cat-biography', 'biography', 'சுயசரிதை (Biography)', 'தலைவர்கள் மற்றும் சாதனையாளர்களின் வாழ்க்கை வரலாறு');
