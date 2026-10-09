import React, { useState } from 'react';
import { UserAccount } from '../types';
import { KeyRound, X, Check } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onSavePassword: (newPass: string) => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSavePassword,
}) => {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setErrorMsg('Konfirmasi password baru tidak cocok.');
      return;
    }
    if (newPass.length < 4) {
      setErrorMsg('Password minimal 4 karakter.');
      return;
    }

    onSavePassword(newPass);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base">Ubah Kata Sandi</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Pengguna</label>
            <div className="p-2.5 bg-slate-100 rounded-xl font-bold text-slate-900">
              {currentUser.fullName} (@{currentUser.username})
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Password Baru</label>
            <input
              type="password"
              required
              value={newPass}
              onChange={(e) => {
                setNewPass(e.target.value);
                setErrorMsg(null);
              }}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono"
              placeholder="Masukkan password baru..."
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Konfirmasi Password Baru</label>
            <input
              type="password"
              required
              value={confirmPass}
              onChange={(e) => {
                setConfirmPass(e.target.value);
                setErrorMsg(null);
              }}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono"
              placeholder="Ulangi password baru..."
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
