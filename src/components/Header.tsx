import React from 'react';
import {
  BranchMaster,
  ThresholdConfig,
  UserAccount,
  DatabaseBulanBibitItem,
  DatabaseBulanKemasanItem,
} from '../types';
import {
  Building2,
  Calendar,
  Sliders,
  AlertOctagon,
  UserCheck,
  LogOut,
  KeyRound,
  Cloud,
  CheckCircle,
  Lock,
} from 'lucide-react';

interface HeaderProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
  selectedBranchId: string;
  onBranchChange: (branchId: string) => void;
  branches: BranchMaster[];
  thresholds: ThresholdConfig;
  onOpenThresholdModal: () => void;
  currentUser: UserAccount;
  onSwitchUser: () => void;
  onOpenPasswordModal: () => void;
  bibitList: DatabaseBulanBibitItem[];
  kemasanList: DatabaseBulanKemasanItem[];
  googleConnected: boolean;
  googleUserEmail?: string;
  onOpenGoogleSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonth,
  onMonthChange,
  selectedBranchId,
  onBranchChange,
  branches,
  thresholds,
  onOpenThresholdModal,
  currentUser,
  onSwitchUser,
  onOpenPasswordModal,
  bibitList,
  kemasanList,
  googleConnected,
  googleUserEmail,
  onOpenGoogleSync,
}) => {
  // Calculate alerts in current month & branch
  const dangerBibit = bibitList.filter((b) => b.status === 'DANGER').length;
  const tidakAmanBibit = bibitList.filter((b) => b.status === 'TIDAK_AMAN').length;
  const dangerKemasan = kemasanList.filter((k) => k.status === 'DANGER').length;
  const tidakAmanKemasan = kemasanList.filter((k) => k.status === 'TIDAK_AMAN').length;
  const totalDanger = dangerBibit + dangerKemasan;
  const totalTidakAman = tidakAmanBibit + tidakAmanKemasan;

  const isBranchLocked = currentUser.role === 'admin_cabang' && !!currentUser.assignedBranchId;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-600/30 tracking-tighter">
              V91
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  V91.CabORD
                </span>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-indigo-500/30 uppercase tracking-wider">
                  Database & Evaluasi Cabang
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Sistem Penilaian Stok Bibit, Kemasan & Analisis Toko
              </p>
            </div>
          </div>

          {/* Quick Controls: Month & Branch Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Month Picker */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200">
              <Calendar className="w-4 h-4 text-indigo-400 mr-2 shrink-0" />
              <label className="text-[11px] text-slate-400 mr-1.5 hidden sm:inline">Periode:</label>
              <input
                type="month"
                value={currentMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-hidden cursor-pointer"
              />
            </div>

            {/* Branch Selector */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200">
              <Building2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
              <label className="text-[11px] text-slate-400 mr-1.5 hidden sm:inline">Cabang:</label>
              {isBranchLocked ? (
                <div className="flex items-center text-xs font-semibold text-emerald-300 gap-1">
                  <span>{branches.find((b) => b.idCabang === currentUser.assignedBranchId)?.namaCabang || currentUser.assignedBranchId}</span>
                  <Lock className="w-3 h-3 text-slate-400 ml-1" />
                </div>
              ) : (
                <select
                  value={selectedBranchId}
                  onChange={(e) => onBranchChange(e.target.value)}
                  className="bg-slate-800 text-white font-semibold focus:outline-hidden cursor-pointer rounded-sm"
                >
                  <option value="ALL">Semua Cabang ({branches.length})</option>
                  {branches.map((b) => (
                    <option key={b.idCabang} value={b.idCabang}>
                      {b.idCabang} - {b.namaCabang}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Threshold Quick Button */}
            <button
              onClick={onOpenThresholdModal}
              title="Atur Batas Selisih Evaluasi (Bisa dirubah kapanpun)"
              className="flex items-center bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1.5 rounded-xl text-xs text-slate-200 hover:text-white transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
              <span className="font-mono text-[11px]">
                Bibit: &gt;{thresholds.thresholdBibitMl}ml | Kms: &gt;{thresholds.thresholdKemasanPcs}pcs
              </span>
            </button>

            {/* Danger Indicator Button */}
            {(totalDanger > 0 || totalTidakAman > 0) && (
              <div
                className={`flex items-center px-2.5 py-1.5 rounded-xl text-xs font-semibold animate-pulse ${
                  totalDanger > 0
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                <AlertOctagon className="w-3.5 h-3.5 mr-1" />
                <span>
                  {totalDanger > 0 ? `${totalDanger} DANGER (Minus)` : `${totalTidakAman} Waspada`}
                </span>
              </div>
            )}

            {/* Google Drive & Sheets Sync Pill */}
            <button
              onClick={onOpenGoogleSync}
              className={`flex items-center px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                googleConnected
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Cloud className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              <span className="hidden sm:inline">
                {googleConnected ? 'Google Drive & Sheets' : 'Sync Google'}
              </span>
              {googleConnected && <CheckCircle className="w-3 h-3 text-emerald-400 ml-1.5" />}
            </button>

            {/* User Profile Badge */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl px-2 py-1">
              <div className="flex items-center gap-1.5 text-left">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold text-xs">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="hidden lg:block text-left pr-1">
                  <div className="text-[11px] font-bold text-white leading-tight flex items-center gap-1">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">
                    {currentUser.role}
                  </div>
                </div>
              </div>

              {/* User Actions */}
              <button
                onClick={onOpenPasswordModal}
                title="Ganti Password"
                className="p-1 hover:bg-slate-700 rounded-md text-slate-400 hover:text-slate-200"
              >
                <KeyRound className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onSwitchUser}
                title="Beralih Pengguna / Login"
                className="p-1 hover:bg-slate-700 rounded-md text-slate-400 hover:text-amber-300"
              >
                <UserCheck className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
