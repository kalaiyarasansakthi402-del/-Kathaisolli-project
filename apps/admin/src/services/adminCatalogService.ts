export interface AdminChapter {
  id: string;
  bookId: string;
  number: number;
  title: string;
  tamilTitle?: string;
  description?: string;
  audioUrl?: string;
  storagePath?: string;
  durationSec: number;
  fileSizeBytes: number;
  fileName?: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBook {
  id: string;
  slug: string;
  title: string;
  tamilTitle?: string;
  description: string;
  authorName: string;
  narratorName: string;
  categoryId: string;
  categoryName?: string;
  languageId: string;
  languageName?: string;
  coverImageUrl?: string;
  coverStoragePath?: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string | null;
  chapters: AdminChapter[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'kathaisolli_admin_books_v1';

const INITIAL_BOOKS: AdminBook[] = [
  {
    id: 'kb-1',
    slug: 'adutha-vinadi',
    title: 'Adutha Vinadi',
    tamilTitle: 'அடுத்த நிமிடம்',
    description: 'வாழ்வின் அடுத்த நொடியை மாற்றியமைக்கும் உத்வேகம் மற்றும் வழிகாட்டல் சிந்தனைகள்.',
    authorName: 'குகநாதன்',
    narratorName: 'By Anzles Studio',
    categoryId: 'motivation',
    categoryName: 'Motivation',
    languageId: 'ta',
    languageName: 'Tamil',
    coverImageUrl: '/images/covers/adutha-vinadi.jpg',
    status: 'PUBLISHED',
    publishedAt: '2026-10-31T10:00:00.000Z',
    createdAt: '2026-10-31T09:00:00.000Z',
    updatedAt: '2026-10-31T10:00:00.000Z',
    chapters: [
      {
        id: 'ch-1-1',
        bookId: 'kb-1',
        number: 1,
        title: 'Chapter 1 - The Awakening',
        tamilTitle: 'அத்தியாயம் 1 - தொடக்கம்',
        description: 'விழிப்புணர்வு மற்றும் முதல் அடியின் சக்தி.',
        durationSec: 360,
        fileSizeBytes: 4200000,
        audioUrl: 'https://firebasestorage.googleapis.com/v0/b/vaagai-audio-books-36a4e.appspot.com/o/Adutha%20Vinadi%2F01.ogg?alt=media',
        status: 'PUBLISHED',
        publishedAt: '2026-10-31T10:00:00.000Z',
        createdAt: '2026-10-31T09:00:00.000Z',
        updatedAt: '2026-10-31T10:00:00.000Z',
      },
      {
        id: 'ch-1-2',
        bookId: 'kb-1',
        number: 2,
        title: 'Chapter 2 - The Turning Point',
        tamilTitle: 'அத்தியாயம் 2 - திருப்பம்',
        description: 'தடைகளை வாய்ப்புகளாக மாற்றும் தருணம்.',
        durationSec: 420,
        fileSizeBytes: 4900000,
        audioUrl: 'https://firebasestorage.googleapis.com/v0/b/vaagai-audio-books-36a4e.appspot.com/o/Adutha%20Vinadi%2F02.ogg?alt=media',
        status: 'PUBLISHED',
        publishedAt: '2026-10-31T10:00:00.000Z',
        createdAt: '2026-10-31T09:00:00.000Z',
        updatedAt: '2026-10-31T10:00:00.000Z',
      },
    ],
  },
  {
    id: 'kb-4',
    slug: 'arthashastram',
    title: 'Arthashastram',
    tamilTitle: 'அர்த்தசாஸ்திரம்',
    description: 'அரசியல், ஆட்சி முறை, பொருளாதாரம் மற்றும் உத்தி பற்றிய சாணக்கியரின் அரிய படைப்பு.',
    authorName: 'கௌடில்யர் (சாணக்கியர்)',
    narratorName: 'By Anzles Studio',
    categoryId: 'history',
    categoryName: 'History',
    languageId: 'ta',
    languageName: 'Tamil',
    coverImageUrl: '/images/covers/arthashastram.jpg',
    status: 'PUBLISHED',
    publishedAt: '2026-10-31T12:00:00.000Z',
    createdAt: '2026-10-31T11:00:00.000Z',
    updatedAt: '2026-10-31T12:00:00.000Z',
    chapters: [
      {
        id: 'ch-4-1',
        bookId: 'kb-4',
        number: 1,
        title: 'Chapter 1 - Introduction to Governance',
        tamilTitle: 'அத்தியாயம் 1 - அரசியல் நெறி',
        description: 'அரசனின் கடமைகள் மற்றும் தலைமைத்துவக் கொள்கைகள்.',
        durationSec: 1456,
        fileSizeBytes: 2866408,
        audioUrl: '/audio/arthashastram_01.mp3',
        status: 'PUBLISHED',
        publishedAt: '2026-10-31T12:00:00.000Z',
        createdAt: '2026-10-31T11:00:00.000Z',
        updatedAt: '2026-10-31T12:00:00.000Z',
      },
    ],
  },
  {
    id: 'kb-draft-sample',
    slug: 'ponniyin-selvan-part1',
    title: 'Ponniyin Selvan - Part 1',
    tamilTitle: 'பொன்னியின் செல்வன் - புது வெள்ளம்',
    description: 'கல்கியின் அமர காவியமான சோழ சாம்ராஜ்ய வரலாற்றுப் புதினம்.',
    authorName: 'கல்கி கிருஷ்ணமூர்த்தி',
    narratorName: 'By Anzles Studio',
    categoryId: 'history',
    categoryName: 'History',
    languageId: 'ta',
    languageName: 'Tamil',
    coverImageUrl: '/images/temple-sunset.jpg',
    status: 'DRAFT',
    publishedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    chapters: [],
  },
];

export const getStoredBooks = (): AdminBook[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BOOKS));
      return INITIAL_BOOKS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_BOOKS;
  }
};

