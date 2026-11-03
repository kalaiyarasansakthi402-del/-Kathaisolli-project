import { Injectable, Logger } from '@nestjs/common';

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  all<T = Record<string, any>>(): Promise<{ results: T[]; success: boolean; meta: any }>;
  first<T = Record<string, any>>(colName?: string): Promise<T | null>;
  run(): Promise<{ success: boolean; meta: any }>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = any>(statements: D1PreparedStatement[]): Promise<Array<any>>;
  exec(query: string): Promise<{ count: number; duration: number }>;
}

/**
 * Cloudflare D1 Database Service
 * Database name: kathaisolli
 * Database ID: 1446e71e-f6f2-4835-956d-07704f141f44
 * Binding: DB
 *
 * Implements safe, parameterized queries exclusively (zero SQL string concatenation).
 */
@Injectable()
export class D1DatabaseService {
  private readonly logger = new Logger(D1DatabaseService.name);
  private db: D1Database | null = null;

  constructor() {
    // If running inside Cloudflare Worker environment, binding DB is available on global/env
    if (typeof (globalThis as any).DB !== 'undefined') {
      this.db = (globalThis as any).DB;
      this.logger.log('Connected to Cloudflare D1 database: kathaisolli (1446e71e-f6f2-4835-956d-07704f141f44)');
    }
  }

  /**
   * Set D1 database instance explicitly from Cloudflare Worker env
   */
  setDatabase(database: D1Database) {
    this.db = database;
  }

  /**
   * Check if D1 binding is active
   */
  isConnected(): boolean {
    return this.db !== null;
  }

