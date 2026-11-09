import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  Eye,
  Headphones,
  Sparkles,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth } from '../context/AdminAuthContext';
import type { AdminStoryListItem } from '@kathaisolli/shared-types';

export const AdminBooksPage: React.FC = () => {
  const { api, permissions } = useAdminAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch categories for filtering
  const { data: categories = [] } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => api.admin.listCategories(),
  });

  // Fetch paginated stories from real database
  const {
    data: storiesData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['admin', 'stories', page, pageSize, debouncedSearch, categoryFilter, statusFilter],
    queryFn: () =>
      api.admin.listStories({
        page,
        pageSize,
        search: debouncedSearch || undefined,
        categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      }),
  });

  // Mutation to toggle publish/draft
  const togglePublishMutation = useMutation({
    mutationFn: (id: string) => api.admin.togglePublishStory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stories'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });

  // Mutation to delete story
  const deleteStoryMutation = useMutation({
    mutationFn: (id: string) => api.admin.deleteStory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stories'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });

  const handleDelete = (story: AdminStoryListItem) => {
    if (
      confirm(
        `"${story.title}" கதையை நிச்சயமாக நீக்க விரும்புகிறீர்களா? (Delete story and chapters?)`,
      )
    ) {
      deleteStoryMutation.mutate(story.id);
    }
  };

  const stories = storiesData?.items || [];
  const total = storiesData?.total || 0;
  const totalPages = storiesData?.totalPages || 1;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#064E3B] text-xs font-bold uppercase tracking-wider mb-1.5 border border-emerald-200">
            <BookOpen className="w-3.5 h-3.5" />
            <span>கதை மேலாண்மை (Story Management)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif">
            ஆடியோ கதைகள் & தொடர்கள்
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            மொத்தம் {total} கதைகள் • பொது நேயர் தளத்தில் உடனுக்குடன் பிரதிபலிக்கும்
          </p>
        </div>

        {permissions.canManageStories && (
          <Link
            to="/admin/stories/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>புதிய கதை சேர் (Add Story)</span>
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="கதை தலைப்பு அல்லது எழுத்தாளர் பெயர் தேடுக..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
          >
            <option value="all">அனைத்து வகைப்பாடுகள் (All Categories)</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.slug || c.id}>
                {c.tamilName || c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-full md:w-auto text-xs font-bold">
          <button
            onClick={() => {
              setStatusFilter('ALL');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-[#064E3B] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            அனைத்தும்
          </button>
          <button
            onClick={() => {
              setStatusFilter('PUBLISHED');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              statusFilter === 'PUBLISHED'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            வெளியானவை
          </button>
          <button
            onClick={() => {
              setStatusFilter('DRAFT');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              statusFilter === 'DRAFT'
                ? 'bg-gray-800 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            வரைவு
          </button>
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span>கதைகளை ஏற்றுவதில் பிழை ஏற்பட்டது</span>
          </div>
          <p className="text-xs">{(error as any)?.message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>மீண்டும் முயற்சி</span>
          </button>
        </div>
      ) : stories.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#064E3B] flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">கதைகள் எதுவும் இல்லை</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
              தேடல் அல்லது வடிகட்டலுக்குப் பொருந்தும் கதைகள் எதுவும் காணப்படவில்லை. புதிய கதையைச் சேர்க்கலாம்.
            </p>
          </div>
          {permissions.canManageStories && (
            <Link
              to="/admin/stories/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#064E3B] text-white text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>புதிய கதை சேர்</span>
            </Link>
          )}
        </div>
      ) : (
        /* Stories Grid Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => {
            const isPublished = story.status === 'PUBLISHED';
            return (
              <div
                key={story.id}
                className="rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header Banner & Cover */}
                  <div className="relative h-44 bg-gradient-to-br from-emerald-900 to-emerald-950 overflow-hidden flex items-center justify-center">
                    {story.coverImage || story.coverImageUrl ? (
                      <img
                        src={story.coverImage || story.coverImageUrl}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-center p-4 text-emerald-200/60">
                        <BookOpen className="w-12 h-12 mx-auto mb-1 stroke-1" />
                        <span className="text-xs font-serif font-bold">கதைசொல்லி</span>
                      </div>
                    )}

                    {/* Status Pill Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide shadow-md ${
                          isPublished
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-800 text-gray-200'
                        }`}
                      >
                        {isPublished ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-[#A7F3D0]" />
                            <span>வெளியானது (Published)</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-300" />
                            <span>வரைவு (Draft)</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Category Pill Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white shadow-sm border border-white/20">
                        {story.categoryName || 'General'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-extrabold text-base text-gray-900 group-hover:text-[#064E3B] transition-colors font-serif line-clamp-1">
                        {story.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        எழுத்தாளர்: <span className="font-semibold text-gray-700">{story.authorName}</span>
                      </p>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {story.shortDescription || 'விளக்கம் சேர்க்கப்படவில்லை.'}
                    </p>

                    {/* Meta stats */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1 font-semibold text-gray-700">
                        <Headphones className="w-3.5 h-3.5 text-[#047857]" />
                        <span>{story.totalEpisodes} அத்தியாயங்கள்</span>
                      </span>
                      <span>{story.languageName || 'தமிழ்'}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Manage Chapters */}
                    <Link
                      to={`/admin/stories/${story.id}/chapters`}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-gray-700 hover:text-[#064E3B] border border-gray-200 text-xs font-bold transition-colors shadow-sm flex items-center gap-1"
                      title="அத்தியாயங்கள் மற்றும் ஆடியோ மேலாண்மை"
                    >
                      <Headphones className="w-3.5 h-3.5 text-[#047857]" />
                      <span>அத்தியாயங்கள்</span>
                    </Link>

                    {/* Edit Story */}
                    {permissions.canManageStories && (
                      <Link
                        to={`/admin/stories/${story.id}`}
                        className="p-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 transition-colors shadow-sm"
                        title="விவரங்களைத் திருத்து (Edit)"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Publish Toggle Button */}
                    {permissions.canManageStories && (
                      <button
                        onClick={() => togglePublishMutation.mutate(story.id)}
                        disabled={togglePublishMutation.isPending}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-sm ${
                          isPublished
                            ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                            : 'bg-[#064E3B] text-white hover:bg-[#047857]'
                        }`}
                      >
                        {isPublished ? 'வரைவாக்கு (Draft)' : 'வெளியிடு (Publish)'}
                      </button>
                    )}

                    {/* Delete Story */}
                    {permissions.canManageStories && (
                      <button
                        onClick={() => handleDelete(story)}
                        disabled={deleteStoryMutation.isPending}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="நீக்கு (Delete)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="p-4 rounded-2xl bg-white border border-gray-200 flex items-center justify-between text-xs font-bold shadow-sm">
          <span className="text-gray-500">
            பக்கம் {page} / {totalPages} (மொத்தம் {total} கதைகள்)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded-xl bg-emerald-50 text-[#064E3B] border border-emerald-200 font-extrabold">
              {page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
