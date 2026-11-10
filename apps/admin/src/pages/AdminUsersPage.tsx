import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Edit2,
  UserCheck,
  UserX,
  X,
  Lock,
  User as UserIcon,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import type { AdminManagedUser } from '@kathaisolli/shared-types';

export const AdminUsersPage: React.FC = () => {
  const { api } = useAdminAuth();

  const [users, setUsers] = useState<AdminManagedUser[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [createUsername, setCreateUsername] = useState<string>('');
  const [createPassword, setCreatePassword] = useState<string>('');
  const [createConfirmPassword, setCreateConfirmPassword] = useState<string>('');
  const [showCreatePassword, setShowCreatePassword] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Edit Username modal state
  const [editingUser, setEditingUser] = useState<AdminManagedUser | null>(null);
  const [editUsername, setEditUsername] = useState<string>('');
  const [editDisplayName, setEditDisplayName] = useState<string>('');

  // Reset Password modal state
  const [resettingUser, setResettingUser] = useState<AdminManagedUser | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [showResetPassword, setShowResetPassword] = useState<boolean>(false);

  // Delete User confirmation state
  const [deletingUser, setDeletingUser] = useState<AdminManagedUser | null>(null);

  const fetchUsers = useCallback(
    async (query = searchQuery) => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.admin.listUsers({ query: query.trim() || undefined, limit: 100 });
        setUsers(res.users);
        setTotalCount(res.total);
      } catch (err: any) {
        console.error('[AdminUsers] Failed to fetch users:', err);
        setError(err?.response?.data?.message || err?.message || 'பயனர்கள் பட்டியலைப் பெறுவதில் பிழை.');
      } finally {
        setLoading(false);
      }
    },
    [api, searchQuery],
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(searchQuery);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 1. Create New User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const trimmedUsername = createUsername.trim().toLowerCase();
    if (!trimmedUsername) {
      setModalError('பயனர்பெயர் (Username) அவசியமானது.');
      return;
    }
    if (trimmedUsername.length < 3) {
      setModalError('பயனர்பெயர் குறைந்தது 3 எழுத்துக்கள் கொண்டிருக்க வேண்டும்.');
      return;
    }
    if (!/^[a-z0-9_.-]+$/.test(trimmedUsername)) {
      setModalError('பயனர்பெயரில் எழுத்துக்கள், எண்கள், புள்ளி, அடிக்கோடு மட்டுமே இருக்க வேண்டும்.');
      return;
    }
    if (!createPassword) {
      setModalError('கடவுச்சொல் (Password) அவசியமானது.');
      return;
    }
    if (createPassword.length < 6) {
      setModalError('கடவுச்சொல் குறைந்தது 6 எழுத்துக்கள் கொண்டிருக்க வேண்டும்.');
      return;
    }
    if (createPassword !== createConfirmPassword) {
      setModalError('கடவுச்சொற்கள் பொருந்தவில்லை (Passwords do not match).');
      return;
    }

    try {
      setSubmitting(true);
      await api.admin.createUser({
        username: trimmedUsername,
        password: createPassword,
      });

      setSuccessMessage('User Account Created Successfully!');
      setShowCreateModal(false);
      setCreateUsername('');
      setCreatePassword('');
      setCreateConfirmPassword('');
      fetchUsers();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setModalError(
        err?.response?.data?.message || err?.message || 'பயனர் கணக்கை உருவாக்குவதில் பிழை.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Edit Username
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setModalError(null);

    const trimmedUsername = editUsername.trim().toLowerCase();
    if (!trimmedUsername) {
      setModalError('பயனர்பெயர் அவசியமானது.');
      return;
    }
    if (trimmedUsername.length < 3) {
      setModalError('பயனர்பெயர் குறைந்தது 3 எழுத்துக்கள் கொண்டிருக்க வேண்டும்.');
      return;
    }

    try {
      setSubmitting(true);
      await api.admin.updateUser(editingUser.id, {
        username: trimmedUsername,
        displayName: editDisplayName.trim() || undefined,
      });

      setSuccessMessage(`பயனர்பெயர் வெற்றிகரமாக புதுப்பிக்கப்பட்டது (${trimmedUsername}).`);
      setEditingUser(null);
      fetchUsers();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setModalError(
        err?.response?.data?.message || err?.message || 'பயனர்பெயரை மாற்றுவதில் பிழை.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;
    setModalError(null);

    if (!newPassword) {
      setModalError('புதிய கடவுச்சொல்லை உள்ளிடவும்.');
      return;
    }
    if (newPassword.length < 6) {
      setModalError('கடவுச்சொல் குறைந்தது 6 எழுத்துக்கள் இருக்க வேண்டும்.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setModalError('கடவுச்சொற்கள் பொருந்தவில்லை (Passwords do not match).');
      return;
    }

    try {
      setSubmitting(true);
      await api.admin.resetUserPassword(resettingUser.id, {
        newPassword,
      });

      setSuccessMessage(
        `பயனர் ${resettingUser.username} இன் கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது (Password Reset Successfully).`,
      );
      setResettingUser(null);
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setModalError(
        err?.response?.data?.message || err?.message || 'கடவுச்சொல்லை மாற்றுவதில் பிழை.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Toggle Status (Activate / Deactivate)
  const handleToggleStatus = async (user: AdminManagedUser) => {
    const nextStatus = !user.isActive;
    try {
      setError(null);
      await api.admin.updateUserStatus(user.id, { isActive: nextStatus });
      setSuccessMessage(
        nextStatus
          ? `பயனர் கணக்கு இயக்கப்பட்டது (${user.username} activated).`
          : `பயனர் கணக்கு முடக்கப்பட்டது (${user.username} deactivated).`,
      );
      fetchUsers();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || 'பயனர் நிலையை மாற்றுவதில் பிழை.',
      );
    }
  };

  // 5. Delete User
  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      setSubmitting(true);
      setError(null);
      await api.admin.deleteUser(deletingUser.id);
      setSuccessMessage(`பயனர் கணக்கு (${deletingUser.username}) நீக்கப்பட்டது.`);
      setDeletingUser(null);
      fetchUsers();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'பயனரை நீக்குவதில் பிழை.');
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics
  const activeCount = useMemo(() => users.filter((u) => u.isActive).length, [users]);
  const inactiveCount = useMemo(() => users.filter((u) => !u.isActive).length, [users]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E1CE] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0E2] text-xs font-bold text-[#064E3B] uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
            <span>User Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#064E3B] tracking-tight">
            பயனர் மேலாண்மை (User Management)
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-stone-600">
            பயனர் கணக்குகளை உருவாக்குதல், கடவுச்சொல் மாற்றுதல், இயக்குதல் மற்றும் நிர்வகித்தல்.
          </p>
        </div>

        <button
          onClick={() => {
            setModalError(null);
            setShowCreateModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm bg-[#064E3B] hover:bg-[#166534] text-white shadow-lg shadow-emerald-950/20 hover:scale-[1.02] active:scale-95 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create New User</span>
        </button>
      </div>

      {/* Global Alerts */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span className="flex-1">{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E8E1CE] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">மொத்த பயனர்கள் (Total)</p>
            <p className="text-2xl font-black text-[#064E3B] mt-1">{totalCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#E8F0E2] text-[#064E3B] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E8E1CE] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">செயலில் உள்ளவர்கள் (Active)</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E8E1CE] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">முடக்கப்பட்டவர்கள் (Inactive)</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{inactiveCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <UserX className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E8E1CE] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Search users by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent"
          />
        </form>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => fetchUsers()}
            disabled={loading}
            className="p-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-600 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white rounded-2xl border border-[#E8E1CE] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-[#E8E1CE] text-xs font-bold uppercase tracking-wider text-stone-600">
                <th className="py-3.5 px-4 sm:px-6">User ID</th>
                <th className="py-3.5 px-4 sm:px-6">Username</th>
                <th className="py-3.5 px-4 sm:px-6">Created Date</th>
                <th className="py-3.5 px-4 sm:px-6">Account Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-[#064E3B] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold">பயனர்கள் பட்டியல் ஏற்றப்படுகிறது...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-500">
                    <Users className="w-8 h-8 mx-auto text-stone-400 mb-2" />
                    <p className="font-semibold text-sm">பயனர்கள் எவரும் காணப்படவில்லை</p>
                    <p className="text-xs text-stone-400 mt-1">புதிய பயனரை உருவாக்க "Create New User" பொத்தானை அழுத்தவும்.</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const createdDate = new Date(u.createdAt).toLocaleDateString('ta-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr key={u.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* User ID */}
                      <td className="py-3.5 px-4 sm:px-6 font-mono text-xs text-stone-600">
                        <div className="flex items-center gap-1.5">
                          <span>{u.id.slice(0, 8)}...</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(u.id)}
                            title="Copy full User ID"
                            className="p-1 hover:text-[#064E3B] text-stone-400 transition-colors"
                          >
                            {copiedId === u.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#E8F0E2] text-[#064E3B] flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                            {u.username ? u.username[0] : 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-stone-900">{u.username}</p>
                            {u.displayName && u.displayName !== u.username && (
                              <p className="text-xs text-stone-500">{u.displayName}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 sm:px-6 text-stone-600 text-xs sm:text-sm">
                        {createdDate}
                      </td>

                      {/* Account Status */}
                      <td className="py-3.5 px-4 sm:px-6">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          {/* Edit Username */}
                          <button
                            type="button"
                            onClick={() => {
                              setModalError(null);
                              setEditingUser(u);
                              setEditUsername(u.username);
                              setEditDisplayName(u.displayName || u.username);
                            }}
                            title="Edit Username"
                            className="p-1.5 rounded-lg text-stone-600 hover:text-[#064E3B] hover:bg-stone-100 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Reset Password */}
                          <button
                            type="button"
                            onClick={() => {
                              setModalError(null);
                              setResettingUser(u);
                              setNewPassword('');
                              setConfirmNewPassword('');
                            }}
                            title="Reset User Password"
                            className="p-1.5 rounded-lg text-stone-600 hover:text-amber-600 hover:bg-stone-100 transition-colors"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Activate / Deactivate Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            title={u.isActive ? 'Deactivate User' : 'Activate User'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              u.isActive
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {u.isActive ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>

                          {/* Delete User */}
                          <button
                            type="button"
                            onClick={() => setDeletingUser(u)}
                            title="Delete User"
                            className="p-1.5 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: CREATE NEW USER                                 */}
      {/* ======================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in zoom-in-95">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-[#E8F0E2] text-[#064E3B] flex items-center justify-center shadow-sm">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black font-serif text-[#064E3B]">
                  Create New User
                </h3>
                <p className="text-xs text-stone-500">புதிய பயனர் கணக்கை உருவாக்கவும்</p>
              </div>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Username (பயனர்பெயர்)
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Enter unique username"
                    value={createUsername}
                    onChange={(e) => setCreateUsername(e.target.value.toLowerCase())}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent font-medium"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">எழுத்துக்கள், எண்கள், _ மற்றும் . மட்டுமே</p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Password (கடவுச்சொல்)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showCreatePassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password (min 6 chars)"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword(!showCreatePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Confirm Password (கடவுச்சொல் உறுதிப்படுத்தல்)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showCreatePassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter password"
                    value={createConfirmPassword}
                    onChange={(e) => setCreateConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent font-medium"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-full text-xs font-bold bg-[#064E3B] text-white hover:bg-[#166534] shadow-md shadow-emerald-950/20 disabled:opacity-60 transition-all flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>உருவாக்குகிறது...</span>
                    </>
                  ) : (
                    <span>Create User</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT USERNAME                                   */}
      {/* ======================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in zoom-in-95">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-5 right-5 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-[#E8F0E2] text-[#064E3B] flex items-center justify-center shadow-sm">
                <Edit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black font-serif text-[#064E3B]">
                  Edit Username
                </h3>
                <p className="text-xs text-stone-500">பயனர்பெயரை மாற்றியமைக்கவும்</p>
              </div>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  New Username (புதிய பயனர்பெயர்)
                </label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value.toLowerCase())}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Display Name (காட்சிப் பெயர்)
                </label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B] font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-full text-xs font-bold bg-[#064E3B] text-white hover:bg-[#166534] shadow-md shadow-emerald-950/20 disabled:opacity-60 transition-all"
                >
                  {submitting ? 'சேமிக்கப்படுகிறது...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: RESET USER PASSWORD                             */}
      {/* ======================================================== */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in zoom-in-95">
            <button
              onClick={() => setResettingUser(null)}
              className="absolute top-5 right-5 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black font-serif text-stone-900">
                  Reset Password
                </h3>
                <p className="text-xs text-stone-500">
                  பயனர் <span className="font-bold text-[#064E3B]">{resettingUser.username}</span> இன் கடவுச்சொல்லை மாற்றவும்
                </p>
              </div>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  New Password (புதிய கடவுச்சொல்)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter new password (min 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B] font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Confirm New Password (கடவுச்சொல் உறுதிப்படுத்தல்)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B] font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-full text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 shadow-md shadow-amber-950/20 disabled:opacity-60 transition-all"
                >
                  {submitting ? 'மாற்றப்படுகிறது...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: DELETE USER CONFIRMATION                        */}
      {/* ======================================================== */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in zoom-in-95">
            <button
              onClick={() => setDeletingUser(null)}
              className="absolute top-5 right-5 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-sm">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black font-serif text-rose-600">
                  Delete User Account?
                </h3>
                <p className="text-xs text-stone-500">பயனர் கணக்கை நீக்குதல்</p>
              </div>
            </div>

            <p className="text-sm text-stone-600 leading-relaxed mb-6">
              பயனர் <span className="font-bold text-stone-900">{deletingUser.username}</span> இன் கணக்கை நிரந்தரமாக நீக்க விரும்புகிறீர்களா? இந்த செயலை மீண்டும் மாற்ற முடியாது.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-full text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteUser}
                className="px-6 py-2 rounded-full text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-950/20 disabled:opacity-60 transition-all"
              >
                {submitting ? 'நீக்கப்படுகிறது...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
