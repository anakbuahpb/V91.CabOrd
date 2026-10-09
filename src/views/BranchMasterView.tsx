import React, { useState, useRef, useEffect } from 'react';
import { BranchMaster, UserAccount } from '../types';
import {
  Building2,
  Search,
  Plus,
  Edit2,
  Trash2,
  FileDown,
  Printer,
  X,
  Check,
  Eye,
  ArrowLeft,
  Copy,
} from 'lucide-react';
import { exportBranchesToPdf, exportBatchSlipPdf } from '../services/pdfExport';
import { exportToExcel } from '../services/excelService';
import { ConfirmModal } from '../components/ConfirmModal';

interface BranchMasterViewProps {
  branches: BranchMaster[];
  onAddBranch: (branch: Omit<BranchMaster, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateBranch: (id: string, updates: Partial<BranchMaster>) => void;
  onDeleteBranch: (id: string) => void;
  currentUser: UserAccount;
}

interface DraftBranchRow {
  tempId: string;
  idCabang: string;
  namaCabang: string;
  kodeBarangUtama: string;
  jenisBarang: string;
  namaBarangUtama: string;
  kategori: string;
  keteranganAnalisisKemarin: string;
  alamat: string;
  penanggungJawab: string;
  telepon: string;
}

export const BranchMasterView: React.FC<BranchMasterViewProps> = ({
  branches,
  onAddBranch,
  onUpdateBranch,
  onDeleteBranch,
  currentUser,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Batch Add Modal
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'FORM' | 'VIEW'>('FORM');
  const [draftRows, setDraftRows] = useState<DraftBranchRow[]>([]);

  // Confirmation Popup State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [shouldPrintPdf, setShouldPrintPdf] = useState(false);

  // Single Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchMaster | null>(null);
  const [editFormData, setEditFormData] = useState({
    idCabang: '',
    namaCabang: '',
    kodeBarangUtama: '',
    jenisBarang: 'Bibit Minyak Wangi & Botol Mewah',
    namaBarangUtama: '',
    kategori: 'Oriental Floral Luxury',
    keteranganAnalisisKemarin: '',
    alamat: '',
    penanggungJawab: '',
    telepon: '',
  });

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isBatchModalOpen && modalStep === 'FORM') {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isBatchModalOpen, modalStep]);

  const categories = Array.from(new Set(branches.map((b) => b.kategori))).filter(Boolean);

