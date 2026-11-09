import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  AlertCircle,
  BookOpen,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  X,
  RefreshCw,
  FolderTree,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminCategoriesPage: React.FC = () => {
  const { api, permissions } = useAdminAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [modalError, setModalError] = useState<string | null>(null);

  // Fetch real categories from database
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => api.admin.listCategories(),
  });

  // Create Category Mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string; slug: string; description?: string; isActive?: boolean }) =>
      api.admin.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      setShowModal(false);
    },
    onError: (err: any) => {
      setModalError(
        err?.response?.data?.message || err?.message || 'வகைப்பாடு உருவாக்குவதில் பிழை ஏற்பட்டது.',
      );
    },
  });

  // Update Category Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.admin.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      setShowModal(false);
    },
    onError: (err: any) => {
      setModalError(
        err?.response?.data?.message || err?.message || 'வகைப்பாடு மாற்றுவதில் பிழை ஏற்பட்டது.',
      );
    },
  });

  // Delete Category Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.admin.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
    onError: (err: any) => {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          'வகைப்பாடு நீக்குவதில் பிழை. கதைகள் இணைக்கப்பட்டுள்ள வகைப்பாடுகளை நீக்க முடியாது.',
      );
    },
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setIsActive(true);
    setModalError(null);
    setShowModal(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setIsActive(cat.isActive);
    setModalError(null);
    setShowModal(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      // Auto-generate slug from English/phonetic name
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      if (generated) setSlug(generated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setModalError('வகைப்பாடு பெயரை உள்ளிடவும்.');
      return;
    }
    if (!slug.trim()) {
      setModalError('Slug அடையாளக் குறியீட்டை உள்ளிடவும்.');
      return;
    }

    const payload = {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      description: description.trim() || undefined,
      isActive,
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (cat: any) => {
    if (cat.seriesCount > 0) {
      alert(
        `"${cat.name}" வகைப்பாட்டில் ${cat.seriesCount} கதைகள் உள்ளன. தற்செயலான நீக்குதலைத் தடுக்க, முதலில் அந்தக் கதைகளை வேறு வகைப்பாட்டிற்கு மாற்றவும்.`,
      );
      return;
    }
    if (confirm(`"${cat.name}" வகைப்பாட்டை நிச்சயமாக நீக்க விரும்புகிறீர்களா?`)) {
      deleteMutation.mutate(cat.id);
    }
  };

  // Filter categories by search
  const filteredCategories = categories.filter((c: any) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      (c.name || '').toLowerCase().includes(term) ||
      (c.slug || '').toLowerCase().includes(term) ||
      (c.description || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#064E3B] text-xs font-bold uppercase tracking-wider mb-1.5 border border-emerald-200">
            <Layers className="w-3.5 h-3.5" />
            <span>வகைப்பாடுகள் மேலாண்மை (Category Management)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif">
            கதை வகைப்பாடுகள்
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            மொத்தம் {categories.length} வகைப்பாடுகள் • பொது நேயர் தளத்தின் ஆய்வுப் பக்கத்தில் பிரதிபலிக்கும்
          </p>
        </div>

        {permissions.canManageCategories && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>புதிய வகைப்பாடு உருவாக்கு (Add Category)</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="வகைப்பாடு பெயர் அல்லது slug தேடுக..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
          />
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
          title="புதுப்பி"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 rounded-3xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span>வகைப்பாடுகளை ஏற்றுவதில் பிழை</span>
          </div>
          <p className="text-xs">{(error as any)?.message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
          >
            மீண்டும் முயற்சி
          </button>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#064E3B] flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">வகைப்பாடுகள் எதுவும் இல்லை</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
              தேடலுக்குப் பொருத்தமான வகைப்பாடு காணப்படவில்லை.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat: any) => (
            <div
              key={cat.id}
              className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#064E3B] flex items-center justify-center font-bold text-xs shrink-0 font-serif">
                      <FolderTree className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-gray-900 font-serif">
                        {cat.tamilName || cat.name}
                      </h3>
                      <span className="text-[11px] font-mono text-[#047857]">
                        /{cat.slug}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      cat.isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {cat.isActive ? 'செயலில் உள்ளது' : 'முடக்கப்பட்டது'}
                  </span>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                  {cat.description || 'விளக்கம் சேர்க்கப்படவில்லை.'}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-500 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#047857]" />
                  <span>{cat.seriesCount || 0} கதைகள் உள்ளன</span>
                </span>

                {permissions.canManageCategories && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors shadow-sm"
                      title="திருத்து (Edit)"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      disabled={deleteMutation.isPending}
                      className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="நீக்கு (Delete)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-5 border border-gray-200 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#064E3B] text-xs font-bold uppercase tracking-wider mb-2">
                <Layers className="w-3.5 h-3.5" />
                <span>
                  {editingCategory ? 'வகைப்பாட்டைத் திருத்து' : 'புதிய வகைப்பாடு'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 font-serif">
                {editingCategory ? 'வகைப்பாடு விவரங்களைப் புதுப்பி' : 'புதிய வகைப்பாடு உருவாக்கு'}
              </h3>
            </div>

            {modalError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">
                  வகைப்பாடு பெயர் (Category Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="எ.கா: ஆன்மீகம் / அறிவியல் / திகில் கதைகள்"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">
                  Slug குறியீடு (URL Identifier) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. mythology / horror / science-fiction"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">
                  விளக்கம் (Description)
                </label>
                <textarea
                  rows={3}
                  placeholder="இந்த வகைப்பாட்டின் உள்ளடக்கம் பற்றிய குறிப்பு..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-xs font-bold text-gray-700">
                  செயலில் உள்ள நிலை (Active Status)
                </span>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`text-2xl transition-colors ${
                    isActive ? 'text-[#064E3B]' : 'text-gray-400'
                  }`}
                >
                  {isActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  ரத்து செய்
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white text-xs font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'சேமிக்கப்படுகிறது...'
                    : 'சேமிக்க'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
