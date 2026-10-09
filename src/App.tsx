/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BranchMaster,
  DatabaseBulanBibitItem,
  DatabaseBulanKemasanItem,
  BarangMasukItem,
  BarangKeluarBibitItem,
  BarangKeluarKemasanItem,
  FinancialAnalysisRecord,
  ThresholdConfig,
  UserAccount,
  ActivityLog,
} from './types';
import { storageService } from './services/storage';
import { initAuth } from './services/googleWorkspace';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { ThresholdModal } from './components/ThresholdModal';
import { NewMonthSheetModal } from './components/NewMonthSheetModal';
import { SwitchUserModal } from './components/SwitchUserModal';
import { PasswordModal } from './components/PasswordModal';

// Views
import { DashboardView } from './views/DashboardView';
import { BibitMonthlyView } from './views/BibitMonthlyView';
import { KemasanMonthlyView } from './views/KemasanMonthlyView';
import { BranchMasterView } from './views/BranchMasterView';
import { BarangMasukView } from './views/BarangMasukView';
import { BarangKeluarView } from './views/BarangKeluarView';
import { FinancialAnalysisView } from './views/FinancialAnalysisView';
import { BranchSummaryAndAdviceView } from './views/BranchSummaryAndAdviceView';
import { LeadershipReportView } from './views/LeadershipReportView';
import { GoogleSyncView } from './views/GoogleSyncView';
import { ImportExportView } from './views/ImportExportView';
import { UserManagementView } from './views/UserManagementView';
import { ActivityLogView } from './views/ActivityLogView';

