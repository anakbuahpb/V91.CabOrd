import React, { useState } from 'react';
import {
  BranchMaster,
  DatabaseBulanBibitItem,
  DatabaseBulanKemasanItem,
  BarangMasukItem,
  BarangKeluarBibitItem,
  BarangKeluarKemasanItem,
  FinancialAnalysisRecord,
  UserAccount,
} from '../types';
import {
  FileSpreadsheet,
  FileDown,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Droplet,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  exportToExcel,
  parseExcelFile,
  exportAllDatabasesBackup,
} from '../services/excelService';

interface ImportExportViewProps {
  branches: BranchMaster[];
  bibitList: DatabaseBulanBibitItem[];
  kemasanList: DatabaseBulanKemasanItem[];
  masukList: BarangMasukItem[];
  keluarBibitList: BarangKeluarBibitItem[];
  keluarKemasanList: BarangKeluarKemasanItem[];
  financialList: FinancialAnalysisRecord[];
  currentUser: UserAccount;
  onImportData: (targetModule: string, data: any[]) => void;
  onActivityLogged: (action: any, module: string, desc: string) => void;
}

export const ImportExportView: React.FC<ImportExportViewProps> = ({
  branches,
  bibitList,
  kemasanList,
  masukList,
  keluarBibitList,
  keluarKemasanList,
  financialList,
  currentUser,
  onImportData,
  onActivityLogged,
}) => {
  const [importTarget, setImportTarget] = useState<string>('BIBIT');
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [importFileName, setImportFileName] = useState<string>('');
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [importErrorMsg, setImportErrorMsg] = useState<string | null>(null);

  // File Upload Parser
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setImportSuccessMsg(null);
    setImportErrorMsg(null);

    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        const json = JSON.parse(text);
        if (Array.isArray(json)) {
          setPreviewRows(json);
        } else {
          setImportErrorMsg('Format file JSON harus berupa array objek data.');
        }
      } else {
        const parsed = await parseExcelFile<any>(file);
        setPreviewRows(parsed);
      }
    } catch (err: any) {
      console.error(err);
      setImportErrorMsg(`Gagal membaca file: ${err.message || 'Format tidak valid'}`);
    }
  };

  const handleApplyImport = () => {
    if (previewRows.length === 0) return;
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin mengimpor ${previewRows.length} baris data ke database target?`
    );
    if (!confirmed) return;

    onImportData(importTarget, previewRows);
    setImportSuccessMsg(`Berhasil mengimpor ${previewRows.length} baris data ke sistem!`);
    onActivityLogged(
      'IMPORT_DATA',
      'Ekspor & Impor',
      `Import file ${importFileName} (${previewRows.length} baris) ke database target ${importTarget}`
    );
    setPreviewRows([]);
    setImportFileName('');
  };

  // Export handlers
  const handleExportFullBackup = () => {
    exportAllDatabasesBackup({
      branches,
      bibitMonthly: bibitList,
      kemasanMonthly: kemasanList,
      barangMasuk: masukList,
      barangKeluarBibit: keluarBibitList,
      barangKeluarKemasan: keluarKemasanList,
      financial: financialList,
      logs: [],
    });
    onActivityLogged('EXPORT_DATA', 'Ekspor & Impor', 'Unduh Full Backup Workbook Excel (Seluruh Database)');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              Form Ekspor &amp; Impor Database
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Unduh format Excel (.xlsx) untuk setiap database atau impor file data dengan validasi pratinjau sebelum disimpan.
          </p>
        </div>

        <button
          onClick={handleExportFullBackup}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 self-start lg:self-auto"
        >
          <FileDown className="w-4 h-4" />
          <span>Unduh Full Backup Semua Database (.xlsx)</span>
        </button>
      </div>

      {/* Grid: Export per database */}
      <div>
        <h3 className="font-extrabold text-sm text-slate-900 mb-3 flex items-center gap-2">
          <FileDown className="w-4 h-4 text-emerald-600" />
          <span>Ekspor Cepat Berdasarkan Database Pilihan</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Card: Master Cabang */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold mb-1">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Database Cabang (Master)</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                {branches.length} cabang terdaftar lengkap dengan kode &amp; analisis kemarin.
              </p>
            </div>
            <button
              onClick={() => exportToExcel(branches, 'V91_Master_Cabang', 'Master Cabang')}
              className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Unduh Excel (.xlsx)</span>
            </button>
          </div>

          {/* Card: Bulan Bibit */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold mb-1">
                <Droplet className="w-4 h-4 text-cyan-600" />
                <span>Database Bulan Bibit</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                {bibitList.length} baris data bibit, masuk, keluar, sisa, selisih &amp; status evaluasi.
              </p>
            </div>
            <button
              onClick={() => exportToExcel(bibitList, 'V91_Database_Bulan_Bibit', 'Bulan Bibit')}
              className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Unduh Excel (.xlsx)</span>
            </button>
          </div>

          {/* Card: Bulan Kemasan */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold mb-1">
                <Package className="w-4 h-4 text-amber-600" />
                <span>Database Bulan Kemasan</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                {kemasanList.length} baris kemasan botol, sisa pcs &amp; peringatan status selisih.
              </p>
            </div>
            <button
              onClick={() => exportToExcel(kemasanList, 'V91_Database_Bulan_Kemasan', 'Bulan Kemasan')}
              className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Unduh Excel (.xlsx)</span>
            </button>
          </div>

          {/* Card: Barang Masuk */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold mb-1">
                <ArrowDownLeft className="w-4 h-4 text-teal-600" />
                <span>Data Masuk Barang</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                {masukList.length} catatan mutasi pasokan masuk dari supplier.
              </p>
            </div>
            <button
              onClick={() => exportToExcel(masukList, 'V91_Barang_Masuk', 'Barang Masuk')}
              className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Unduh Excel (.xlsx)</span>
            </button>
          </div>

          {/* Card: Barang Keluar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold mb-1">
                <ArrowUpRight className="w-4 h-4 text-rose-600" />
                <span>Data Keluar Barang (Bibit)</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                {keluarBibitList.length} transaksi racikan dengan kalkulasi kemasan x %.
              </p>
            </div>
            <button
              onClick={() => exportToExcel(keluarBibitList, 'V91_Barang_Keluar_Bibit', 'Keluar Bibit')}
              className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Unduh Excel (.xlsx)</span>
            </button>
          </div>

          {/* Card: Finansial */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold mb-1">
                <TrendingUp className="w-4 h-4 text-lime-600" />
                <span>Analisis Finansial Toko</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                {financialList.length} catatan rekap laba rugi &amp; omset 1 bulan per cabang.
              </p>
            </div>
            <button
              onClick={() => exportToExcel(financialList, 'V91_Analisis_Finansial', 'Finansial')}
              className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Unduh Excel (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section: Impor Data File */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600" />
            <span>Form Impor Data dari File Excel (.xlsx / .csv / .json)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Unggah file data eksternal untuk dimasukkan ke database sistem dengan pratinjau keamanan data.
          </p>
        </div>

        {/* Target and File Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Pilih Target Database Tujuan
            </label>
            <select
              value={importTarget}
              onChange={(e) => setImportTarget(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
            >
              <option value="BIBIT">Database Bulan Bibit</option>
              <option value="KEMASAN">Database Bulan Kemasan</option>
              <option value="CABANG">Database Cabang (Master)</option>
              <option value="MASUK">Data Masuk Barang</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Pilih File Excel / JSON
            </label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv,.json"
              onChange={handleFileUpload}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>
        </div>

        {/* Status Notification */}
        {importErrorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{importErrorMsg}</span>
          </div>
        )}

        {importSuccessMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-800 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{importSuccessMsg}</span>
          </div>
        )}

        {/* Data Preview Table */}
        {previewRows.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-800">
                Pratinjau Data ({previewRows.length} baris terdeteksi dari "{importFileName}"):
              </span>
              <button
                onClick={handleApplyImport}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Terapkan Impor ke Database</span>
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 sticky top-0 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    {Object.keys(previewRows[0] || {}).slice(0, 6).map((key) => (
                      <th key={key} className="py-2 px-3">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewRows.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      {Object.values(row).slice(0, 6).map((val: any, cidx) => (
                        <td key={cidx} className="py-2 px-3 truncate max-w-xs">
                          {String(val ?? '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {previewRows.length > 10 && (
              <p className="text-[11px] text-slate-400 italic">
                Menampilkan 10 baris pertama dari total {previewRows.length} baris.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
