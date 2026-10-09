import React from 'react';
import {
  BranchMaster,
  DatabaseBulanBibitItem,
  DatabaseBulanKemasanItem,
  FinancialAnalysisRecord,
  ThresholdConfig,
} from '../types';
import {
  Lightbulb,
  Building2,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Droplet,
  Package,
  ShieldCheck,
  Printer,
} from 'lucide-react';

interface BranchSummaryAndAdviceViewProps {
  currentMonth: string;
  branches: BranchMaster[];
  bibitList: DatabaseBulanBibitItem[];
  kemasanList: DatabaseBulanKemasanItem[];
  financialList: FinancialAnalysisRecord[];
  thresholds: ThresholdConfig;
  onOpenThresholdModal: () => void;
}

export const BranchSummaryAndAdviceView: React.FC<BranchSummaryAndAdviceViewProps> = ({
  currentMonth,
  branches,
  bibitList,
  kemasanList,
  financialList,
  thresholds,
  onOpenThresholdModal,
}) => {
  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-yellow-50 text-yellow-600 rounded-xl">
              <Lightbulb className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              Ringkasan Cabang Detail &amp; Saran Strategis
            </h2>
            <span className="text-xs font-mono font-bold bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full">
              {currentMonth}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Evaluasi mendalam per cabang, diagnostik selisih stok, serta rekomendasi aksi langsung pimpinan.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 self-start lg:self-auto"
        >
          <Printer className="w-4 h-4 text-slate-300" />
          <span>Cetak Halaman Ini</span>
        </button>
      </div>

      {/* Branch Cards Loop */}
      <div className="space-y-6">
        {branches.map((b) => {
          const bBibit = bibitList.filter((x) => x.idCabang === b.idCabang);
          const bKemasan = kemasanList.filter((x) => x.idCabang === b.idCabang);
          const bFin = financialList.find((x) => x.idCabang === b.idCabang);

          const dangerBibit = bBibit.filter((x) => x.status === 'DANGER');
          const tidakAmanBibit = bBibit.filter((x) => x.status === 'TIDAK_AMAN');
          const amanBibit = bBibit.filter((x) => x.status === 'AMAN');

          const dangerKemasan = bKemasan.filter((x) => x.status === 'DANGER');
          const tidakAmanKemasan = bKemasan.filter((x) => x.status === 'TIDAK_AMAN');

          const totalKeluarMl = bBibit.reduce((acc, x) => acc + x.keluarMl, 0);
          const totalSisaMl = bBibit.reduce((acc, x) => acc + x.sisaMl, 0);
          const totalKeluarKms = bKemasan.reduce((acc, x) => acc + x.keluarPcs, 0);

          // Top selling bibit
          const topBibit = [...bBibit].sort((x, y) => y.keluarMl - x.keluarMl)[0];

          // Dynamic Suggestions
          const suggestions: string[] = [];

          if (dangerBibit.length > 0) {
            suggestions.push(
              `Restock Darurat Bibit: Terdapat ${dangerBibit.length} varian bibit (${dangerBibit.map((d) => d.namaBibit).join(', ')}) dengan status DANGER karena sisa minus. Lakukan pengiriman dari pusat hari ini.`
            );
          }
          if (dangerKemasan.length > 0) {
            suggestions.push(
              `Koreksi Stok Botol Kemasan: ${dangerKemasan.length} tipe kemasan (${dangerKemasan.map((d) => d.namaKemasan).join(', ')}) mencatat sisa minus. Cek kemungkinan botol pecah atau salah pencatatan kode.`
            );
          }
          if (tidakAmanBibit.length > 0) {
            suggestions.push(
              `Investigasi Takaran Racikan: ${tidakAmanBibit.length} bibit memiliki selisih keluar melebihi batas > ${thresholds.thresholdBibitMl} ml. Verifikasi takaran pipet/spuit staff saat melayani racikan botol.`
            );
          }
          if (topBibit && topBibit.keluarMl > 0) {
            suggestions.push(
              `Peningkatan Alokasi Suplai: Varian "${topBibit.namaBibit}" adalah best seller cabang dengan volume keluar ${topBibit.keluarMl} ml. Tambahkan kuota buffer stok 30% bulan depan.`
            );
          }
          if (suggestions.length === 0) {
            suggestions.push(
              'Operasional Cabang Sangat Prima: Seluruh stok bibit dan kemasan berada dalam batas toleransi aman, perputaran stok sehat, dan pencatatan kas rapi.'
            );
          }

          const healthScore = Math.max(
            0,
            100 - (dangerBibit.length + dangerKemasan.length) * 25 - (tidakAmanBibit.length + tidakAmanKemasan.length) * 10
          );

          return (
            <div
              key={b.idCabang}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:border-indigo-300 transition-all"
            >
              {/* Branch Header */}
              <div className="bg-slate-900 text-white p-5 flex flex-col md:flex-row justify-between md:items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-sm shadow-md">
                    {b.idCabang}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg">{b.namaCabang}</h3>
                    <p className="text-xs text-slate-300">
                      PIC: {b.penanggungJawab || '-'} | Kontak: {b.telepon || '-'} | Alamat: {b.alamat || '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Health Index Cabang</span>
                    <strong
                      className={`text-base font-mono ${
                        healthScore >= 80 ? 'text-emerald-400' : healthScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                      }`}
                    >
                      {healthScore}/100
                    </strong>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      healthScore >= 80
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : healthScore >= 50
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                    }`}
                  >
                    {healthScore >= 80 ? 'SEHAT' : healthScore >= 50 ? 'WASPADA' : 'KRITIS'}
                  </span>
                </div>
              </div>

              {/* Branch Detailed Grid */}
              <div className="p-6 space-y-6">
                {/* Stats 4-col */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block">Total Keluar Bibit</span>
                    <strong className="text-base text-slate-900 font-mono mt-0.5 block">
                      {totalKeluarMl.toLocaleString('id-ID')} ml
                    </strong>
                    <span className="text-[10px] text-slate-400">Sisa Fisik: {totalSisaMl} ml</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block">Kemasan Keluar</span>
                    <strong className="text-base text-slate-900 font-mono mt-0.5 block">
                      {totalKeluarKms.toLocaleString('id-ID')} pcs
                    </strong>
                    <span className="text-[10px] text-slate-400">Botol terjual/dipakai</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block">Omset Toko (Bulan Ini)</span>
                    <strong className="text-base text-emerald-700 font-mono mt-0.5 block">
                      Rp {(bFin?.totalHargaJualBibit || 0).toLocaleString('id-ID')}
                    </strong>
                    <span className="text-[10px] text-emerald-600">
                      Laba: Rp {(bFin?.estimasiLabaBersih || 0).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block">Status Inventori</span>
                    <div className="flex items-center gap-2 mt-1 font-bold">
                      <span className="text-emerald-700">{amanBibit.length} Aman</span>
                      <span className="text-amber-700">{tidakAmanBibit.length + tidakAmanKemasan.length} Waspada</span>
                      <span className="text-rose-700">{dangerBibit.length + dangerKemasan.length} Danger</span>
                    </div>
                  </div>
                </div>

                {/* Analysis from Previous Month & Current Context */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">
                    Keterangan Analisis Bulan Kemarin (Evaluasi Master):
                  </span>
                  <p className="text-slate-600 leading-relaxed italic">
                    "{b.keteranganAnalisisKemarin || 'Tidak ada catatan bulan kemarin.'}"
                  </p>
                </div>

                {/* Smart Actionable Recommendations (Saran Pimpinan) */}
                <div className="bg-yellow-50/70 border border-yellow-200 rounded-2xl p-5 space-y-3">
                  <h4 className="font-extrabold text-sm text-yellow-950 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-600" />
                    <span>Saran &amp; Rekomendasi Pimpinan untuk {b.namaCabang}</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-yellow-900">
                    {suggestions.map((sug, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-600 mt-1.5 shrink-0"></span>
                        <span className="leading-relaxed">{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
