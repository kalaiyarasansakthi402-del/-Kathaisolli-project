import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  BookOpen,
  Headphones,
  Upload,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  FileAudio,
  Image as ImageIcon,
  HardDrive,
  RefreshCw,
  ExternalLink,
  Lock,
  Eye,
  EyeOff,
  Save,
  X,
} from 'lucide-react';
import {
  COMPLETE_LIBRARY_CATALOG,
  LibraryBook,
} from '../data/libraryCatalog';
import { isFirebaseConfigured, firebaseConfig } from '../services/firebase';

export const AdminDashboardPage: React.FC = () => {
  const [books, setBooks] = useState<LibraryBook[]>(COMPLETE_LIBRARY_CATALOG);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<'books' | 'upload' | 'storage' | 'security'>('books');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<LibraryBook | null>(null);
  const [deletingBook, setDeletingBook] = useState<LibraryBook | null>(null);

  // New Book Form
  const [newTitle, setNewTitle] = useState('');
  const [newTamilTitle, setNewTamilTitle] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCategory, setNewCategory] = useState<any>('Literature');
  const [newLanguage, setNewLanguage] = useState<'Tamil' | 'English'>('Tamil');
  const [newAudioAvailable, setNewAudioAvailable] = useState(true);
  const [newDescription, setNewDescription] = useState('');

  // Upload simulation
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // Filtered books
  const filteredBooks = books.filter((b) => {
    if (selectedCategory !== 'All' && b.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        b.title.toLowerCase().includes(q) ||
        b.tamilTitle.toLowerCase().includes(q) ||
        b.folderName.toLowerCase().includes(q) ||
        b.authorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalBooks = books.length;
  const audioAvailableCount = books.filter((b) => b.audioAvailable).length;
  const pendingAudioCount = totalBooks - audioAvailableCount;

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTamilTitle.trim()) {
      alert('Please fill in title and Tamil title.');
      return;
    }

    const created: LibraryBook = {
      id: `kb-${Date.now()}`,
      slug: (newFolderName || newTitle).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      folderName: newFolderName || newTitle,
      title: newTitle,
      tamilTitle: newTamilTitle,
      authorName: newAuthor || 'Kathaisolli Studio',
      narratorName: 'By Anzles Studio',
      category: newCategory,
      language: newLanguage,
      audioAvailable: newAudioAvailable,
      coverImageUrl: '/images/hero-art.jpg',
      gradient: ['#064E3B', '#166534'],
      description: newDescription || 'புதிய தமிழ் ஆடியோ புத்தகம்.',
      totalEpisodes: newAudioAvailable ? 2 : 0,
      totalDurationSeconds: newAudioAvailable ? 1800 : 0,
      chapters: newAudioAvailable
        ? [
            {
              id: `ch-${Date.now()}-1`,
              number: 1,
              title: 'Chapter 1',
              tamilTitle: 'அத்தியாயம் 1',
              durationSeconds: 900,
              audioUrl: `https://storage.googleapis.com/vaagai-audio-books-36a4e.appspot.com/stories/${encodeURIComponent(
                newFolderName || newTitle,
              )}/chapter1.mp3`,
            },
          ]
        : [],
    };

    setBooks([created, ...books]);
    setIsAddModalOpen(false);
    // Reset form
    setNewTitle('');
    setNewTamilTitle('');
    setNewFolderName('');
    setNewAuthor('');
    setNewDescription('');
    alert(`Book "${newTitle}" has been added to the catalog!`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;

    setBooks(books.map((b) => (b.id === editingBook.id ? editingBook : b)));
    setEditingBook(null);
    alert('Book updated successfully.');
  };

  const handleDeleteBook = () => {
    if (!deletingBook) return;
    setBooks(books.filter((b) => b.id !== deletingBook.id));
    setDeletingBook(null);
  };

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress(15);
    setUploadMessage(`Uploading ${file.name} to gs://vaagai-audio-books-36a4e.appspot.com...`);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setUploadMessage(`Successfully uploaded ${file.name} to Firebase Storage!`);
          setTimeout(() => {
            setUploadProgress(null);
            setUploadMessage(null);
          }, 3500);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#032016] text-[#173D2E] dark:text-[#F8F5E9] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3DCBA] dark:border-[#084D37] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#064E3B] text-white text-xs font-bold uppercase tracking-wider mb-2">
            <Shield className="w-4 h-4 text-[#A7F3D0]" />
            <span>Admin Control Center</span>
          </div>
          <h1 className="text-3xl font-black font-serif text-[#064E3B] dark:text-[#F8F5E9]">
            Kathaisolli Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-300">
            Developer branding: By Anzles · Manage 62 Library books, Firebase Audio, and Cloud Storage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/library"
            className="px-4 py-2 rounded-xl bg-white dark:bg-[#063828] border border-stone-200 dark:border-[#084D37] text-xs font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-50 flex items-center gap-1.5 shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-[#064E3B]" />
            <span>View Public Library</span>
          </Link>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#064E3B] hover:bg-[#166534] text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#063828] border border-stone-200 dark:border-[#084D37] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold text-stone-400">Total Books in Catalog</p>
            <h3 className="text-3xl font-black font-serif text-[#064E3B] dark:text-[#A7F3D0] mt-1">
              {totalBooks}
            </h3>
            <p className="text-[11px] text-stone-500 mt-1">All 62 User Folders</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-[#064E3B] dark:text-[#A7F3D0] flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#063828] border border-stone-200 dark:border-[#084D37] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold text-stone-400">Audio Available</p>
            <h3 className="text-3xl font-black font-serif text-[#064E3B] dark:text-[#A7F3D0] mt-1">
              {audioAvailableCount}
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Ready for Streaming</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-[#064E3B] dark:text-[#A7F3D0] flex items-center justify-center">
            <Headphones className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#063828] border border-stone-200 dark:border-[#084D37] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold text-stone-400">Pending Audio</p>
            <h3 className="text-3xl font-black font-serif text-amber-600 dark:text-amber-400 mt-1">
              {pendingAudioCount}
            </h3>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">Ezhavathu Jenmam</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#063828] border border-stone-200 dark:border-[#084D37] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold text-stone-400">Firebase Storage</p>
            <h3 className="text-sm font-bold text-[#064E3B] dark:text-[#A7F3D0] mt-1 truncate max-w-[160px]" title={firebaseConfig.storageBucket}>
              {firebaseConfig.storageBucket}
            </h3>
            <p className="text-[11px] text-stone-500 mt-1">
              Status: {isFirebaseConfigured() ? 'Active (Connected)' : 'Fallback Mock'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
            <HardDrive className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-[#084D37] pb-2">
        <button
          onClick={() => setActiveTab('books')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'books'
              ? 'bg-[#064E3B] text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/10'
          }`}
        >
          Book Management ({books.length})
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'upload'
              ? 'bg-[#064E3B] text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/10'
          }`}
        >
          Audio & File Upload
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'security'
              ? 'bg-[#064E3B] text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/10'
          }`}
        >
          Firebase Storage Rules & Access
        </button>
      </div>

      {/* Tab 1: Book Management */}
      {activeTab === 'books' && (
        <div className="space-y-4">
          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, folder, or author..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-[#063828] border border-stone-200 dark:border-[#084D37] text-xs focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
              {['All', 'Mythology', 'Biography', 'Literature', 'Self Help', 'History', 'Motivation'].map(
                (c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategory === c
                        ? 'bg-[#064E3B] text-white font-bold'
                        : 'bg-white dark:bg-[#063828] text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-[#084D37]'
                    }`}
                  >
                    {c}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-[#063828] rounded-2xl border border-stone-200 dark:border-[#084D37] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-white/5 border-b border-stone-200 dark:border-[#084D37] text-stone-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">#</th>
                    <th className="p-4">Folder Name</th>
                    <th className="p-4">English Title</th>
                    <th className="p-4">Tamil Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Audio Status</th>
                    <th className="p-4">Chapters</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-white/5 font-sans">
                  {filteredBooks.map((b, i) => (
                    <tr key={b.id} className="hover:bg-stone-50/70 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 text-stone-400 font-mono">{i + 1}</td>
                      <td className="p-4 font-mono text-[11px] text-stone-600 dark:text-stone-300 max-w-[150px] truncate">
                        {b.folderName}
                      </td>
                      <td className="p-4 font-bold text-[#064E3B] dark:text-[#A7F3D0]">{b.title}</td>
                      <td className="p-4 font-tamil font-semibold">{b.tamilTitle}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-white/10 text-[10px] font-bold">
                          {b.category}
                        </span>
                      </td>
                      <td className="p-4">
                        {b.audioAvailable ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Audio Available</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 text-[10px] font-medium">
                            <AlertCircle className="w-3 h-3 text-stone-400" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-mono">{b.chapters.length}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setEditingBook(b)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-[#064E3B] hover:bg-stone-100 dark:hover:bg-white/10 transition-colors"
                          title="Edit Metadata"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingBook(b)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Delete Book"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Audio & File Upload */}
      {activeTab === 'upload' && (
        <div className="bg-white dark:bg-[#063828] p-8 rounded-2xl border border-stone-200 dark:border-[#084D37] space-y-6">
          <div>
            <h3 className="text-lg font-bold font-serif text-[#064E3B] dark:text-[#F8F5E9]">
              Upload Audio to Firebase Storage
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Target bucket: <code className="bg-stone-100 dark:bg-black/30 px-2 py-0.5 rounded">{firebaseConfig.storageBucket}</code>
            </p>
          </div>

          {/* Drag & Drop Area */}
          <div className="border-2 border-dashed border-stone-300 dark:border-[#084D37] rounded-3xl p-10 text-center space-y-4 hover:border-[#064E3B] transition-colors relative">
            <input
              type="file"
              accept="audio/*,image/*"
              onChange={handleSimulateUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-16 h-16 rounded-full bg-[#E8F0E2] dark:bg-[#083325] text-[#064E3B] dark:text-[#A7F3D0] flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#064E3B] dark:text-[#A7F3D0]">
                Choose audio file or drag & drop here
              </p>
              <p className="text-xs text-stone-400 mt-1">MP3, AAC, M4A, or cover art (PNG/JPG)</p>
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress !== null && (
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-black/20 border border-stone-200 dark:border-[#084D37] space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>{uploadMessage}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#064E3B] h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Security & Rules */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-[#063828] p-8 rounded-2xl border border-stone-200 dark:border-[#084D37] space-y-6">
          <div>
            <h3 className="text-lg font-bold font-serif text-[#064E3B] dark:text-[#F8F5E9]">
              Firebase Storage Security Rules
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Public read enabled for all verified story audio; Admin write authorization enforced.
            </p>
          </div>

          <pre className="p-5 rounded-2xl bg-stone-900 text-stone-200 font-mono text-xs overflow-x-auto leading-relaxed border border-stone-800">
{`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Stories and audio files are publicly readable for streaming
    match /stories/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    match /audio/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    // Default deny for all other private paths
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}`}
          </pre>
        </div>
      )}

      {/* Add Book Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddBook}
            className="bg-white dark:bg-[#032016] text-[#173D2E] dark:text-[#F8F5E9] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-stone-200 dark:border-[#084D37]"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-black text-lg text-[#064E3B] dark:text-[#A7F3D0]">
                Add New Book to Library
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">English Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Sivagamiyin Sapatham"
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-[#084D37] dark:bg-black/30"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Tamil Title (தமிழ் பெயர்)</label>
                <input
                  type="text"
                  required
                  value={newTamilTitle}
                  onChange={(e) => setNewTamilTitle(e.target.value)}
                  placeholder="e.g. சிவகாமியின் சபதம்"
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-[#084D37] dark:bg-black/30"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Storage Folder Name</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Sivagamiyin Sapatham"
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-[#084D37] dark:bg-black/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-[#084D37] dark:bg-black/30"
                  >
                    <option value="Literature">Literature</option>
                    <option value="Mythology">Mythology</option>
                    <option value="Biography">Biography</option>
                    <option value="History">History</option>
                    <option value="Motivation">Motivation</option>
                    <option value="Self Help">Self Help</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Language</label>
                  <select
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-[#084D37] dark:bg-black/30"
                  >
                    <option value="Tamil">Tamil</option>
                    <option value="English">English</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="audioAvailable"
                  checked={newAudioAvailable}
                  onChange={(e) => setNewAudioAvailable(e.target.checked)}
                  className="rounded text-[#064E3B] focus:ring-[#064E3B]"
                />
                <label htmlFor="audioAvailable" className="font-bold cursor-pointer">
                  Audio Available for Streaming
                </label>
              </div>

              <div>
                <label className="block font-bold mb-1">Short Description</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Summary of this book..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-[#084D37] dark:bg-black/30"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#064E3B] text-white text-xs font-bold shadow-md hover:bg-[#166534]"
              >
                Save Book
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Book Modal */}
      {editingBook && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white dark:bg-[#032016] text-[#173D2E] dark:text-[#F8F5E9] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-stone-200 dark:border-[#084D37]"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-black text-lg text-[#064E3B] dark:text-[#A7F3D0]">
                Edit Book: {editingBook.title}
              </h3>
              <button
                type="button"
                onClick={() => setEditingBook(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">English Title</label>
                <input
                  type="text"
                  required
                  value={editingBook.title}
                  onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-[#084D37] dark:bg-black/30"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Tamil Title</label>
                <input
                  type="text"
                  required
                  value={editingBook.tamilTitle}
                  onChange={(e) => setEditingBook({ ...editingBook, tamilTitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-[#084D37] dark:bg-black/30"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editAudio"
                  checked={editingBook.audioAvailable}
                  onChange={(e) =>
                    setEditingBook({ ...editingBook, audioAvailable: e.target.checked })
                  }
                  className="rounded text-[#064E3B] focus:ring-[#064E3B]"
                />
                <label htmlFor="editAudio" className="font-bold cursor-pointer">
                  Audio Available
                </label>
              </div>

              <div>
                <label className="block font-bold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingBook.description}
                  onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-[#084D37] dark:bg-black/30"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setEditingBook(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#064E3B] text-white text-xs font-bold shadow-md hover:bg-[#166534]"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Destructive-Action Confirmation Dialog */}
      {deletingBook && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#032016] text-[#173D2E] dark:text-[#F8F5E9] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-red-200 dark:border-red-950">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-bold font-serif text-lg text-red-600 dark:text-red-400">
                Confirm Destructive Action
              </h4>
              <p className="text-xs text-stone-500">
                Are you sure you want to delete <span className="font-bold">"{deletingBook.title}"</span>?
                This will remove its chapters, metadata, and cloud streaming references.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingBook(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 dark:bg-white/10 text-stone-700 dark:text-stone-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBook}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md"
              >
                Delete Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