export default function App() {
  // Global Period & Branch Selection
  const [currentMonth, setCurrentMonth] = useState('2026-10');
  const [selectedBranchId, setSelectedBranchId] = useState('ALL');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // App Data State
  const [branches, setBranches] = useState<BranchMaster[]>([]);
  const [bibitList, setBibitList] = useState<DatabaseBulanBibitItem[]>([]);
  const [kemasanList, setKemasanList] = useState<DatabaseBulanKemasanItem[]>([]);
  const [masukList, setMasukList] = useState<BarangMasukItem[]>([]);
  const [keluarBibitList, setKeluarBibitList] = useState<BarangKeluarBibitItem[]>([]);
  const [keluarKemasanList, setKeluarKemasanList] = useState<BarangKeluarKemasanItem[]>([]);
  const [financialList, setFinancialList] = useState<FinancialAnalysisRecord[]>([]);
  const [thresholds, setThresholds] = useState<ThresholdConfig>(storageService.getThresholds());
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount>(storageService.getCurrentUser());
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Google Workspace Connection State
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleUserEmail, setGoogleUserEmail] = useState<string | undefined>();

  // Modals
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
  const [isNewMonthModalOpen, setIsNewMonthModalOpen] = useState(false);
  const [isSwitchUserModalOpen, setIsSwitchUserModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Load all initial data
  const reloadData = () => {
    setBranches(storageService.getBranches());
    setBibitList(storageService.getBibitMonthly());
    setKemasanList(storageService.getKemasanMonthly());
    setMasukList(storageService.getBarangMasuk());
    setKeluarBibitList(storageService.getBarangKeluarBibit());
    setKeluarKemasanList(storageService.getBarangKeluarKemasan());
    setFinancialList(storageService.getFinancialRecords());
    setThresholds(storageService.getThresholds());
    setUsers(storageService.getUsers());
    setCurrentUser(storageService.getCurrentUser());
    setLogs(storageService.getActivityLogs());
  };

  useEffect(() => {
    reloadData();

    // Init Google Auth listener
    const unsubscribe = initAuth(
      (user) => {
        setGoogleConnected(true);
        setGoogleUserEmail(user.email || undefined);
      },
      () => {
        setGoogleConnected(false);
        setGoogleUserEmail(undefined);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Sync selected branch if user is restricted
  useEffect(() => {
    if (currentUser.role === 'admin_cabang' && currentUser.assignedBranchId) {
      setSelectedBranchId(currentUser.assignedBranchId);
    }
  }, [currentUser]);

  // Log activity helper
  const handleLog = (
    action: ActivityLog['actionType'],
    targetModule: string,
    description: string,
    branchId?: string
  ) => {
    storageService.logActivity(action, targetModule, description, branchId);
    setLogs(storageService.getActivityLogs());
  };

  // Branch CRUD
  const handleAddBranch = (b: Omit<BranchMaster, 'id' | 'createdAt' | 'updatedAt'>) => {
    storageService.addBranch(b);
    reloadData();
  };

  const handleUpdateBranch = (id: string, updates: Partial<BranchMaster>) => {
    storageService.updateBranch(id, updates);
    reloadData();
  };

  const handleDeleteBranch = (id: string) => {
    storageService.deleteBranch(id);
    reloadData();
  };

  // Bibit Monthly CRUD
  const handleAddBibit = (
    item: Omit<DatabaseBulanBibitItem, 'id' | 'sisaMl' | 'selisihMl' | 'status' | 'updatedAt'>
  ) => {
    storageService.addBibitMonthlyItem(item);
    reloadData();
  };

  const handleUpdateBibit = (id: string, updates: Partial<DatabaseBulanBibitItem>) => {
    storageService.updateBibitMonthlyItem(id, updates);
    reloadData();
  };

  const handleDeleteBibit = (id: string) => {
    storageService.deleteBibitMonthlyItem(id);
    reloadData();
  };

  // Kemasan Monthly CRUD
  const handleAddKemasan = (
    item: Omit<DatabaseBulanKemasanItem, 'id' | 'sisaPcs' | 'selisihPcs' | 'status' | 'updatedAt'>
  ) => {
    storageService.addKemasanMonthlyItem(item);
    reloadData();
  };

  const handleUpdateKemasan = (id: string, updates: Partial<DatabaseBulanKemasanItem>) => {
    storageService.updateKemasanMonthlyItem(id, updates);
    reloadData();
  };

  const handleDeleteKemasan = (id: string) => {
    storageService.deleteKemasanMonthlyItem(id);
    reloadData();
  };

  // Barang Masuk
  const handleAddBarangMasuk = (item: Omit<BarangMasukItem, 'id'>, syncToMonthly: boolean) => {
    storageService.addBarangMasuk(item, syncToMonthly);
    reloadData();
  };

  const handleDeleteBarangMasuk = (id: string) => {
    storageService.deleteBarangMasuk(id);
    reloadData();
  };

  // Barang Keluar Bibit & Kemasan
  const handleAddKeluarBibit = (
    item: Omit<BarangKeluarBibitItem, 'id' | 'keluarMl'>,
    syncToMonthly: boolean
  ) => {
    storageService.addBarangKeluarBibit(item, syncToMonthly);
    reloadData();
  };

  const handleDeleteKeluarBibit = (id: string) => {
    storageService.deleteBarangKeluarBibit(id);
    reloadData();
  };

  const handleAddKeluarKemasan = (
    item: Omit<BarangKeluarKemasanItem, 'id'>,
    syncToMonthly: boolean
  ) => {
    storageService.addBarangKeluarKemasan(item, syncToMonthly);
    reloadData();
  };

  const handleDeleteKeluarKemasan = (id: string) => {
    storageService.deleteBarangKeluarKemasan(id);
    reloadData();
  };

  // Financial
  const handleUpsertFinancial = (rec: FinancialAnalysisRecord) => {
    storageService.upsertFinancialRecord(rec);
    reloadData();
  };

  // Thresholds
  const handleSaveThresholds = (bibitMl: number, kemasanPcs: number) => {
    const updated = storageService.updateThresholds(bibitMl, kemasanPcs);
    setThresholds(updated);
    reloadData();
  };

  // Buka Lembar Baru Bulan
  const handleConfirmNewMonth = (
    targetBulan: string,
    sourceBulan: string,
    carryForward: boolean
  ) => {
    const res = storageService.bukaLembarBaruBulan(targetBulan, sourceBulan, carryForward);
    setCurrentMonth(targetBulan);
    reloadData();
    alert(
      `Sukses membuka lembar baru periode ${targetBulan}!\n${res.bibitCount} data bibit dan ${res.kemasanCount} data kemasan telah disiapkan.`
    );
  };

  // Users & Password
  const handleSaveUsers = (newUsers: UserAccount[]) => {
    storageService.saveUsers(newUsers);
    setUsers(newUsers);
  };

  const handleSelectUser = (user: UserAccount) => {
    storageService.setCurrentUser(user);
    setCurrentUser(user);
    reloadData();
  };

  const handleSavePassword = (newPass: string) => {
    const updated = users.map((u) => (u.id === currentUser.id ? { ...u, passwordHash: newPass } : u));
    storageService.saveUsers(updated);
    storageService.logActivity('GANTI_PASSWORD', 'Keamanan Akun', `User ${currentUser.fullName} mengganti password`);
    setUsers(updated);
    alert('Password berhasil diperbarui.');
  };

  // Import Data handler
  const handleImportData = (target: string, rows: any[]) => {
    if (target === 'CABANG') {
      rows.forEach((r) => {
        storageService.addBranch({
          idCabang: r['ID Cabang'] || r.idCabang || `CAB-${Math.floor(Math.random() * 90 + 10)}`,
          namaCabang: r['Nama Cabang'] || r.namaCabang || 'Cabang Baru',
          kodeBarangUtama: r['Kode Barang'] || r.kodeBarangUtama || 'BBT-001',
          jenisBarang: r['Jenis Barang'] || r.jenisBarang || 'Bibit & Botol',
          namaBarangUtama: r['Nama Barang'] || r.namaBarangUtama || 'Parfum',
          kategori: r['Kategori'] || r.kategori || 'Floral',
          keteranganAnalisisKemarin: r['Keterangan Analisis Bulan Kemarin'] || r.keteranganAnalisisKemarin || '-',
        });
      });
    } else if (target === 'BIBIT') {
      rows.forEach((r) => {
        storageService.addBibitMonthlyItem({
          bulan: currentMonth,
          idCabang: r['ID Cabang'] || r.idCabang || branches[0]?.idCabang || 'CAB-01',
          namaCabang: r['Nama Cabang'] || r.namaCabang || branches[0]?.namaCabang || 'Cabang',
          kodeBibit: r['Kode Bibit'] || r.kodeBibit || 'BBT-001',
          namaBibit: r['Nama Bibit'] || r.namaBibit || 'Bibit Impor',
          kategori: r['Kategori'] || r.kategori || 'Oriental',
          stokAwalMl: Number(r['Stok Awal (ml)'] || r.stokAwalMl || 0),
          masukMl: Number(r['Masuk (ml)'] || r.masukMl || 0),
          keluarMl: Number(r['Keluar (ml)'] || r.keluarMl || 0),
          catatan: r['Catatan'] || r.catatan || 'Data diimpor',
        });
      });
    } else if (target === 'KEMASAN') {
      rows.forEach((r) => {
        storageService.addKemasanMonthlyItem({
          bulan: currentMonth,
          idCabang: r['ID Cabang'] || r.idCabang || branches[0]?.idCabang || 'CAB-01',
          namaCabang: r['Nama Cabang'] || r.namaCabang || branches[0]?.namaCabang || 'Cabang',
          kodeKemasan: r['Kode Kemasan'] || r.kodeKemasan || 'KMS-30S',
          namaKemasan: r['Nama Kemasan'] || r.namaKemasan || 'Botol Impor',
          type: r['Type'] || r.type || 'Spray',
          stokAwalPcs: Number(r['Stok Awal (pcs)'] || r.stokAwalPcs || 0),
          masukPcs: Number(r['Masuk (pcs)'] || r.masukPcs || 0),
          keluarPcs: Number(r['Keluar (pcs)'] || r.keluarPcs || 0),
          catatan: r['Catatan'] || r.catatan || 'Data diimpor',
        });
      });
    } else if (target === 'MASUK') {
      rows.forEach((r) => {
        storageService.addBarangMasuk(
          {
            tanggal: r['Tanggal'] || r.tanggal || new Date().toISOString().slice(0, 10),
            idCabang: r['ID Cabang'] || r.idCabang || branches[0]?.idCabang || 'CAB-01',
            namaCabang: r['Nama Cabang'] || r.namaCabang || branches[0]?.namaCabang || 'Cabang',
            jenisBarang: (r['Jenis'] || r.jenisBarang || 'Bibit') as any,
            kodeBarang: r['Kode Barang'] || r.kodeBarang || 'BRG-01',
            namaBarang: r['Nama Barang'] || r.namaBarang || 'Barang Masuk',
            kategoriAtauType: r['Kategori/Type'] || r.kategoriAtauType || '-',
            jumlah: Number(r['Jumlah'] || r.jumlah || 100),
            satuan: (r['Satuan'] || r.satuan || 'ml') as any,
            supplier: r['Supplier'] || r.supplier || '-',
            noFaktur: r['No Faktur'] || r.noFaktur || '-',
            keterangan: r['Keterangan'] || r.keterangan || '-',
            recordedBy: currentUser.fullName,
          },
          false
        );
      });
    }
    reloadData();
  };

  // Filtered views items based on Month and Branch
  const visibleBibit = bibitList.filter(
    (b) => b.bulan === currentMonth && (selectedBranchId === 'ALL' || b.idCabang === selectedBranchId)
  );

  const visibleKemasan = kemasanList.filter(
    (k) => k.bulan === currentMonth && (selectedBranchId === 'ALL' || k.idCabang === selectedBranchId)
  );

  const visibleFinancial = financialList.filter(
    (f) => f.bulan === currentMonth && (selectedBranchId === 'ALL' || f.idCabang === selectedBranchId)
  );

  const dangerCount =
    visibleBibit.filter((b) => b.status === 'DANGER').length +
    visibleKemasan.filter((k) => k.status === 'DANGER').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-indigo-600 selection:text-white">
      {/* Top Header */}
      <Header
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        selectedBranchId={selectedBranchId}
        onBranchChange={setSelectedBranchId}
        branches={branches}
        thresholds={thresholds}
        onOpenThresholdModal={() => setIsThresholdModalOpen(true)}
        currentUser={currentUser}
        onSwitchUser={() => setIsSwitchUserModalOpen(true)}
        onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
        bibitList={visibleBibit}
        kemasanList={visibleKemasan}
        googleConnected={googleConnected}
        googleUserEmail={googleUserEmail}
        onOpenGoogleSync={() => setActiveTab('google_sync')}
      />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 gap-6">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userRole={currentUser.role}
          dangerCount={dangerCount}
        />

        {/* View Content Canvas */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              currentMonth={currentMonth}
              branches={branches}
              bibitList={visibleBibit}
              kemasanList={visibleKemasan}
              financialList={visibleFinancial}
              thresholds={thresholds}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenNewMonthModal={() => setIsNewMonthModalOpen(true)}
              onOpenThresholdModal={() => setIsThresholdModalOpen(true)}
            />
          )}

          {activeTab === 'bibit_monthly' && (
            <BibitMonthlyView
              currentMonth={currentMonth}
              selectedBranchId={selectedBranchId}
              branches={branches}
              bibitList={visibleBibit}
              thresholds={thresholds}
              onOpenThresholdModal={() => setIsThresholdModalOpen(true)}
              onOpenNewMonthModal={() => setIsNewMonthModalOpen(true)}
              onAddItem={handleAddBibit}
              onUpdateItem={handleUpdateBibit}
              onDeleteItem={handleDeleteBibit}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'kemasan_monthly' && (
            <KemasanMonthlyView
              currentMonth={currentMonth}
              selectedBranchId={selectedBranchId}
              branches={branches}
              kemasanList={visibleKemasan}
              thresholds={thresholds}
              onOpenThresholdModal={() => setIsThresholdModalOpen(true)}
              onOpenNewMonthModal={() => setIsNewMonthModalOpen(true)}
              onAddItem={handleAddKemasan}
              onUpdateItem={handleUpdateKemasan}
              onDeleteItem={handleDeleteKemasan}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'branch_master' && (
            <BranchMasterView
              branches={branches}
              onAddBranch={handleAddBranch}
              onUpdateBranch={handleUpdateBranch}
              onDeleteBranch={handleDeleteBranch}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'barang_masuk' && (
            <BarangMasukView
              barangMasukList={masukList}
              branches={branches}
              onAddBarangMasuk={handleAddBarangMasuk}
              onDeleteBarangMasuk={handleDeleteBarangMasuk}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'barang_keluar' && (
            <BarangKeluarView
              keluarBibitList={keluarBibitList}
              keluarKemasanList={keluarKemasanList}
              branches={branches}
              onAddKeluarBibit={handleAddKeluarBibit}
              onDeleteKeluarBibit={handleDeleteKeluarBibit}
              onAddKeluarKemasan={handleAddKeluarKemasan}
              onDeleteKeluarKemasan={handleDeleteKeluarKemasan}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'financial' && (
            <FinancialAnalysisView
              currentMonth={currentMonth}
              selectedBranchId={selectedBranchId}
              branches={branches}
              financialList={visibleFinancial}
              onUpsertFinancial={handleUpsertFinancial}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'summary_advice' && (
            <BranchSummaryAndAdviceView
              currentMonth={currentMonth}
              branches={branches}
              bibitList={visibleBibit}
              kemasanList={visibleKemasan}
              financialList={visibleFinancial}
              thresholds={thresholds}
              onOpenThresholdModal={() => setIsThresholdModalOpen(true)}
            />
          )}

          {activeTab === 'leadership_report' && (
            <LeadershipReportView
              currentMonth={currentMonth}
              selectedBranchId={selectedBranchId}
              branches={branches}
              bibitList={visibleBibit}
              kemasanList={visibleKemasan}
              financialList={visibleFinancial}
              thresholds={thresholds}
            />
          )}

          {activeTab === 'google_sync' && (
            <GoogleSyncView
              currentMonth={currentMonth}
              branches={branches}
              bibitList={visibleBibit}
              kemasanList={visibleKemasan}
              masukList={masukList}
              keluarBibitList={keluarBibitList}
              keluarKemasanList={keluarKemasanList}
              financialList={visibleFinancial}
              currentUser={currentUser}
              isConnected={googleConnected}
              googleEmail={googleUserEmail}
              onConnectionChange={(conn, email) => {
                setGoogleConnected(conn);
                setGoogleUserEmail(email);
              }}
              onActivityLogged={handleLog}
            />
          )}

          {activeTab === 'export_import' && (
            <ImportExportView
              branches={branches}
              bibitList={visibleBibit}
              kemasanList={visibleKemasan}
              masukList={masukList}
              keluarBibitList={keluarBibitList}
              keluarKemasanList={keluarKemasanList}
              financialList={visibleFinancial}
              currentUser={currentUser}
              onImportData={handleImportData}
              onActivityLogged={handleLog}
            />
          )}

          {activeTab === 'user_management' && (
            <UserManagementView
              users={users}
              branches={branches}
              onSaveUsers={handleSaveUsers}
              currentUser={currentUser}
              onActivityLogged={handleLog}
            />
          )}

          {activeTab === 'activity_logs' && (
            <ActivityLogView
              logs={logs}
              onClearLogs={() => {
                storageService.clearActivityLogs();
                setLogs([]);
              }}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <ThresholdModal
        isOpen={isThresholdModalOpen}
        onClose={() => setIsThresholdModalOpen(false)}
        currentThresholds={thresholds}
        onSave={handleSaveThresholds}
        canEdit={currentUser.canEditThreshold}
      />

      <NewMonthSheetModal
        isOpen={isNewMonthModalOpen}
        onClose={() => setIsNewMonthModalOpen(false)}
        currentBulan={currentMonth}
        onConfirm={handleConfirmNewMonth}
      />

      <SwitchUserModal
        isOpen={isSwitchUserModalOpen}
        onClose={() => setIsSwitchUserModalOpen(false)}
        users={users}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
      />

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        currentUser={currentUser}
        onSavePassword={handleSavePassword}
      />
    </div>
  );
}
