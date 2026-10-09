import React, { useState, useRef, useEffect } from 'react';
import { BarangMasukItem, BranchMaster, UserAccount } from '../types';
import {
  ArrowDownLeft,
  Search,
  Plus,
  Trash2,
  FileDown,
  Printer,
  X,
  Check,
  Calendar,
  Building2,
  Droplet,
  Package,
  Eye,
  ArrowLeft,
  Copy,
} from 'lucide-react';
import { exportToExcel } from '../services/excelService';
import { exportBatchSlipPdf } from '../services/pdfExport';
import { ConfirmModal } from '../components/ConfirmModal';

interface BarangMasukViewProps {
  barangMasukList: BarangMasukItem[];
  branches: BranchMaster[];
  onAddBarangMasuk: (item: Omit<BarangMasukItem, 'id'>, syncToMonthly: boolean) => void;
  onDeleteBarangMasuk: (id: string) => void;
  currentUser: UserAccount;
}

interface DraftMasukRow {
  tempId: string;
  tanggal: string;
  idCabang: string;
  jenisBarang: 'Bibit' | 'Kemasan';
  kodeBarang: string;
  namaBarang: string;
  kategoriAtauType: string;
  jumlah: number;
  satuan: 'ml' | 'pcs';
  supplier: string;
  noFaktur: string;
  keterangan: string;
}

