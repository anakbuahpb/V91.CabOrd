import React, { useState } from 'react';
import { ActivityLog } from '../types';
import {
  ShieldAlert,
  Search,
  Filter,
  Trash2,
  FileDown,
  Clock,
  User,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { exportToExcel } from '../services/excelService';

interface ActivityLogViewProps {
  logs: ActivityLog[];
  onClearLogs: () => void;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({ logs, onClearLogs }) => {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.targetModule.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || log.actionType === actionFilter;
    return matchesSearch && matchesAction;
  });

  const handleExportExcel = () => {
    const data = filteredLogs.map((l) => ({
      Timestamp: l.timestamp,
      'Nama Pengguna': l.userName,
      Role: l.userRole,
      'Tipe Aksi': l.actionType,
      'Modul Target': l.targetModule,
      'Deskripsi Detail': l.description,
      'ID Cabang': l.branchId || '-',
    }));
    exportToExcel(data, `V91_Audit_Trail_Log_${new Date().toISOString().slice(0, 10)}`, 'Audit Log');
  };

  const getActionBadgeColor = (action: ActivityLog['actionType']) => {
    switch (action) {
      case 'LOGIN':
      case 'LOGOUT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TAMBAH':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'EDIT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'HAPUS':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'UPDATE_THRESHOLD':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SYNC_GOOGLE':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'LEMBAR_BARU':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              Log Aktivitas Pengguna (Audit Trail Keamanan)
            </h2>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full">
              {filteredLogs.length} Catatan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rekam jejak setiap aksi pengguna untuk audit keamanan mendalam, deteksi perubahan threshold, mutasi stok, dan sinkronisasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <FileDown className="w-4 h-4" />
            <span>Ekspor Log Excel</span>
          </button>
          <button
            onClick={() => {
              if (confirm('Bersihkan seluruh riwayat audit log aktivitas?')) {
                onClearLogs();
              }
            }}
            className="px-3.5 py-2 border border-slate-300 hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Bersihkan Log</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari user, deskripsi aksi, atau modul..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-semibold">Tipe Aksi:</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
          >
            <option value="ALL">Semua Aksi</option>
            <option value="LOGIN">LOGIN</option>
            <option value="TAMBAH">TAMBAH</option>
            <option value="EDIT">EDIT</option>
            <option value="HAPUS">HAPUS</option>
            <option value="UPDATE_THRESHOLD">UPDATE THRESHOLD</option>
            <option value="LEMBAR_BARU">LEMBAR BARU</option>
            <option value="SYNC_GOOGLE">SYNC GOOGLE</option>
            <option value="EXPORT_DATA">EXPORT DATA</option>
            <option value="IMPORT_DATA">IMPORT DATA</option>
          </select>
        </div>
      </div>

      {/* Timeline / Table Log */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Pengguna &amp; Role</th>
                <th className="py-3 px-4 text-center">Tipe Aksi</th>
                <th className="py-3 px-4">Modul Target</th>
                <th className="py-3 px-4">Deskripsi Aktivitas</th>
                <th className="py-3 px-4">Cabang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4">
                    <strong className="text-slate-900 block">{log.userName}</strong>
                    <span className="text-[10px] uppercase font-mono text-slate-400">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase border ${getActionBadgeColor(
                        log.actionType
                      )}`}
                    >
                      {log.actionType}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700">{log.targetModule}</td>
                  <td className="py-3 px-4 text-slate-800 leading-relaxed">{log.description}</td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                    {log.branchId || '-'}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada riwayat aktivitas yang sesuai kriteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
