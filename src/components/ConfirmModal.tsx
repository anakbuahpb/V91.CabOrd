import React from 'react';
import { AlertCircle, CheckCircle2, ArrowLeft, Printer, ShieldCheck } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  moduleName: string;
  itemCount: number;
  previewSummary?: React.ReactNode;
  shouldPrintPdf: boolean;
  onTogglePrintPdf: (val: boolean) => void;
  onReviewBack: () => void; // "Cek Kembali"
  onProceedSave: () => void; // "Ya, Lanjutkan Simpan"
  isSaving?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  moduleName,
  itemCount,
  previewSummary,
  shouldPrintPdf,
  onTogglePrintPdf,
  onReviewBack,
  onProceedSave,
  isSaving = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg leading-tight text-white">{title}</h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                Verifikasi &amp; Konfirmasi Penyimpanan Database {moduleName}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs">
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-amber-900 space-y-1.5">
            <strong className="block text-sm font-bold text-amber-950">
              Periksa Kembali Sebelum Menyimpan!
            </strong>
            <p className="leading-relaxed">
              Anda akan menyimpan <strong>{itemCount} baris data barang</strong> ke dalam sistem.
              Pastikan kode barang, takaran volume, dan nilai telah dicek dengan teliti.
            </p>
          </div>

          {/* Optional Preview Summary */}
          {previewSummary && (
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-2xl p-3 bg-slate-50 modal-scroll">
              {previewSummary}
            </div>
          )}

          {/* Option: Sekaligus Cetak PDF */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={shouldPrintPdf}
                onChange={(e) => onTogglePrintPdf(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500"
              />
              <div>
                <span className="font-bold text-slate-800 block text-xs flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Sekaligus Cetak &amp; Simpan Dokumen Bukti PDF</span>
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Membuat berkas PDF resmi tanda terima / bukti input transaksi
                </span>
              </div>
            </label>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-100 p-2.5 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Aktivitas penyimpanan ini akan dicatat ke dalam Log Audit Keamanan.</span>
          </div>

          {/* Action Buttons: Cek Kembali vs Lanjut Simpan */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onReviewBack}
              disabled={isSaving}
              className="px-4 py-2.5 border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Cek Kembali</span>
            </button>

            <button
              type="button"
              onClick={onProceedSave}
              disabled={isSaving}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>{isSaving ? 'Menyimpan...' : 'Ya, Lanjutkan Simpan'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