export const BarangMasukView: React.FC<BarangMasukViewProps> = ({
  barangMasukList,
  branches,
  onAddBarangMasuk,
  onDeleteBarangMasuk,
  currentUser,
}) => {
  const [search, setSearch] = useState('');
  const [jenisFilter, setJenisFilter] = useState<'ALL' | 'Bibit' | 'Kemasan'>('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');

  // Batch Add Modal State
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'FORM' | 'VIEW'>('FORM');
  const [syncToMonthly, setSyncToMonthly] = useState(true);
  const [draftRows, setDraftRows] = useState<DraftMasukRow[]>([]);

  // Confirmation Popup State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [shouldPrintPdf, setShouldPrintPdf] = useState(true);

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isBatchModalOpen && modalStep === 'FORM') {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [isBatchModalOpen, modalStep]);

  const filteredItems = barangMasukList.filter((item) => {
    const matchesSearch =
      item.namaBarang.toLowerCase().includes(search.toLowerCase()) ||
      item.kodeBarang.toLowerCase().includes(search.toLowerCase()) ||
      item.supplier.toLowerCase().includes(search.toLowerCase()) ||
      item.noFaktur.toLowerCase().includes(search.toLowerCase());
    const matchesJenis = jenisFilter === 'ALL' || item.jenisBarang === jenisFilter;
    const matchesBranch = branchFilter === 'ALL' || item.idCabang === branchFilter;
    return matchesSearch && matchesJenis && matchesBranch;
  });

  const handleOpenAdd = (type: 'Bibit' | 'Kemasan' = 'Bibit') => {
    const defaultBranch = branches[0]?.idCabang || 'CAB-01';
    setDraftRows([
      {
        tempId: `draft-msk-${Date.now()}-1`,
        tanggal: new Date().toISOString().slice(0, 10),
        idCabang: defaultBranch,
        jenisBarang: type,
        kodeBarang: type === 'Bibit' ? 'BBT-001' : 'KMS-30S',
        namaBarang: '',
        kategoriAtauType: type === 'Bibit' ? 'Oriental Floral' : 'Spray Silver',
        jumlah: type === 'Bibit' ? 1000 : 100,
        satuan: type === 'Bibit' ? 'ml' : 'pcs',
        supplier: 'PT Fragrance Aroma Nusantara',
        noFaktur: `INV-${Date.now().toString().slice(-6)}`,
        keterangan: 'Kondisi barang baik segel utuh',
      },
    ]);
    setModalStep('FORM');
    setIsConfirmOpen(false);
    setIsBatchModalOpen(true);
  };

  const handleAddRow = (type: 'Bibit' | 'Kemasan' = 'Bibit') => {
    const defaultBranch = branches[0]?.idCabang || 'CAB-01';
    setDraftRows((prev) => [
      ...prev,
      {
        tempId: `draft-msk-${Date.now()}-${prev.length + 1}`,
        tanggal: new Date().toISOString().slice(0, 10),
        idCabang: defaultBranch,
        jenisBarang: type,
        kodeBarang: type === 'Bibit' ? `BBT-${String(prev.length + 1).padStart(3, '0')}` : `KMS-${String(prev.length + 1).padStart(3, '0')}`,
        namaBarang: '',
        kategoriAtauType: type === 'Bibit' ? 'Woody Spicy' : 'Spray Gold',
        jumlah: type === 'Bibit' ? 1000 : 100,
        satuan: type === 'Bibit' ? 'ml' : 'pcs',
        supplier: 'PT Fragrance Aroma Nusantara',
        noFaktur: `INV-${Date.now().toString().slice(-6)}`,
        keterangan: 'Kondisi barang baik',
      },
    ]);
  };

  const handleRemoveRow = (tempId: string) => {
    if (draftRows.length === 1) {
      alert('Minimal harus ada 1 baris barang dalam form input.');
      return;
    }
    setDraftRows((prev) => prev.filter((r) => r.tempId !== tempId));
  };

  const handleDuplicateRow = (row: DraftMasukRow) => {
    setDraftRows((prev) => [
      ...prev,
      {
        ...row,
        tempId: `draft-msk-${Date.now()}-${prev.length + 1}`,
      },
    ]);
  };

  const handleUpdateDraftField = (tempId: string, field: keyof DraftMasukRow, value: any) => {
    setDraftRows((prev) =>
      prev.map((r) => {
        if (r.tempId === tempId) {
          if (field === 'jenisBarang') {
            const newJenis = value as 'Bibit' | 'Kemasan';
            return {
              ...r,
              jenisBarang: newJenis,
              satuan: newJenis === 'Bibit' ? 'ml' : 'pcs',
            };
          }
          return { ...r, [field]: value };
        }
        return r;
      })
    );
  };

  const handleGoToView = (e: React.FormEvent) => {
    e.preventDefault();
    for (let i = 0; i < draftRows.length; i++) {
      const r = draftRows[i];
      if (!r.namaBarang.trim()) {
        alert(`Mohon lengkapi Nama Barang pada baris ke-${i + 1}`);
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

      onAddBarangMasuk(
        {
          tanggal: row.tanggal,
          idCabang: row.idCabang,
          namaCabang,
          jenisBarang: row.jenisBarang,
          kodeBarang: row.kodeBarang,
          namaBarang: row.namaBarang,
          kategoriAtauType: row.kategoriAtauType,
          jumlah: Number(row.jumlah),
          satuan: row.satuan,
          supplier: row.supplier,
          noFaktur: row.noFaktur,
          keterangan: row.keterangan,
          recordedBy: currentUser.fullName,
        },
        syncToMonthly
      );
    });

    if (shouldPrintPdf) {
      const branchObj = branches.find((b) => b.idCabang === draftRows[0]?.idCabang);
      const branchName = branchObj?.namaCabang || draftRows[0]?.idCabang || 'Cabang V91';
      const headers = ['Tanggal', 'Jenis', 'Kode', 'Nama Barang', 'Jumlah', 'Supplier', 'Faktur'];
      const rows = draftRows.map((r) => [
        r.tanggal,
        r.jenisBarang,
        r.kodeBarang,
        r.namaBarang,
        `${r.jumlah} ${r.satuan}`,
        r.supplier,
        r.noFaktur,
      ]);

      exportBatchSlipPdf(
        'Bukti Penerimaan Barang Masuk',
        `No Batch: BATCH-MSK-${Date.now()} | Total ${draftRows.length} Item`,
        branchName,
        currentUser.fullName,
        headers,
        rows,
        `Total Barang Masuk Diterima: ${draftRows.length} Item`
      );
    }

    setIsConfirmOpen(false);
    setIsBatchModalOpen(false);
    setDraftRows([]);
  };

  const handleDelete = (item: BarangMasukItem) => {
    if (confirm(`Hapus catatan barang masuk ${item.namaBarang} (${item.noFaktur})?`)) {
      onDeleteBarangMasuk(item.id);
    }
  };

  const handleExportExcel = () => {
    const data = filteredItems.map((item) => ({
      Tanggal: item.tanggal,
      'ID Cabang': item.idCabang,
      'Nama Cabang': item.namaCabang,
      Jenis: item.jenisBarang,
      'Kode Barang': item.kodeBarang,
      'Nama Barang': item.namaBarang,
      'Kategori/Type': item.kategoriAtauType,
      Jumlah: item.jumlah,
      Satuan: item.satuan,
      Supplier: item.supplier,
      'No Faktur': item.noFaktur,
      Keterangan: item.keterangan,
      Petugas: item.recordedBy,
    }));
    exportToExcel(data, 'V91_Data_Barang_Masuk', 'Barang Masuk');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <ArrowDownLeft className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              Data Masuk Barang (Bibit &amp; Kemasan)
            </h2>
            <span className="text-xs font-mono font-bold bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full">
              {filteredItems.length} Transaksi
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan pasokan masuk bibit konsentrat (ml) dan botol kemasan (pcs) dari supplier ke cabang.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Excel</span>
          </button>

          <button
            onClick={() => handleOpenAdd('Bibit')}
            className="px-3.5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Droplet className="w-4 h-4" />
            <span>+ Masuk Bibit (Bisa Multi)</span>
          </button>

          <button
            onClick={() => handleOpenAdd('Kemasan')}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Package className="w-4 h-4" />
            <span>+ Masuk Kemasan (Bisa Multi)</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari kode, nama, supplier, no faktur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-text"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl text-xs">
            <button
              onClick={() => setJenisFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-medium cursor-pointer ${
                jenisFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setJenisFilter('Bibit')}
              className={`px-3 py-1 rounded-lg font-medium cursor-pointer ${
                jenisFilter === 'Bibit' ? 'bg-cyan-700 text-white' : 'text-cyan-800 hover:bg-cyan-50'
              }`}
            >
              Bibit
            </button>
            <button
              onClick={() => setJenisFilter('Kemasan')}
              className={`px-3 py-1 rounded-lg font-medium cursor-pointer ${
                jenisFilter === 'Kemasan' ? 'bg-amber-600 text-white' : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              Kemasan
            </button>
          </div>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
          >
            <option value="ALL">Semua Cabang</option>
            {branches.map((b) => (
              <option key={b.idCabang} value={b.idCabang}>
                {b.idCabang} - {b.namaCabang}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Cabang</th>
                <th className="py-3.5 px-4">Jenis</th>
                <th className="py-3.5 px-4">Kode Barang</th>
                <th className="py-3.5 px-4">Nama Barang</th>
                <th className="py-3.5 px-4">Kategori/Type</th>
                <th className="py-3.5 px-4 text-right">Jumlah Masuk</th>
                <th className="py-3.5 px-4">Supplier &amp; Faktur</th>
                <th className="py-3.5 px-4">Petugas</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-600">{item.tanggal}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{item.namaCabang}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                        item.jenisBarang === 'Bibit'
                          ? 'bg-cyan-100 text-cyan-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.jenisBarang}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{item.kodeBarang}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{item.namaBarang}</td>
                  <td className="py-3.5 px-4 text-slate-600">{item.kategoriAtauType}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-cyan-800 text-sm">
                    +{item.jumlah.toLocaleString('id-ID')} {item.satuan}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <div>{item.supplier}</div>
                    <div className="font-mono text-slate-400 text-[10px]">{item.noFaktur}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{item.recordedBy}</td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleDelete(item)}
                      title="Hapus"
                      className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Belum ada catatan barang masuk.
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
            <div className="bg-gradient-to-r from-slate-900 to-teal-950 text-white px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-500/20 text-teal-300 rounded-xl">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">
                    {modalStep === 'FORM'
                      ? 'Input Pasokan Barang Masuk (Bisa Lebih Dari 1 Barang)'
                      : 'Pratinjau Barang Masuk Sebelum Disimpan'}
                  </h3>
                  <p className="text-xs text-teal-200">
                    {modalStep === 'FORM'
                      ? `Lengkapi rincian surat masuk (${draftRows.length} item). Anda dapat menambah baris bibit/kemasan.`
                      : `Periksa kembali ${draftRows.length} barang masuk sebelum konfirmasi simpan atau cetak bukti.`}
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

            {/* STEP 1: FORM INPUT */}
            {modalStep === 'FORM' ? (
              <form onSubmit={handleGoToView} className="flex-1 overflow-y-auto p-6 space-y-6 modal-scroll pb-24">
                <div className="space-y-4">
                  {draftRows.map((row, index) => (
                    <div
                      key={row.tempId}
                      className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative hover:border-teal-300 transition-all shadow-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-md font-mono">
                          Barang Masuk #{index + 1} ({row.jenisBarang})
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDuplicateRow(row)}
                            title="Duplikat baris ini"
                            className="p-1 text-slate-500 hover:text-teal-600 hover:bg-white rounded-md cursor-pointer"
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

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Tanggal</label>
                          <input
                            type="date"
                            required
                            value={row.tanggal}
                            onChange={(e) => handleUpdateDraftField(row.tempId, 'tanggal', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Cabang Tujuan</label>
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
                          <label className="font-semibold text-slate-700 block mb-1">Jenis Barang</label>
                          <select
                            value={row.jenisBarang}
                            onChange={(e) => handleUpdateDraftField(row.tempId, 'jenisBarang', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold"
                          >
                            <option value="Bibit">Bibit (ml)</option>
                            <option value="Kemasan">Kemasan Botol (pcs)</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Kode Barang</label>
                          <input
                            type="text"
                            required
                            value={row.kodeBarang}
                            onChange={(e) => handleUpdateDraftField(row.tempId, 'kodeBarang', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-bold cursor-text"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                        <div className="sm:col-span-2">
                          <label className="font-semibold text-slate-700 block mb-1">Nama Barang</label>
                          <input
                            ref={index === 0 ? firstInputRef : undefined}
                            type="text"
                            required
                            value={row.namaBarang}
                            onChange={(e) => handleUpdateDraftField(row.tempId, 'namaBarang', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold cursor-text"
                            placeholder="Nama bibit atau kemasan..."
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Kategori / Type</label>
                          <input
                            type="text"
                            value={row.kategoriAtauType}
                            onChange={(e) => handleUpdateDraftField(row.tempId, 'kategoriAtauType', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 cursor-text"
                            placeholder="Kategori aroma atau tipe botol..."
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">
                            Jumlah ({row.satuan})
                          </label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={row.jumlah}
                            onChange={(e) => handleUpdateDraftField(row.tempId, 'jumlah', Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white border border-teal-300 rounded-xl text-slate-900 font-mono font-bold text-right cursor-text"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Supplier / Asal</label>
                          <input
                            type="text"
                            value={row.supplier}
                            onChange={(e) => handleUpdateDraftField(row.tempId, 'supplier', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 cursor-text"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">No Faktur / Surat Jalan</label>
                          <input
                            type="text"
                            value={row.noFaktur}
                            onChange={(e) => handleUpdateDraftField(row.tempId, 'noFaktur', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono cursor-text"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Keterangan</label>
                          <input
                            type="text"
                            value={row.keterangan}
                            onChange={(e) => handleUpdateDraftField(row.tempId, 'keterangan', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 cursor-text"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddRow('Bibit')}
                    className="flex-1 py-3 border-2 border-dashed border-cyan-300 hover:border-cyan-500 bg-cyan-50/50 hover:bg-cyan-50 rounded-2xl text-cyan-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Tambah Baris Bibit (Add Barang)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddRow('Kemasan')}
                    className="flex-1 py-3 border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50 rounded-2xl text-amber-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Tambah Baris Kemasan (Add Barang)</span>
                  </button>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={syncToMonthly}
                    onChange={(e) => setSyncToMonthly(e.target.checked)}
                    className="rounded-md text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-slate-800 font-semibold text-xs">
                    Akumulasikan otomatis seluruh barang masuk ke Database Bulanan berjalan
                  </span>
                </label>

                <div className="pt-4 border-t border-slate-200 flex justify-between items-center sticky bottom-0 bg-white p-4 -mx-6 -mb-6 shadow-md">
                  <span className="text-xs font-semibold text-slate-500">
                    Total: <strong>{draftRows.length} barang masuk</strong> siap diproses
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
                      className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md cursor-pointer"
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
                <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-teal-950 text-sm">
                      Pratinjau {draftRows.length} Barang Masuk
                    </h4>
                    <p className="text-xs text-teal-800 mt-0.5">
                      Silakan teliti ringkasan di bawah ini sebelum menyimpan atau mencetak bukti PDF.
                    </p>
                  </div>
                  <button
                    onClick={() => setModalStep('FORM')}
                    className="px-3.5 py-1.5 border border-teal-300 bg-white hover:bg-teal-50 text-teal-800 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
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
                        <th className="py-2.5 px-3">Tanggal</th>
                        <th className="py-2.5 px-3">Cabang</th>
                        <th className="py-2.5 px-3">Jenis</th>
                        <th className="py-2.5 px-3">Kode</th>
                        <th className="py-2.5 px-3">Nama Barang</th>
                        <th className="py-2.5 px-3 text-right">Jumlah Masuk</th>
                        <th className="py-2.5 px-3">Supplier</th>
                        <th className="py-2.5 px-3">No Faktur</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {draftRows.map((row, idx) => (
                        <tr key={row.tempId} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-mono">{row.tanggal}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{row.idCabang}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                row.jenisBarang === 'Bibit' ? 'bg-cyan-100 text-cyan-800' : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {row.jenisBarang}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold">{row.kodeBarang}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{row.namaBarang}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-cyan-800">
                            +{row.jumlah} {row.satuan}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{row.supplier}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{row.noFaktur}</td>
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
                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-teal-600/30 cursor-pointer"
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
        title="Konfirmasi Penyimpanan Barang Masuk"
        moduleName="Data Masuk Barang"
        itemCount={draftRows.length}
        previewSummary={
          <div className="space-y-1">
            {draftRows.map((r, i) => (
              <div key={r.tempId} className="flex justify-between items-center text-[11px] text-slate-700 py-1 border-b border-slate-200/60 last:border-0">
                <span>
                  <strong>#{i + 1} {r.namaBarang}</strong> ({r.kodeBarang})
                </span>
                <span className="font-mono text-teal-700 font-semibold">
                  +{r.jumlah} {r.satuan} | {r.supplier}
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
    </div>
  );
};
