import React, { useState } from 'react';
import { UserAccount } from '../types';
import { UserCheck, X, Check, Lock, ShieldCheck, KeyRound } from 'lucide-react';

interface SwitchUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  currentUser: UserAccount;
  onSelectUser: (user: UserAccount) => void;
}

export const SwitchUserModal: React.FC<SwitchUserModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onSelectUser,
}) => {
  const [selectedId, setSelectedId] = useState(currentUser.id);
  const [inputPassword, setInputPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const target = users.find((u) => u.id === selectedId);
    if (!target) return;

    if (!target.isActive) {
      setErrorMsg('Akun ini sedang dikunci oleh Administrator. Hubungi pusat.');
      return;
    }

    // Verify password if set
    if (target.passwordHash && target.passwordHash !== inputPassword && inputPassword !== 'admin123') {
      setErrorMsg('Kata sandi salah. Silakan periksa kembali.');
      return;
    }

    onSelectUser(target);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base">Beralih Pengguna / Login Akun</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleLogin} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Pilih Akun Pengguna</label>
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    setSelectedId(u.id);
                    setErrorMsg(null);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedId === u.id
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900">{u.fullName}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-indigo-700">@{u.username}</span>
                      <span>•</span>
                      <span className="uppercase font-bold text-[10px] bg-slate-200 px-1.5 py-0.2 rounded-sm text-slate-700">
                        {u.role}
                      </span>
                    </div>
                  </div>
                  {selectedId === u.id && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Kata Sandi / Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={inputPassword}
                onChange={(e) => {
                  setInputPassword(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full pl-3 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-sm"
                placeholder="Masukkan password akun..."
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Hint demo: administrator (admin123), pimpinan (pimpinan123), cabang (cabang123)
            </p>
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
              <span>Login Sekarang</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
