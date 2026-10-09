import React, { useState } from 'react';
import { UserAccount, BranchMaster, UserRole } from '../types';
import {
  Users,
  UserPlus,
  KeyRound,
  ShieldCheck,
  Lock,
  Unlock,
  Building2,
  Trash2,
  Edit2,
  Check,
  X,
} from 'lucide-react';

interface UserManagementViewProps {
  users: UserAccount[];
  branches: BranchMaster[];
  onSaveUsers: (users: UserAccount[]) => void;
  currentUser: UserAccount;
  onActivityLogged: (action: any, module: string, desc: string) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  branches,
  onSaveUsers,
  currentUser,
  onActivityLogged,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    role: 'admin_cabang' as UserRole,
    assignedBranchId: 'CAB-01',
    email: '',
    password: '',
    isActive: true,
    canEditThreshold: false,
    canDeleteRecords: false,
    canExportImport: true,
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      fullName: '',
      role: 'admin_cabang',
      assignedBranchId: branches[0]?.idCabang || 'CAB-01',
      email: '',
      password: '',
      isActive: true,
      canEditThreshold: false,
      canDeleteRecords: false,
      canExportImport: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: UserAccount) => {
    setEditingUser(u);
    setFormData({
      username: u.username,
      fullName: u.fullName,
      role: u.role,
      assignedBranchId: u.assignedBranchId || branches[0]?.idCabang || 'CAB-01',
      email: u.email,
      password: '',
      isActive: u.isActive,
      canEditThreshold: u.canEditThreshold,
      canDeleteRecords: u.canDeleteRecords,
      canExportImport: u.canExportImport,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: UserAccount[];

    if (editingUser) {
      updated = users.map((u) => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            username: formData.username,
            fullName: formData.fullName,
            role: formData.role,
            assignedBranchId: formData.role === 'admin_cabang' ? formData.assignedBranchId : undefined,
            email: formData.email,
            passwordHash: formData.password ? formData.password : u.passwordHash,
            isActive: formData.isActive,
            canEditThreshold: formData.role === 'administrator' || formData.canEditThreshold,
            canDeleteRecords: formData.role === 'administrator' || formData.canDeleteRecords,
            canExportImport: formData.canExportImport,
          };
        }
        return u;
      });
      onActivityLogged('EDIT', 'Manajemen Pengguna', `Memperbarui akun pengguna: ${formData.fullName} (${formData.role})`);
    } else {
      const newUser: UserAccount = {
        id: `USR-${Date.now().toString().slice(-4)}`,
        username: formData.username,
        fullName: formData.fullName,
        role: formData.role,
        assignedBranchId: formData.role === 'admin_cabang' ? formData.assignedBranchId : undefined,
        email: formData.email,
        passwordHash: formData.password || '123456',
        isActive: formData.isActive,
        canEditThreshold: formData.role === 'administrator' || formData.canEditThreshold,
        canDeleteRecords: formData.role === 'administrator' || formData.canDeleteRecords,
        canExportImport: formData.canExportImport,
      };
      updated = [...users, newUser];
      onActivityLogged('TAMBAH', 'Manajemen Pengguna', `Menambahkan pengguna baru: ${newUser.fullName} (${newUser.role})`);
    }

    onSaveUsers(updated);
    setIsModalOpen(false);
  };

  const handleToggleActive = (u: UserAccount) => {
    const updated = users.map((item) => (item.id === u.id ? { ...item, isActive: !item.isActive } : item));
    onSaveUsers(updated);
    onActivityLogged(
      'EDIT',
      'Manajemen Pengguna',
      `Mengubah status akses akun ${u.fullName} menjadi ${!u.isActive ? 'AKTIF' : 'TERKUNCI'}`
    );
  };

  const handleDelete = (u: UserAccount) => {
    if (u.id === currentUser.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.');
      return;
    }
    if (confirm(`Hapus akun pengguna ${u.fullName} (${u.username})?`)) {
      const updated = users.filter((item) => item.id !== u.id);
      onSaveUsers(updated);
      onActivityLogged('HAPUS', 'Manajemen Pengguna', `Menghapus akun pengguna: ${u.fullName}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              Manajemen Pengguna &amp; Batasan Kapasitas Akses
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan kata sandi, hak akses cabang, kontrol pengubahan threshold, izin hapus data, dan status kunci akses.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 self-start lg:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Pengguna Baru</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Nama Lengkap &amp; Username</th>
                <th className="py-3.5 px-4">Role Kapasitas</th>
                <th className="py-3.5 px-4">Batasan Cabang</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4 text-center">Hak Ubah Threshold</th>
                <th className="py-3.5 px-4 text-center">Hak Hapus Data</th>
                <th className="py-3.5 px-4 text-center">Status Akses</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const branch = branches.find((b) => b.idCabang === u.assignedBranchId);
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <strong className="text-slate-900 block">{u.fullName}</strong>
                      <span className="font-mono text-slate-400 text-[11px]">@{u.username}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          u.role === 'administrator' || u.role === 'superadmin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'pimpinan'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {u.role === 'admin_cabang' ? (
                        <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{branch ? `${branch.idCabang} - ${branch.namaCabang}` : u.assignedBranchId}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Semua Cabang (Pusat)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{u.email}</td>
                    <td className="py-3.5 px-4 text-center">
                      {u.canEditThreshold ? (
                        <span className="text-emerald-600 font-bold">Ya</span>
                      ) : (
                        <span className="text-slate-400">Tidak</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {u.canDeleteRecords ? (
                        <span className="text-emerald-600 font-bold">Ya</span>
                      ) : (
                        <span className="text-slate-400">Tidak</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center justify-center gap-1 mx-auto cursor-pointer ${
                          u.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        {u.isActive ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        <span>{u.isActive ? 'Aktif' : 'Terkunci'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          title="Edit Pengguna"
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          title="Hapus Pengguna"
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Username Login</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Role / Kapasitas</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                  >
                    <option value="administrator">Administrator (Penuh)</option>
                    <option value="pimpinan">Pimpinan / Direksi</option>
                    <option value="admin_cabang">Admin Cabang (Terbatas)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Cabang Ditugaskan (Jika Admin Cabang)
                  </label>
                  <select
                    disabled={formData.role !== 'admin_cabang'}
                    value={formData.assignedBranchId}
                    onChange={(e) => setFormData({ ...formData, assignedBranchId: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 disabled:bg-slate-100"
                  >
                    {branches.map((b) => (
                      <option key={b.idCabang} value={b.idCabang}>
                        {b.idCabang} - {b.namaCabang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {editingUser ? 'Ganti Password (Kosongkan jika tetap)' : 'Password Baru'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                    placeholder={editingUser ? '••••••' : 'Password'}
                  />
                </div>
              </div>

              {/* Permissions Checkbox Grid */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-700 block mb-1">Batasan &amp; Izin Akses:</span>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.canEditThreshold}
                    onChange={(e) => setFormData({ ...formData, canEditThreshold: e.target.checked })}
                    className="rounded-sm text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-800">Boleh merubah nilai threshold selisih (&gt;300ml / &gt;12pcs)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.canDeleteRecords}
                    onChange={(e) => setFormData({ ...formData, canDeleteRecords: e.target.checked })}
                    className="rounded-sm text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-800">Boleh menghapus data catatan inventory &amp; cabang</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded-sm text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-800 font-semibold">Akun Aktif (Dapat Login)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Pengguna</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
