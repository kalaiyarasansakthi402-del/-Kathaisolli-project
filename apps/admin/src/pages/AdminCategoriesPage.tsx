import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  AlertCircle,
  BookOpen,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import {
  listAdminCategories,
  upsertAdminCategory,
  deleteAdminCategory,
  toggleCategoryActive,
  type AdminCategory,
} from '../services/adminCatalogService';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminCategoriesPage: React.FC = () => {
  const { api } = useAdminAuth();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<AdminCategory[]>(() => listAdminCategories());
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [name, setName] = useState('');
  const [tamilName, setTamilName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const refreshCategories = () => {
    setCategories(listAdminCategories(search));
  };

  useEffect(() => {
    let mounted = true;
    const fetchApiCategories = async () => {
      if (!api?.admin?.listCategories) return;
      try {
        setIsLoading(true);
        const serverCats = await api.admin.listCategories();
        if (mounted && Array.isArray(serverCats) && serverCats.length > 0) {
          serverCats.forEach((sc: any) => {
            upsertAdminCategory({
              id: sc.id,
              name: sc.name,
              tamilName: sc.name,
              slug: sc.slug,
              description: sc.description || '',
              isActive: sc.isActive !== undefined ? sc.isActive : true,
            });
          });
          refreshCategories();
        }
      } catch (err: any) {
        console.warn('API listCategories notice (using cached catalog):', err?.message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchApiCategories();
    refreshCategories();
    window.addEventListener('kathaisolli:admin-categories-updated', refreshCategories);
    return () => {
      mounted = false;
      window.removeEventListener('kathaisolli:admin-categories-updated', refreshCategories);
    };
  }, [search, api]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setTamilName('');
    setSlug('');
    setDescription('');
    setIsActive(true);
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (cat: AdminCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setTamilName(cat.tamilName || '');
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setIsActive(cat.isActive);
    setError(null);
    setShowModal(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setError('வகை பெயர் மற்றும் Slug உள்ளிடவும் (Name and Slug are required).');
      return;
    }

    try {
      if (api?.admin?.createCategory && api?.admin?.updateCategory) {
        try {
          if (editingCategory && !editingCategory.id.startsWith('cat-')) {
            await api.admin.updateCategory(editingCategory.id, {
              name: name.trim(),
              slug: slug.trim().toLowerCase(),
              description: description.trim(),
              isActive,
            });
          } else {
            await api.admin.createCategory({
              name: name.trim(),
              slug: slug.trim().toLowerCase(),
              description: description.trim(),
              isActive,
            });
          }
        } catch (apiErr: any) {
          console.warn('Backend category sync fallback to local storage:', apiErr?.message);
        }
      }

      upsertAdminCategory({
        id: editingCategory?.id,
        name: name.trim(),
        tamilName: tamilName.trim() || name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
        isActive,
      });

      setShowModal(false);
      setSuccessMessage(
        editingCategory ? 'வகை வெற்றிகரமாக புதுப்பிக்கப்பட்டது.' : 'புதிய வகை வெற்றிகரமாக சேர்க்கப்பட்டது.'
      );
      setTimeout(() => setSuccessMessage(null), 3000);
      refreshCategories();
    } catch (err: any) {
      setError(err?.message || 'வகை சேமிப்பதில் பிழை ஏற்பட்டது.');
    }
  };

  const handleToggle = (cat: AdminCategory) => {
    toggleCategoryActive(cat.id);
    refreshCategories();
  };

  const handleDelete = async (cat: AdminCategory) => {
    setError(null);
    if (cat.slug === 'general') {
      setError('பொதுவானவை (General) முதன்மை வகையை நீக்க முடியாது. இது கணினியின் பிரதான வகையாகும்.');
      return;
    }

    if ((cat.itemCount || 0) > 0) {
      setError(`"${cat.tamilName || cat.name}" வகையில் ${cat.itemCount} கதைகள் உள்ளதால் இதனை நீக்க முடியாது (Protected: contains active stories).`);
      return;
    }

    if (
      !confirm(
        `"${cat.tamilName || cat.name}" வகையை நிச்சயமாக நீக்க விரும்புகிறீர்களா? (Delete category?)`
      )
    ) {
      return;
    }

    try {
      if (api?.admin?.deleteCategory && !cat.id.startsWith('cat-')) {
        await api.admin.deleteCategory(cat.id);
      }
    } catch (err: any) {
      console.warn('API category delete note:', err?.message);
    }

    const res = deleteAdminCategory(cat.id);
    if (res.success) {
      setSuccessMessage('வகை வெற்றிகரமாக நீக்கப்பட்டது.');
      setTimeout(() => setSuccessMessage(null), 3000);
      refreshCategories();
    } else {
      setError(res.reason || 'வகையை நீக்க முடியவில்லை.');
    }
  };

  const totalCategories = categories.length;
  const activeCount = categories.filter((c) => c.isActive).length;
  const totalBooksAssigned = categories.reduce((sum, c) => sum + (c.itemCount || 0), 0);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>வகைப்பாடுகள் மேலாண்மை (Category Management)</span>
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
            கதை வகைப்பாடுகள் (Categories)
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            பொதுவானவை (General) உள்ளிட்ட அனைத்து கதைப் பிரிவுகளையும் நிர்வகிக்கவும்
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all hover:scale-105 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>புதிய வகை சேர் (Add Category)</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-200 text-xs">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold text-zinc-400">மொத்த வகைகள்</p>
            <h3 className="text-3xl font-black font-serif text-emerald-700 dark:text-emerald-300 mt-1">
              {totalCategories}
            </h3>
            <p className="text-[11px] text-zinc-500 mt-1">வகைப்பாடுகள் பட்டியல்</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold text-zinc-400">செயலில் உள்ளவை</p>
            <h3 className="text-3xl font-black font-serif text-emerald-700 dark:text-emerald-300 mt-1">
              {activeCount}
            </h3>
            <p className="text-[11px] text-zinc-500 mt-1">பொது தளத்தில் தோன்றுபவை</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold text-zinc-400">இணைக்கப்பட்ட புத்தகங்கள்</p>
            <h3 className="text-3xl font-black font-serif text-emerald-700 dark:text-emerald-300 mt-1">
              {totalBooksAssigned}
            </h3>
            <p className="text-[11px] text-zinc-500 mt-1">ஆடியோ புத்தகத் தொடர்கள்</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="வகை பெயர் அல்லது Slug தேடுக..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-[#0A1612] border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-[#0A1612] text-zinc-500 dark:text-zinc-400 text-xs uppercase font-bold border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">வகை பெயர் (Name)</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">விளக்கம்</th>
                <th className="px-6 py-4 text-center">புத்தகங்கள்</th>
                <th className="px-6 py-4 text-center">நிலை (Status)</th>
                <th className="px-6 py-4 text-right">நடவடிக்கைகள்</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {categories.map((cat) => {
                const isGeneral = cat.slug === 'general';

                return (
                  <tr key={cat.id} className="hover:bg-zinc-50 dark:hover:bg-[#081813] transition-colors">
                    <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">
                      <div className="flex items-center gap-2">
                        <span>{cat.tamilName || cat.name}</span>
                        {isGeneral && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            முதன்மை (Default)
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-400 block font-normal">{cat.name}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-emerald-700 dark:text-emerald-400">
                      {cat.slug}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400 max-w-xs truncate">
                      {cat.description || '—'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {cat.itemCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggle(cat)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          cat.isActive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {cat.isActive ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>செயலில் (Active)</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-zinc-400" />
                            <span>முடக்கம் (Inactive)</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          title="திருத்து (Edit)"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {!isGeneral && (
                          <button
                            onClick={() => handleDelete(cat)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="நீக்கு (Delete)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/60 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-serif text-zinc-900 dark:text-zinc-100">
                {editingCategory ? 'வகையைத் திருத்து (Edit Category)' : 'புதிய வகை உருவாக்கு (Add Category)'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-600 text-sm font-bold"
              >
                ✕ மூடு
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                  வகை பெயர் (English Name) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Mythology, Philosophy"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-[#0A1612] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                  தமிழ் பெயர் (Tamil Name)
                </label>
                <input
                  type="text"
                  value={tamilName}
                  onChange={(e) => setTamilName(e.target.value)}
                  placeholder="எ.கா. புராணக் கதைகள்"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-[#0A1612] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-tamil"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                  placeholder="e.g. mythology"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-[#0A1612] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                  விளக்கம் (Description)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="இந்த வகையின் சுருக்கமான விளக்கம்..."
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-[#0A1612] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-zinc-300"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  தளத்தில் செயலில் காட்டவும் (Active in Catalog)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  ரத்து செய் (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all"
                >
                  {editingCategory ? 'மாற்றங்களைச் சேமி' : 'வகையை உருவாக்கு'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
