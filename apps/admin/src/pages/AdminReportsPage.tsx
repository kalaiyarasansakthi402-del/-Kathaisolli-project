import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  Download,
  Printer,
  RefreshCw,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  FileEdit,
  Headphones,
  FolderTree,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import type { AdminReportsData } from '@kathaisolli/shared-types';

export const AdminReportsPage: React.FC = () => {
  const { api } = useAdminAuth();

  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<AdminReportsData | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: { timeframe?: string; startDate?: string; endDate?: string } = {
        timeframe: timeframe === 'custom' ? undefined : timeframe,
      };
      if (timeframe === 'custom') {
        params.startDate = new Date(startDate).toISOString();
        params.endDate = new Date(`${endDate}T23:59:59.999Z`).toISOString();
      }

      const data = await api.admin.getReports(params);
      setReportData(data);
      setLastRefreshed(new Date().toLocaleTimeString('ta-IN'));
    } catch (err: any) {
      console.error('[AdminReports] Fetch error:', err);
      setError(err?.response?.data?.message || err?.message || 'அறிக்கைகளைப் பெறுவதில் பிழை ஏற்பட்டது.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [timeframe]);

  const handleApplyCustomFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (timeframe === 'custom') {
      fetchReports();
    }
  };

  // CSV Export with UTF-8 BOM for Tamil Unicode support
  const handleExportCSV = () => {
    if (!reportData) return;

    const lines: string[] = [];
    lines.push('Kathaisolli (கதைசொல்லி) - Platform Administrative Report');
    lines.push(`Report Generated: ${new Date().toLocaleString('ta-IN')}`);
    lines.push(`Date Range: ${reportData.dateRange.start} to ${reportData.dateRange.end}`);
    lines.push(`Timeframe: ${reportData.timeframe}`);
    lines.push('');

    // Summary Metrics
    lines.push('--- SUMMARY METRICS ---');
    lines.push('Metric,Count');
    lines.push(`New Stories Created (Selected Period),${reportData.metrics.periodStoriesCreated}`);
    lines.push(`Published Stories (Selected Period),${reportData.metrics.periodPublishedStories}`);
    lines.push(`Draft Stories (Selected Period),${reportData.metrics.periodDraftStories}`);
    lines.push(`Audio Files Uploaded (Selected Period),${reportData.metrics.periodAudioUploads}`);
    lines.push(`Total All-Time Stories,${reportData.metrics.totalAllTimeStories}`);
    lines.push(`Total Categories,${reportData.metrics.totalCategories}`);
    lines.push('');

    // Category Distribution
    lines.push('--- CATEGORY DISTRIBUTION ---');
    lines.push('Category Name,Slug,Story Count,Share Percentage');
    reportData.categoryDistribution.forEach((c) => {
      lines.push(`"${c.name}","${c.slug}",${c.count},${c.percentage}%`);
    });
    lines.push('');

    // Monthly Upload Trends
    lines.push('--- MONTHLY UPLOAD TRENDS ---');
    lines.push('Month,Tamil Month,New Stories,Audio Uploads,Estimated Storage (MB)');
    reportData.monthlyTrends.forEach((m) => {
      lines.push(`"${m.label}","${m.tamilMonth}",${m.storiesCount},${m.audioFilesCount},${m.storageMb}`);
    });
    lines.push('');

    // Audit Logs
    lines.push('--- RECENT ADMINISTRATIVE ACTIVITIES ---');
    lines.push('Timestamp,Action,Target Type,Target ID,Admin User,Admin Email');
    reportData.recentAuditLogs.forEach((l) => {
      const user = l.user?.displayName || 'System';
      const email = l.user?.email || 'N/A';
      lines.push(`"${l.createdAt}","${l.action}","${l.targetType}","${l.targetId || ''}","${user}","${email}"`);
    });

    const csvContent = '\uFEFF' + lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kathaisolli-report-${timeframe}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#064E3B] text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>அறிக்கைகள் & பகுப்பாய்வு மையம் (Reports & Analytics)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 font-serif tracking-tight">
            தள அறிக்கைகள் & விரிவான புள்ளிவிவரங்கள்
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            உண்மையான தரவுத்தள பதிவுகளிலிருந்து உருவாக்கப்பட்ட நேரடி அறிக்கைகள், ஏற்றுமதி மற்றும் அச்சு விருப்பங்கள்.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchReports}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium text-sm shadow-sm transition-all disabled:opacity-60"
            title="புதிய தரவைப் பெறுக"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-700 ${loading ? 'animate-spin' : ''}`} />
            <span>புதுப்பி</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={loading || !reportData}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-emerald-600 text-[#064E3B] hover:bg-emerald-50 font-semibold text-sm shadow-sm transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-[#064E3B]" />
            <span>CSV ஏற்றுமதி</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={loading || !reportData}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white font-semibold text-sm shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>அறிக்கையை அச்சிடு (Print / PDF)</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 mr-1">கால அளவு:</span>
            {(['7d', '30d', '90d', 'custom'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeframe === t
                    ? 'bg-[#064E3B] text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                {t === '7d' && 'கடந்த 7 நாட்கள்'}
                {t === '30d' && 'கடந்த 30 நாட்கள்'}
                {t === '90d' && 'கடந்த 90 நாட்கள்'}
                {t === 'custom' && 'தனிப்பயன் காலம் (Custom)'}
              </button>
            ))}
          </div>

          {lastRefreshed && (
            <div className="text-xs text-zinc-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>கடைசியாக புதுப்பிக்கப்பட்டது: {lastRefreshed}</span>
            </div>
          )}
        </div>

        {/* Custom Date Range Picker */}
        {timeframe === 'custom' && (
          <form
            onSubmit={handleApplyCustomFilter}
            className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center gap-3 animate-fadeIn"
          >
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-zinc-700">தொடக்கத் தேதி:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-zinc-700">முடிவுத் தேதி:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                required
              />
            </div>

            <button
              type="submit"
              className="px-4 py-1.5 bg-[#047857] hover:bg-[#064E3B] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              வடிப்பானைப் பயன்படுத்து
            </button>
          </form>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !reportData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white border border-zinc-200 animate-pulse p-5" />
          ))}
        </div>
      )}

      {reportData && (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  புதிய கதைகள் (இக்காலம்)
                </span>
                <div className="p-2 rounded-xl bg-emerald-50 text-[#064E3B]">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-zinc-900 font-serif">
                  {reportData.metrics.periodStoriesCreated}
                </span>
                <span className="text-xs text-zinc-500 ml-2">கதைகள்</span>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                மொத்த கதைகள்: <strong className="text-zinc-800">{reportData.metrics.totalAllTimeStories}</strong>
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  வெளியிடப்பட்டவை (Published)
                </span>
                <div className="p-2 rounded-xl bg-emerald-50 text-[#047857]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-[#047857] font-serif">
                  {reportData.metrics.periodPublishedStories}
                </span>
                <span className="text-xs text-zinc-500 ml-2">கதைகள்</span>
              </div>
              <p className="text-xs text-emerald-700 mt-2 font-medium">பொதுமக்களுக்குக் கிடைக்கக்கூடியவை</p>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  வரைவு நிலையில் (Draft)
                </span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <FileEdit className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-amber-700 font-serif">
                  {reportData.metrics.periodDraftStories}
                </span>
                <span className="text-xs text-zinc-500 ml-2">கதைகள்</span>
              </div>
              <p className="text-xs text-zinc-500 mt-2">ஆசிரியர் மெருகேற்றலில் உள்ளவை</p>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  ஆடியோ பதிவேற்றங்கள்
                </span>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                  <Headphones className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-zinc-900 font-serif">
                  {reportData.metrics.periodAudioUploads}
                </span>
                <span className="text-xs text-zinc-500 ml-2">அத்தியாயக் கோப்புகள்</span>
              </div>
              <p className="text-xs text-zinc-500 mt-2">Firebase Storage-ல் பத்திரப்படுத்தப்பட்டது</p>
            </div>
          </div>

          {/* Section 2: Trends and Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Upload Trends */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 font-serif flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#064E3B]" />
                    <span>மாதாந்திர உள்ளடக்கப் பதிவேற்றப் போக்குகள்</span>
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    கடந்த 6 மாதங்களில் சேர்க்கப்பட்ட கதைகள் மற்றும் ஆடியோ தொகுதிகள்
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                {reportData.monthlyTrends.map((m) => {
                  const maxStories = Math.max(...reportData.monthlyTrends.map((t) => t.storiesCount), 5);
                  const widthPercent = Math.min(100, Math.round((m.storiesCount / maxStories) * 100));

                  return (
                    <div key={m.key} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-zinc-800">
                          {m.tamilMonth} ({m.label})
                        </span>
                        <div className="flex items-center gap-3 text-zinc-600">
                          <span>
                            கதைகள்: <strong className="text-zinc-900">{m.storiesCount}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            ஆடியோ: <strong className="text-emerald-700">{m.audioFilesCount}</strong>
                          </span>
                          <span>•</span>
                          <span className="text-zinc-500">{m.storageMb} MB</span>
                        </div>
                      </div>
                      <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-gradient-to-r from-[#064E3B] to-[#047857] rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(widthPercent, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 font-serif flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-[#064E3B]" />
                  <span>வகைப்பாடுப் பகிர்வு</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  மொத்த கதைகளின் வகைவாரியான விகிதம்
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {reportData.categoryDistribution.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-6">வகைப்பாடுகள் ஏதுமில்லை.</p>
                ) : (
                  reportData.categoryDistribution.map((cat) => (
                    <div key={cat.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-zinc-800 truncate pr-2">{cat.name}</span>
                        <span className="text-zinc-500 font-semibold">{cat.count} ({cat.percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Recent Administrative Activities Log */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 font-serif flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#064E3B]" />
                  <span>நிர்வாக தணிக்கை நடவடிக்கைகள் (Audit Activity Log)</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  நிர்வாகிகளால் மேற்கொள்ளப்பட்ட சமீபத்திய நடவடிக்கைகள் மற்றும் பாதுகாப்பு மாற்றங்கள்
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3">நேரம்</th>
                    <th className="py-2.5 px-3">நடவடிக்கை (Action)</th>
                    <th className="py-2.5 px-3">இலக்கு (Target)</th>
                    <th className="py-2.5 px-3">நிர்வாகி</th>
                    <th className="py-2.5 px-3">விவரங்கள்</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {reportData.recentAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-zinc-500">
                        நடவடிக்கைப் பதிவுகள் ஏதுமில்லை.
                      </td>
                    </tr>
                  ) : (
                    reportData.recentAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="py-2.5 px-3 text-zinc-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString('ta-IN')}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-zinc-900">
                          <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 font-mono text-[11px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-zinc-700">
                          {log.targetType} {log.targetId ? `(#${log.targetId.slice(-6)})` : ''}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-medium text-zinc-900">
                            {log.user?.displayName || 'System'}
                          </span>
                          {log.user?.email && (
                            <span className="block text-[10px] text-zinc-400">{log.user.email}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-zinc-600 font-mono text-[11px] max-w-xs truncate">
                          {log.details ? JSON.stringify(log.details) : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          header, aside, button, nav, form {
            display: none !important;
          }
          .max-w-7xl {
            max-width: 100% !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminReportsPage;
