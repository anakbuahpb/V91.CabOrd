import React, { useState, useRef, useEffect } from 'react';
import {
  DatabaseBulanBibitItem,
  BranchMaster,
  ThresholdConfig,
  StatusEvaluasi,
  UserAccount,
} from '../types';
import {
  Droplet,
  Search,
  Plus,
  Edit2,
  Trash2,
  FileDown,
  Printer,
  Sliders,
  Calendar,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  X,
  Check,
  Eye,
  ArrowLeft,
  Copy,
} from 'lucide-react';
import { exportBibitMonthlyToPdf, exportBatchSlipPdf } from '../services/pdfExport';
import { exportToExcel } from '../services/excelService';
import { ConfirmModal } from '../components/ConfirmModal';

interface BibitMonthlyViewProps {
  currentMonth: string;
  selectedBranchId: string;
  branches: BranchMaster[];
  bibitList: DatabaseBulanBibitItem[];
  thresholds: ThresholdConfig;
  onOpenThresholdModal: () => void;
  onOpenNewMonthModal: () => void;
  onAddItem: (item: Omit<DatabaseBulanBibitItem, 'id' | 'sisaMl' | 'selisihMl' | 'status' | 'updatedAt'>) => void;
  onUpdateItem: (id: string, updates: Partial<DatabaseBulanBibitItem>) => void;
  onDeleteItem: (id: string) => void;
  currentUser: UserAccount;
}

interface DraftBibitRow {
  tempId: string;
  idCabang: string;
  kodeBibit: string;
  namaBibit: string;
  kategori: string;
  stokAwalMl: number;
  masukMl: number;
  keluarMl: number;
  catatan: string;
}

