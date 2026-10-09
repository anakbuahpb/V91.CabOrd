import React, { useState, useRef, useEffect } from 'react';
import {
  BarangKeluarBibitItem,
  BarangKeluarKemasanItem,
  BranchMaster,
  UserAccount,
} from '../types';
import {
  ArrowUpRight,
  Search,
  Plus,
  Trash2,
  FileDown,
  Droplet,
  Package,
  Calculator,
  X,
  Check,
  Eye,
  ArrowLeft,
  Copy,
  Printer,
} from 'lucide-react';
import { exportToExcel } from '../services/excelService';
import { exportBatchSlipPdf } from '../services/pdfExport';
import { ConfirmModal } from '../components/ConfirmModal';

interface BarangKeluarViewProps {
  keluarBibitList: BarangKeluarBibitItem[];
  keluarKemasanList: BarangKeluarKemasanItem[];
  branches: BranchMaster[];
  onAddKeluarBibit: (
    item: Omit<BarangKeluarBibitItem, 'id' | 'keluarMl'>,
    syncToMonthly: boolean
  ) => void;
  onDeleteKeluarBibit: (id: string) => void;
  onAddKeluarKemasan: (item: Omit<BarangKeluarKemasanItem, 'id'>, syncToMonthly: boolean) => void;
  onDeleteKeluarKemasan: (id: string) => void;
  currentUser: UserAccount;
}

interface DraftKeluarBibitRow {
  tempId: string;
  tanggal: string;
  idCabang: string;
  kodeBibit: string;
  namaBibit: string;
  kategori: string;
  kemasanBotolMl: number;
  persentaseBibit: number;
  hargaJual: number;
  noTransaksi: string;
  keterangan: string;
}

interface DraftKeluarKemasanRow {
  tempId: string;
  tanggal: string;
  idCabang: string;
  kodeKemasan: string;
  namaKemasan: string;
  type: string;
  keluarPcs: number;
  tujuan: string;
  keterangan: string;
}