export const saveStoredBooks = (books: AdminBook[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    window.dispatchEvent(new CustomEvent('kathaisolli:admin-books-updated'));
  } catch (err) {
    console.error('Failed to save admin books:', err);
  }
};

/**
 * Platform KPI metrics for the Admin Dashboard
 */
export const getAdminMetrics = () => {
  const books = getStoredBooks();
  const publishedBooks = books.filter((b) => b.status === 'PUBLISHED');
  const draftBooks = books.filter((b) => b.status === 'DRAFT');

  let totalChapters = 0;
  let totalAudioFiles = 0;
  let totalStorageBytes = 0;
  let totalCoverImages = 0;

  for (const book of books) {
    if (book.coverImageUrl) totalCoverImages++;
    for (const ch of book.chapters) {
      totalChapters++;
      if (ch.audioUrl) {
        totalAudioFiles++;
        totalStorageBytes += ch.fileSizeBytes || 0;
      }
    }
  }

  // Format storage usage
  const mb = (totalStorageBytes / (1024 * 1024)).toFixed(1);
  const storageFormatted = totalStorageBytes > 1024 * 1024 * 1024
    ? `${(totalStorageBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
    : `${mb} MB`;

  return {
    totalBooks: books.length,
    totalChapters,
    totalUploadedAudio: totalAudioFiles,
    totalCoverImages,
    publishedBooks: publishedBooks.length,
    draftBooks: draftBooks.length,
    totalStorageBytes,
    storageUsage: storageFormatted,
    databaseType: 'PostgreSQL + Prisma',
    storageBucket: 'vaagai-audio-books-36a4e.appspot.com',
  };
};

/**
 * List books with filters
 */
export const listAdminBooks = (filter?: {
  status?: 'ALL' | 'DRAFT' | 'PUBLISHED';
  search?: string;
  categoryId?: string;
}): AdminBook[] => {
  let books = getStoredBooks();

  if (filter?.status && filter.status !== 'ALL') {
    books = books.filter((b) => b.status === filter.status);
  }

  if (filter?.categoryId && filter.categoryId !== 'all') {
    books = books.filter((b) => b.categoryId === filter.categoryId);
  }

  if (filter?.search && filter.search.trim()) {
    const q = filter.search.toLowerCase().trim();
    books = books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.tamilTitle && b.tamilTitle.toLowerCase().includes(q)) ||
        b.authorName.toLowerCase().includes(q)
    );
  }

  return books;
};

/**
 * Get single book by ID
 */
export const getAdminBook = (bookId: string): AdminBook | null => {
  const books = getStoredBooks();
  return books.find((b) => b.id === bookId || b.slug === bookId) || null;
};

/**
 * Create or update a book
 */
export const upsertAdminBook = (
  data: Partial<AdminBook> & { title: string; categoryId: string; languageId: string }
): AdminBook => {
  const books = getStoredBooks();
  const id = data.id || `kb-${Date.now()}`;
  const slug =
    data.slug ||
    data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') ||
    `book-${Date.now()}`;

  const existingIndex = books.findIndex((b) => b.id === id);
  const now = new Date().toISOString();

  let book: AdminBook;
  if (existingIndex >= 0) {
    book = {
      ...books[existingIndex],
      ...data,
      id,
      slug,
      updatedAt: now,
      chapters: books[existingIndex].chapters,
    };
    books[existingIndex] = book;
  } else {
    book = {
      id,
      slug,
      title: data.title,
      tamilTitle: data.tamilTitle || '',
      description: data.description || '',
      authorName: data.authorName || 'கதைசொல்லி',
      narratorName: data.narratorName || 'By Anzles Studio',
      categoryId: data.categoryId,
      categoryName: data.categoryName || data.categoryId,
      languageId: data.languageId,
      languageName: data.languageName || 'Tamil',
      coverImageUrl: data.coverImageUrl || '/images/temple-sunset.jpg',
      coverStoragePath: data.coverStoragePath,
      status: data.status || 'DRAFT',
      publishedAt: data.status === 'PUBLISHED' ? now : null,
      chapters: [],
      createdAt: now,
      updatedAt: now,
    };
    books.unshift(book);
  }

  saveStoredBooks(books);
  return book;
};

/**
 * Toggle book publishing status
 */
export const toggleBookPublish = (
  bookId: string,
  targetStatus?: 'PUBLISHED' | 'DRAFT'
): AdminBook | null => {
  const books = getStoredBooks();
  const index = books.findIndex((b) => b.id === bookId);
  if (index === -1) return null;

  const current = books[index];
  const newStatus = targetStatus || (current.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED');
  const now = new Date().toISOString();

  books[index] = {
    ...current,
    status: newStatus,
    publishedAt: newStatus === 'PUBLISHED' ? current.publishedAt || now : null,
    updatedAt: now,
  };

  saveStoredBooks(books);
  return books[index];
};

/**
 * Delete a book
 */
export const deleteAdminBook = (bookId: string): boolean => {
  const books = getStoredBooks();
  const filtered = books.filter((b) => b.id !== bookId);
  if (filtered.length === books.length) return false;
  saveStoredBooks(filtered);
  return true;
};

/**
 * Add or update a chapter in a book
 */
export const upsertAdminChapter = (
  bookId: string,
  chapterData: Partial<AdminChapter> & { title: string; number: number; durationSec: number }
): AdminChapter | null => {
  const books = getStoredBooks();
  const bookIndex = books.findIndex((b) => b.id === bookId);
  if (bookIndex === -1) return null;

  const book = books[bookIndex];
  const chapterId = chapterData.id || `ch-${bookId}-${Date.now()}`;
  const now = new Date().toISOString();

  const chIndex = book.chapters.findIndex((c) => c.id === chapterId);
  let chapter: AdminChapter;

  if (chIndex >= 0) {
    chapter = {
      ...book.chapters[chIndex],
      ...chapterData,
      id: chapterId,
      bookId,
      updatedAt: now,
    };
    book.chapters[chIndex] = chapter;
  } else {
    chapter = {
      id: chapterId,
      bookId,
      number: chapterData.number || book.chapters.length + 1,
      title: chapterData.title,
      tamilTitle: chapterData.tamilTitle || '',
      description: chapterData.description || '',
      audioUrl: chapterData.audioUrl || '',
      storagePath: chapterData.storagePath || '',
      durationSec: chapterData.durationSec || 0,
      fileSizeBytes: chapterData.fileSizeBytes || 0,
      fileName: chapterData.fileName || '',
      status: chapterData.status || 'DRAFT',
      publishedAt: chapterData.status === 'PUBLISHED' ? now : null,
      createdAt: now,
      updatedAt: now,
    };
    book.chapters.push(chapter);
  }

  // Sort chapters by number
  book.chapters.sort((a, b) => a.number - b.number);
  book.updatedAt = now;
  books[bookIndex] = book;

  saveStoredBooks(books);
  return chapter;
};

/**
 * Delete a chapter
 */
export const deleteAdminChapter = (bookId: string, chapterId: string): boolean => {
  const books = getStoredBooks();
  const bookIndex = books.findIndex((b) => b.id === bookId);
  if (bookIndex === -1) return false;

  const book = books[bookIndex];
  const initialLen = book.chapters.length;
  book.chapters = book.chapters.filter((c) => c.id !== chapterId);
  if (book.chapters.length === initialLen) return false;

  book.updatedAt = new Date().toISOString();
  books[bookIndex] = book;
  saveStoredBooks(books);
  return true;
};

/**
 * List recent uploads across all books
 */
export const getRecentUploads = (limit = 5) => {
  const books = getStoredBooks();
  const uploads: Array<{
    id: string;
    bookId: string;
    bookTitle: string;
    chapterNumber: number;
    chapterTitle: string;
    fileName: string;
    durationSec: number;
    fileSizeBytes: number;
    status: 'DRAFT' | 'PUBLISHED';
    uploadedAt: string;
    audioUrl?: string;
  }> = [];

  for (const book of books) {
    for (const ch of book.chapters) {
      if (ch.audioUrl) {
        uploads.push({
          id: ch.id,
          bookId: book.id,
          bookTitle: book.tamilTitle || book.title,
          chapterNumber: ch.number,
          chapterTitle: ch.tamilTitle || ch.title,
          fileName: ch.fileName || `${ch.number}.mp3`,
          durationSec: ch.durationSec,
          fileSizeBytes: ch.fileSizeBytes,
          status: ch.status,
          uploadedAt: ch.updatedAt || ch.createdAt,
          audioUrl: ch.audioUrl,
        });
      }
    }
  }

  uploads.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  return uploads.slice(0, limit);
};

export interface AdminCategory {
  id: string;
  slug: string;
  name: string;
  tamilName?: string;
  description?: string;
  isActive: boolean;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES_STORAGE_KEY = 'kathaisolli_admin_categories_v1';

const INITIAL_CATEGORIES: AdminCategory[] = [
  {
    id: 'cat-general',
    slug: 'general',
    name: 'General',
    tamilName: 'பொதுவானவை (General)',
    description: 'அனைத்து நேயர்களுக்கும் உகந்த பொதுவான கதைகள் மற்றும் தொடர்கள்.',
    isActive: true,
    createdAt: '2026-10-30T00:00:00.000Z',
    updatedAt: '2026-10-30T00:00:00.000Z',
  },
  {
    id: 'cat-history',
    slug: 'history',
    name: 'History',
    tamilName: 'வரலாற்றுக் கதைகள்',
    description: 'வரலாற்றுப் புதினங்கள் மற்றும் அரசர்களின் வரலாற்று நிகழ்வுகள்.',
    isActive: true,
    createdAt: '2026-10-30T00:00:00.000Z',
    updatedAt: '2026-10-30T00:00:00.000Z',
  },
  {
    id: 'cat-motivation',
    slug: 'motivation',
    name: 'Motivation',
    tamilName: 'ஊக்கமளிக்கும் கதைகள்',
    description: 'தன்னம்பிக்கை மற்றும் வாழ்வியல் வழிகாட்டல் சிந்தனைகள்.',
    isActive: true,
    createdAt: '2026-10-30T00:00:00.000Z',
    updatedAt: '2026-10-30T00:00:00.000Z',
  },
  {
    id: 'cat-moral',
    slug: 'moral-stories',
    name: 'Moral Stories',
    tamilName: 'நீதிக்கதைகள் & நன்னெறி',
    description: 'பஞ்சதந்திரக் கதைகள் மற்றும் ஈசாப் நீதிக்கதைகள்.',
    isActive: true,
    createdAt: '2026-10-30T00:00:00.000Z',
    updatedAt: '2026-10-30T00:00:00.000Z',
  },
  {
    id: 'cat-mythology',
    slug: 'mythology',
    name: 'Mythology',
    tamilName: 'புராணக் கதைகள்',
    description: 'இதிகாசங்கள் மற்றும் தெய்வக் கதைகள்.',
    isActive: true,
    createdAt: '2026-10-30T00:00:00.000Z',
    updatedAt: '2026-10-30T00:00:00.000Z',
  },
  {
    id: 'cat-children',
    slug: 'children',
    name: 'Children',
    tamilName: 'சிறுவர் கதைகள்',
    description: 'குழந்தைகளுக்கான தாலாட்டு மற்றும் பொழுதுபோக்குக் கதைகள்.',
    isActive: true,
    createdAt: '2026-10-30T00:00:00.000Z',
    updatedAt: '2026-10-30T00:00:00.000Z',
  },
];

export const getStoredCategories = (): AdminCategory[] => {
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    // Ensure 'general' is always included
    if (!parsed.some((c: AdminCategory) => c.slug === 'general')) {
      parsed.unshift(INITIAL_CATEGORIES[0]);
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return INITIAL_CATEGORIES;
  }
};

export const saveStoredCategories = (categories: AdminCategory[]): void => {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    window.dispatchEvent(new CustomEvent('kathaisolli:admin-categories-updated'));
  } catch (err) {
    console.error('Failed to save categories:', err);
  }
};

export const listAdminCategories = (search?: string): AdminCategory[] => {
  const categories = getStoredCategories();
  const books = getStoredBooks();

  const mapped = categories.map((cat) => {
    const count = books.filter(
      (b) => b.categoryId?.toLowerCase() === cat.slug?.toLowerCase() || b.categoryName?.toLowerCase() === cat.name?.toLowerCase()
    ).length;
    return { ...cat, itemCount: count };
  });

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    return mapped.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.tamilName && c.tamilName.toLowerCase().includes(q)) ||
        c.slug.toLowerCase().includes(q)
    );
  }

  return mapped;
};

export const upsertAdminCategory = (
  data: Partial<AdminCategory> & { name: string; slug: string }
): AdminCategory => {
  const categories = getStoredCategories();
  const id = data.id || `cat-${Date.now()}`;
  const now = new Date().toISOString();
  const existingIdx = categories.findIndex((c) => c.id === id || c.slug === data.slug);

  let category: AdminCategory;
  if (existingIdx >= 0) {
    category = {
      ...categories[existingIdx],
      ...data,
      id: categories[existingIdx].id,
      updatedAt: now,
    };
    categories[existingIdx] = category;
  } else {
    category = {
      id,
      slug: data.slug,
      name: data.name,
      tamilName: data.tamilName || data.name,
      description: data.description || '',
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: now,
      updatedAt: now,
    };
    categories.push(category);
  }

  saveStoredCategories(categories);
  return category;
};

export const deleteAdminCategory = (id: string): boolean => {
  const categories = getStoredCategories();
  const target = categories.find((c) => c.id === id);
  if (target?.slug === 'general') {
    // Cannot delete default General category
    return false;
  }
  const filtered = categories.filter((c) => c.id !== id);
  if (filtered.length === categories.length) return false;
  saveStoredCategories(filtered);
  return true;
};

export const toggleCategoryActive = (id: string): AdminCategory | null => {
  const categories = getStoredCategories();
  const idx = categories.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  categories[idx].isActive = !categories[idx].isActive;
  categories[idx].updatedAt = new Date().toISOString();
  saveStoredCategories(categories);
  return categories[idx];
};
