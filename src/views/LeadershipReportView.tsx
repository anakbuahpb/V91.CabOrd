import React, { useState } from 'react';
import {
  BranchMaster,
  DatabaseBulanBibitItem,
  DatabaseBulanKemasanItem,
  FinancialAnalysisRecord,
  ThresholdConfig,
} from '../types';
import {
  FileText,
  Printer,
  FileDown,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { exportLeadershipReportToPdf } from '../services/pdfExport';
import { exportToExcel } from '../services/excelService';

interface LeadershipReportViewProps {
  currentMonth: string;
  selectedBranchId: string;
  branches: BranchMaster[];
  bibitList: DatabaseBulanBibitItem[];
  kemasanList: DatabaseBulanKemasanItem[];
  financialList: FinancialAnalysisRecord[];
  thresholds: ThresholdConfig;
}

export const LeadershipReportView: React.FC<LeadershipReportViewProps> = ({
  currentMonth,
  selectedBranchId,
  branches,
  bibitList,
  kemasanList,
  financialList,
  thresholds,
}) => {
  const [reportType, setReportType] = useState<'RINGKASAN' | 'DETAIL'>('RINGKASAN');

  // Filter based on selected branch
  const activeBranches = selectedBranchId === 'ALL'
    ? branches
    : branches.filter((b) => b.idCabang === selectedBranchId);

  const activeBibit = selectedBranchId === 'ALL'
    ? bibitList
    : bibitList.filter((b) => b.idCabang === selectedBranchId);

  const activeKemasan = selectedBranchId === 'ALL'
    ? kemasanList
    : kemasanList.filter((k) => k.idCabang === selectedBranchId);

  const activeFinancial = selectedBranchId === 'ALL'
    ? financialList
    : financialList.filter((f) => f.idCabang === selectedBranchId);

  const totalOmset = activeFinancial.reduce((acc, f) => acc + f.totalHargaJualBibit, 0);
  const totalLabaBersih = activeFinancial.reduce((acc, f) => acc + f.estimasiLabaBersih, 0);
  const totalBibitMl = activeBibit.reduce((acc, b) => acc + b.keluarMl, 0);
  const totalKemasanPcs = activeKemasan.reduce((acc, k) => acc + k.keluarPcs, 0);

  const dangerCount =
    activeBibit.filter((b) => b.status === 'DANGER').length +
    activeKemasan.filter((k) => k.status === 'DANGER').length;

  const handlePrintPdf = () => {
    exportLeadershipReportToPdf(activeFinancial, activeBibit, activeKemasan, currentMonth);
  };

  const handleExportExcel = () => {
    const data = activeFinancial.map((f) => {
      const bItems = activeBibit.filter((x) => x.idCabang === f.idCabang);
      const kItems = activeKemasan.filter((x) => x.idCabang === f.idCabang);
      return {
        Bulan: f.bulan,
        'ID Cabang': f.idCabang,
        'Nama Cabang': f.namaCabang,
        'Total Keluar Bibit (ml)': f.totalKeluarBibitMl,
        'Total Kemasan (pcs)': f.totalKemasanKeluarPcs,
        'Total Omset (Rp)': f.totalHargaJualBibit,
        'Estimasi HPP': f.estimasiBiayaBibit + f.estimasiBiayaKemasan,
        'Biaya Operasional': f.estimasiPengeluaranOperasional,
        'Laba Bersih': f.estimasiLabaBersih,
        'Item Danger': bItems.filter((x) => x.status === 'DANGER').length + kItems.filter((x) => x.status === 'DANGER').length,
        'Item Waspada': bItems.filter((x) => x.status === 'TIDAK_AMAN').length + kItems.filter((x) => x.status === 'TIDAK_AMAN').length,
        'Catatan Pimpinan': f.catatanEvaluasi,
      };
    });
    exportToExcel(data, `V91_Laporan_Pimpinan_${currentMonth}`, 'Laporan Pimpinan');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              Form Laporan Pimpinan &amp; Direksi
            </h2>
            <span className="text-xs font-mono font-bold bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
              Dokumen Resmi Periode {currentMonth}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Laporan pertanggungjawaban operasional, evaluasi margin laba, dan pemantauan risiko inventori cabang.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Switch Ringkasan / Detail */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setReportType('RINGKASAN')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                reportType === 'RINGKASAN' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Ringkasan Eksekutif
            </button>
            <button
              onClick={() => setReportType('DETAIL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                reportType === 'DETAIL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Detail Lengkap
            </button>
          </div>

          <button
            onClick={handleExportExcel}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <FileDown className="w-4 h-4" />
            <span>Excel</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-slate-900/30"
          >
            <Printer className="w-4 h-4 text-sky-300" />
            <span>Cetak &amp; Simpan Dokumen PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Corporate Executive Document Box */}
      <div className="bg-white rounded-3xl border border-slate-300 p-8 shadow-md space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header Kop */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-indigo-700 tracking-tighter">V91.CabORD</span>
              <span className="text-xs font-bold text-slate-400">| SISTEM DATABASE CABANG</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 uppercase mt-1">
              LAPORAN EVALUASI OPERASIONAL &amp; PENILAIAN STOK PIMPINAN
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              PT V91 Aroma Nusantara - Divisi Operasional &amp; Kontrol Kualitas Cabang
            </p>
          </div>

          <div className="text-right text-xs text-slate-600">
            <div>
              <strong>Periode:</strong> {currentMonth}
            </div>
            <div>
              <strong>Cabang:</strong>{' '}
              {selectedBranchId === 'ALL'
                ? `Konsolidasi Semua Cabang (${activeBranches.length})`
                : activeBranches[0]?.namaCabang}
            </div>
            <div>
              <strong>Tanggal Terbit:</strong> {new Date().toLocaleDateString('id-ID')}
            </div>
          </div>
        </div>

        {/* Section 1: Executive KPI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-slate-500 text-xs font-bold uppercase block">Total Pemasukan Omset</span>
            <strong className="text-xl font-black text-slate-900 mt-1 block">
              Rp {totalOmset.toLocaleString('id-ID')}
            </strong>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-slate-500 text-xs font-bold uppercase block">Estimasi Laba Bersih</span>
            <strong className="text-xl font-black text-emerald-700 mt-1 block">
              Rp {totalLabaBersih.toLocaleString('id-ID')}
            </strong>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-slate-500 text-xs font-bold uppercase block">Volume Bibit Terjual</span>
            <strong className="text-xl font-black text-cyan-800 font-mono mt-1 block">
              {totalBibitMl.toLocaleString('id-ID')} ml
            </strong>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-slate-500 text-xs font-bold uppercase block">Status Risiko Stok</span>
            <strong
              className={`text-xl font-black mt-1 block ${
                dangerCount > 0 ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {dangerCount > 0 ? `${dangerCount} Item Danger` : 'Kondisi Aman'}
            </strong>
          </div>
        </div>

        {/* Section 2: Table Rekapitulasi Cabang */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>Tabel Evaluasi Kinerja Finansial &amp; Stok Per Cabang</span>
          </h3>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Nama Cabang</th>
                  <th className="py-2.5 px-3 text-right">Keluar Bibit</th>
                  <th className="py-2.5 px-3 text-right">Botol (pcs)</th>
                  <th className="py-2.5 px-3 text-right">Omset (Rp)</th>
                  <th className="py-2.5 px-3 text-right">Biaya Operasional</th>
                  <th className="py-2.5 px-3 text-right font-black">Laba Bersih</th>
                  <th className="py-2.5 px-3 text-center">Indikator Stok</th>
                  <th className="py-2.5 px-3">Catatan Pimpinan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeFinancial.map((f) => {
                  const bDanger = activeBibit.filter((x) => x.idCabang === f.idCabang && x.status === 'DANGER').length;
                  const bWarn = activeBibit.filter((x) => x.idCabang === f.idCabang && x.status === 'TIDAK_AMAN').length;
                  const kDanger = activeKemasan.filter((x) => x.idCabang === f.idCabang && x.status === 'DANGER').length;

                  return (
                    <tr key={f.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{f.idCabang}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{f.namaCabang}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{f.totalKeluarBibitMl.toLocaleString('id-ID')} ml</td>
                      <td className="py-2.5 px-3 text-right font-mono">{f.totalKemasanKeluarPcs} pcs</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        Rp {f.totalHargaJualBibit.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                        Rp {f.estimasiPengeluaranOperasional.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-700">
                        Rp {f.estimasiLabaBersih.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {bDanger + kDanger > 0 ? (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {bDanger + kDanger} DANGER
                          </span>
                        ) : bWarn > 0 ? (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {bWarn} WASPADA
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            AMAN
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">{f.catatanEvaluasi}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: If Detail Mode, show all Bibit & Kemasan table */}
        {reportType === 'DETAIL' && (
          <div className="space-y-6 pt-4 border-t border-slate-200">
            <div>
              <h4 className="font-bold text-xs text-slate-800 uppercase mb-2">
                Lampiran 1: Detail Status Database Bulan Bibit
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Cabang</th>
                      <th className="py-2 px-3">Kode</th>
                      <th className="py-2 px-3">Nama Bibit</th>
                      <th className="py-2 px-3 text-right">Masuk</th>
                      <th className="py-2 px-3 text-right">Keluar</th>
                      <th className="py-2 px-3 text-right">Sisa</th>
                      <th className="py-2 px-3 text-right">Selisih</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeBibit.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 px-3">{item.namaCabang}</td>
                        <td className="py-2 px-3 font-mono">{item.kodeBibit}</td>
                        <td className="py-2 px-3 font-medium">{item.namaBibit}</td>
                        <td className="py-2 px-3 text-right font-mono">{item.masukMl} ml</td>
                        <td className="py-2 px-3 text-right font-mono">{item.keluarMl} ml</td>
                        <td className={`py-2 px-3 text-right font-mono font-bold ${item.sisaMl < 0 ? 'text-rose-600' : ''}`}>
                          {item.sisaMl} ml
                        </td>
                        <td className="py-2 px-3 text-right font-mono">{item.selisihMl} ml</td>
                        <td className="py-2 px-3 text-center font-bold text-[10px]">{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs text-slate-800 uppercase mb-2">
                Lampiran 2: Detail Status Database Bulan Kemasan
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Cabang</th>
                      <th className="py-2 px-3">Kode</th>
                      <th className="py-2 px-3">Nama Kemasan</th>
                      <th className="py-2 px-3 text-right">Masuk</th>
                      <th className="py-2 px-3 text-right">Keluar</th>
                      <th className="py-2 px-3 text-right">Sisa</th>
                      <th className="py-2 px-3 text-right">Selisih</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeKemasan.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 px-3">{item.namaCabang}</td>
                        <td className="py-2 px-3 font-mono">{item.kodeKemasan}</td>
                        <td className="py-2 px-3 font-medium">{item.namaKemasan}</td>
                        <td className="py-2 px-3 text-right font-mono">{item.masukPcs} pcs</td>
                        <td className="py-2 px-3 text-right font-mono">{item.keluarPcs} pcs</td>
                        <td className={`py-2 px-3 text-right font-mono font-bold ${item.sisaPcs < 0 ? 'text-rose-600' : ''}`}>
                          {item.sisaPcs} pcs
                        </td>
                        <td className="py-2 px-3 text-right font-mono">{item.selisihPcs} pcs</td>
                        <td className="py-2 px-3 text-center font-bold text-[10px]">{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Signature Blocks */}
        <div className="pt-8 border-t-2 border-slate-200 grid grid-cols-2 text-center text-xs">
          <div>
            <p className="text-slate-500">Dibuat &amp; Diverifikasi Oleh:</p>
            <div className="h-16"></div>
            <strong className="text-slate-900 block underline">Administrator Operasional</strong>
            <span className="text-slate-400 text-[10px]">Staff Pengawas V91 Pusat</span>
          </div>

          <div>
            <p className="text-slate-500">Disetujui &amp; Disahkan Oleh:</p>
            <div className="h-16"></div>
            <strong className="text-slate-900 block underline">Direktur Utama / Pimpinan</strong>
            <span className="text-slate-400 text-[10px]">PT V91 Aroma Nusantara</span>
          </div>
        </div>
      </div>
    </div>
  );
};
