export type UserRole = 'administrator' | 'superadmin' | 'pimpinan' | 'admin_cabang';

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  assignedBranchId?: string; // If admin_cabang, restricted to this branch
  email: string;
  passwordHash?: string;
  isActive: boolean;
  canEditThreshold: boolean;
  canDeleteRecords: boolean;
  canExportImport: boolean;
  lastLogin?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  actionType: 'LOGIN' | 'LOGOUT' | 'TAMBAH' | 'EDIT' | 'HAPUS' | 'LEMBAR_BARU' | 'EXPORT_DATA' | 'IMPORT_DATA' | 'CETAK_PDF' | 'SYNC_GOOGLE' | 'GANTI_PASSWORD' | 'UPDATE_THRESHOLD';
  targetModule: string;
  description: string;
  branchId?: string;
}

export interface BranchMaster {
  id: string; // e.g. CAB-01
  idCabang: string; // User-facing ID Cabang
  namaCabang: string;
  kodeBarangUtama: string;
  jenisBarang: string; // Bibit, Botol Kemasan, dsb.
  namaBarangUtama: string;
  kategori: string;
  keteranganAnalisisKemarin: string;
  alamat?: string;
  penanggungJawab?: string;
  telepon?: string;
  createdAt: string;
  updatedAt: string;
}

export type StatusEvaluasi = 'AMAN' | 'TIDAK_AMAN' | 'DANGER';

export interface DatabaseBulanBibitItem {
  id: string;
  bulan: string; // YYYY-MM
  idCabang: string;
  namaCabang: string;
  kodeBibit: string;
  namaBibit: string;
  kategori: string;
  stokAwalMl: number;
  masukMl: number;
  keluarMl: number;
  sisaMl: number; // stokAwal + masuk - keluar
  selisihMl: number; // keluar - masuk (atau pemakaian melebihi pasokan)
  status: StatusEvaluasi;
  catatan?: string;
  updatedAt: string;
}

export interface DatabaseBulanKemasanItem {
  id: string;
  bulan: string; // YYYY-MM
  idCabang: string;
  namaCabang: string;
  kodeKemasan: string;
  namaKemasan: string;
  type: string; // Spray, Roll On, Dropper, Flacon, etc.
  stokAwalPcs: number;
  masukPcs: number;
  keluarPcs: number;
  sisaPcs: number;
  selisihPcs: number;
  status: StatusEvaluasi;
  catatan?: string;
  updatedAt: string;
}

export interface BarangMasukItem {
  id: string;
  tanggal: string; // YYYY-MM-DD
  idCabang: string;
  namaCabang: string;
  jenisBarang: 'Bibit' | 'Kemasan';
  kodeBarang: string;
  namaBarang: string;
  kategoriAtauType: string;
  jumlah: number; // ml or pcs
  satuan: 'ml' | 'pcs';
  supplier: string;
  noFaktur: string;
  keterangan: string;
  recordedBy: string;
}

export interface BarangKeluarBibitItem {
  id: string;
  tanggal: string;
  idCabang: string;
  namaCabang: string;
  kodeBibit: string;
  namaBibit: string;
  kategori: string;
  kemasanBotolMl: number; // ukuran botol (ml), misal 30ml
  persentaseBibit: number; // persen bibit (misal 50%)
  keluarMl: number; // hasil otomatis = kemasanBotolMl * (persentaseBibit / 100)
  hargaJual: number; // Rp
  noTransaksi?: string;
  keterangan?: string;
  recordedBy: string;
}

export interface BarangKeluarKemasanItem {
  id: string;
  tanggal: string;
  idCabang: string;
  namaCabang: string;
  kodeKemasan: string;
  namaKemasan: string;
  type: string;
  keluarPcs: number;
  tujuan: string; // Penjualan Toko, Sample, Rusak/Afkir, etc.
  keterangan?: string;
  recordedBy: string;
}

export interface FinancialAnalysisRecord {
  id: string;
  bulan: string; // YYYY-MM
  idCabang: string;
  namaCabang: string;
  totalKeluarBibitMl: number;
  totalHargaJualBibit: number; // Pemasukan Penjualan
  totalKemasanKeluarPcs: number;
  estimasiBiayaBibit: number; // Biaya HPP perkiraan
  estimasiBiayaKemasan: number;
  estimasiPengeluaranOperasional: number;
  estimasiLabaKotor: number;
  estimasiLabaBersih: number;
  catatanEvaluasi: string;
}

export interface ThresholdConfig {
  thresholdBibitMl: number; // Default 300 ml
  thresholdKemasanPcs: number; // Default 12 pcs
  updatedAt: string;
  updatedBy: string;
}

export interface GoogleSyncState {
  isConnected: boolean;
  userEmail?: string;
  userName?: string;
  lastSyncedAt?: string;
  sheetId?: string;
  sheetUrl?: string;
  isSyncing: boolean;
  syncError?: string;
}
