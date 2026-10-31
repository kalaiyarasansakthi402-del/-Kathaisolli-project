import React, { useState } from 'react';
import { Search, ShieldAlert, CheckCircle2, UserX, UserCheck } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: 'LISTENER' | 'CREATOR' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';
  createdAt: string;
  disabled: boolean;
}

export const AdminUsersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const [users, setUsers] = useState<AdminUser[]>([
    {
      id: 'usr-1',
      email: 'admin@kathaisolli.com',
      displayName: 'கதைசொல்லி தலைமை நிர்வாகி',
      role: 'SUPER_ADMIN',
      createdAt: '2025-01-01',
      disabled: false,
    },
    {
      id: 'usr-2',
      email: 'rajarajan@example.com',
      displayName: 'ராஜராஜன் (குரல் கலைஞர்)',
      role: 'CREATOR',
      createdAt: '2025-01-10',
      disabled: false,
    },
    {
      id: 'usr-3',
      email: 'sumathi@example.com',
      displayName: 'சுமதி ராகவன் (கதைசொல்லி)',
      role: 'CREATOR',
      createdAt: '2025-01-15',
      disabled: false,
    },
    {
      id: 'usr-4',
      email: 'karthik@example.com',
      displayName: 'கார்த்திக் சுப்புராஜ்',
      role: 'CREATOR',
      createdAt: '2025-01-18',
      disabled: false,
    },
    {
      id: 'usr-5',
      email: 'anand@example.com',
      displayName: 'ஆனந்த்',
      role: 'LISTENER',
      createdAt: '2025-02-01',
      disabled: false,
    },
    {
      id: 'usr-6',
      email: 'spammer@example.com',
      displayName: 'Spam Account',
      role: 'LISTENER',
      createdAt: '2025-02-05',
      disabled: true,
    },
  ]);

  const toggleUserStatus = (id: string) => {
    setUsers(
      users.map((u) => (u.id === id ? { ...u, disabled: !u.disabled } : u))
    );
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.displayName.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-serif">
          பயனர்கள் மேலாண்மை (User Management)
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          தளத்தின் நேயர்கள் மற்றும் படைப்பாளர்களின் கணக்கு விவரங்கள் மற்றும் அணுகல் நிலைகள்
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#10221B] border border-emerald-100 dark:border-emerald-900/40 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="பெயர் அல்லது மின்னஞ்சல் மூலம் தேடுங்கள்..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0A1612] text-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">பங்கு (Role):</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0A1612] px-3 py-2 text-zinc-900 dark:text-zinc-100"
          >
            <option value="ALL">அனைத்துப் பங்களிப்புகள்</option>
            <option value="LISTENER">நேயர் (Listener)</option>
            <option value="CREATOR">படைப்பாளர் (Creator)</option>
            <option value="ADMIN">நிர்வாகி (Admin)</option>
            <option value="SUPER_ADMIN">தலைமை நிர்வாகி</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#10221B] rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-emerald-50/50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/30 text-xs font-bold text-zinc-600 dark:text-zinc-300">
            <tr>
              <th className="py-4 px-6">பயனர் (User)</th>
              <th className="py-4 px-6">மின்னஞ்சல் (Email)</th>
              <th className="py-4 px-6">பங்கு (Role)</th>
              <th className="py-4 px-6">நிலை (Status)</th>
              <th className="py-4 px-6 text-right">செயல்கள் (Actions)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-50 dark:divide-emerald-900/30">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-colors">
                <td className="py-4 px-6 font-bold text-zinc-900 dark:text-zinc-100">
                  {u.displayName}
                </td>
                <td className="py-4 px-6 text-zinc-500 text-xs">
                  {u.email}
                </td>
                <td className="py-4 px-6">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {u.role}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {u.disabled ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      முடக்கப்பட்டது (Suspended)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      செயலில் (Active)
                    </span>
                  )}
                </td>
                <td className="py-4 px-6 text-right">
                  {u.role !== 'SUPER_ADMIN' && (
                    <button
                      onClick={() => toggleUserStatus(u.id)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        u.disabled
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {u.disabled ? (
                        <>
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>மீட்டெடு (Reactivate)</span>
                        </>
                      ) : (
                        <>
                          <UserX className="h-3.5 w-3.5" />
                          <span>முடக்கு (Suspend)</span>
                        </>
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
