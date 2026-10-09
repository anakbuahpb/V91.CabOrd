import React, { useState, useRef, useEffect } from 'react';
import {
  DatabaseBulanKemasanItem,
  BranchMaster,
  ThresholdConfig,
  StatusEvaluasi,
  UserAccount,
} from '../types';
import {
  Package,
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
import { exportKemasanMonthlyToPdf, exportBatchSlipPdf } from '../services/pdfExport';
import { exportToExcel } from '../services/excelService';
import { ConfirmModal } from '../components/ConfirmModal';

interface KemasanMonthlyViewProps {
  currentMonth: string;
  selectedBranchId: string;
  branches: BranchMaster[];
  kemasanList: DatabaseBulanKemasanItem[];
  thresholds: ThresholdConfig;
  onOpenThresholdModal: () => void;
  onOpenNewMonthModal: () => void;
  onAddItem: (item: Omit<DatabaseBulanKemasanItem, 'id' | 'sisaPcs' | 'selisihPcs' | 'status' | 'updatedAt'>) => void;
  onUpdateItem: (id: string, updates: Partial<DatabaseBulanKemasanItem>) => void;
  onDeleteItem: (id: string) => void;
  currentUser: UserAccount;
}

interface DraftKemasanRow {
  tempId: string;
  idCabang: string;
  kodeKemasan: string;
  namaKemasan: string;
  type: string;
  stokAwalPcs: number;
  masukPcs: number;
  keluarPcs: number;
  catatan: string;
}

export const KemasanMonthlyView: React.FC<KemasanMonthlyViewProps> = ({
  currentMonth,
  selectedBranchId,
  branches,
  kemasanList,
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
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Batch Add Modal State
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'FORM' | 'VIEW'>('FORM');
  const [draftRows, setDraftRows] = useState<DraftKemasanRow[]>([]);

  // Confirmation Popup State ("Lanjut atau Cek")
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [shouldPrintPdf, setShouldPrintPdf] = useState(true);

  // Edit Single Item Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DatabaseBulanKemasanItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    idCabang: '',
    kodeKemasan: '',
    namaKemasan: '',
    type: '',
    stokAwalPcs: 0,
    masukPcs: 0,
    keluarPcs: 0,
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

  const types = Array.from(new Set(kemasanList.map((k) => k.type))).filter(Boolean);

  const filteredItems = kemasanList.filter((item) => {
    const matchesSearch =
      item.namaKemasan.toLowerCase().includes(search.toLowerCase()) ||
      item.kodeKemasan.toLowerCase().includes(search.toLowerCase()) ||
      item.namaCabang.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Open Multi-Item Batch Add
  const handleOpenAdd = () => {
    const defaultBranch = selectedBranchId !== 'ALL' ? selectedBranchId : branches[0]?.idCabang || 'CAB-01';
    setDraftRows([
      {
        tempId: `draft-kms-${Date.now()}-1`,
        idCabang: defaultBranch,
        kodeKemasan: `KMS-${String(kemasanList.length + 1).padStart(3, '0')}`,
        namaKemasan: '',
        type: 'Spray Silver',
        stokAwalPcs: 0,
        masukPcs: 200,
        keluarPcs: 0,
        catatan: '',
      },
    ]);
    setModalStep('FORM');
    setIsConfirmOpen(false);
    setIsBatchModalOpen(true);
  };

  const handleAddRow = () => {
    const defaultBranch = selectedBranchId !== 'ALL' ? selectedBranchId : branches[0]?.idCabang || 'CAB-01';
    const nextNum = kemasanList.length + draftRows.length + 1;
    setDraftRows((prev) => [
      ...prev,
      {
        tempId: `draft-kms-${Date.now()}-${prev.length + 1}`,
        idCabang: defaultBranch,
        kodeKemasan: `KMS-${String(nextNum).padStart(3, '0')}`,
        namaKemasan: '',
        type: 'Spray Gold',
        stokAwalPcs: 0,
        masukPcs: 100,
        keluarPcs: 0,
        catatan: '',
      },
    ]);
  };

  const handleRemoveRow = (tempId: string) => {
    if (draftRows.length === 1) {
      alert('Minimal harus ada 1 baris kemasan dalam form tambah.');
      return;
    }
    setDraftRows((prev) => prev.filter((r) => r.tempId !== tempId));
  };

  const handleDuplicateRow = (row: DraftKemasanRow) => {
    setDraftRows((prev) => [
      ...prev,
      {
        ...row,
        tempId: `draft-kms-${Date.now()}-${prev.length + 1}`,
        kodeKemasan: `KMS-${String(kemasanList.length + prev.length + 1).padStart(3, '0')}`,
      },
    ]);
  };

  const handleUpdateDraftField = (tempId: string, field: keyof DraftKemasanRow, value: any) => {
    setDraftRows((prev) =>
      prev.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r))
    );
  };

  const handleGoToView = (e: React.FormEvent) => {
    e.preventDefault();
    for (let i = 0; i < draftRows.length; i++) {
      const r = draftRows[i];
      if (!r.namaKemasan.trim()) {
        alert(`Mohon lengkapi Nama Kemasan pada baris ke-${i + 1}`);
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
      const branch = branches.find((b) => b.idCabang === row.idCabang);
      const namaCabang = branch?.namaCabang || row.idCabang;

      onAddItem({
        bulan: currentMonth,
        idCabang: row.idCabang,
        namaCabang,
        kodeKemasan: row.kodeKemasan,
        namaKemasan: row.namaKemasan,
        type: row.type,
        stokAwalPcs: Number(row.stokAwalPcs),
        masukPcs: Number(row.masukPcs),
        keluarPcs: Number(row.keluarPcs),
        catatan: row.catatan,
      });
    });

    if (shouldPrintPdf) {
      const branchObj = branches.find((b) => b.idCabang === draftRows[0]?.idCabang);
      const branchName = branchObj?.namaCabang || draftRows[0]?.idCabang || 'Cabang V91';
      const headers = ['Kode', 'Nama Kemasan', 'Type', 'Awal', 'Masuk', 'Keluar', 'Sisa (pcs)', 'Status'];
      const rows = draftRows.map((r) => {
        const sisa = Number(r.stokAwalPcs) + Number(r.masukPcs) - Number(r.keluarPcs);
        const selisih = Number(r.keluarPcs) - Number(r.masukPcs);
        let status = 'AMAN';
        if (sisa < 0) status = 'DANGER';
        else if (selisih > thresholds.thresholdKemasanPcs) status = 'TIDAK AMAN';
        return [r.kodeKemasan, r.namaKemasan, r.type, r.stokAwalPcs, r.masukPcs, r.keluarPcs, `${sisa} pcs`, status];
      });

      exportBatchSlipPdf(
        'Bukti Penambahan Database Bulan Kemasan',
        `Periode Evaluasi: ${currentMonth} | Total ${draftRows.length} Kemasan`,
        branchName,
        currentUser.fullName,
        headers,
        rows,
        `Total Item Berhasil Disimpan: ${draftRows.length} Kemasan Botol`
      );
    }

    setIsConfirmOpen(false);
    setIsBatchModalOpen(false);
    setDraftRows([]);
  };

  const handleOpenEdit = (item: DatabaseBulanKemasanItem) => {
    setEditingItem(item);
    setEditFormData({
      idCabang: item.idCabang,
      kodeKemasan: item.kodeKemasan,
      namaKemasan: item.namaKemasan,
      type: item.type,
      stokAwalPcs: item.stokAwalPcs,
      masukPcs: item.masukPcs,
      keluarPcs: item.keluarPcs,
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
      kodeKemasan: editFormData.kodeKemasan,
      namaKemasan: editFormData.namaKemasan,
      type: editFormData.type,
      stokAwalPcs: Number(editFormData.stokAwalPcs),
      masukPcs: Number(editFormData.masukPcs),
      keluarPcs: Number(editFormData.keluarPcs),
      catatan: editFormData.catatan,
    });
    setIsEditModalOpen(false);
  };

  const handleDelete = (item: DatabaseBulanKemasanItem) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data kemasan ${item.namaKemasan}?`)) {
      onDeleteItem(item.id);
    }
  };

  const handleExportPdf = () => {
    const branchName = selectedBranchId !== 'ALL'
      ? branches.find((b) => b.idCabang === selectedBranchId)?.namaCabang
      : undefined;
    exportKemasanMonthlyToPdf(filteredItems, currentMonth, thresholds.thresholdKemasanPcs, branchName);
  };

  const handleExportExcel = () => {
    const data = filteredItems.map((item) => ({
      Bulan: item.bulan,
      'ID Cabang': item.idCabang,
      'Nama Cabang': item.namaCabang,
      'Kode Kemasan': item.kodeKemasan,
      'Nama Kemasan': item.namaKemasan,
      Type: item.type,
      'Stok Awal (pcs)': item.stokAwalPcs,
      'Masuk (pcs)': item.masukPcs,
      'Keluar (pcs)': item.keluarPcs,
      'Sisa (pcs)': item.sisaPcs,
      'Selisih (pcs)': item.selisihPcs,
      'Status Evaluasi': item.status,
      Catatan: item.catatan || '',
    }));
    exportToExcel(data, `V91_Database_Bulan_Kemasan_${currentMonth}`, 'Database Bulan Kemasan');
  };

  const totalPcsMasuk = filteredItems.reduce((acc, i) => acc + i.masukPcs, 0);
  const totalPcsKeluar = filteredItems.reduce((acc, i) => acc + i.keluarPcs, 0);
  const totalPcsSisa = filteredItems.reduce((acc, i) => acc + i.sisaPcs, 0);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Package className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              Database Bulan Kemasan
            </h2>
            <span className="text-xs font-mono font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
              {currentMonth}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Penilaian selisih &gt;{thresholds.thresholdKemasanPcs} pcs (bisa dirubah kapanpun) lebih banyak dari masuk = <strong>TIDAK AMAN</strong>. Jika sisa minus = <strong>DANGER</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenThresholdModal}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>Batas: &gt;{thresholds.thresholdKemasanPcs} pcs</span>
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
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-amber-600/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Kemasan (Bisa Multi Barang)</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Mini Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-slate-400 block font-semibold">Total Tipe Kemasan</span>
          <strong className="text-base text-slate-900 font-mono mt-0.5 block">{filteredItems.length} Varian</strong>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-slate-400 block font-semibold">Total Masuk (pcs)</span>
          <strong className="text-base text-cyan-700 font-mono mt-0.5 block">{totalPcsMasuk.toLocaleString('id-ID')} pcs</strong>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-slate-400 block font-semibold">Total Keluar (pcs)</span>
          <strong className="text-base text-indigo-700 font-mono mt-0.5 block">{totalPcsKeluar.toLocaleString('id-ID')} pcs</strong>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-slate-400 block font-semibold">Sisa Stok Total (pcs)</span>
          <strong className={`text-base font-mono mt-0.5 block ${totalPcsSisa < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
            {totalPcsSisa.toLocaleString('id-ID')} pcs
          </strong>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari kode, nama kemasan, atau cabang..."
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

          {types.length > 0 && (
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="ALL">Semua Type</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
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
                <th className="py-3.5 px-4">Nama Kemasan</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4 text-right">Stok Awal</th>
                <th className="py-3.5 px-4 text-right">Masuk/pcs</th>
                <th className="py-3.5 px-4 text-right">Keluar/pcs</th>
                <th className="py-3.5 px-4 text-right">Sisa/pcs</th>
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
                  <td className="py-3.5 px-4 font-mono text-amber-700 font-bold">{item.kodeKemasan}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{item.namaKemasan}</td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px]">
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-600">{item.stokAwalPcs}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-cyan-800 font-semibold">{item.masukPcs}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-800">{item.keluarPcs}</td>
                  <td
                    className={`py-3.5 px-4 text-right font-mono font-black ${
                      item.sisaPcs < 0 ? 'text-rose-600 bg-rose-50/80' : 'text-slate-900'
                    }`}
                  >
                    {item.sisaPcs} pcs
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono">
                    <span
                      className={`font-bold ${
                        item.selisihPcs > thresholds.thresholdKemasanPcs
                          ? 'text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-sm'
                          : 'text-slate-600'
                      }`}
                    >
                      {item.selisihPcs > 0 ? `+${item.selisihPcs}` : item.selisihPcs} pcs
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
                    Tidak ada data kemasan yang cocok dengan filter atau pencarian.
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
            <div className="bg-gradient-to-r from-slate-900 to-amber-950 text-white px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">
                    {modalStep === 'FORM'
                      ? 'Tambah Data Kemasan (Bisa Lebih Dari 1 Barang)'
                      : 'Pratinjau Data Kemasan Sebelum Disimpan'}
                  </h3>
                  <p className="text-xs text-amber-200">
                    {modalStep === 'FORM'
                      ? `Lengkapi isian kemasan (${draftRows.length} item). Anda dapat menambah baris botol.`
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
                    const sisaPcs = Number(row.stokAwalPcs) + Number(row.masukPcs) - Number(row.keluarPcs);
                    const selisihPcs = Number(row.keluarPcs) - Number(row.masukPcs);
                    const isDanger = sisaPcs < 0;
                    const isTidakAman = !isDanger && selisihPcs > thresholds.thresholdKemasanPcs;

                    return (
                      <div
                        key={row.tempId}
                        className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative hover:border-amber-300 transition-all shadow-xs"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-md font-mono">
                            Kemasan #{index + 1}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDuplicateRow(row)}
                              title="Duplikat baris ini"
                              className="p-1 text-slate-500 hover:text-amber-600 hover:bg-white rounded-md cursor-pointer"
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
                            <label className="font-semibold text-slate-700 block mb-1">Kode Kemasan</label>
                            <input
                              type="text"
                              required
                              value={row.kodeKemasan}
                              onChange={(e) => handleUpdateDraftField(row.tempId, 'kodeKemasan', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-bold cursor-text"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Type Botol</label>
                            <input
                              type="text"
                              required
                              value={row.type}
                              onChange={(e) => handleUpdateDraftField(row.tempId, 'type', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 cursor-text"
                              placeholder="Spray Silver, Roll On..."
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                          <div className="sm:col-span-2">
                            <label className="font-semibold text-slate-700 block mb-1">Nama Kemasan</label>
                            <input
                              ref={index === 0 ? firstInputRef : undefined}
                              type="text"
                              required
                              value={row.namaKemasan}
                              onChange={(e) => handleUpdateDraftField(row.tempId, 'namaKemasan', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold cursor-text"
                              placeholder="Botol Spray Kaca Silver 30ml"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Stok Awal (pcs)</label>
                            <input
                              type="number"
                              min="0"
                              value={row.stokAwalPcs}
                              onChange={(e) => handleUpdateDraftField(row.tempId, 'stokAwalPcs', Number(e.target.value))}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-right cursor-text"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Masuk (pcs)</label>
                            <input
                              type="number"
                              min="0"
                              value={row.masukPcs}
                              onChange={(e) => handleUpdateDraftField(row.tempId, 'masukPcs', Number(e.target.value))}
                              className="w-full px-3 py-2 bg-white border border-cyan-300 rounded-xl text-cyan-800 font-mono font-bold text-right cursor-text"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Keluar (pcs)</label>
                            <input
                              type="number"
                              min="0"
                              value={row.keluarPcs}
                              onChange={(e) => handleUpdateDraftField(row.tempId, 'keluarPcs', Number(e.target.value))}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-bold text-right cursor-text"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="font-semibold text-slate-700 block mb-1">Catatan</label>
                            <input
                              type="text"
                              value={row.catatan}
                              onChange={(e) => handleUpdateDraftField(row.tempId, 'catatan', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 cursor-text"
                              placeholder="Catatan botol..."
                            />
                          </div>
                        </div>

                        {/* Live calculation pill */}
                        <div className="pt-2 flex items-center justify-between border-t border-slate-200/80 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">Hasil Sisa:</span>
                            <strong className={`font-mono ${isDanger ? 'text-rose-600' : 'text-slate-900'}`}>
                              {sisaPcs} pcs
                            </strong>
                            <span className="text-slate-400">
                              (Selisih: {selisihPcs > 0 ? `+${selisihPcs}` : selisihPcs} pcs)
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

                <button
                  type="button"
                  onClick={handleAddRow}
                  className="w-full py-3 border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50 rounded-2xl text-amber-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Baris Kemasan Lagi (Add Barang)</span>
                </button>

                <div className="pt-4 border-t border-slate-200 flex justify-between items-center sticky bottom-0 bg-white p-4 -mx-6 -mb-6 shadow-md">
                  <span className="text-xs font-semibold text-slate-500">
                    Total: <strong>{draftRows.length} kemasan</strong> siap diproses
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
                      className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md cursor-pointer"
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
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-amber-950 text-sm">
                      Pratinjau {draftRows.length} Baris Data Kemasan
                    </h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Silakan teliti ringkasan di bawah ini sebelum menyimpan atau mencetak bukti PDF.
                    </p>
                  </div>
                  <button
                    onClick={() => setModalStep('FORM')}
                    className="px-3.5 py-1.5 border border-amber-300 bg-white hover:bg-amber-50 text-amber-800 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
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
                        <th className="py-2.5 px-3">Cabang</th>
                        <th className="py-2.5 px-3">Kode</th>
                        <th className="py-2.5 px-3">Nama Kemasan</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3 text-right">Awal</th>
                        <th className="py-2.5 px-3 text-right">Masuk</th>
                        <th className="py-2.5 px-3 text-right">Keluar</th>
                        <th className="py-2.5 px-3 text-right">Sisa (pcs)</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {draftRows.map((row, idx) => {
                        const sisa = Number(row.stokAwalPcs) + Number(row.masukPcs) - Number(row.keluarPcs);
                        const selisih = Number(row.keluarPcs) - Number(row.masukPcs);
                        const isDanger = sisa < 0;
                        const isTidakAman = !isDanger && selisih > thresholds.thresholdKemasanPcs;
                        const status = isDanger ? 'DANGER' : isTidakAman ? 'TIDAK AMAN' : 'AMAN';

                        return (
                          <tr key={row.tempId} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">{row.idCabang}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-amber-700">{row.kodeKemasan}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{row.namaKemasan}</td>
                            <td className="py-2.5 px-3 text-slate-600">{row.type}</td>
                            <td className="py-2.5 px-3 text-right font-mono">{row.stokAwalPcs}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-cyan-800">{row.masukPcs}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold">{row.keluarPcs}</td>
                            <td className={`py-2.5 px-3 text-right font-mono font-black ${isDanger ? 'text-rose-600' : 'text-slate-900'}`}>
                              {sisa} pcs
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
                    className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-600/30 cursor-pointer"
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
        title="Konfirmasi Penyimpanan Data Kemasan"
        moduleName="Database Bulan Kemasan"
        itemCount={draftRows.length}
        previewSummary={
          <div className="space-y-1">
            {draftRows.map((r, i) => (
              <div key={r.tempId} className="flex justify-between items-center text-[11px] text-slate-700 py-1 border-b border-slate-200/60 last:border-0">
                <span>
                  <strong>#{i + 1} {r.namaKemasan}</strong> ({r.kodeKemasan})
                </span>
                <span className="font-mono text-amber-700 font-semibold">
                  Masuk: {r.masukPcs}pcs | Keluar: {r.keluarPcs}pcs
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
                <Package className="w-4 h-4 text-amber-400" />
                <span>Edit Data Kemasan</span>
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
                  <label className="font-semibold text-slate-700 block mb-1">Kode Kemasan</label>
                  <input
                    type="text"
                    required
                    value={editFormData.kodeKemasan}
                    onChange={(e) => setEditFormData({ ...editFormData, kodeKemasan: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-bold cursor-text"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Type Kemasan</label>
                  <input
                    type="text"
                    required
                    value={editFormData.type}
                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 cursor-text"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Kemasan</label>
                <input
                  type="text"
                  required
                  value={editFormData.namaKemasan}
                  onChange={(e) => setEditFormData({ ...editFormData, namaKemasan: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold cursor-text"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Stok Awal (pcs)</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.stokAwalPcs}
                    onChange={(e) => setEditFormData({ ...editFormData, stokAwalPcs: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-right cursor-text"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Masuk (pcs)</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.masukPcs}
                    onChange={(e) => setEditFormData({ ...editFormData, masukPcs: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-right text-cyan-700 font-bold cursor-text"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Keluar (pcs)</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.keluarPcs}
                    onChange={(e) => setEditFormData({ ...editFormData, keluarPcs: Number(e.target.value) })}
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
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
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
