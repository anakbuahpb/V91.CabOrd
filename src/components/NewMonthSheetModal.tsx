import React, { useState } from 'react';
import { Calendar, X, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

interface NewMonthSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBulan: string;
  onConfirm: (targetBulan: string, sourceBulan: string, carryForward: boolean) => void;
}

export const NewMonthSheetModal: React.FC<NewMonthSheetModalProps> = ({
  isOpen,
  onClose,
  currentBulan,
  onConfirm,
}) => {
  // Default target next month
  const [sourceBulan, setSourceBulan] = useState(currentBulan);
  const getNextMonth = (cur: string) => {
    const [year, month] = cur.split('-').map(Number);
    const date = new Date(year, month); // next month (month is 0-indexed in JS Date)
    const nextY = date.getFullYear();
    const nextM = String(date.getMonth() + 1).padStart(2, '0');
    return `${nextY}-${nextM}`;
  };

  const [targetBulan, setTargetBulan] = useState(getNextMonth(currentBulan));
  const [carryForward, setCarryForward] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBulan) return;
    onConfirm(targetBulan, sourceBulan, carryForward);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-950 px-6 py-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Buka Lembar Baru Bulan Baru</h3>
              <p className="text-xs text-emerald-200/80">Arsipkan periode lama dan siapkan lembar kerja periode baru</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Alur Transisi Periode
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <label className="text-xs text-slate-600 block mb-1">Bulan Sumber (Arsip)</label>
                <input
                  type="month"
                  value={sourceBulan}
                  onChange={(e) => setSourceBulan(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800"
                />
              </div>
              <div className="p-2 bg-emerald-100 rounded-full text-emerald-700 shrink-0 mt-5">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-600 block mb-1">Target Bulan Baru</label>
                <input
                  type="month"
                  value={targetBulan}
                  onChange={(e) => setTargetBulan(e.target.value)}
                  className="w-full px-3 py-2 bg-emerald-50 border border-emerald-400 rounded-lg text-sm font-bold text-emerald-900"
                />
              </div>
            </div>
          </div>

          {/* Option carry forward */}
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={carryForward}
                onChange={(e) => setCarryForward(e.target.checked)}
                className="mt-1 w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-900 block">
                  Transfer Sisa Stok Bulan Sebelumnya Otomatis
                </span>
                <span className="text-slate-600 leading-relaxed block mt-0.5">
                  Nilai <strong>Sisa (ml)</strong> pada Database Bibit dan <strong>Sisa (pcs)</strong> pada Database Kemasan periode {sourceBulan} akan otomatis disalin menjadi <strong>Stok Awal</strong> di lembar baru periode {targetBulan}.
                </span>
              </div>
            </label>
          </div>

          <div className="bg-slate-100 p-3 rounded-lg text-xs text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Data periode lama tetap tersimpan utuh dan dapat dilihat kapan saja lewat filter bulan.</span>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-emerald-600/25 flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Buka Lembar Periode Baru</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
