import React from 'react';
import {
  BranchMaster,
  DatabaseBulanBibitItem,
  DatabaseBulanKemasanItem,
  FinancialAnalysisRecord,
  ThresholdConfig,
} from '../types';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  TrendingUp,
  Droplet,
  Package,
  Building2,
  Calendar,
  ArrowRight,
  FileText,
  Cloud,
  Sliders,
} from 'lucide-react';

interface DashboardViewProps {
  currentMonth: string;
  branches: BranchMaster[];
  bibitList: DatabaseBulanBibitItem[];
  kemasanList: DatabaseBulanKemasanItem[];
  financialList: FinancialAnalysisRecord[];
  thresholds: ThresholdConfig;
  onNavigate: (tab: any) => void;
  onOpenNewMonthModal: () => void;
  onOpenThresholdModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentMonth,
  branches,
  bibitList,
  kemasanList,
  financialList,
  thresholds,
  onNavigate,
  onOpenNewMonthModal,
  onOpenThresholdModal,
}) => {
  // Aggregate stats
  const totalBibitMasuk = bibitList.reduce((acc, b) => acc + b.masukMl, 0);
  const totalBibitKeluar = bibitList.reduce((acc, b) => acc + b.keluarMl, 0);
  const totalBibitSisa = bibitList.reduce((acc, b) => acc + b.sisaMl, 0);

  const totalKemasanMasuk = kemasanList.reduce((acc, k) => acc + k.masukPcs, 0);
  const totalKemasanKeluar = kemasanList.reduce((acc, k) => acc + k.keluarPcs, 0);
  const totalKemasanSisa = kemasanList.reduce((acc, k) => acc + k.sisaPcs, 0);

  const totalOmset = financialList.reduce((acc, f) => acc + f.totalHargaJualBibit, 0);
  const totalLabaBersih = financialList.reduce((acc, f) => acc + f.estimasiLabaBersih, 0);

  // Status breakdown
  const dangerBibit = bibitList.filter((b) => b.status === 'DANGER');
  const tidakAmanBibit = bibitList.filter((b) => b.status === 'TIDAK_AMAN');
  const amanBibit = bibitList.filter((b) => b.status === 'AMAN');

  const dangerKemasan = kemasanList.filter((k) => k.status === 'DANGER');
  const tidakAmanKemasan = kemasanList.filter((k) => k.status === 'TIDAK_AMAN');
  const amanKemasan = kemasanList.filter((k) => k.status === 'AMAN');

  const totalDanger = dangerBibit.length + dangerKemasan.length;
  const totalTidakAman = tidakAmanBibit.length + tidakAmanKemasan.length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 lg:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-indigo-500/10 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 text-xs px-3 py-1 rounded-full border border-indigo-500/30 font-mono mb-3">
              <Calendar className="w-3.5 h-3.5" />
              <span>Periode Penilaian Aktif: {currentMonth}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              Pusat Evaluasi Stok &amp; Analisis Cabang V91.CabORD
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl mt-1 leading-relaxed">
              Pemantauan performa real-time untuk {branches.length} cabang. Penilaian otomatis mendeteksi selisih volume bibit &gt;{thresholds.thresholdBibitMl}ml, kemasan &gt;{thresholds.thresholdKemasanPcs}pcs, serta alarm darurat jika sisa stok minus.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewMonthModal}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Buka Lembar Bulan Baru</span>
            </button>
            <button
              onClick={() => onNavigate('leadership_report')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Laporan Pimpinan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Critical Status Banners if Any Danger */}
      {totalDanger > 0 && (
        <div className="bg-rose-500/10 border-2 border-rose-500/40 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500 text-white rounded-xl animate-bounce">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-rose-950 font-bold text-sm">
                PERINGATAN KRITIS: {totalDanger} Item Berstatus DANGER (Sisa Stok Minus)
              </h4>
              <p className="text-rose-800 text-xs mt-0.5">
                Terdapat catatan pengeluaran barang tanpa ketersediaan stok fisik yang cukup. Segera lakukan audit stock opname atau restock darurat.
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {dangerBibit.length > 0 && (
              <button
                onClick={() => onNavigate('bibit_monthly')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Lihat {dangerBibit.length} Bibit Danger
              </button>
            )}
            {dangerKemasan.length > 0 && (
              <button
                onClick={() => onNavigate('kemasan_monthly')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Lihat {dangerKemasan.length} Kemasan Danger
              </button>
            )}
          </div>
        </div>
      )}

      {/* Metrics KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Bibit Status Overview */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Database Bulan Bibit
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {totalBibitKeluar.toLocaleString('id-ID')}{' '}
                <span className="text-xs font-normal text-slate-500">ml keluar</span>
              </h3>
            </div>
            <div className="p-2.5 bg-cyan-100 text-cyan-700 rounded-xl">
              <Droplet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
            <span className="text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {amanBibit.length} Aman
            </span>
            <span className="text-amber-700 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {tidakAmanBibit.length} Waspada
            </span>
            <span className="text-rose-700 flex items-center gap-1 font-bold">
              <AlertOctagon className="w-3.5 h-3.5" /> {dangerBibit.length} Danger
            </span>
          </div>
        </div>

        {/* Card 2: Kemasan Status Overview */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Database Kemasan
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {totalKemasanKeluar.toLocaleString('id-ID')}{' '}
                <span className="text-xs font-normal text-slate-500">pcs keluar</span>
              </h3>
            </div>
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
            <span className="text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {amanKemasan.length} Aman
            </span>
            <span className="text-amber-700 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {tidakAmanKemasan.length} Waspada
            </span>
            <span className="text-rose-700 flex items-center gap-1 font-bold">
              <AlertOctagon className="w-3.5 h-3.5" /> {dangerKemasan.length} Danger
            </span>
          </div>
        </div>

        {/* Card 3: Total Omset Penjualan */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Omset Penjualan
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                Rp {Math.round(totalOmset / 1000000)} jt
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Rp {totalOmset.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="p-2.5 bg-lime-100 text-lime-800 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Estimasi Bersih:</span>
            <span className="font-bold text-emerald-700">Rp {totalLabaBersih.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Card 4: Konfigurasi Parameter Selisih */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Batas Selisih Aktif
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-xl font-bold text-indigo-700">
                  &gt;{thresholds.thresholdBibitMl}ml
                </span>
                <span className="text-xs text-slate-400">/</span>
                <span className="font-mono text-xl font-bold text-emerald-700">
                  &gt;{thresholds.thresholdKemasanPcs}pcs
                </span>
              </div>
            </div>
            <button
              onClick={onOpenThresholdModal}
              title="Ubah batas selisih kapanpun"
              className="p-2 bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-700 rounded-xl transition-colors"
            >
              <Sliders className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Dapat diubah kapanpun</span>
            <button
              onClick={onOpenThresholdModal}
              className="text-indigo-600 hover:underline font-semibold"
            >
              Edit Parameter
            </button>
          </div>
        </div>
      </div>

      {/* Critical Stock Evaluation Watchlist */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              Item Perlu Perhatian Segera (Status DANGER &amp; TIDAK AMAN)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar stok bibit atau kemasan dengan selisih tinggi atau volume sisa minus
            </p>
          </div>
          <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-semibold">
            {dangerBibit.length + tidakAmanBibit.length + dangerKemasan.length + tidakAmanKemasan.length} Item Terdeteksi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4">Cabang</th>
                <th className="py-3 px-4">Kode &amp; Nama Item</th>
                <th className="py-3 px-4 text-right">Masuk</th>
                <th className="py-3 px-4 text-right">Keluar</th>
                <th className="py-3 px-4 text-right">Sisa Stok</th>
                <th className="py-3 px-4 text-right">Selisih</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Catatan / Analisis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Bibit Alert Items */}
              {[...dangerBibit, ...tidakAmanBibit].map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <span className="bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-md font-semibold">
                      Bibit (ml)
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">{item.namaCabang}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-slate-500 mr-1.5">{item.kodeBibit}</span>
                    <strong className="text-slate-800">{item.namaBibit}</strong>
                  </td>
                  <td className="py-3 px-4 text-right font-mono">{item.masukMl} ml</td>
                  <td className="py-3 px-4 text-right font-mono">{item.keluarMl} ml</td>
                  <td
                    className={`py-3 px-4 text-right font-mono font-bold ${
                      item.sisaMl < 0 ? 'text-rose-600 bg-rose-50' : 'text-slate-900'
                    }`}
                  >
                    {item.sisaMl} ml
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-amber-700 font-semibold">
                    {item.selisihMl > 0 ? `+${item.selisihMl}` : item.selisihMl} ml
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        item.status === 'DANGER'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{item.catatan || '-'}</td>
                </tr>
              ))}

              {/* Kemasan Alert Items */}
              {[...dangerKemasan, ...tidakAmanKemasan].map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-semibold">
                      Kemasan (pcs)
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">{item.namaCabang}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-slate-500 mr-1.5">{item.kodeKemasan}</span>
                    <strong className="text-slate-800">{item.namaKemasan}</strong>
                  </td>
                  <td className="py-3 px-4 text-right font-mono">{item.masukPcs} pcs</td>
                  <td className="py-3 px-4 text-right font-mono">{item.keluarPcs} pcs</td>
                  <td
                    className={`py-3 px-4 text-right font-mono font-bold ${
                      item.sisaPcs < 0 ? 'text-rose-600 bg-rose-50' : 'text-slate-900'
                    }`}
                  >
                    {item.sisaPcs} pcs
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-amber-700 font-semibold">
                    {item.selisihPcs > 0 ? `+${item.selisihPcs}` : item.selisihPcs} pcs
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        item.status === 'DANGER'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{item.catatan || '-'}</td>
                </tr>
              ))}

              {dangerBibit.length === 0 &&
                tidakAmanBibit.length === 0 &&
                dangerKemasan.length === 0 &&
                tidakAmanKemasan.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                        <p className="font-semibold text-slate-700">Semua Stok Cabang Dalam Kondisi Aman</p>
                        <p className="text-xs text-slate-400">
                          Tidak ditemukan sisa minus atau selisih melebihi batas batas yang ditetapkan.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Branch Cards Overview */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            Daftar Cabang Aktif ({branches.length})
          </h3>
          <button
            onClick={() => onNavigate('branch_master')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Kelola Master Cabang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {branches.map((b) => {
            const bFin = financialList.find((f) => f.idCabang === b.idCabang);
            const bDangerBibit = bibitList.filter((x) => x.idCabang === b.idCabang && x.status === 'DANGER').length;
            const bDangerKms = kemasanList.filter((x) => x.idCabang === b.idCabang && x.status === 'DANGER').length;

            return (
              <div
                key={b.idCabang}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {b.idCabang}
                    </span>
                    {(bDangerBibit > 0 || bDangerKms > 0) && (
                      <span className="text-[10px] font-black uppercase bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                        DANGER ({bDangerBibit + bDangerKms})
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-base mt-2">{b.namaCabang}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {b.keteranganAnalisisKemarin}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Omset Bulan Ini:</span>
                    <strong className="text-slate-900">
                      Rp {(bFin?.totalHargaJualBibit || 0).toLocaleString('id-ID')}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600 mt-1">
                    <span>Barang Utama:</span>
                    <span className="text-indigo-600 font-medium truncate max-w-[130px]">
                      {b.namaBarangUtama}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
