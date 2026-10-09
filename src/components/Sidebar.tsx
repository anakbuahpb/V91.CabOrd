import React from 'react';
import {
  LayoutDashboard,
  Droplet,
  Package,
  Building2,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Lightbulb,
  FileText,
  FileSpreadsheet,
  Cloud,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { UserRole } from '../types';

export type ActiveTab =
  | 'dashboard'
  | 'bibit_monthly'
  | 'kemasan_monthly'
  | 'branch_master'
  | 'barang_masuk'
  | 'barang_keluar'
  | 'financial'
  | 'summary_advice'
  | 'leadership_report'
  | 'export_import'
  | 'google_sync'
  | 'user_management'
  | 'activity_logs';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  userRole: UserRole;
  dangerCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  userRole,
  dangerCount,
}) => {
  const isLeaderOrAdmin = userRole === 'administrator' || userRole === 'superadmin' || userRole === 'pimpinan';
  const isAdmin = userRole === 'administrator' || userRole === 'superadmin';

  return (
    <aside className="w-full lg:w-64 bg-slate-900 border-r border-slate-800 p-4 shrink-0 flex flex-col gap-6 text-slate-300">
      {/* Category: Penilaian & Evaluasi Utama */}
      <div>
        <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase px-3 mb-2 font-mono">
          Penilaian &amp; Evaluasi Utama
        </div>
        <nav className="space-y-1">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 text-indigo-400" />
              <span>Dashboard Overview</span>
            </div>
          </button>

          <button
            onClick={() => onTabChange('bibit_monthly')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'bibit_monthly'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Droplet className="w-4 h-4 text-cyan-400" />
              <span>Database Bulan Bibit</span>
            </div>
            {dangerCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                !
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('kemasan_monthly')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'kemasan_monthly'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-amber-400" />
              <span>Database Bulan Kemasan</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Category: Mutasi Inventory */}
      <div>
        <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase px-3 mb-2 font-mono">
          Operasional Cabang
        </div>
        <nav className="space-y-1">
          <button
            onClick={() => onTabChange('branch_master')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'branch_master'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Database Cabang (Master)</span>
          </button>

          <button
            onClick={() => onTabChange('barang_masuk')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'barang_masuk'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-teal-400" />
            <span>Data Masuk Barang</span>
          </button>

          <button
            onClick={() => onTabChange('barang_keluar')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'barang_keluar'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
            <span>Data Keluar Barang (Bibit &amp; Kemasan)</span>
          </button>
        </nav>
      </div>

      {/* Category: Analisis & Laporan Pimpinan */}
      <div>
        <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase px-3 mb-2 font-mono">
          Analisis &amp; Pimpinan
        </div>
        <nav className="space-y-1">
          <button
            onClick={() => onTabChange('financial')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'financial'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-lime-400" />
            <span>Analisis Pemasukan &amp; Pengeluaran</span>
          </button>

          <button
            onClick={() => onTabChange('summary_advice')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'summary_advice'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            <span>Ringkasan Cabang &amp; Saran</span>
          </button>

          <button
            onClick={() => onTabChange('leadership_report')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'leadership_report'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Form Laporan Pimpinan (PDF)</span>
          </button>
        </nav>
      </div>

      {/* Category: Integrasi & Pengelolaan Sistem */}
      <div className="mt-auto">
        <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase px-3 mb-2 font-mono">
          Integrasi &amp; Keamanan
        </div>
        <nav className="space-y-1">
          <button
            onClick={() => onTabChange('google_sync')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'google_sync'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Cloud className="w-4 h-4 text-emerald-400" />
            <span>Sinkron Google Drive &amp; Sheets</span>
          </button>

          <button
            onClick={() => onTabChange('export_import')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'export_import'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
            <span>Form Ekspor &amp; Impor Excel</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => onTabChange('user_management')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'user_management'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-purple-400" />
              <span>Manajemen Pengguna &amp; Akses</span>
            </button>
          )}

          {isLeaderOrAdmin && (
            <button
              onClick={() => onTabChange('activity_logs')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'activity_logs'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Log Aktivitas (Audit Trail)</span>
            </button>
          )}
        </nav>
      </div>
    </aside>
  );
};
