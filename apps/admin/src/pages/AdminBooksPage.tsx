import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Trash2,
  Edit,
  Headphones,
  Eye,
  Radio,
  Sparkles,
} from 'lucide-react';
import {
  listAdminBooks,
  toggleBookPublish,
  deleteAdminBook,
  type AdminBook,
} from '../services/adminCatalogService';

export const AdminBooksPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [books, setBooks] = useState<AdminBook[]>(() => listAdminBooks());

  const refreshBooks = () => {
    setBooks(listAdminBooks({ search, status: statusFilter, categoryId: categoryFilter }));
  };

  useEffect(() => {
    refreshBooks();
    window.addEventListener('kathaisolli:admin-books-updated', refreshBooks);
    return () => window.removeEventListener('kathaisolli:admin-books-updated', refreshBooks);
  }, [search, statusFilter, categoryFilter]);

  const handleTogglePublish = (bookId: string) => {
    toggleBookPublish(bookId);
    refreshBooks();
  };

  const handleDelete = (bookId: string, title: string) => {
    if (confirm(`"${title}" புத்தகத்தை நிச்சயமாக நீக்க விரும்புகிறீர்களா? (Delete book?)`)) {
      deleteAdminBook(bookId);
      refreshBooks();
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>புத்தகங்கள் மேலாண்மை (Book Management)</span>
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
            ஆடியோ புத்தகங்கள் & தொடர்கள்
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            மொத்தம் {books.length} புத்தகங்கள் • வெளியிடப்பட்டவை பொது தளத்தில் நேரடியாகக் கேட்க முடியும்
          </p>
        </div>

        <Link
          to="/books/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all hover:scale-105 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>புதிய புத்தகம் சேர் (Add New Book)</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="புத்தகம் அல்லது எழுத்தாளர் பெயர் தேடுக..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-[#0A1612] border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-emerald-700 text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            அனைத்தும் ({books.length})
          </button>
          <button
            onClick={() => setStatusFilter('PUBLISHED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === 'PUBLISHED'
                ? 'bg-emerald-700 text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            வெளியிடப்பட்டது (Published)
          </button>
          <button
            onClick={() => setStatusFilter('DRAFT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === 'DRAFT'
                ? 'bg-amber-600 text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            வரைவு (Draft)
          </button>
        </div>
      </div>

      {/* Books Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => {
          const isPublished = book.status === 'PUBLISHED';
          const audioChapters = book.chapters.filter((c) => !!c.audioUrl).length;

          return (
            <div
              key={book.id}
              className="flex flex-col justify-between rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-5 space-y-4">
                <div className="flex gap-4 items-start">
                  {/* Cover Preview */}
                  <div className="w-20 h-24 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-sm relative">
                    <img
                      src={book.coverImageUrl || '/images/temple-sunset.jpg'}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/temple-sunset.jpg';
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    {/* Status Pill */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isPublished
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        }`}
                      >
                        {isPublished ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>வெளியிடப்பட்டது (Published)</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>வரைவு (Draft)</span>
                          </>
                        )}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 truncate font-serif">
                      {book.tamilTitle || book.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {book.title}
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold truncate">
                      {book.authorName}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                  {book.description || 'விளக்கம் எதுவும் சேர்க்கப்படவில்லை.'}
                </p>

                {/* Stats Info */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Headphones className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{book.chapters.length} அத்தியாயங்கள் ({audioChapters} ஆடியோ)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold">
                    {book.categoryName || book.categoryId}
                  </span>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-3 bg-zinc-50 dark:bg-[#0A1612] border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                <Link
                  to={`/books/${book.id}/chapters`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-colors"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>ஆடியோ அத்தியாயங்கள்</span>
                </Link>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleTogglePublish(book.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      isPublished
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                    title={isPublished ? 'வரைவுக்கு மாற்று (Set to Draft)' : 'பொதுவில் வெளியிடு (Publish)'}
                  >
                    {isPublished ? 'வரைவாக்கு' : 'வெளியிடு'}
                  </button>

                  <button
                    onClick={() => handleDelete(book.id, book.tamilTitle || book.title)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="நீக்கு (Delete)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
