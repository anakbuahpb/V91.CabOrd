import React, { useState } from 'react';
import {
  googleSignIn,
  googleLogout,
  getAccessToken,
  syncToGoogleDriveAndSheets,
} from '../services/googleWorkspace';
import {
  BranchMaster,
  DatabaseBulanBibitItem,
  DatabaseBulanKemasanItem,
  BarangMasukItem,
  BarangKeluarBibitItem,
  BarangKeluarKemasanItem,
  FinancialAnalysisRecord,
  UserAccount,
} from '../types';
import {
  Cloud,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  LogOut,
  FileSpreadsheet,
  HardDrive,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface GoogleSyncViewProps {
  currentMonth: string;
  branches: BranchMaster[];
  bibitList: DatabaseBulanBibitItem[];
  kemasanList: DatabaseBulanKemasanItem[];
  masukList: BarangMasukItem[];
  keluarBibitList: BarangKeluarBibitItem[];
  keluarKemasanList: BarangKeluarKemasanItem[];
  financialList: FinancialAnalysisRecord[];
  currentUser: UserAccount;
  isConnected: boolean;
  googleEmail?: string;
  onConnectionChange: (connected: boolean, email?: string) => void;
  onActivityLogged: (action: any, module: string, desc: string) => void;
}

export const GoogleSyncView: React.FC<GoogleSyncViewProps> = ({
  currentMonth,
  branches,
  bibitList,
  kemasanList,
  masukList,
  keluarBibitList,
  keluarKemasanList,
  financialList,
  currentUser,
  isConnected,
  googleEmail,
  onConnectionChange,
  onActivityLogged,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSheetUrl, setLastSheetUrl] = useState<string | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sign In with Google
  const handleGoogleSignIn = async () => {
    try {
      setErrorMsg(null);
      const res = await googleSignIn();
      if (res && res.user) {
        onConnectionChange(true, res.user.email || 'Akun Google Terhubung');
        onActivityLogged('SYNC_GOOGLE', 'Google Workspace', `User menghubungkan akun Google: ${res.user.email}`);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal login ke Google Workspace');
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await googleLogout();
      onConnectionChange(false, undefined);
      setLastSheetUrl(null);
      onActivityLogged('LOGOUT', 'Google Workspace', 'Koneksi Google Workspace diputus');
    } catch (err: any) {
      console.error(err);
    }
  };

  // Perform Synchronization to Google Sheets & Drive
  const handlePerformSync = async () => {
    // Workspace mandatory confirmation for mutating data
    const confirmed = window.confirm(
      `Apakah Anda ingin membuat / memperbarui file Google Spreadsheet untuk data periode ${currentMonth} di Google Drive Anda?`
    );
    if (!confirmed) return;

    setIsSyncing(true);
    setErrorMsg(null);
    setSyncStatusMsg('Sedang memproses struktur spreadsheet dan sinkronisasi baris data...');

    try {
      const result = await syncToGoogleDriveAndSheets({
        bulan: currentMonth,
        branches,
        bibitList,
        kemasanList,
        masukList,
        keluarBibitList,
        keluarKemasanList,
        financialList,
      });

      setLastSheetUrl(result.spreadsheetUrl);
      const now = new Date().toLocaleTimeString('id-ID');
      setLastSyncedTime(now);
      setSyncStatusMsg(`Berhasil disinkronkan ke Google Drive & Google Sheets pukul ${now}!`);
      onActivityLogged(
        'SYNC_GOOGLE',
        'Google Sheets & Drive',
        `Sinkronisasi berhasil: Spreadsheet ID ${result.spreadsheetId} dibuat/diperbarui di Google Drive.`
      );
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal melakukan sinkronisasi ke Google Sheets');
      setSyncStatusMsg(null);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Cloud className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              Sinkronisasi Google Drive &amp; Google Sheets
            </h2>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isConnected ? 'Terhubung' : 'Belum Terhubung'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Integrasi cloud real-time resmi Google Workspace untuk membuat spreadsheet database cabang, evaluasi stok, dan laporan di akun Google Anda.
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 shadow-xs space-y-6">
        {/* Connection Box */}
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {isConnected ? 'Akun Google Workspace Terhubung' : 'Sambungkan Akun Google'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isConnected
                  ? `Aktif sebagai: ${googleEmail || 'Pengguna Google'}`
                  : 'Masuk dengan akun Google Anda untuk mengizinkan aplikasi membuat dan memperbarui spreadsheet cabang di Google Drive.'}
              </p>
            </div>
          </div>

          <div>
            {isConnected ? (
              <button
                onClick={handleGoogleLogout}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Putus Sambungan</span>
              </button>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Masuk dengan Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Terjadi Kesalahan:</strong>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Success / Status Message */}
        {syncStatusMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-800 text-xs">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Status Sinkronisasi:</strong>
              <span>{syncStatusMsg}</span>
            </div>
          </div>
        )}

        {/* Sync Action Area */}
        <div className="border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Sinkronkan Seluruh Database ke Google Spreadsheet</span>
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Akan membuat/memperbarui lembar: <strong>Ringkasan Cabang</strong>, <strong>Bulan Bibit</strong>, <strong>Bulan Kemasan</strong>, <strong>Barang Masuk</strong>, <strong>Keluar Bibit</strong>, <strong>Keluar Kemasan</strong>, dan <strong>Analisis Finansial</strong>.
              </p>
            </div>

            <button
              disabled={!isConnected || isSyncing}
              onClick={handlePerformSync}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
            </button>
          </div>

          {/* Active Generated Spreadsheet Link */}
          {lastSheetUrl && (
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-indigo-900">
                <CheckCircle className="w-4 h-4 text-indigo-600" />
                <span>
                  Spreadsheet berhasil diperbarui. Tersimpan aman di Google Drive Anda.
                </span>
              </div>
              <a
                href={lastSheetUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>Buka di Google Sheets</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <HardDrive className="w-4 h-4 text-indigo-600" />
              <span>Otomatis Google Drive</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              File tersimpan rapi pada root Google Drive Anda dengan judul berformat periode bulanan yang terstruktur.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>7 Tab Data Lengkap</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Memisahkan data per sheet secara otomatis: Master, Bibit, Kemasan, Mutasi Masuk/Keluar, dan Analisis Finansial.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Keamanan Hak Akses</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Menggunakan token otorisasi OAuth resmi Google. Data hanya tersimpan di Drive milik akun Google Anda sendiri.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