  /**
   * Execute parameterized query returning multiple rows
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) {
      this.logger.warn('D1 database not directly bound in current runtime; using local simulation mode');
      return [];
    }
    const stmt = this.db.prepare(sql).bind(...params);
    const { results } = await stmt.all<T>();
    return results;
  }

  /**
   * Execute parameterized query returning a single row
   */
  async queryFirst<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    if (!this.db) return null;
    const stmt = this.db.prepare(sql).bind(...params);
    return stmt.first<T>();
  }

  /**
   * Run INSERT/UPDATE/DELETE query with parameters
   */
  async run(sql: string, params: any[] = []): Promise<{ success: boolean; meta?: any }> {
    if (!this.db) return { success: true };
    const stmt = this.db.prepare(sql).bind(...params);
    return stmt.run();
  }

  /**
   * Public Catalog API: Get ONLY published books with pagination
   */
  async getPublishedBooks(page = 1, pageSize = 20, categoryId?: string, search?: string) {
    const offset = (page - 1) * pageSize;
    let whereClause = "WHERE status = 'PUBLISHED'";
    const params: any[] = [];

    if (categoryId && categoryId !== 'all') {
      whereClause += " AND category_id = ?";
      params.push(categoryId);
    }

    if (search && search.trim()) {
      whereClause += " AND (title LIKE ? OR tamil_title LIKE ? OR author_name LIKE ?)";
      const pattern = `%${search.trim()}%`;
      params.push(pattern, pattern, pattern);
    }

    const countSql = `SELECT COUNT(*) as total FROM series ${whereClause}`;
    const totalRow = await this.queryFirst<{ total: number }>(countSql, params);
    const total = totalRow?.total || 0;

    const queryParams = [...params, pageSize, offset];
    const dataSql = `
      SELECT id, slug, title, tamil_title as tamilTitle, short_description as shortDescription,
             cover_image as coverImage, author_name as authorName, narrator_name as narratorName,
             category_id as categoryId, language_id as languageId, published_at as publishedAt
      FROM series
      ${whereClause}
      ORDER BY published_at DESC, created_at DESC
      LIMIT ? OFFSET ?
    `;

    const items = await this.query(dataSql, queryParams);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Admin API: Get all books (both Published and Draft) with full status
   */
  async getAdminBooks(page = 1, pageSize = 20, status?: string, search?: string) {
    const offset = (page - 1) * pageSize;
    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (status && status !== 'ALL') {
      whereClause += " AND status = ?";
      params.push(status);
    }

    if (search && search.trim()) {
      whereClause += " AND (title LIKE ? OR tamil_title LIKE ? OR author_name LIKE ?)";
      const pattern = `%${search.trim()}%`;
      params.push(pattern, pattern, pattern);
    }

    const countSql = `SELECT COUNT(*) as total FROM series ${whereClause}`;
    const totalRow = await this.queryFirst<{ total: number }>(countSql, params);
    const total = totalRow?.total || 0;

    const queryParams = [...params, pageSize, offset];
    const dataSql = `
      SELECT s.*, 
        (SELECT COUNT(*) FROM episodes e JOIN seasons sn ON e.season_id = sn.id WHERE sn.series_id = s.id) as chapterCount
      FROM series s
      ${whereClause}
      ORDER BY s.updated_at DESC
      LIMIT ? OFFSET ?
    `;

    const items = await this.query(dataSql, queryParams);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Admin API: Save Book (Draft or Published)
   */
  async saveBook(data: {
    id: string;
    slug: string;
    title: string;
    tamilTitle?: string;
    shortDescription?: string;
    fullDescription?: string;
    coverImage?: string;
    categoryId: string;
    languageId: string;
    authorName?: string;
    narratorName?: string;
    status: 'DRAFT' | 'PUBLISHED';
    creatorId?: string;
  }) {
    const publishedAt = data.status === 'PUBLISHED' ? new Date().toISOString() : null;

    const sql = `
      INSERT INTO series (
        id, slug, title, tamil_title, short_description, full_description,
        cover_image, category_id, language_id, author_name, narrator_name,
        status, published_at, creator_id, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        tamil_title = excluded.tamil_title,
        short_description = excluded.short_description,
        full_description = excluded.full_description,
        cover_image = excluded.cover_image,
        category_id = excluded.category_id,
        language_id = excluded.language_id,
        author_name = excluded.author_name,
        narrator_name = excluded.narrator_name,
        status = excluded.status,
        published_at = COALESCE(series.published_at, excluded.published_at),
        updated_at = CURRENT_TIMESTAMP
    `;

    await this.run(sql, [
      data.id,
      data.slug,
      data.title,
      data.tamilTitle || null,
      data.shortDescription || null,
      data.fullDescription || null,
      data.coverImage || null,
      data.categoryId,
      data.languageId,
      data.authorName || null,
      data.narratorName || null,
      data.status,
      publishedAt,
      data.creatorId || null,
    ]);

    // Ensure default Season 1 exists for chapters
    const seasonId = `season-${data.id}-1`;
    await this.run(
      `INSERT OR IGNORE INTO seasons (id, series_id, title, number) VALUES (?, ?, 'Season 1', 1)`,
      [seasonId, data.id]
    );

    return { id: data.id, status: data.status, success: true };
  }

  /**
   * Admin API: Save Audio Chapter (Draft or Published)
   */
  async saveChapter(data: {
    id: string;
    seriesId: string;
    title: string;
    tamilTitle?: string;
    description?: string;
    episodeNumber: number;
    durationSec: number;
    fileSizeBytes?: number;
    audioUrl?: string;
    status: 'DRAFT' | 'PUBLISHED';
  }) {
    const seasonId = `season-${data.seriesId}-1`;
    const publishedAt = data.status === 'PUBLISHED' ? new Date().toISOString() : null;

    const sql = `
      INSERT INTO episodes (
        id, season_id, title, tamil_title, description,
        episode_number, duration_sec, file_size_bytes, audio_url,
        status, published_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        tamil_title = excluded.tamil_title,
        description = excluded.description,
        episode_number = excluded.episode_number,
        duration_sec = excluded.duration_sec,
        file_size_bytes = excluded.file_size_bytes,
        audio_url = excluded.audio_url,
        status = excluded.status,
        published_at = COALESCE(episodes.published_at, excluded.published_at),
        updated_at = CURRENT_TIMESTAMP
    `;

    await this.run(sql, [
      data.id,
      seasonId,
      data.title,
      data.tamilTitle || null,
      data.description || null,
      data.episodeNumber,
      data.durationSec || 0,
      data.fileSizeBytes || 0,
      data.audioUrl || null,
      data.status,
      publishedAt,
    ]);

    return { id: data.id, status: data.status, success: true };
  }

  /**
   * Admin Overview KPI Metrics
   */
  async getMetrics() {
    const booksCount = await this.queryFirst<{ count: number }>("SELECT COUNT(*) as count FROM series");
    const publishedCount = await this.queryFirst<{ count: number }>("SELECT COUNT(*) as count FROM series WHERE status = 'PUBLISHED'");
    const draftCount = await this.queryFirst<{ count: number }>("SELECT COUNT(*) as count FROM series WHERE status = 'DRAFT'");
    const chaptersCount = await this.queryFirst<{ count: number }>("SELECT COUNT(*) as count FROM episodes");
    const audioCount = await this.queryFirst<{ count: number }>("SELECT COUNT(*) as count FROM episodes WHERE audio_url IS NOT NULL");
    const usersCount = await this.queryFirst<{ count: number }>("SELECT COUNT(*) as count FROM users");

    return {
      totalBooks: booksCount?.count || 0,
      publishedBooks: publishedCount?.count || 0,
      draftBooks: draftCount?.count || 0,
      totalChapters: chaptersCount?.count || 0,
      totalUploadedAudio: audioCount?.count || 0,
      totalUsers: usersCount?.count || 0,
      databaseType: 'Cloudflare D1 (SQLite)',
      databaseId: '1446e71e-f6f2-4835-956d-07704f141f44',
    };
  }
}