  const filteredBranches = branches.filter((b) => {
    const matchesSearch =
      b.namaCabang.toLowerCase().includes(search.toLowerCase()) ||
      b.idCabang.toLowerCase().includes(search.toLowerCase()) ||
      b.namaBarangUtama.toLowerCase().includes(search.toLowerCase()) ||
      b.kategori.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || b.kategori === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setDraftRows([
      {
        tempId: `draft-br-${Date.now()}-1`,
        idCabang: `CAB-${String(branches.length + 1).padStart(2, '0')}`,
        namaCabang: '',
        kodeBarangUtama: 'BBT-001',
        jenisBarang: 'Bibit Minyak Wangi & Botol Mewah',
        namaBarangUtama: '',
        kategori: 'Oriental Floral Luxury',
        keteranganAnalisisKemarin: 'Permintaan stabil, pasokan aman',
        alamat: '',
        penanggungJawab: '',
        telepon: '',
      },
    ]);
    setModalStep('FORM');
    setIsConfirmOpen(false);
    setIsBatchModalOpen(true);
  };

  const handleAddRow = () => {
    const nextNum = branches.length + draftRows.length + 1;
    setDraftRows((prev) => [
      ...prev,
      {
        tempId: `draft-br-${Date.now()}-${prev.length + 1}`,
        idCabang: `CAB-${String(nextNum).padStart(2, '0')}`,
        namaCabang: '',
        kodeBarangUtama: 'BBT-003',
        jenisBarang: 'Bibit Minyak Wangi & Botol Spray',
        namaBarangUtama: '',
        kategori: 'Woody Spicy Fresh',
        keteranganAnalisisKemarin: 'Tren varian fresh mendominasi',
        alamat: '',
        penanggungJawab: '',
        telepon: '',
      },
    ]);
  };

  const handleRemoveRow = (tempId: string) => {
    if (draftRows.length === 1) {
      alert('Minimal harus ada 1 baris cabang.');
      return;
    }
    setDraftRows((prev) => prev.filter((r) => r.tempId !== tempId));
  };

  const handleDuplicateRow = (row: DraftBranchRow) => {
    const nextNum = branches.length + draftRows.length + 1;
    setDraftRows((prev) => [
      ...prev,
      {
        ...row,
        tempId: `draft-br-${Date.now()}-${prev.length + 1}`,
        idCabang: `CAB-${String(nextNum).padStart(2, '0')}`,
      },
    ]);
  };

  const handleUpdateDraftField = (tempId: string, field: keyof DraftBranchRow, value: any) => {
    setDraftRows((prev) =>
      prev.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r))
    );
  };

  const handleGoToView = (e: React.FormEvent) => {
    e.preventDefault();
    for (let i = 0; i < draftRows.length; i++) {
      const r = draftRows[i];
      if (!r.namaCabang.trim()) {
        alert(`Mohon lengkapi Nama Cabang pada baris ke-${i + 1}`);
        return;
      }
    }
    setModalStep('VIEW');
  };

  const handlePromptConfirm = () => {
    setIsConfirmOpen(true);
  };

  const handleExecuteSave = () => {
    draftRows.forEach((row) => {
      onAddBranch({
        idCabang: row.idCabang,
        namaCabang: row.namaCabang,
        kodeBarangUtama: row.kodeBarangUtama,
        jenisBarang: row.jenisBarang,
        namaBarangUtama: row.namaBarangUtama,
        kategori: row.kategori,
        keteranganAnalisisKemarin: row.keteranganAnalisisKemarin,
        alamat: row.alamat,
        penanggungJawab: row.penanggungJawab,
        telepon: row.telepon,
      });
    });

    if (shouldPrintPdf) {
      const headers = ['ID Cabang', 'Nama Cabang', 'Kode Barang', 'Barang Utama', 'Kategori', 'PIC'];
      const rows = draftRows.map((r) => [
        r.idCabang,
        r.namaCabang,
        r.kodeBarangUtama,
        r.namaBarangUtama,
        r.kategori,
        r.penanggungJawab || '-',
      ]);
      exportBatchSlipPdf(
        'Bukti Registrasi Database Cabang',
        `Pusat V91.CabORD | Total ${draftRows.length} Cabang Baru`,
        'Pusat Operasional V91',
        currentUser.fullName,
        headers,
        rows
      );
    }

    setIsConfirmOpen(false);
    setIsBatchModalOpen(false);
    setDraftRows([]);
  };

  const handleOpenEdit = (branch: BranchMaster) => {
    setEditingBranch(branch);
    setEditFormData({
      idCabang: branch.idCabang,
      namaCabang: branch.namaCabang,
      kodeBarangUtama: branch.kodeBarangUtama,
      jenisBarang: branch.jenisBarang,
      namaBarangUtama: branch.namaBarangUtama,
      kategori: branch.kategori,
      keteranganAnalisisKemarin: branch.keteranganAnalisisKemarin,
      alamat: branch.alamat || '',
      penanggungJawab: branch.penanggungJawab || '',
      telepon: branch.telepon || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;
    onUpdateBranch(editingBranch.id, editFormData);
    setIsEditModalOpen(false);
  };

  const handleDelete = (b: BranchMaster) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data cabang ${b.namaCabang} (${b.idCabang})?`)) {
      onDeleteBranch(b.id);
    }
  };

  const handleExportPdf = () => {
    exportBranchesToPdf(filteredBranches);
  };

  const handleExportExcel = () => {
    const data = filteredBranches.map((b) => ({
      'ID Cabang': b.idCabang,
      'Nama Cabang': b.namaCabang,
      'Kode Barang': b.kodeBarangUtama,
      'Jenis Barang': b.jenisBarang,
      'Nama Barang': b.namaBarangUtama,
      Kategori: b.kategori,
      'Keterangan Analisis Bulan Kemarin': b.keteranganAnalisisKemarin,
      Alamat: b.alamat || '',
      'Penanggung Jawab': b.penanggungJawab || '',
      Telepon: b.telepon || '',
    }));
    exportToExcel(data, 'V91_Database_Master_Cabang', 'Master Cabang');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              Database Cabang (Master Cabang)
            </h2>
            <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              {branches.length} Cabang
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data profil cabang, kode barang utama, jenis &amp; kategori barang, serta catatan analisis bulan kemarin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPdf}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span>Cetak PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Excel</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Cabang (Bisa Multi Cabang)</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari ID, nama cabang, atau produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-text"
          />
        </div>

        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Table view */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">ID Cabang</th>
                <th className="py-3.5 px-4">Nama Cabang</th>
                <th className="py-3.5 px-4">Kode Barang</th>
                <th className="py-3.5 px-4">Jenis Barang</th>
                <th className="py-3.5 px-4">Nama Barang Utama</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Keterangan Analisis Bulan Kemarin</th>
                <th className="py-3.5 px-4">PIC / Kontak</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBranches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{b.idCabang}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">{b.namaCabang}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 font-semibold">{b.kodeBarangUtama}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{b.jenisBarang}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-800">{b.namaBarangUtama}</td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px]">
                      {b.kategori}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                    <p className="line-clamp-2" title={b.keteranganAnalisisKemarin}>
                      {b.keteranganAnalisisKemarin}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    <div>{b.penanggungJawab || '-'}</div>
                    <div className="text-slate-400 font-mono">{b.telepon || '-'}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        title="Edit Cabang"
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(b)}
                        title="Hapus Cabang"
                        className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBranches.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Tidak ada data cabang yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MULTI-ITEM BATCH ADD MODAL with VIEW & CONFIRMATION */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">
                    {modalStep === 'FORM'
                      ? 'Tambah Cabang Baru (Bisa Multi Cabang)'
                      : 'Pratinjau Data Cabang Sebelum Disimpan'}
                  </h3>
                  <p className="text-xs text-emerald-200">
                    {modalStep === 'FORM'
                      ? `Lengkapi isian data cabang (${draftRows.length} cabang). Anda dapat menambah baris cabang.`
                      : `Periksa kembali ${draftRows.length} cabang sebelum konfirmasi simpan.`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalStep === 'FORM' ? (
              <form onSubmit={handleGoToView} className="flex-1 overflow-y-auto p-6 space-y-6 modal-scroll pb-24">
                <div className="space-y-4">
                  {draftRows.map((row, index) => (
                    <div
                      key={row.tempId}
                      className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative hover:border-emerald-300 transition-all shadow-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md font-mono">
                          Cabang #{index + 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDuplicateRow(row)}
                            title="Duplikat baris ini"
                            className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-white rounded-md cursor-pointer"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          {draftRows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(row.tempId)}
                              title="Hapus baris ini"
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">ID Cabang</label>
                          <input
                            type="text"
                            required
                            value={row.idCabang}
                            onChange={(e) => handleUpdateDraftField(row.tempId, 'idCabang', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-bold cursor-text"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Nama Cabang</label>
                          <input
                            ref={index === 0 ? firstInputRef : undefined}
                            type="text"
                            required
                            value={row.namaCabang}
                            onChange={(e) => handleUpdateDraftField(row.tempId, 'namaCabang', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold cursor-text"
                            placeholder="V91 Cabang..."
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Kode Barang</label>
                          <input
                            type="text"
                            required
                            value={row.kodeBarangUtama}
                            onChange={(e) => handleUpdateDraftField(row.tempId, 'kodeBarangUtama', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono cursor-text"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Jenis Barang</label>
                          <input
                            type="text"
                            required
                            value={row.jenisBarang}
                            onChange={(e) => handleUpdateDraftField(row.tempId, 'jenisBarang', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 cursor-text"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Nama Barang Utama</label>
                          <input
                            type="text"
                            required
                            value={row.namaBarangUtama}
                            onChange={(e) => handleUpdateDraftField(row.tempId, 'namaBarangUtama', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold cursor-text"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Kategori</label>
                          <input
                            type="text"
                            required
                            value={row.kategori}
                            onChange={(e) => handleUpdateDraftField(row.tempId, 'kategori', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 cursor-text"
                          />
                        </div>
                      </div>

                      <div className="text-xs">
                        <label className="font-semibold text-slate-700 block mb-1">
                          Keterangan dalam Analisis Bulan Kemarin
                        </label>
                        <input
                          type="text"
                          required
                          value={row.keteranganAnalisisKemarin}
                          onChange={(e) => handleUpdateDraftField(row.tempId, 'keteranganAnalisisKemarin', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 cursor-text"
                          placeholder="Catatan analisis performa atau evaluasi bulan kemarin..."
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">PIC Cabang</label>
                          <input
                            type="text"
                            value={row.penanggungJawab}
                            onChange={(e) => handleUpdateDraftField(row.tempId, 'penanggungJawab', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 cursor-text"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">No. Kontak</label>
                          <input
                            type="text"
                            value={row.telepon}
                            onChange={(e) => handleUpdateDraftField(row.tempId, 'telepon', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 cursor-text"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Alamat Cabang</label>
                          <input
                            type="text"
                            value={row.alamat}
                            onChange={(e) => handleUpdateDraftField(row.tempId, 'alamat', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 cursor-text"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddRow}
                  className="w-full py-3 border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Baris Cabang Lagi (Add Barang/Cabang)</span>
                </button>

                <div className="pt-4 border-t border-slate-200 flex justify-between items-center sticky bottom-0 bg-white p-4 -mx-6 -mb-6 shadow-md">
                  <span className="text-xs font-semibold text-slate-500">
                    Total: <strong>{draftRows.length} cabang</strong> siap diproses
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsBatchModalOpen(false)}
                      className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Pratinjau / View Data ({draftRows.length})</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* VIEW / PREVIEW DATA */
              <div className="flex-1 overflow-y-auto p-6 space-y-5 modal-scroll">
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm">
                      Pratinjau {draftRows.length} Cabang Baru
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Periksa rincian data cabang sebelum disimpan ke master database.
                    </p>
                  </div>
                  <button
                    onClick={() => setModalStep('FORM')}
                    className="px-3.5 py-1.5 border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Ubah / Edit Kembali</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">No</th>
                        <th className="py-2.5 px-3">ID Cabang</th>
                        <th className="py-2.5 px-3">Nama Cabang</th>
                        <th className="py-2.5 px-3">Kode</th>
                        <th className="py-2.5 px-3">Barang Utama</th>
                        <th className="py-2.5 px-3">Kategori</th>
                        <th className="py-2.5 px-3">Analisis Kemarin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {draftRows.map((r, idx) => (
                        <tr key={r.tempId} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{r.idCabang}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{r.namaCabang}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{r.kodeBarangUtama}</td>
                          <td className="py-2.5 px-3 font-semibold text-emerald-800">{r.namaBarangUtama}</td>
                          <td className="py-2.5 px-3 text-slate-600">{r.kategori}</td>
                          <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">{r.keteranganAnalisisKemarin}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                  <button
                    onClick={() => setModalStep('FORM')}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali Edit</span>
                  </button>

                  <button
                    onClick={handlePromptConfirm}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Lanjutkan Simpan Data ({draftRows.length})</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONFIRMATION POPUP ("Lanjut atau Cek") */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Konfirmasi Pendaftaran Cabang"
        moduleName="Database Master Cabang"
        itemCount={draftRows.length}
        previewSummary={
          <div className="space-y-1">
            {draftRows.map((r, i) => (
              <div key={r.tempId} className="flex justify-between items-center text-[11px] text-slate-700 py-1 border-b border-slate-200/60 last:border-0">
                <span>
                  <strong>#{i + 1} {r.namaCabang}</strong> ({r.idCabang})
                </span>
                <span className="font-mono text-emerald-700 font-semibold">
                  {r.namaBarangUtama}
                </span>
              </div>
            ))}
          </div>
        }
        shouldPrintPdf={shouldPrintPdf}
        onTogglePrintPdf={setShouldPrintPdf}
        onReviewBack={() => setIsConfirmOpen(false)}
        onProceedSave={handleExecuteSave}
      />

      {/* Single Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Edit Data Cabang</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs max-h-[85vh] overflow-y-auto modal-scroll">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ID Cabang</label>
                  <input
                    type="text"
                    required
                    value={editFormData.idCabang}
                    onChange={(e) => setEditFormData({ ...editFormData, idCabang: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-bold cursor-text"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Cabang</label>
                  <input
                    type="text"
                    required
                    value={editFormData.namaCabang}
                    onChange={(e) => setEditFormData({ ...editFormData, namaCabang: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold cursor-text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kode Barang</label>
                  <input
                    type="text"
                    required
                    value={editFormData.kodeBarangUtama}
                    onChange={(e) => setEditFormData({ ...editFormData, kodeBarangUtama: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono cursor-text"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jenis Barang</label>
                  <input
                    type="text"
                    required
                    value={editFormData.jenisBarang}
                    onChange={(e) => setEditFormData({ ...editFormData, jenisBarang: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 cursor-text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Barang Utama</label>
                  <input
                    type="text"
                    required
                    value={editFormData.namaBarangUtama}
                    onChange={(e) => setEditFormData({ ...editFormData, namaBarangUtama: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold cursor-text"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kategori</label>
                  <input
                    type="text"
                    required
                    value={editFormData.kategori}
                    onChange={(e) => setEditFormData({ ...editFormData, kategori: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 cursor-text"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Keterangan dalam Analisis Bulan Kemarin
                </label>
                <textarea
                  rows={3}
                  required
                  value={editFormData.keteranganAnalisisKemarin}
                  onChange={(e) => setEditFormData({ ...editFormData, keteranganAnalisisKemarin: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 cursor-text"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