export const BibitMonthlyView: React.FC<BibitMonthlyViewProps> = ({
  currentMonth,
  selectedBranchId,
  branches,
  bibitList,
  thresholds,
  onOpenThresholdModal,
  onOpenNewMonthModal,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  currentUser,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | StatusEvaluasi>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modal State for Batch Add
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'FORM' | 'VIEW'>('FORM');
  const [draftRows, setDraftRows] = useState<DraftBibitRow[]>([]);

  // Confirmation Popup State ("Lanjut atau Cek")
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [shouldPrintPdf, setShouldPrintPdf] = useState(true);

  // Edit Single Item Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DatabaseBulanBibitItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    idCabang: '',
    kodeBibit: '',
    namaBibit: '',
    kategori: '',
    stokAwalMl: 0,
    masukMl: 0,
    keluarMl: 0,
    catatan: '',
  });

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isBatchModalOpen && modalStep === 'FORM') {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [isBatchModalOpen, modalStep]);

  const categories = Array.from(new Set(bibitList.map((b) => b.kategori))).filter(Boolean);

  const filteredItems = bibitList.filter((item) => {
    const matchesSearch =
      item.namaBibit.toLowerCase().includes(search.toLowerCase()) ||
      item.kodeBibit.toLowerCase().includes(search.toLowerCase()) ||
      item.namaCabang.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || item.kategori === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Open Multi-Item Batch Add
  const handleOpenAdd = () => {
    const defaultBranch = selectedBranchId !== 'ALL' ? selectedBranchId : branches[0]?.idCabang || 'CAB-01';
    setDraftRows([
      {
        tempId: `draft-${Date.now()}-1`,
        idCabang: defaultBranch,
        kodeBibit: `BBT-${String(bibitList.length + 1).padStart(3, '0')}`,
        namaBibit: '',
        kategori: 'Oriental Floral',
        stokAwalMl: 0,
        masukMl: 1000,
        keluarMl: 0,
        catatan: '',
      },
    ]);
    setModalStep('FORM');
    setIsConfirmOpen(false);
    setIsBatchModalOpen(true);
  };

  // Add another item row in batch
  const handleAddRow = () => {
    const defaultBranch = selectedBranchId !== 'ALL' ? selectedBranchId : branches[0]?.idCabang || 'CAB-01';
    const nextNum = bibitList.length + draftRows.length + 1;
    setDraftRows((prev) => [
      ...prev,
      {
        tempId: `draft-${Date.now()}-${prev.length + 1}`,
        idCabang: defaultBranch,
        kodeBibit: `BBT-${String(nextNum).padStart(3, '0')}`,
        namaBibit: '',
        kategori: 'Woody Spicy',
        stokAwalMl: 0,
        masukMl: 1000,
        keluarMl: 0,
        catatan: '',
      },
    ]);
  };

  // Remove a row from batch
  const handleRemoveRow = (tempId: string) => {
    if (draftRows.length === 1) {
      alert('Minimal harus ada 1 baris barang dalam form tambah.');
      return;
    }
    setDraftRows((prev) => prev.filter((r) => r.tempId !== tempId));
  };

  // Duplicate row
  const handleDuplicateRow = (row: DraftBibitRow) => {
    setDraftRows((prev) => [
      ...prev,
      {
        ...row,
        tempId: `draft-${Date.now()}-${prev.length + 1}`,
        kodeBibit: `BBT-${String(bibitList.length + prev.length + 1).padStart(3, '0')}`,
      },
    ]);
  };

  // Update specific field in a draft row
  const handleUpdateDraftField = (tempId: string, field: keyof DraftBibitRow, value: any) => {
    setDraftRows((prev) =>
      prev.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r))
    );
  };

  // Proceed from Form to View (Pratinjau)
  const handleGoToView = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate rows
    for (let i = 0; i < draftRows.length; i++) {
      const r = draftRows[i];
      if (!r.namaBibit.trim()) {
        alert(`Mohon lengkapi Nama Bibit pada baris ke-${i + 1}`);
        return;
      }
    }
    setModalStep('VIEW');
  };

  // Click Simpan from View -> Opens Confirm Modal ("Lanjut atau Cek")
  const handlePromptConfirm = () => {
    setIsConfirmOpen(true);
  };

  // Final Save Execution after Confirm
  const handleExecuteSave = () => {
    draftRows.forEach((row) => {
      const branch = branches.find((b) => b.idCabang === row.idCabang);
      const namaCabang = branch?.namaCabang || row.idCabang;

      onAddItem({
        bulan: currentMonth,
        idCabang: row.idCabang,
        namaCabang,
        kodeBibit: row.kodeBibit,
        namaBibit: row.namaBibit,
        kategori: row.kategori,
        stokAwalMl: Number(row.stokAwalMl),
        masukMl: Number(row.masukMl),
        keluarMl: Number(row.keluarMl),
        catatan: row.catatan,
      });
    });

    // If PDF option was enabled, generate official receipt slip
    if (shouldPrintPdf) {
      const branchObj = branches.find((b) => b.idCabang === draftRows[0]?.idCabang);
      const branchName = branchObj?.namaCabang || draftRows[0]?.idCabang || 'Cabang V91';
      const headers = ['Kode', 'Nama Bibit', 'Kategori', 'Awal', 'Masuk', 'Keluar', 'Sisa (ml)', 'Status'];
      const rows = draftRows.map((r) => {
        const sisa = Number(r.stokAwalMl) + Number(r.masukMl) - Number(r.keluarMl);
        const selisih = Number(r.keluarMl) - Number(r.masukMl);
        let status = 'AMAN';
        if (sisa < 0) status = 'DANGER';
        else if (selisih > thresholds.thresholdBibitMl) status = 'TIDAK AMAN';
        return [r.kodeBibit, r.namaBibit, r.kategori, r.stokAwalMl, r.masukMl, r.keluarMl, `${sisa} ml`, status];
      });

      exportBatchSlipPdf(
        'Bukti Penambahan Database Bulan Bibit',
        `Periode Evaluasi: ${currentMonth} | Total ${draftRows.length} Bibit`,
        branchName,
        currentUser.fullName,
        headers,
        rows,
        `Total Item Berhasil Disimpan: ${draftRows.length} Bibit Parfum`
      );
    }

    setIsConfirmOpen(false);
    setIsBatchModalOpen(false);
    setDraftRows([]);
  };

  // Single Item Edit
  const handleOpenEdit = (item: DatabaseBulanBibitItem) => {
    setEditingItem(item);
    setEditFormData({
      idCabang: item.idCabang,
      kodeBibit: item.kodeBibit,
      namaBibit: item.namaBibit,
      kategori: item.kategori,
      stokAwalMl: item.stokAwalMl,
      masukMl: item.masukMl,
      keluarMl: item.keluarMl,
      catatan: item.catatan || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const branch = branches.find((b) => b.idCabang === editFormData.idCabang);
    const namaCabang = branch?.namaCabang || editFormData.idCabang;

    onUpdateItem(editingItem.id, {
      idCabang: editFormData.idCabang,
      namaCabang,
      kodeBibit: editFormData.kodeBibit,
      namaBibit: editFormData.namaBibit,
      kategori: editFormData.kategori,
      stokAwalMl: Number(editFormData.stokAwalMl),
      masukMl: Number(editFormData.masukMl),
      keluarMl: Number(editFormData.keluarMl),
      catatan: editFormData.catatan,
    });
    setIsEditModalOpen(false);
  };

  const handleDelete = (item: DatabaseBulanBibitItem) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data bibit ${item.namaBibit} (${item.kodeBibit})?`)) {
      onDeleteItem(item.id);
    }
  };

  const handleExportPdf = () => {
    const branchName = selectedBranchId !== 'ALL'
      ? branches.find((b) => b.idCabang === selectedBranchId)?.namaCabang
      : undefined;
    exportBibitMonthlyToPdf(filteredItems, currentMonth, thresholds.thresholdBibitMl, branchName);
  };

  const handleExportExcel = () => {
    const data = filteredItems.map((item) => ({
      Bulan: item.bulan,
      'ID Cabang': item.idCabang,
      'Nama Cabang': item.namaCabang,
      'Kode Bibit': item.kodeBibit,
      'Nama Bibit': item.namaBibit,
      Kategori: item.kategori,
      'Stok Awal (ml)': item.stokAwalMl,
      'Masuk (ml)': item.masukMl,
      'Keluar (ml)': item.keluarMl,
      'Sisa (ml)': item.sisaMl,
      'Selisih (ml)': item.selisihMl,
      'Status Evaluasi': item.status,
      Catatan: item.catatan || '',
    }));
    exportToExcel(data, `V91_Database_Bulan_Bibit_${currentMonth}`, 'Database Bulan Bibit');
  };

  const totalMlMasuk = filteredItems.reduce((acc, i) => acc + i.masukMl, 0);
  const totalMlKeluar = filteredItems.reduce((acc, i) => acc + i.keluarMl, 0);
  const totalMlSisa = filteredItems.reduce((acc, i) => acc + i.sisaMl, 0);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Droplet className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              Database Bulan Bibit
            </h2>
            <span className="text-xs font-mono font-bold bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">
              {currentMonth}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Penilaian selisih &gt;{thresholds.thresholdBibitMl} ml (bisa dirubah kapanpun) lebih banyak dari masuk = <strong>TIDAK AMAN</strong>. Jika sisa minus = <strong>DANGER</strong>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenThresholdModal}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Batas: &gt;{thresholds.thresholdBibitMl} ml</span>
          </button>

          <button
            onClick={onOpenNewMonthModal}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Lembar Bulan Baru</span>
          </button>

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
            <span>+ Tambah Data Bibit (Bisa Multi Barang)</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Mini Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-slate-400 block font-semibold">Total Item Terdaftar</span>
          <strong className="text-base text-slate-900 font-mono mt-0.5 block">{filteredItems.length} Varian</strong>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-slate-400 block font-semibold">Total Masuk (ml)</span>
          <strong className="text-base text-cyan-700 font-mono mt-0.5 block">{totalMlMasuk.toLocaleString('id-ID')} ml</strong>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-slate-400 block font-semibold">Total Keluar (ml)</span>
          <strong className="text-base text-indigo-700 font-mono mt-0.5 block">{totalMlKeluar.toLocaleString('id-ID')} ml</strong>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-slate-400 block font-semibold">Sisa Stok Total (ml)</span>
          <strong className={`text-base font-mono mt-0.5 block ${totalMlSisa < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
            {totalMlSisa.toLocaleString('id-ID')} ml
          </strong>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari kode, nama bibit, atau cabang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-text"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl text-xs">
            <span className="text-slate-400 px-2 font-semibold">Status:</span>
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setStatusFilter('AMAN')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === 'AMAN' ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Aman
            </button>
            <button
              onClick={() => setStatusFilter('TIDAK_AMAN')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === 'TIDAK_AMAN' ? 'bg-amber-600 text-white' : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              Waspada
            </button>
            <button
              onClick={() => setStatusFilter('DANGER')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === 'DANGER' ? 'bg-rose-600 text-white' : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              Danger
            </button>
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
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Cabang</th>
                <th className="py-3.5 px-4">Kode</th>
                <th className="py-3.5 px-4">Nama Bibit</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4 text-right">Stok Awal</th>
                <th className="py-3.5 px-4 text-right">Masuk/ml</th>
                <th className="py-3.5 px-4 text-right">Keluar/ml</th>
                <th className="py-3.5 px-4 text-right">Sisa/ml</th>
                <th className="py-3.5 px-4 text-right">Selisih</th>
                <th className="py-3.5 px-4 text-center">Analisis Penilaian</th>
                <th className="py-3.5 px-4">Catatan</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{item.namaCabang}</td>
                  <td className="py-3.5 px-4 font-mono text-indigo-700 font-bold">{item.kodeBibit}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{item.namaBibit}</td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px]">
                      {item.kategori}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-600">{item.stokAwalMl}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-cyan-800 font-semibold">{item.masukMl}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-800">{item.keluarMl}</td>
                  <td
                    className={`py-3.5 px-4 text-right font-mono font-black ${
                      item.sisaMl < 0 ? 'text-rose-600 bg-rose-50/80' : 'text-slate-900'
                    }`}
                  >
                    {item.sisaMl} ml
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono">
                    <span
                      className={`font-bold ${
                        item.selisihMl > thresholds.thresholdBibitMl
                          ? 'text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-sm'
                          : 'text-slate-600'
                      }`}
                    >
                      {item.selisihMl > 0 ? `+${item.selisihMl}` : item.selisihMl} ml
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        item.status === 'DANGER'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                          : item.status === 'TIDAK_AMAN'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {item.status === 'DANGER' && <AlertOctagon className="w-3 h-3 text-rose-600" />}
                      {item.status === 'TIDAK_AMAN' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                      {item.status === 'AMAN' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      <span>{item.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-[200px] truncate" title={item.catatan}>
                    {item.catatan || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Data"
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        title="Hapus Data"
                        className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    Tidak ada data bibit yang cocok dengan filter atau pencarian.
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
            {/* Top Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">
                    {modalStep === 'FORM'
                      ? 'Tambah Data Bibit (Bisa Lebih Dari 1 Barang)'
                      : 'Pratinjau Data Bibit Sebelum Disimpan'}
                  </h3>
                  <p className="text-xs text-indigo-200">
                    {modalStep === 'FORM'
                      ? `Lengkapi isian barang (${draftRows.length} item). Anda dapat menambah baris barang sesuka hati.`
                      : `Periksa kembali ${draftRows.length} item sebelum konfirmasi simpan atau cetak PDF.`}
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

            {/* STEP 1: FORM INPUT (BATCH ROWS) */}
            {modalStep === 'FORM' ? (
              <form onSubmit={handleGoToView} className="flex-1 overflow-y-auto p-6 space-y-6 modal-scroll pb-24">
                <div className="space-y-4">
                  {draftRows.map((row, index) => {
                    const sisaMl = Number(row.stokAwalMl) + Number(row.masukMl) - Number(row.keluarMl);
                    const selisihMl = Number(row.keluarMl) - Number(row.masukMl);
                    const isDanger = sisaMl < 0;
                    const isTidakAman = !isDanger && selisihMl > thresholds.thresholdBibitMl;

                    return (
                      <div
                        key={row.tempId}
                        className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative hover:border-indigo-300 transition-all shadow-xs"
                      >
                        {/* Row Header */}
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-md font-mono">
                            Barang #{index + 1}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDuplicateRow(row)}
                              title="Duplikat baris ini"
                              className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-md cursor-pointer"
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

                        {/* Fields Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Cabang</label>
                            <select
                              value={row.idCabang}
                              onChange={(e) => handleUpdateDraftField(row.tempId, 'idCabang', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold"
                            >
                              {branches.map((b) => (
                                <option key={b.idCabang} value={b.idCabang}>
                                  {b.idCabang} - {b.namaCabang}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Kode Bibit</label>
                            <input
                              type="text"
                              required
                              value={row.kodeBibit}
                              onChange={(e) => handleUpdateDraftField(row.tempId, 'kodeBibit', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-bold cursor-text"
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
                              placeholder="Oriental, Woody..."
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                          <div className="sm:col-span-2">
                            <label className="font-semibold text-slate-700 block mb-1">Nama Bibit Wangi</label>
                            <input
                              ref={index === 0 ? firstInputRef : undefined}
                              type="text"
                              required
                              value={row.namaBibit}
                              onChange={(e) => handleUpdateDraftField(row.tempId, 'namaBibit', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold cursor-text"
                              placeholder="Contoh: Baccarat Rouge 540 Extra"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Stok Awal (ml)</label>
                            <input
                              type="number"
                              min="0"
                              value={row.stokAwalMl}
                              onChange={(e) => handleUpdateDraftField(row.tempId, 'stokAwalMl', Number(e.target.value))}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-right cursor-text"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Masuk (ml)</label>
                            <input
                              type="number"
                              min="0"
                              value={row.masukMl}
                              onChange={(e) => handleUpdateDraftField(row.tempId, 'masukMl', Number(e.target.value))}
                              className="w-full px-3 py-2 bg-white border border-cyan-300 rounded-xl text-cyan-800 font-mono font-bold text-right cursor-text"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Keluar (ml)</label>
                            <input
                              type="number"
                              min="0"
                              value={row.keluarMl}
                              onChange={(e) => handleUpdateDraftField(row.tempId, 'keluarMl', Number(e.target.value))}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-bold text-right cursor-text"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="font-semibold text-slate-700 block mb-1">Catatan / Analisis</label>
                            <input
                              type="text"
                              value={row.catatan}
                              onChange={(e) => handleUpdateDraftField(row.tempId, 'catatan', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 cursor-text"
                              placeholder="Catatan stok atau alasan mutasi..."
                            />
                          </div>
                        </div>

                        {/* Live calculation pill */}
                        <div className="pt-2 flex items-center justify-between border-t border-slate-200/80 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">Hasil Sisa:</span>
                            <strong className={`font-mono ${isDanger ? 'text-rose-600' : 'text-slate-900'}`}>
                              {sisaMl} ml
                            </strong>
                            <span className="text-slate-400">
                              (Selisih: {selisihMl > 0 ? `+${selisihMl}` : selisihMl} ml)
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              isDanger
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : isTidakAman
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            {isDanger ? 'DANGER' : isTidakAman ? 'TIDAK AMAN' : 'AMAN'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Button Add Row */}
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="w-full py-3 border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 rounded-2xl text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Baris Barang Lagi (Add Barang)</span>
                </button>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-slate-200 flex justify-between items-center sticky bottom-0 bg-white p-4 -mx-6 -mb-6 shadow-md">
                  <span className="text-xs font-semibold text-slate-500">
                    Total: <strong>{draftRows.length} barang</strong> siap diproses
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
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Pratinjau / View Data ({draftRows.length})</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* STEP 2: VIEW / PREVIEW DATA */
              <div className="flex-1 overflow-y-auto p-6 space-y-5 modal-scroll">
                <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-indigo-950 text-sm">
                      Pratinjau {draftRows.length} Baris Data Bibit
                    </h4>
                    <p className="text-xs text-indigo-800 mt-0.5">
                      Silakan teliti ringkasan di bawah ini sebelum menyimpan atau mencetak bukti PDF.
                    </p>
                  </div>
                  <button
                    onClick={() => setModalStep('FORM')}
                    className="px-3.5 py-1.5 border border-indigo-300 bg-white hover:bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Ubah / Edit Kembali</span>
                  </button>
                </div>

                {/* Table View */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">No</th>
                        <th className="py-2.5 px-3">Cabang</th>
                        <th className="py-2.5 px-3">Kode</th>
                        <th className="py-2.5 px-3">Nama Bibit</th>
                        <th className="py-2.5 px-3">Kategori</th>
                        <th className="py-2.5 px-3 text-right">Awal</th>
                        <th className="py-2.5 px-3 text-right">Masuk</th>
                        <th className="py-2.5 px-3 text-right">Keluar</th>
                        <th className="py-2.5 px-3 text-right">Sisa (ml)</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {draftRows.map((row, idx) => {
                        const sisa = Number(row.stokAwalMl) + Number(row.masukMl) - Number(row.keluarMl);
                        const selisih = Number(row.keluarMl) - Number(row.masukMl);
                        const isDanger = sisa < 0;
                        const isTidakAman = !isDanger && selisih > thresholds.thresholdBibitMl;
                        const status = isDanger ? 'DANGER' : isTidakAman ? 'TIDAK AMAN' : 'AMAN';

                        return (
                          <tr key={row.tempId} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">{row.idCabang}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{row.kodeBibit}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{row.namaBibit}</td>
                            <td className="py-2.5 px-3 text-slate-600">{row.kategori}</td>
                            <td className="py-2.5 px-3 text-right font-mono">{row.stokAwalMl}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-cyan-800">{row.masukMl}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold">{row.keluarMl}</td>
                            <td className={`py-2.5 px-3 text-right font-mono font-black ${isDanger ? 'text-rose-600' : 'text-slate-900'}`}>
                              {sisa} ml
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                  status === 'DANGER'
                                    ? 'bg-rose-100 text-rose-800'
                                    : status === 'TIDAK AMAN'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Footer Actions */}
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
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
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
        title="Konfirmasi Penyimpanan Data Bibit"
        moduleName="Database Bulan Bibit"
        itemCount={draftRows.length}
        previewSummary={
          <div className="space-y-1">
            {draftRows.map((r, i) => (
              <div key={r.tempId} className="flex justify-between items-center text-[11px] text-slate-700 py-1 border-b border-slate-200/60 last:border-0">
                <span>
                  <strong>#{i + 1} {r.namaBibit}</strong> ({r.kodeBibit})
                </span>
                <span className="font-mono text-indigo-700 font-semibold">
                  Masuk: {r.masukMl}ml | Keluar: {r.keluarMl}ml
                </span>
              </div>
            ))}
          </div>
        }
        shouldPrintPdf={shouldPrintPdf}
        onTogglePrintPdf={setShouldPrintPdf}
        onReviewBack={() => setIsConfirmOpen(false)} // "Cek Kembali"
        onProceedSave={handleExecuteSave} // "Ya, Lanjutkan Simpan"
      />

      {/* Single Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Droplet className="w-4 h-4 text-indigo-400" />
                <span>Edit Data Bibit</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Cabang</label>
                <select
                  value={editFormData.idCabang}
                  onChange={(e) => setEditFormData({ ...editFormData, idCabang: e.target.value })}
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
                  <label className="font-semibold text-slate-700 block mb-1">Kode Bibit</label>
                  <input
                    type="text"
                    required
                    value={editFormData.kodeBibit}
                    onChange={(e) => setEditFormData({ ...editFormData, kodeBibit: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-bold cursor-text"
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
                <label className="font-semibold text-slate-700 block mb-1">Nama Bibit Wangi</label>
                <input
                  type="text"
                  required
                  value={editFormData.namaBibit}
                  onChange={(e) => setEditFormData({ ...editFormData, namaBibit: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold cursor-text"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Stok Awal (ml)</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.stokAwalMl}
                    onChange={(e) => setEditFormData({ ...editFormData, stokAwalMl: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-right cursor-text"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Masuk (ml)</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.masukMl}
                    onChange={(e) => setEditFormData({ ...editFormData, masukMl: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-right text-cyan-700 font-bold cursor-text"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Keluar (ml)</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.keluarMl}
                    onChange={(e) => setEditFormData({ ...editFormData, keluarMl: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-right text-indigo-700 font-bold cursor-text"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Catatan</label>
                <textarea
                  rows={2}
                  value={editFormData.catatan}
                  onChange={(e) => setEditFormData({ ...editFormData, catatan: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 cursor-text"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
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
