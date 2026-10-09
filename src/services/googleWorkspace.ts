import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  BranchMaster,
  DatabaseBulanBibitItem,
  DatabaseBulanKemasanItem,
  BarangMasukItem,
  BarangKeluarBibitItem,
  BarangKeluarKemasanItem,
  FinancialAnalysisRecord,
} from '../types';

// Ensure Firebase is initialized only once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Required Workspace Scopes
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses dari Google OAuth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleLogout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface SyncPayload {
  bulan: string;
  branches: BranchMaster[];
  bibitList: DatabaseBulanBibitItem[];
  kemasanList: DatabaseBulanKemasanItem[];
  masukList: BarangMasukItem[];
  keluarBibitList: BarangKeluarBibitItem[];
  keluarKemasanList: BarangKeluarKemasanItem[];
  financialList: FinancialAnalysisRecord[];
}

/**
 * Creates or updates a Google Spreadsheet in the user's Google Drive and writes sheets for all modules.
 */
export async function syncToGoogleDriveAndSheets(payload: SyncPayload): Promise<{
  spreadsheetId: string;
  spreadsheetUrl: string;
}> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Anda belum login ke Google Workspace. Silakan hubungkan akun Google terlebih dahulu.');
  }

  const title = `V91.CabORD - Database Cabang [${payload.bulan}] - Sync ${new Date().toLocaleDateString('id-ID')}`;

  // 1. Create a new Spreadsheet with sheets
  const sheetNames = [
    'Ringkasan Cabang',
    'Database Bulan Bibit',
    'Database Bulan Kemasan',
    'Barang Masuk',
    'Barang Keluar Bibit',
    'Barang Keluar Kemasan',
    'Analisis Finansial',
  ];

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: sheetNames.map((name, index) => ({
        properties: {
          sheetId: index + 100,
          title: name,
        },
      })),
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gagal membuat Google Spreadsheet (HTTP ${createRes.status})`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  // Prepare data rows for each sheet
  const branchRows = [
    ['ID Cabang', 'Nama Cabang', 'Kode Barang Utama', 'Jenis Barang', 'Nama Barang', 'Kategori', 'Analisis Kemarin', 'Penanggung Jawab', 'Alamat', 'Telepon'],
    ...payload.branches.map((b) => [
      b.idCabang,
      b.namaCabang,
      b.kodeBarangUtama,
      b.jenisBarang,
      b.namaBarangUtama,
      b.kategori,
      b.keteranganAnalisisKemarin,
      b.penanggungJawab || '-',
      b.alamat || '-',
      b.telepon || '-',
    ]),
  ];

  const bibitRows = [
    ['Bulan', 'ID Cabang', 'Nama Cabang', 'Kode Bibit', 'Nama Bibit', 'Kategori', 'Stok Awal (ml)', 'Masuk (ml)', 'Keluar (ml)', 'Sisa (ml)', 'Selisih (ml)', 'Status Evaluasi', 'Catatan'],
    ...payload.bibitList.map((item) => [
      item.bulan,
      item.idCabang,
      item.namaCabang,
      item.kodeBibit,
      item.namaBibit,
      item.kategori,
      item.stokAwalMl,
      item.masukMl,
      item.keluarMl,
      item.sisaMl,
      item.selisihMl,
      item.status,
      item.catatan || '',
    ]),
  ];

  const kemasanRows = [
    ['Bulan', 'ID Cabang', 'Nama Cabang', 'Kode Kemasan', 'Nama Kemasan', 'Type', 'Stok Awal (pcs)', 'Masuk (pcs)', 'Keluar (pcs)', 'Sisa (pcs)', 'Selisih (pcs)', 'Status Evaluasi', 'Catatan'],
    ...payload.kemasanList.map((item) => [
      item.bulan,
      item.idCabang,
      item.namaCabang,
      item.kodeKemasan,
      item.namaKemasan,
      item.type,
      item.stokAwalPcs,
      item.masukPcs,
      item.keluarPcs,
      item.sisaPcs,
      item.selisihPcs,
      item.status,
      item.catatan || '',
    ]),
  ];

  const masukRows = [
    ['Tanggal', 'ID Cabang', 'Nama Cabang', 'Jenis', 'Kode Barang', 'Nama Barang', 'Kategori/Type', 'Jumlah', 'Satuan', 'Supplier', 'No Faktur', 'Keterangan', 'Petugas'],
    ...payload.masukList.map((m) => [
      m.tanggal,
      m.idCabang,
      m.namaCabang,
      m.jenisBarang,
      m.kodeBarang,
      m.namaBarang,
      m.kategoriAtauType,
      m.jumlah,
      m.satuan,
      m.supplier,
      m.noFaktur,
      m.keterangan,
      m.recordedBy,
    ]),
  ];

  const keluarBibitRows = [
    ['Tanggal', 'ID Cabang', 'Nama Cabang', 'Kode Bibit', 'Nama Bibit', 'Kategori', 'Kemasan Botol (ml)', 'Persentase Bibit (%)', 'Keluar/ml (Otomatis)', 'Harga Jual (Rp)', 'No Transaksi', 'Keterangan'],
    ...payload.keluarBibitList.map((k) => [
      k.tanggal,
      k.idCabang,
      k.namaCabang,
      k.kodeBibit,
      k.namaBibit,
      k.kategori,
      k.kemasanBotolMl,
      k.persentaseBibit,
      k.keluarMl,
      k.hargaJual,
      k.noTransaksi || '-',
      k.keterangan || '',
    ]),
  ];

  const keluarKemasanRows = [
    ['Tanggal', 'ID Cabang', 'Nama Cabang', 'Kode Kemasan', 'Nama Kemasan', 'Type', 'Keluar (pcs)', 'Tujuan', 'Keterangan'],
    ...payload.keluarKemasanList.map((k) => [
      k.tanggal,
      k.idCabang,
      k.namaCabang,
      k.kodeKemasan,
      k.namaKemasan,
      k.type,
      k.keluarPcs,
      k.tujuan,
      k.keterangan || '',
    ]),
  ];

  const financialRows = [
    ['Bulan', 'ID Cabang', 'Nama Cabang', 'Total Keluar Bibit (ml)', 'Total Omset Penjualan (Rp)', 'Kemasan Keluar (pcs)', 'Estimasi HPP Bibit', 'Estimasi HPP Botol', 'Biaya Operasional', 'Laba Bersih', 'Catatan Evaluasi'],
    ...payload.financialList.map((f) => [
      f.bulan,
      f.idCabang,
      f.namaCabang,
      f.totalKeluarBibitMl,
      f.totalHargaJualBibit,
      f.totalKemasanKeluarPcs,
      f.estimasiBiayaBibit,
      f.estimasiBiayaKemasan,
      f.estimasiPengeluaranOperasional,
      f.estimasiLabaBersih,
      f.catatanEvaluasi,
    ]),
  ];

  // Batch update spreadsheet values
  const dataPayload = [
    { range: "'Ringkasan Cabang'!A1", values: branchRows },
    { range: "'Database Bulan Bibit'!A1", values: bibitRows },
    { range: "'Database Bulan Kemasan'!A1", values: kemasanRows },
    { range: "'Barang Masuk'!A1", values: masukRows },
    { range: "'Barang Keluar Bibit'!A1", values: keluarBibitRows },
    { range: "'Barang Keluar Kemasan'!A1", values: keluarKemasanRows },
    { range: "'Analisis Finansial'!A1", values: financialRows },
  ];

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: dataPayload,
      }),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gagal mengisi data Google Spreadsheet (HTTP ${updateRes.status})`);
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
  };
}