export const BarangKeluarView: React.FC<BarangKeluarViewProps> = ({
  keluarBibitList,
  keluarKemasanList,
  branches,
  onAddKeluarBibit,
  onDeleteKeluarBibit,
  onAddKeluarKemasan,
  onDeleteKeluarKemasan,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'BIBIT' | 'KEMASAN'>('BIBIT');
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');

  // Modal State for Batch Add Bibit
  const [isBibitBatchOpen, setIsBibitBatchOpen] = useState(false);
  const [bibitModalStep, setBibitModalStep] = useState<'FORM' | 'VIEW'>('FORM');
  const [draftBibitRows, setDraftBibitRows] = useState<DraftKeluarBibitRow[]>([]);

  // Modal State for Batch Add Kemasan
  const [isKemasanBatchOpen, setIsKemasanBatchOpen] = useState(false);
  const [kemasanModalStep, setKemasanModalStep] = useState<'FORM' | 'VIEW'>('FORM');
  const [draftKemasanRows, setDraftKemasanRows] = useState<DraftKeluarKemasanRow[]>([]);

  const [syncToMonthly, setSyncToMonthly] = useState(true);

  // Confirmation Popup State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<'BIBIT' | 'KEMASAN'>('BIBIT');
  const [shouldPrintPdf, setShouldPrintPdf] = useState(true);

  const firstBibitRef = useRef<HTMLInputElement>(null);
  const firstKemasanRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isBibitBatchOpen && bibitModalStep === 'FORM') {
      setTimeout(() => firstBibitRef.current?.focus(), 100);
    }
  }, [isBibitBatchOpen, bibitModalStep]);

  useEffect(() => {
    if (isKemasanBatchOpen && kemasanModalStep === 'FORM') {
      setTimeout(() => firstKemasanRef.current?.focus(), 100);
    }
  }, [isKemasanBatchOpen, kemasanModalStep]);

  const filteredBibit = keluarBibitList.filter((item) => {
    const matchesSearch =
      item.namaBibit.toLowerCase().includes(search.toLowerCase()) ||
      item.kodeBibit.toLowerCase().includes(search.toLowerCase()) ||
      (item.noTransaksi && item.noTransaksi.toLowerCase().includes(search.toLowerCase()));
    const matchesBranch = branchFilter === 'ALL' || item.idCabang === branchFilter;
    return matchesSearch && matchesBranch;
  });

  const filteredKemasan = keluarKemasanList.filter((item) => {
    const matchesSearch =
      item.namaKemasan.toLowerCase().includes(search.toLowerCase()) ||
      item.kodeKemasan.toLowerCase().includes(search.toLowerCase()) ||
      item.tujuan.toLowerCase().includes(search.toLowerCase());
    const matchesBranch = branchFilter === 'ALL' || item.idCabang === branchFilter;
    return matchesSearch && matchesBranch;
  });

  // Open Batch Bibit Modal
  const handleOpenAddBibit = () => {
    const defaultBranch = branches[0]?.idCabang || 'CAB-01';
    setDraftBibitRows([
      {
        tempId: `draft-kb-${Date.now()}-1`,
        tanggal: new Date().toISOString().slice(0, 10),
        idCabang: defaultBranch,
        kodeBibit: 'BBT-001',
        namaBibit: 'Baccarat Rouge 540 Extra',
        kategori: 'Oriental Floral',
        kemasanBotolMl: 50,
        persentaseBibit: 60,
        hargaJual: 185000,
        noTransaksi: `TRX-${Date.now().toString().slice(-6)}`,
        keterangan: 'Racikan Eau De Parfum 50ml botol gold',
      },
    ]);
    setBibitModalStep('FORM');
    setIsConfirmOpen(false);
    setIsBibitBatchOpen(true);
  };

  const handleAddBibitRow = () => {
    const defaultBranch = branches[0]?.idCabang || 'CAB-01';
    setDraftBibitRows((prev) => [
      ...prev,
      {
        tempId: `draft-kb-${Date.now()}-${prev.length + 1}`,
        tanggal: new Date().toISOString().slice(0, 10),
        idCabang: defaultBranch,
        kodeBibit: `BBT-00${(prev.length % 5) + 1}`,
        namaBibit: '',
        kategori: 'Woody Spicy',
        kemasanBotolMl: 30,
        persentaseBibit: 50,
        hargaJual: 135000,
        noTransaksi: `TRX-${Date.now().toString().slice(-6)}`,
        keterangan: 'Racikan parfum botol spray',
      },
    ]);
  };

  const handleRemoveBibitRow = (tempId: string) => {
    if (draftBibitRows.length === 1) {
      alert('Minimal harus ada 1 baris transaksi.');
      return;
    }
    setDraftBibitRows((prev) => prev.filter((r) => r.tempId !== tempId));
  };

  const handleUpdateDraftBibitField = (tempId: string, field: keyof DraftKeluarBibitRow, value: any) => {
    setDraftBibitRows((prev) =>
      prev.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r))
    );
  };

  const handleGoToViewBibit = (e: React.FormEvent) => {
    e.preventDefault();
    for (let i = 0; i < draftBibitRows.length; i++) {
      const r = draftBibitRows[i];
      if (!r.namaBibit.trim()) {
        alert(`Mohon lengkapi Nama Bibit pada baris ke-${i + 1}`);
        return;
      }
    }
    setBibitModalStep('VIEW');
  };

  // Open Batch Kemasan Modal
  const handleOpenAddKemasan = () => {
    const defaultBranch = branches[0]?.idCabang || 'CAB-01';
    setDraftKemasanRows([
      {
        tempId: `draft-kk-${Date.now()}-1`,
        tanggal: new Date().toISOString().slice(0, 10),
        idCabang: defaultBranch,
        kodeKemasan: 'KMS-30S',
        namaKemasan: 'Botol Spray Kaca Silver 30ml',
        type: 'Spray Silver',
        keluarPcs: 1,
        tujuan: 'Penjualan Botol Racikan',
        keterangan: 'Kemasan penjualan toko',
      },
    ]);
    setKemasanModalStep('FORM');
    setIsConfirmOpen(false);
    setIsKemasanBatchOpen(true);
  };

  const handleAddKemasanRow = () => {
    const defaultBranch = branches[0]?.idCabang || 'CAB-01';
    setDraftKemasanRows((prev) => [
      ...prev,
      {
        tempId: `draft-kk-${Date.now()}-${prev.length + 1}`,
        tanggal: new Date().toISOString().slice(0, 10),
        idCabang: defaultBranch,
        kodeKemasan: 'KMS-50G',
        namaKemasan: 'Botol Spray Kaca Gold 50ml',
        type: 'Spray Gold',
        keluarPcs: 1,
        tujuan: 'Penjualan Botol Racikan',
        keterangan: 'Kemasan penjualan toko',
      },
    ]);
  };

  const handleRemoveKemasanRow = (tempId: string) => {
    if (draftKemasanRows.length === 1) {
      alert('Minimal harus ada 1 baris botol keluar.');
      return;
    }
    setDraftKemasanRows((prev) => prev.filter((r) => r.tempId !== tempId));
  };

  const handleUpdateDraftKemasanField = (tempId: string, field: keyof DraftKeluarKemasanRow, value: any) => {
    setDraftKemasanRows((prev) =>
      prev.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r))
    );
  };

  const handleGoToViewKemasan = (e: React.FormEvent) => {
    e.preventDefault();
    for (let i = 0; i < draftKemasanRows.length; i++) {
      const r = draftKemasanRows[i];
      if (!r.namaKemasan.trim()) {
        alert(`Mohon lengkapi Nama Kemasan pada baris ke-${i + 1}`);
        return;
      }
    }
    setKemasanModalStep('VIEW');
  };

  // Trigger Confirmation
  const handlePromptConfirm = (target: 'BIBIT' | 'KEMASAN') => {
    setConfirmTarget(target);
    setIsConfirmOpen(true);
  };

  // Execute Save
  const handleExecuteSave = () => {
    if (confirmTarget === 'BIBIT') {
      draftBibitRows.forEach((row) => {
        const branch = branches.find((b) => b.idCabang === row.idCabang);
        const namaCabang = branch?.namaCabang || row.idCabang;

        onAddKeluarBibit(
          {
            tanggal: row.tanggal,
            idCabang: row.idCabang,
            namaCabang,
            kodeBibit: row.kodeBibit,
            namaBibit: row.namaBibit,
            kategori: row.kategori,
            kemasanBotolMl: Number(row.kemasanBotolMl),
            persentaseBibit: Number(row.persentaseBibit),
            hargaJual: Number(row.hargaJual),
            noTransaksi: row.noTransaksi,
            keterangan: row.keterangan,
            recordedBy: currentUser.fullName,
          },
          syncToMonthly
        );
      });

      if (shouldPrintPdf) {
        const branchObj = branches.find((b) => b.idCabang === draftBibitRows[0]?.idCabang);
        const branchName = branchObj?.namaCabang || draftBibitRows[0]?.idCabang || 'Cabang V91';
        const headers = ['No TRX', 'Kode', 'Nama Bibit', 'Botol', 'Persen', 'Keluar/ml', 'Harga Jual'];
        const rows = draftBibitRows.map((r) => {
          const keluarMl = Math.round((Number(r.kemasanBotolMl) * (Number(r.persentaseBibit) / 100)) * 100) / 100;
          return [
            r.noTransaksi || '-',
            r.kodeBibit,
            r.namaBibit,
            `${r.kemasanBotolMl} ml`,
            `${r.persentaseBibit}%`,
            `${keluarMl} ml`,
            `Rp ${Number(r.hargaJual).toLocaleString('id-ID')}`,
          ];
        });

        const totalRp = draftBibitRows.reduce((a, b) => a + Number(b.hargaJual), 0);
        exportBatchSlipPdf(
          'Struk Transaksi Penjualan Racikan Bibit',
          `Total ${draftBibitRows.length} Transaksi Racikan`,
          branchName,
          currentUser.fullName,
          headers,
          rows,
          `Total Omset Penjualan: Rp ${totalRp.toLocaleString('id-ID')}`
        );
      }

      setIsConfirmOpen(false);
      setIsBibitBatchOpen(false);
      setDraftBibitRows([]);
    } else {
      draftKemasanRows.forEach((row) => {
        const branch = branches.find((b) => b.idCabang === row.idCabang);
        const namaCabang = branch?.namaCabang || row.idCabang;

        onAddKeluarKemasan(
          {
            tanggal: row.tanggal,
            idCabang: row.idCabang,
            namaCabang,
            kodeKemasan: row.kodeKemasan,
            namaKemasan: row.namaKemasan,
            type: row.type,
            keluarPcs: Number(row.keluarPcs),
            tujuan: row.tujuan,
            keterangan: row.keterangan,
            recordedBy: currentUser.fullName,
          },
          syncToMonthly
        );
      });

      if (shouldPrintPdf) {
        const branchObj = branches.find((b) => b.idCabang === draftKemasanRows[0]?.idCabang);
        const branchName = branchObj?.namaCabang || draftKemasanRows[0]?.idCabang || 'Cabang V91';
        const headers = ['Tanggal', 'Kode', 'Nama Kemasan', 'Type', 'Keluar (pcs)', 'Tujuan'];
        const rows = draftKemasanRows.map((r) => [
          r.tanggal,
          r.kodeKemasan,
          r.namaKemasan,
          r.type,
          `${r.keluarPcs} pcs`,
          r.tujuan,
        ]);

        exportBatchSlipPdf(
          'Bukti Pengeluaran Botol Kemasan',
          `Total ${draftKemasanRows.length} Item Kemasan`,
          branchName,
          currentUser.fullName,
          headers,
          rows,
          `Total Botol Keluar: ${draftKemasanRows.reduce((a, b) => a + Number(b.keluarPcs), 0)} pcs`
        );
      }

      setIsConfirmOpen(false);
      setIsKemasanBatchOpen(false);
      setDraftKemasanRows([]);
    }
  };

  const handleExportBibitExcel = () => {
    const data = filteredBibit.map((item) => ({
      Tanggal: item.tanggal,
      'ID Cabang': item.idCabang,
      'Nama Cabang': item.namaCabang,
      'Kode Bibit': item.kodeBibit,
      'Nama Bibit': item.namaBibit,
      Kategori: item.kategori,
      'Kemasan Botol (ml)': item.kemasanBotolMl,
      'Persentase Bibit (%)': `${item.persentaseBibit}%`,
      'Keluar/ml (Otomatis)': item.keluarMl,
      'Harga Jual (Rp)': item.hargaJual,
      'No Transaksi': item.noTransaksi || '-',
      Keterangan: item.keterangan || '',
      Petugas: item.recordedBy,
    }));
    exportToExcel(data, 'V91_Data_Keluar_Bibit', 'Keluar Bibit');
  };

  const handleExportKemasanExcel = () => {
    const data = filteredKemasan.map((item) => ({
      Tanggal: item.tanggal,
      'ID Cabang': item.idCabang,
      'Nama Cabang': item.namaCabang,
      'Kode Kemasan': item.kodeKemasan,
      'Nama Kemasan': item.namaKemasan,
      Type: item.type,
      'Keluar (pcs)': item.keluarPcs,
      Tujuan: item.tujuan,
      Keterangan: item.keterangan || '',
      Petugas: item.recordedBy,
    }));
    exportToExcel(data, 'V91_Data_Keluar_Kemasan', 'Keluar Kemasan');
  };

  const totalOmsetBibit = filteredBibit.reduce((acc, b) => acc + b.hargaJual, 0);
  const totalVolumeBibitMl = filteredBibit.reduce((acc, b) => acc + b.keluarMl, 0);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <ArrowUpRight className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              Data Keluar Barang (Bibit &amp; Kemasan)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Penjualan bibit parfum dengan <strong>kalkulasi otomatis keluar/ml (kemasan botol x persentase)</strong> &amp; pengeluaran kemasan botol.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'BIBIT' ? (
            <>
              <button
                onClick={handleExportBibitExcel}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>Excel Bibit</span>
              </button>
              <button
                onClick={handleOpenAddBibit}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Input Keluar Bibit (Bisa Multi Racikan)</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleExportKemasanExcel}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>Excel Kemasan</span>
              </button>
              <button
                onClick={handleOpenAddKemasan}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-amber-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Input Keluar Kemasan (Bisa Multi Botol)</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs Selector: Bibit vs Kemasan */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('BIBIT')}
          className={`py-3 px-6 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'BIBIT'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Droplet className="w-4 h-4" />
          <span>Keluar Bibit Minyak Wangi ({filteredBibit.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('KEMASAN')}
          className={`py-3 px-6 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'KEMASAN'
              ? 'border-amber-600 text-amber-700 bg-amber-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Keluar Botol Kemasan ({filteredKemasan.length})</span>
        </button>
      </div>

      {/* Mini KPI Bar for Bibit */}
      {activeTab === 'BIBIT' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-400 block font-semibold">Total Transaksi Keluar</span>
            <strong className="text-base text-slate-900 font-mono mt-0.5 block">{filteredBibit.length} Penjualan</strong>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-400 block font-semibold">Total Volume Terjual</span>
            <strong className="text-base text-cyan-800 font-mono mt-0.5 block">
              {totalVolumeBibitMl.toLocaleString('id-ID')} ml bibit
            </strong>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-400 block font-semibold">Total Nilai Penjualan (Omset)</span>
            <strong className="text-base text-emerald-700 font-mono mt-0.5 block">
              Rp {totalOmsetBibit.toLocaleString('id-ID')}
            </strong>
          </div>
        </div>
      )}

      {/* Toolbar Search & Branch Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={activeTab === 'BIBIT' ? 'Cari bibit, no transaksi...' : 'Cari kemasan, tujuan...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-text"
          />
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

      {/* Main Table: Bibit vs Kemasan */}
      {activeTab === 'BIBIT' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Cabang</th>
                  <th className="py-3.5 px-4">Kode &amp; Nama Bibit</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4 text-right">Kemasan Botol (ml)</th>
                  <th className="py-3.5 px-4 text-right">Persentase Bibit</th>
                  <th className="py-3.5 px-4 text-right bg-indigo-50 text-indigo-900">
                    Keluar/ml (Kemasan x %)
                  </th>
                  <th className="py-3.5 px-4 text-right font-black">Harga Jual (Rp)</th>
                  <th className="py-3.5 px-4">No Transaksi &amp; Ket</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBibit.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-600">{item.tanggal}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{item.namaCabang}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-indigo-700 font-bold mr-1.5">{item.kodeBibit}</span>
                      <strong className="text-slate-900">{item.namaBibit}</strong>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-sm text-[10px]">{item.kategori}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-700 font-bold">
                      {item.kemasanBotolMl} ml
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-indigo-700 font-bold">
                      {item.persentaseBibit}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-indigo-700 text-sm bg-indigo-50/50">
                      {item.keluarMl} ml
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-800">
                      Rp {item.hargaJual.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="font-mono text-[10px] text-slate-400">{item.noTransaksi || '-'}</div>
                      <div className="text-[11px] truncate max-w-xs">{item.keterangan || '-'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Hapus transaksi ${item.namaBibit}?`)) {
                            onDeleteKeluarBibit(item.id);
                          }
                        }}
                        title="Hapus"
                        className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredBibit.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      Belum ada catatan barang keluar bibit.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Cabang</th>
                  <th className="py-3.5 px-4">Kode Kemasan</th>
                  <th className="py-3.5 px-4">Nama Kemasan</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-right font-black">Keluar/pcs</th>
                  <th className="py-3.5 px-4">Tujuan Penggunaan</th>
                  <th className="py-3.5 px-4">Keterangan</th>
                  <th className="py-3.5 px-4">Petugas</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredKemasan.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-600">{item.tanggal}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{item.namaCabang}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-700">{item.kodeKemasan}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.namaKemasan}</td>
                    <td className="py-3.5 px-4 text-slate-600">{item.type}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-rose-700 text-sm">
                      -{item.keluarPcs} pcs
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{item.tujuan}</td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{item.keterangan || '-'}</td>
                    <td className="py-3.5 px-4 text-slate-500">{item.recordedBy}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Hapus catatan keluar kemasan ${item.namaKemasan}?`)) {
                            onDeleteKeluarKemasan(item.id);
                          }
                        }}
                        title="Hapus"
                        className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredKemasan.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      Belum ada catatan barang keluar kemasan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MULTI-ITEM BATCH ADD MODAL: BIBIT RACIKAN */}
      {isBibitBatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">
                    {bibitModalStep === 'FORM'
                      ? 'Input Penjualan Racikan Bibit (Bisa Multi Barang)'
                      : 'Pratinjau Transaksi Racikan Bibit'}
                  </h3>
                  <p className="text-xs text-indigo-200">
                    Kalkulator Otomatis: <strong>Keluar/ml = Botol (ml) × Persentase (%)</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBibitBatchOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bibitModalStep === 'FORM' ? (
              <form onSubmit={handleGoToViewBibit} className="flex-1 overflow-y-auto p-6 space-y-6 modal-scroll pb-24">
                <div className="space-y-4">
                  {draftBibitRows.map((row, index) => {
                    const calculatedMl = Math.round((Number(row.kemasanBotolMl) * (Number(row.persentaseBibit) / 100)) * 100) / 100;

                    return (
                      <div
                        key={row.tempId}
                        className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative hover:border-indigo-300 transition-all shadow-xs"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-md font-mono">
                            Racikan #{index + 1}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {draftBibitRows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveBibitRow(row.tempId)}
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
                              onChange={(e) => handleUpdateDraftBibitField(row.tempId, 'tanggal', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Cabang</label>
                            <select
                              value={row.idCabang}
                              onChange={(e) => handleUpdateDraftBibitField(row.tempId, 'idCabang', e.target.value)}
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
                              onChange={(e) => handleUpdateDraftBibitField(row.tempId, 'kodeBibit', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-bold cursor-text"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Kategori</label>
                            <input
                              type="text"
                              required
                              value={row.kategori}
                              onChange={(e) => handleUpdateDraftBibitField(row.tempId, 'kategori', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 cursor-text"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Nama Bibit Wangi</label>
                            <input
                              ref={index === 0 ? firstBibitRef : undefined}
                              type="text"
                              required
                              value={row.namaBibit}
                              onChange={(e) => handleUpdateDraftBibitField(row.tempId, 'namaBibit', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold cursor-text"
                              placeholder="Contoh: Baccarat Rouge 540 Extra"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">No. Transaksi</label>
                            <input
                              type="text"
                              value={row.noTransaksi}
                              onChange={(e) => handleUpdateDraftBibitField(row.tempId, 'noTransaksi', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono cursor-text"
                            />
                          </div>
                        </div>

                        {/* FORMULA KALKULATOR: KEMASAN BOTOL X PERSENTASE */}
                        <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs items-center">
                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Kemasan Botol (ml)</label>
                            <input
                              type="number"
                              min="1"
                              required
                              value={row.kemasanBotolMl}
                              onChange={(e) => handleUpdateDraftBibitField(row.tempId, 'kemasanBotolMl', Number(e.target.value))}
                              className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-xl text-slate-900 font-mono font-bold cursor-text"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Persentase Bibit (%)</label>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              required
                              value={row.persentaseBibit}
                              onChange={(e) => handleUpdateDraftBibitField(row.tempId, 'persentaseBibit', Number(e.target.value))}
                              className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-xl text-slate-900 font-mono font-bold text-right cursor-text"
                            />
                          </div>

                          <div className="p-2.5 bg-white rounded-xl border border-indigo-200 text-center">
                            <span className="text-[10px] text-slate-500 uppercase block font-bold">Hasil Keluar/ml</span>
                            <strong className="text-base font-black text-indigo-700 font-mono block">
                              {calculatedMl} ml
                            </strong>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Harga Jual (Rp)</label>
                            <input
                              type="number"
                              min="0"
                              required
                              value={row.hargaJual}
                              onChange={(e) => handleUpdateDraftBibitField(row.tempId, 'hargaJual', Number(e.target.value))}
                              className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-emerald-800 font-mono font-bold text-base cursor-text"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Keterangan</label>
                            <input
                              type="text"
                              value={row.keterangan}
                              onChange={(e) => handleUpdateDraftBibitField(row.tempId, 'keterangan', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 cursor-text"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleAddBibitRow}
                  className="w-full py-3 border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 rounded-2xl text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Baris Racikan Lagi (Add Barang)</span>
                </button>

                <div className="pt-4 border-t border-slate-200 flex justify-between items-center sticky bottom-0 bg-white p-4 -mx-6 -mb-6 shadow-md">
                  <span className="text-xs font-semibold text-slate-500">
                    Total: <strong>{draftBibitRows.length} racikan</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsBibitBatchOpen(false)}
                      className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Pratinjau / View Data ({draftBibitRows.length})</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* VIEW / PREVIEW BIBIT */
              <div className="flex-1 overflow-y-auto p-6 space-y-5 modal-scroll">
                <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-indigo-950 text-sm">
                      Pratinjau {draftBibitRows.length} Penjualan Racikan Bibit
                    </h4>
                    <p className="text-xs text-indigo-800 mt-0.5">
                      Periksa rincian botol, persentase bibit, dan harga jual sebelum disimpan.
                    </p>
                  </div>
                  <button
                    onClick={() => setBibitModalStep('FORM')}
                    className="px-3.5 py-1.5 border border-indigo-300 bg-white hover:bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
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
                        <th className="py-2.5 px-3">Kode &amp; Nama</th>
                        <th className="py-2.5 px-3 text-right">Botol (ml)</th>
                        <th className="py-2.5 px-3 text-right">Bibit (%)</th>
                        <th className="py-2.5 px-3 text-right bg-indigo-50">Keluar/ml</th>
                        <th className="py-2.5 px-3 text-right">Harga Jual</th>
                        <th className="py-2.5 px-3">No TRX</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {draftBibitRows.map((r, idx) => {
                        const calculatedMl = Math.round((Number(r.kemasanBotolMl) * (Number(r.persentaseBibit) / 100)) * 100) / 100;
                        return (
                          <tr key={r.tempId} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-mono">{r.tanggal}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{r.namaBibit}</td>
                            <td className="py-2.5 px-3 text-right font-mono">{r.kemasanBotolMl} ml</td>
                            <td className="py-2.5 px-3 text-right font-mono text-indigo-700 font-bold">{r.persentaseBibit}%</td>
                            <td className="py-2.5 px-3 text-right font-mono font-black text-indigo-700 bg-indigo-50/50">
                              {calculatedMl} ml
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-800">
                              Rp {Number(r.hargaJual).toLocaleString('id-ID')}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-500">{r.noTransaksi || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                  <button
                    onClick={() => setBibitModalStep('FORM')}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali Edit</span>
                  </button>

                  <button
                    onClick={() => handlePromptConfirm('BIBIT')}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Lanjutkan Simpan Data ({draftBibitRows.length})</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MULTI-ITEM BATCH ADD MODAL: KEMASAN */}
      {isKemasanBatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-gradient-to-r from-slate-900 to-amber-950 text-white px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">
                    {kemasanModalStep === 'FORM'
                      ? 'Input Keluar Botol Kemasan (Bisa Multi Barang)'
                      : 'Pratinjau Keluar Kemasan'}
                  </h3>
                  <p className="text-xs text-amber-200">
                    Catat pengeluaran botol kemasan untuk penjualan atau penggunaan cabang
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsKemasanBatchOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {kemasanModalStep === 'FORM' ? (
              <form onSubmit={handleGoToViewKemasan} className="flex-1 overflow-y-auto p-6 space-y-6 modal-scroll pb-24">
                <div className="space-y-4">
                  {draftKemasanRows.map((row, index) => (
                    <div
                      key={row.tempId}
                      className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative hover:border-amber-300 transition-all shadow-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-md font-mono">
                          Kemasan #{index + 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {draftKemasanRows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveKemasanRow(row.tempId)}
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
                            onChange={(e) => handleUpdateDraftKemasanField(row.tempId, 'tanggal', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Cabang</label>
                          <select
                            value={row.idCabang}
                            onChange={(e) => handleUpdateDraftKemasanField(row.tempId, 'idCabang', e.target.value)}
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
                            onChange={(e) => handleUpdateDraftKemasanField(row.tempId, 'kodeKemasan', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-bold cursor-text"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Type Botol</label>
                          <input
                            type="text"
                            value={row.type}
                            onChange={(e) => handleUpdateDraftKemasanField(row.tempId, 'type', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 cursor-text"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Nama Kemasan</label>
                          <input
                            ref={index === 0 ? firstKemasanRef : undefined}
                            type="text"
                            required
                            value={row.namaKemasan}
                            onChange={(e) => handleUpdateDraftKemasanField(row.tempId, 'namaKemasan', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold cursor-text"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Keluar (pcs)</label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={row.keluarPcs}
                            onChange={(e) => handleUpdateDraftKemasanField(row.tempId, 'keluarPcs', Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-slate-900 font-mono font-bold text-right cursor-text"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Tujuan Penggunaan</label>
                          <input
                            type="text"
                            value={row.tujuan}
                            onChange={(e) => handleUpdateDraftKemasanField(row.tempId, 'tujuan', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 cursor-text"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddKemasanRow}
                  className="w-full py-3 border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50 rounded-2xl text-amber-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Baris Kemasan Lagi (Add Barang)</span>
                </button>

                <div className="pt-4 border-t border-slate-200 flex justify-between items-center sticky bottom-0 bg-white p-4 -mx-6 -mb-6 shadow-md">
                  <span className="text-xs font-semibold text-slate-500">
                    Total: <strong>{draftKemasanRows.length} kemasan</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsKemasanBatchOpen(false)}
                      className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Pratinjau / View Data ({draftKemasanRows.length})</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* VIEW / PREVIEW KEMASAN */
              <div className="flex-1 overflow-y-auto p-6 space-y-5 modal-scroll">
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-amber-950 text-sm">
                      Pratinjau {draftKemasanRows.length} Keluar Kemasan
                    </h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Periksa rincian sebelum disimpan ke sistem.
                    </p>
                  </div>
                  <button
                    onClick={() => setKemasanModalStep('FORM')}
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
                        <th className="py-2.5 px-3">Tanggal</th>
                        <th className="py-2.5 px-3">Kode</th>
                        <th className="py-2.5 px-3">Nama Kemasan</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3 text-right">Keluar</th>
                        <th className="py-2.5 px-3">Tujuan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {draftKemasanRows.map((r, idx) => (
                        <tr key={r.tempId} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-mono">{r.tanggal}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-amber-700">{r.kodeKemasan}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{r.namaKemasan}</td>
                          <td className="py-2.5 px-3 text-slate-600">{r.type}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-rose-700">
                            -{r.keluarPcs} pcs
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">{r.tujuan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                  <button
                    onClick={() => setKemasanModalStep('FORM')}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali Edit</span>
                  </button>

                  <button
                    onClick={() => handlePromptConfirm('KEMASAN')}
                    className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-600/30 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Lanjutkan Simpan Data ({draftKemasanRows.length})</span>
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
        title={
          confirmTarget === 'BIBIT'
            ? 'Konfirmasi Penjualan Racikan Bibit'
            : 'Konfirmasi Pengeluaran Botol Kemasan'
        }
        moduleName={confirmTarget === 'BIBIT' ? 'Keluar Bibit Parfum' : 'Keluar Botol Kemasan'}
        itemCount={confirmTarget === 'BIBIT' ? draftBibitRows.length : draftKemasanRows.length}
        previewSummary={
          <div className="space-y-1">
            {confirmTarget === 'BIBIT'
              ? draftBibitRows.map((r, i) => (
                  <div key={r.tempId} className="flex justify-between items-center text-[11px] text-slate-700 py-1 border-b border-slate-200/60 last:border-0">
                    <span>
                      <strong>#{i + 1} {r.namaBibit}</strong> ({r.kemasanBotolMl}ml @{r.persentaseBibit}%)
                    </span>
                    <span className="font-mono text-emerald-700 font-bold">
                      Rp {Number(r.hargaJual).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))
              : draftKemasanRows.map((r, i) => (
                  <div key={r.tempId} className="flex justify-between items-center text-[11px] text-slate-700 py-1 border-b border-slate-200/60 last:border-0">
                    <span>
                      <strong>#{i + 1} {r.namaKemasan}</strong>
                    </span>
                    <span className="font-mono text-rose-700 font-bold">
                      -{r.keluarPcs} pcs | {r.tujuan}
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
