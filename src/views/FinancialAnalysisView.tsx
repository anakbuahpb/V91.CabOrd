import React, { useState } from 'react';
import { FinancialAnalysisRecord, BranchMaster, UserAccount } from '../types';
import {
  TrendingUp,
  Search,
  FileDown,
  Edit2,
  X,
  Check,
  Building2,
  Calendar,
  Wallet,
  Coins,
} from 'lucide-react';
import { exportToExcel } from '../services/excelService';

interface FinancialAnalysisViewProps {
  currentMonth: string;
  selectedBranchId: string;
  branches: BranchMaster[];
  financialList: FinancialAnalysisRecord[];
  onUpsertFinancial: (record: FinancialAnalysisRecord) => void;
  currentUser: UserAccount;
}

export const FinancialAnalysisView: React.FC<FinancialAnalysisViewProps> = ({
  currentMonth,
  selectedBranchId,
  branches,
  financialList,
  onUpsertFinancial,
  currentUser,
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinancialAnalysisRecord | null>(null);

  const [formData, setFormData] = useState({
    idCabang: branches[0]?.idCabang || 'CAB-01',
    totalKeluarBibitMl: 0,
    totalHargaJualBibit: 0,
    totalKemasanKeluarPcs: 0,
    estimasiBiayaBibit: 0,
    estimasiBiayaKemasan: 0,
    estimasiPengeluaranOperasional: 0,
    catatanEvaluasi: '',
  });

  const filteredRecords = financialList.filter((item) => {
    const matchesSearch =
      item.namaCabang.toLowerCase().includes(search.toLowerCase()) ||
      item.idCabang.toLowerCase().includes(search.toLowerCase());
    const matchesBranch = selectedBranchId === 'ALL' || item.idCabang === selectedBranchId;
    return matchesSearch && matchesBranch;
  });

  const totalOmset = filteredRecords.reduce((acc, f) => acc + f.totalHargaJualBibit, 0);
  const totalVolumeMl = filteredRecords.reduce((acc, f) => acc + f.totalKeluarBibitMl, 0);
  const totalBiayaOperasional = filteredRecords.reduce((acc, f) => acc + f.estimasiPengeluaranOperasional, 0);
  const totalLabaBersih = filteredRecords.reduce((acc, f) => acc + f.estimasiLabaBersih, 0);

  const handleOpenEdit = (rec: FinancialAnalysisRecord) => {
    setEditingRecord(rec);
    setFormData({
      idCabang: rec.idCabang,
      totalKeluarBibitMl: rec.totalKeluarBibitMl,
      totalHargaJualBibit: rec.totalHargaJualBibit,
      totalKemasanKeluarPcs: rec.totalKemasanKeluarPcs,
      estimasiBiayaBibit: rec.estimasiBiayaBibit,
      estimasiBiayaKemasan: rec.estimasiBiayaKemasan,
      estimasiPengeluaranOperasional: rec.estimasiPengeluaranOperasional,
      catatanEvaluasi: rec.catatanEvaluasi,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const branch = branches.find((b) => b.idCabang === formData.idCabang);
    const namaCabang = branch?.namaCabang || formData.idCabang;

    const hppTotal = Number(formData.estimasiBiayaBibit) + Number(formData.estimasiBiayaKemasan);
    const labaKotor = Number(formData.totalHargaJualBibit) - hppTotal;
    const labaBersih = labaKotor - Number(formData.estimasiPengeluaranOperasional);

    onUpsertFinancial({
      id: editingRecord?.id || `FIN-${formData.idCabang}-${currentMonth}`,
      bulan: currentMonth,
      idCabang: formData.idCabang,
      namaCabang,
      totalKeluarBibitMl: Number(formData.totalKeluarBibitMl),
      totalHargaJualBibit: Number(formData.totalHargaJualBibit),
      totalKemasanKeluarPcs: Number(formData.totalKemasanKeluarPcs),
      estimasiBiayaBibit: Number(formData.estimasiBiayaBibit),
      estimasiBiayaKemasan: Number(formData.estimasiBiayaKemasan),
      estimasiPengeluaranOperasional: Number(formData.estimasiPengeluaranOperasional),
      estimasiLabaKotor: labaKotor,
      estimasiLabaBersih: labaBersih,
      catatanEvaluasi: formData.catatanEvaluasi,
    });
    setIsModalOpen(false);
  };

  const handleExportExcel = () => {
    const data = filteredRecords.map((f) => ({
      Bulan: f.bulan,
      'ID Cabang': f.idCabang,
      'Nama Cabang': f.namaCabang,
      'Total Keluar Bibit (ml)': f.totalKeluarBibitMl,
      'Total Harga Jual Bibit (Rp)': f.totalHargaJualBibit,
      'Kemasan Keluar (pcs)': f.totalKemasanKeluarPcs,
      'Estimasi HPP Bibit': f.estimasiBiayaBibit,
      'Estimasi HPP Kemasan': f.estimasiBiayaKemasan,
      'Biaya Operasional Toko': f.estimasiPengeluaranOperasional,
      'Estimasi Laba Bersih': f.estimasiLabaBersih,
      'Catatan Evaluasi': f.catatanEvaluasi,
    }));
    exportToExcel(data, `V91_Analisis_Finansial_Toko_${currentMonth}`, 'Analisis Finansial');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-lime-50 text-lime-700 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              Analisis Pemasukan &amp; Pengeluaran Toko
            </h2>
            <span className="text-xs font-mono font-bold bg-lime-100 text-lime-800 px-2.5 py-0.5 rounded-full">
              {currentMonth}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data rekapitulasi 1 bulan: Total volume keluar bibit (ml), Total omset penjualan bibit, biaya operasional, dan laba toko per cabang.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <FileDown className="w-4 h-4" />
            <span>Ekspor Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-xs font-semibold uppercase block">Total Omset Penjualan</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            Rp {totalOmset.toLocaleString('id-ID')}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Pemasukan penjualan bibit 1 bulan</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-xs font-semibold uppercase block">Total Volume Bibit Keluar</span>
          <h3 className="text-2xl font-black text-indigo-700 font-mono mt-1">
            {totalVolumeMl.toLocaleString('id-ID')} ml
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Volume terjual selama 1 bulan</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-xs font-semibold uppercase block">Biaya Operasional Toko</span>
          <h3 className="text-2xl font-black text-slate-800 mt-1">
            Rp {totalBiayaOperasional.toLocaleString('id-ID')}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Gaji, utilitas, sewa cabang</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-xs font-semibold uppercase block">Estimasi Laba Bersih</span>
          <h3 className="text-2xl font-black text-emerald-700 mt-1">
            Rp {totalLabaBersih.toLocaleString('id-ID')}
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Margin Bersih: {totalOmset > 0 ? ((totalLabaBersih / totalOmset) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari cabang..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
          <span className="text-xs font-mono text-slate-500">
            {filteredRecords.length} Cabang Terdata
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Bulan</th>
                <th className="py-3.5 px-4">ID Cabang</th>
                <th className="py-3.5 px-4">Nama Cabang</th>
                <th className="py-3.5 px-4 text-right">Total Keluar (ml)</th>
                <th className="py-3.5 px-4 text-right">Kemasan (pcs)</th>
                <th className="py-3.5 px-4 text-right font-black">Total Omset (Rp)</th>
                <th className="py-3.5 px-4 text-right">Biaya Operasional</th>
                <th className="py-3.5 px-4 text-right font-black text-emerald-800">Laba Bersih</th>
                <th className="py-3.5 px-4">Catatan Evaluasi Toko</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-600">{item.bulan}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{item.idCabang}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{item.namaCabang}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-cyan-800">
                    {item.totalKeluarBibitMl.toLocaleString('id-ID')} ml
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-amber-800">
                    {item.totalKemasanKeluarPcs} pcs
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 text-sm">
                    Rp {item.totalHargaJualBibit.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                    Rp {item.estimasiPengeluaranOperasional.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-700 text-sm">
                    Rp {item.estimasiLabaBersih.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={item.catatanEvaluasi}>
                    {item.catatanEvaluasi || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      title="Edit Biaya / Analisis"
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Belum ada data finansial untuk periode/cabang ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-lime-400" />
                <span>Edit Analisis Finansial Cabang</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Cabang</label>
                <select
                  value={formData.idCabang}
                  onChange={(e) => setFormData({ ...formData, idCabang: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                >
                  {branches.map((b) => (
                    <option key={b.idCabang} value={b.idCabang}>
                      {b.idCabang} - {b.namaCabang}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Total Keluar (ml) 1 Bulan</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.totalKeluarBibitMl}
                    onChange={(e) => setFormData({ ...formData, totalKeluarBibitMl: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Total Omset Penjualan (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.totalHargaJualBibit}
                    onChange={(e) => setFormData({ ...formData, totalHargaJualBibit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kemasan Keluar (pcs)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalKemasanKeluarPcs}
                    onChange={(e) => setFormData({ ...formData, totalKemasanKeluarPcs: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Biaya Operasional Toko (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estimasiPengeluaranOperasional}
                    onChange={(e) => setFormData({ ...formData, estimasiPengeluaranOperasional: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                    placeholder="Sewa, listrik, gaji..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Estimasi HPP Bibit (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estimasiBiayaBibit}
                    onChange={(e) => setFormData({ ...formData, estimasiBiayaBibit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Estimasi HPP Kemasan (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estimasiBiayaKemasan}
                    onChange={(e) => setFormData({ ...formData, estimasiBiayaKemasan: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Catatan Evaluasi Toko</label>
                <textarea
                  rows={3}
                  value={formData.catatanEvaluasi}
                  onChange={(e) => setFormData({ ...formData, catatanEvaluasi: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  placeholder="Catatan pimpinan terhadap efisiensi toko..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Analisis</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
