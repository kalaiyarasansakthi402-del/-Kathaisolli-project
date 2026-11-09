import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Users,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Edit,
  Mail,
  User as UserIcon,
  Lock,
  Sparkles,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import type { AdminStaffMember } from '@kathaisolli/shared-types';

export const AdminRolesPage: React.FC = () => {
  const { user: currentAdmin, api, isSuperAdmin } = useAdminAuth();

  const [staffList, setStaffList] = useState<AdminStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State for Creating Staff
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createName, setCreateName] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState<'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR'>('ADMIN');
  const [submitting, setSubmitting] = useState(false);

  // Edit Role Modal State
  const [editingStaff, setEditingStaff] = useState<AdminStaffMember | null>(null);
  const [editRoleValue, setEditRoleValue] = useState<'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR'>('ADMIN');

  // Delete Confirmation State
  const [deletingStaff, setDeletingStaff] = useState<AdminStaffMember | null>(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.admin.listStaff();
      setStaffList(res);
    } catch (err: any) {
      console.error('[AdminRoles] Failed to fetch staff list:', err);
      setError(err?.response?.data?.message || err?.message || 'பணியாளர்கள் பட்டியலைப் பெறுவதில் பிழை.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createEmail || !createPassword || !createName) {
      setError('அனைத்து புலங்களையும் நிரப்பவும்.');
      return;
    }
    if (createPassword.length < 8) {
      setError('கடவுச்சொல் குறைந்தது 8 எழுத்துக்கள் கொண்டிருக்க வேண்டும்.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.admin.createStaff({
        email: createEmail,
        displayName: createName,
        password: createPassword,
        role: createRole,
      });

      setSuccessMessage(`புதிய நிர்வாகி (${createName}) வெற்றிகரமாக சேர்க்கப்பட்டார்.`);
      setShowCreateModal(false);
      setCreateEmail('');
      setCreateName('');
      setCreatePassword('');
      setCreateRole('ADMIN');
      fetchStaff();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'புதிய பணியாளரைச் சேர்ப்பதில் பிழை.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    try {
      setSubmitting(true);
      setError(null);
      await api.admin.updateStaffRole(editingStaff.id, editRoleValue);
      setSuccessMessage(`${editingStaff.displayName} அவர்களின் பொறுப்பு (${editRoleValue}) மாற்றப்பட்டது.`);
      setEditingStaff(null);
      fetchStaff();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'பொறுப்பை மாற்றுவதில் பிழை.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!deletingStaff) return;

    try {
      setSubmitting(true);
      setError(null);
      await api.admin.deleteStaff(deletingStaff.id);
      setSuccessMessage(`${deletingStaff.displayName} நிர்வாகக் குழுவிலிருந்து நீக்கப்பட்டார்.`);
      setDeletingStaff(null);
      fetchStaff();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'பணியாளரை நீக்குவதில் பிழை.');
    } finally {
      setSubmitting(false);
    }
  };

  // Permission Matrix Definition
  const permissionsMatrix = [
    { name: 'Dashboard Access (டாஷ்போர்டு பார்வை)', superAdmin: true, admin: true, editor: true },
    { name: 'Story Management (கதைகள் CRUD & வெளியீடு)', superAdmin: true, admin: true, editor: true },
    { name: 'Audiobook Upload & Management (ஆடியோ பதிவேற்றம்)', superAdmin: true, admin: true, editor: true },
    { name: 'Category Management (வகைப்பாடு மேலாண்மை)', superAdmin: true, admin: true, editor: false },
    { name: 'Audio Storage Management (சேமிப்பக மேலாண்மை)', superAdmin: true, admin: true, editor: false },
    { name: 'Reports & Analytics (அறிக்கைகள் & பகுப்பாய்வு)', superAdmin: true, admin: true, editor: true },
    { name: 'Admin Staff & Roles (நிர்வாகப் பொறுப்புகள்)', superAdmin: true, admin: false, editor: false },
    { name: 'Platform Settings & Security (தள அமைப்புகள்)', superAdmin: true, admin: true, editor: false },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#064E3B] text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>நிர்வாகப் பொறுப்புகள் & அனுமதிகள் (Roles & Permissions)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 font-serif tracking-tight">
            நிர்வாகிகள் மற்றும் அனுமதிகள் மேலாண்மை
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Super Admin, Admin மற்றும் Editor நிலைகளுக்கான பாதுகாப்பான அணுகல் கட்டுப்பாடு மற்றும் ஊழியர் மேலாண்மை.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchStaff}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium text-sm shadow-sm transition-all disabled:opacity-60"
            title="பட்டியலைப் புதுப்பிக்க"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-700 ${loading ? 'animate-spin' : ''}`} />
            <span>புதுப்பி</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white font-semibold text-sm shadow-sm transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>புதிய நிர்வாகியைச் சேர்</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-[#064E3B] flex items-center gap-3 text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#047857]" />
          <p className="font-medium">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3 text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
          <p>{error}</p>
        </div>
      )}

      {/* Current Active Staff Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 font-serif flex items-center gap-2">
              <Users className="w-5 h-5 text-[#064E3B]" />
              <span>செயலில் உள்ள நிர்வாகக் குழு ({staffList.length})</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              கதைசொல்லி நிர்வாக தளத்திற்கான அனுமதி பெற்ற கணக்குகள்
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">நிர்வாகி பெயர் & மின்னஞ்சல்</th>
                <th className="py-3 px-4">பொறுப்பு (Role)</th>
                <th className="py-3 px-4">நிலை (Status)</th>
                <th className="py-3 px-4">உருவாக்கப்பட்ட தேதி</th>
                <th className="py-3 px-4 text-right">செயல்கள் (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading && staffList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    பணியாளர்கள் விவரங்கள் ஏற்றப்படுகின்றன...
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    நிர்வாகிகள் ஏதுமில்லை.
                  </td>
                </tr>
              ) : (
                staffList.map((staff) => {
                  const isCurrent = staff.id === currentAdmin?.id;
                  const isSuper = staff.role === 'SUPER_ADMIN';
                  const isAdminRole = staff.role === 'ADMIN';

                  return (
                    <tr key={staff.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#064E3B] flex items-center justify-center font-bold text-sm">
                            {staff.displayName?.[0]?.toUpperCase() || 'A'}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 flex items-center gap-2">
                              <span>{staff.displayName}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-[#064E3B]">
                                  நீங்கள் (You)
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-zinc-500 font-mono">{staff.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            isSuper
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : isAdminRole
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {staff.roleName || staff.role}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>செயலில் (Active)</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-zinc-500">
                        {new Date(staff.createdAt).toLocaleDateString('ta-IN')}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {isSuperAdmin && (
                            <button
                              onClick={() => {
                                setEditingStaff(staff);
                                setEditRoleValue(staff.role as any);
                              }}
                              className="p-1.5 rounded-lg text-zinc-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                              title="பொறுப்பை மாற்று"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {isSuperAdmin && !isCurrent && (
                            <button
                              onClick={() => setDeletingStaff(staff)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="கணக்கை நீக்கு"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* Permissions Matrix Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 font-serif flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#064E3B]" />
            <span>அனுமதி நிலை வழிகாட்டி (Permission Matrix)</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            ஒவ்வொரு நிர்வாகப் பொறுப்புக்கும் வழங்கப்பட்டுள்ள அனுமதிகள்
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">தளப் பகுதி / செயல்முறை</th>
                <th className="py-3 px-4 text-center">Super Admin</th>
                <th className="py-3 px-4 text-center">Admin</th>
                <th className="py-3 px-4 text-center">Editor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {permissionsMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-zinc-800">{item.name}</td>
                  <td className="py-3 px-4 text-center">
                    {item.superAdmin ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 inline-block" />
                    ) : (
                      <XCircle className="w-4 h-4 text-zinc-300 inline-block" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.admin ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 inline-block" />
                    ) : (
                      <XCircle className="w-4 h-4 text-zinc-300 inline-block" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.editor ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 inline-block" />
                    ) : (
                      <XCircle className="w-4 h-4 text-zinc-300 inline-block" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Create New Staff */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="text-lg font-bold text-zinc-900 font-serif flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#064E3B]" />
                <span>புதிய நிர்வாகியைச் சேர்</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">முழு பெயர்:</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="எ.கா. அரவிந்த் குமார்"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">மின்னஞ்சல்:</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="admin@kathaisolli.com"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">கடவுச்சொல் (குறைந்தது 8 எழுத்துகள்):</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">நிர்வாகப் பொறுப்பு:</label>
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                >
                  <option value="SUPER_ADMIN">Super Admin (தலைமை நிர்வாகி - முழு அதிகாரம்)</option>
                  <option value="ADMIN">Admin (பொது நிர்வாகி)</option>
                  <option value="MODERATOR">Editor (உள்ளடக்க ஆசிரியர்)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl"
                >
                  ரத்து செய்
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold bg-[#064E3B] hover:bg-[#047857] text-white rounded-xl shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'சேர்க்கப்படுகிறது...' : 'உறுதி செய்'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Staff Role */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <h3 className="text-base font-bold text-zinc-900 font-serif">
              பொறுப்பை மாற்று: {editingStaff.displayName}
            </h3>
            <p className="text-xs text-zinc-500 font-mono">{editingStaff.email}</p>

            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">புதிய பொறுப்பைத் தேர்ந்தெடுக்கவும்:</label>
                <select
                  value={editRoleValue}
                  onChange={(e) => setEditRoleValue(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                >
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MODERATOR">Editor</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl"
                >
                  ரத்து
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold bg-[#064E3B] hover:bg-[#047857] text-white rounded-xl shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'மாற்றப்படுகிறது...' : 'சேமி'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Staff Confirmation */}
      {deletingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <div className="p-3 rounded-full bg-red-50 text-red-600 w-fit">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 font-serif">
              கணக்கை நீக்குவதை உறுதிப்படுத்தவும்
            </h3>
            <p className="text-xs text-zinc-600">
              <strong>{deletingStaff.displayName}</strong> ({deletingStaff.email}) அவர்களின் நிர்வாக அணுகல் முற்றிலும் நீக்கப்படும்.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingStaff(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl"
              >
                ரத்து செய்
              </button>
              <button
                type="button"
                onClick={handleDeleteStaff}
                disabled={submitting}
                className="px-5 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm disabled:opacity-50"
              >
                {submitting ? 'நீக்கப்படுகிறது...' : 'ஆம், நீக்கு'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRolesPage;
