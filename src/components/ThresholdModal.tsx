import React, { useState } from 'react';
import { ThresholdConfig } from '../types';
import { Sliders, X, Check, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ThresholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThresholds: ThresholdConfig;
  onSave: (bibitMl: number, kemasanPcs: number) => void;
  canEdit: boolean;
}

export const ThresholdModal: React.FC<ThresholdModalProps> = ({
  isOpen,
  onClose,
  currentThresholds,
  onSave,
  canEdit,
}) => {
  const [bibitMl, setBibitMl] = useState(currentThresholds.thresholdBibitMl);
  const [kemasanPcs, setKemasanPcs] = useState(currentThresholds.thresholdKemasanPcs);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    onSave(Number(bibitMl), Number(kemasanPcs));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-6 py-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Konfigurasi Batas Selisih Penilaian</h3>
              <p className="text-xs text-indigo-200/80">Atur parameter threshold evaluasi stok kapanpun</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {!canEdit && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 text-amber-800 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Akun Anda saat ini memiliki akses hanya lihat. Hanya <strong>Administrator</strong> atau <strong>Pimpinan</strong> yang berhak mengubah parameter penilaian ini.
              </span>
            </div>
          )}

          {/* Bibit Threshold */}
          <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                Batas Selisih Database Bibit (ml)
              </label>
              <span className="text-xs font-mono bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md font-semibold">
                Default: 300 ml
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="0"
                step="10"
                disabled={!canEdit}
                value={bibitMl}
                onChange={(e) => setBibitMl(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-500"
              />
              <span className="text-sm font-medium text-slate-600">ml</span>
            </div>
            <p className="text-xs text-slate-500">
              Jika selisih keluar melebihi masuk lebih dari <strong>{bibitMl} ml</strong>, status dinilai <strong>TIDAK AMAN</strong>. Jika sisa minus, berstatus <strong>DANGER</strong>.
            </p>
          </div>

          {/* Kemasan Threshold */}
          <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                Batas Selisih Database Kemasan (pcs)
              </label>
              <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-semibold">
                Default: 12 pcs
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="0"
                step="1"
                disabled={!canEdit}
                value={kemasanPcs}
                onChange={(e) => setKemasanPcs(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-500"
              />
              <span className="text-sm font-medium text-slate-600">pcs</span>
            </div>
            <p className="text-xs text-slate-500">
              Jika selisih keluar melebihi masuk lebih dari <strong>{kemasanPcs} pcs</strong>, status dinilai <strong>TIDAK AMAN</strong>. Jika sisa botol minus, berstatus <strong>DANGER</strong>.
            </p>
          </div>

          <div className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
            <div className="text-xs text-indigo-900 leading-relaxed">
              Perubahan threshold akan secara otomatis menghitung ulang seluruh penilaian status di semua cabang secara seketika dan tercatat dalam Log Audit Keamanan.
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Tutup
            </button>
            {canEdit && (
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-indigo-500/25 flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Simpan & Terapkan Perubahan</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
