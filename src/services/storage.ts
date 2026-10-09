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
  StatusEvaluasi,
} from '../types';

const STORAGE_KEYS = {
  BRANCHES: 'v91_branches_v1',
  BIBIT_MONTHLY: 'v91_bibit_monthly_v1',
  KEMASAN_MONTHLY: 'v91_kemasan_monthly_v1',
  BARANG_MASUK: 'v91_barang_masuk_v1',
  BARANG_KELUAR_BIBIT: 'v91_barang_keluar_bibit_v1',
  BARANG_KELUAR_KEMASAN: 'v91_barang_keluar_kemasan_v1',
  FINANCIAL: 'v91_financial_v1',
  THRESHOLDS: 'v91_thresholds_v1',
  USERS: 'v91_users_v1',
  CURRENT_USER: 'v91_current_user_v1',
  LOGS: 'v91_activity_logs_v1',
};

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  thresholdBibitMl: 300, // Default 300ml
  thresholdKemasanPcs: 12, // Default 12pcs
  updatedAt: new Date().toISOString(),
  updatedBy: 'Sistem V91',
};

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'USR-01',
    username: 'administrator',
    fullName: 'Chief Administrator (Pusat)',
    role: 'administrator',
    email: 'admin@v91cabord.com',
    passwordHash: 'admin123',
    isActive: true,
    canEditThreshold: true,
    canDeleteRecords: true,
    canExportImport: true,
  },
  {
    id: 'USR-02',
    username: 'pimpinan',
    fullName: 'Bpk. Direktur Operasional',
    role: 'pimpinan',
    email: 'pimpinan@v91cabord.com',
    passwordHash: 'pimpinan123',
    isActive: true,
    canEditThreshold: true,
    canDeleteRecords: false,
    canExportImport: true,
  },
  {
    id: 'USR-03',
    username: 'admin_bdg',
    fullName: 'Staff Admin V91 Bandung',
    role: 'admin_cabang',
    assignedBranchId: 'CAB-01',
    email: 'bandung@v91cabord.com',
    passwordHash: 'cabang123',
    isActive: true,
    canEditThreshold: false,
    canDeleteRecords: false,
    canExportImport: true,
  },
  {
    id: 'USR-04',
    username: 'admin_sby',
    fullName: 'Staff Admin V91 Surabaya',
    role: 'admin_cabang',
    assignedBranchId: 'CAB-02',
    email: 'surabaya@v91cabord.com',
    passwordHash: 'cabang123',
    isActive: true,
    canEditThreshold: false,
    canDeleteRecords: false,
    canExportImport: true,
  },
];

const INITIAL_BRANCHES: BranchMaster[] = [
  {
    id: 'CAB-01',
    idCabang: 'CAB-01',
    namaCabang: 'V91 Bandung Pusat',
    kodeBarangUtama: 'BBT-001',
    jenisBarang: 'Bibit Minyak Wangi & Botol Mewah',
    namaBarangUtama: 'Baccarat Rouge 540 Extra',
    kategori: 'Oriental Floral Luxury',
    keteranganAnalisisKemarin: 'Permintaan aroma manis woody sangat tinggi, stok botol 30ml silver sempat menipis di akhir bulan.',
    alamat: 'Jl. Riau No. 91, Bandung',
    penanggungJawab: 'Ahmad Fauzi',
    telepon: '0812-9100-0001',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'CAB-02',
    idCabang: 'CAB-02',
    namaCabang: 'V91 Surabaya Barat',
    kodeBarangUtama: 'BBT-003',
    jenisBarang: 'Bibit Minyak Wangi & Botol Spray',
    namaBarangUtama: 'Sauvage Elixir Bold',
    kategori: 'Woody Spicy Fresh',
    keteranganAnalisisKemarin: 'Tren pria meningkat pesat, varian fresh spicy mendominasi penjualan, selisih kemasan 50ml terpantau aman.',
    alamat: 'Jl. Mayjen Sungkono No. 45, Surabaya',
    penanggungJawab: 'Rian Hidayat',
    telepon: '0813-9100-0002',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'CAB-03',
    idCabang: 'CAB-03',
    namaCabang: 'V91 Jakarta Selatan',
    kodeBarangUtama: 'BBT-002',
    jenisBarang: 'Bibit Konsentrat & Kemasan Premium',
    namaBarangUtama: 'Black Opium Floral Gourmand',
    kategori: 'Gourmand Sweet Vanilla',
    keteranganAnalisisKemarin: 'Ada catatan selisih bibit melebihi 320ml pada pengisian botol 50ml karena tumpahan saat display.',
    alamat: 'Jl. Kemang Raya No. 12, Jakarta Selatan',
    penanggungJawab: 'Siti Nurhaliza',
    telepon: '0811-9100-0003',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'CAB-04',
    idCabang: 'CAB-04',
    namaCabang: 'V91 Yogyakarta Malioboro',
    kodeBarangUtama: 'BBT-005',
    jenisBarang: 'Bibit Murni & Botol Roll-on',
    namaBarangUtama: 'English Pear & Freesia',
    kategori: 'Fruity Floral Elegance',
    keteranganAnalisisKemarin: 'Perputaran kemasan roll on 10ml sangat cepat untuk wisatan, stok aman dan sisa positif.',
    alamat: 'Jl. Malioboro No. 88, Yogyakarta',
    penanggungJawab: 'Bambang Tri',
    telepon: '0812-9100-0004',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-10-01T08:00:00Z',
  },
];

const CURRENT_MONTH = '2026-10';

export function calculateBibitStatus(
  masukMl: number,
  keluarMl: number,
  sisaMl: number,
  thresholdMl: number
): { status: StatusEvaluasi; selisihMl: number } {
  // Selisih = pemakaian keluar dibanding masuk atau deviasi
  const selisihMl = keluarMl - masukMl;

  // Aturan spesifik brief:
  // "namun jika minus pada data sisa tergolong (danger)"
  if (sisaMl < 0) {
    return { status: 'DANGER', selisihMl };
  }

  // "analisis selisih lebih dari 300ml (bisa dirubah kapanpun nilai selisih) lebih banyak dari data masuk maka (tidak aman) jika dibawah itu aman"
  if (selisihMl > thresholdMl) {
    return { status: 'TIDAK_AMAN', selisihMl };
  }

  return { status: 'AMAN', selisihMl };
}

export function calculateKemasanStatus(
  masukPcs: number,
  keluarPcs: number,
  sisaPcs: number,
  thresholdPcs: number
): { status: StatusEvaluasi; selisihPcs: number } {
  const selisihPcs = keluarPcs - masukPcs;

  // Jika minus pada sisa tergolong danger
  if (sisaPcs < 0) {
    return { status: 'DANGER', selisihPcs };
  }

  // Lebih dari 12 pcs (atau threshold) lebih banyak dari data masuk maka tidak aman
  if (selisihPcs > thresholdPcs) {
    return { status: 'TIDAK_AMAN', selisihPcs };
  }

  return { status: 'AMAN', selisihPcs };
}

const INITIAL_BIBIT_MONTHLY: DatabaseBulanBibitItem[] = [
  // CAB-01 (Bandung)
  {
    id: 'BIBIT-001',
    bulan: CURRENT_MONTH,
    idCabang: 'CAB-01',
    namaCabang: 'V91 Bandung Pusat',
    kodeBibit: 'BBT-001',
    namaBibit: 'Baccarat Rouge 540 Extra',
    kategori: 'Oriental Floral',
    stokAwalMl: 500,
    masukMl: 3000,
    keluarMl: 2650,
    sisaMl: 850,
    selisihMl: -350,
    status: 'AMAN',
    catatan: 'Permintaan stabil tinggi, pasokan masuk mencukupi',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'BIBIT-002',
    bulan: CURRENT_MONTH,
    idCabang: 'CAB-01',
    namaCabang: 'V91 Bandung Pusat',
    kodeBibit: 'BBT-002',
    namaBibit: 'Black Opium YSL Type',
    kategori: 'Gourmand Sweet',
    stokAwalMl: 200,
    masukMl: 1500,
    keluarMl: 1950, // keluar melebihi masuk 450ml (> 300 threshold)
    sisaMl: -250, // Minus -> DANGER
    selisihMl: 450,
    status: 'DANGER',
    catatan: 'Peringatan keras: Stok minus 250ml! Segera restock darurat.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'BIBIT-003',
    bulan: CURRENT_MONTH,
    idCabang: 'CAB-01',
    namaCabang: 'V91 Bandung Pusat',
    kodeBibit: 'BBT-003',
    namaBibit: 'Sauvage Elixir Bold',
    kategori: 'Woody Spicy',
    stokAwalMl: 1000,
    masukMl: 2000,
    keluarMl: 2450, // keluar melebihi masuk 450ml (> 300ml) tapi sisa masih positif 550ml -> TIDAK_AMAN
    sisaMl: 550,
    selisihMl: 450,
    status: 'TIDAK_AMAN',
    catatan: 'Waspada: Selisih keluar melebihi masuk > 300ml. Cek fisik stok display.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'BIBIT-004',
    bulan: CURRENT_MONTH,
    idCabang: 'CAB-01',
    namaCabang: 'V91 Bandung Pusat',
    kodeBibit: 'BBT-004',
    namaBibit: 'Aventus Creed Imperial',
    kategori: 'Fruity Chypre',
    stokAwalMl: 400,
    masukMl: 2500,
    keluarMl: 2100,
    sisaMl: 800,
    selisihMl: -400,
    status: 'AMAN',
    catatan: 'Perputaran normal lancar',
    updatedAt: new Date().toISOString(),
  },
  // CAB-02 (Surabaya)
  {
    id: 'BIBIT-005',
    bulan: CURRENT_MONTH,
    idCabang: 'CAB-02',
    namaCabang: 'V91 Surabaya Barat',
    kodeBibit: 'BBT-003',
    namaBibit: 'Sauvage Elixir Bold',
    kategori: 'Woody Spicy',
    stokAwalMl: 600,
    masukMl: 3500,
    keluarMl: 3100,
    sisaMl: 1000,
    selisihMl: -400,
    status: 'AMAN',
    catatan: 'Top seller pria, aman terkendali',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'BIBIT-006',
    bulan: CURRENT_MONTH,
    idCabang: 'CAB-02',
    namaCabang: 'V91 Surabaya Barat',
    kodeBibit: 'BBT-005',
    namaBibit: 'English Pear & Freesia',
    kategori: 'Floral Fresh',
    stokAwalMl: 100,
    masukMl: 1000,
    keluarMl: 1400, // keluar lebih banyak 400ml drpd masuk, sisa minus
    sisaMl: -300,
    selisihMl: 400,
    status: 'DANGER',
    catatan: 'Danger: Terjadi minus stok sisa 300ml, butuh audit pengisian botol.',
    updatedAt: new Date().toISOString(),
  },
  // CAB-03 (Jakarta Selatan)
  {
    id: 'BIBIT-007',
    bulan: CURRENT_MONTH,
    idCabang: 'CAB-03',
    namaCabang: 'V91 Jakarta Selatan',
    kodeBibit: 'BBT-001',
    namaBibit: 'Baccarat Rouge 540 Extra',
    kategori: 'Oriental Floral',
    stokAwalMl: 800,
    masukMl: 3000,
    keluarMl: 3380, // selisih 380ml > 300ml -> TIDAK_AMAN
    sisaMl: 420,
    selisihMl: 380,
    status: 'TIDAK_AMAN',
    catatan: 'Peringatan pimpinan: Pemakaian bulan ini melebihi pasokan masuk 380ml.',
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_KEMASAN_MONTHLY: DatabaseBulanKemasanItem[] = [
  // CAB-01
  {
    id: 'KMS-001',
    bulan: CURRENT_MONTH,
    idCabang: 'CAB-01',
    namaCabang: 'V91 Bandung Pusat',
    kodeKemasan: 'KMS-30S',
    namaKemasan: 'Botol Spray Kaca Silver 30ml',
    type: 'Spray Silver',
    stokAwalPcs: 50,
    masukPcs: 300,
    keluarPcs: 280,
    sisaPcs: 70,
    selisihPcs: -20,
    status: 'AMAN',
    catatan: 'Kemasan favorit 30ml',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'KMS-002',
    bulan: CURRENT_MONTH,
    idCabang: 'CAB-01',
    namaCabang: 'V91 Bandung Pusat',
    kodeKemasan: 'KMS-50G',
    namaKemasan: 'Botol Spray Kaca Gold 50ml',
    type: 'Spray Gold',
    stokAwalPcs: 30,
    masukPcs: 150,
    keluarPcs: 175, // keluar > masuk (selisih 25 > 12)
    sisaPcs: 5,
    selisihPcs: 25,
    status: 'TIDAK_AMAN',
    catatan: 'Waspada: Pengeluaran melebihi pasokan baru 25 pcs (> 12 pcs)',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'KMS-003',
    bulan: CURRENT_MONTH,
    idCabang: 'CAB-01',
    namaCabang: 'V91 Bandung Pusat',
    kodeKemasan: 'KMS-10R',
    namaKemasan: 'Botol Roll-On Kaca Tebal 10ml',
    type: 'Roll On',
    stokAwalPcs: 10,
    masukPcs: 100,
    keluarPcs: 125, // sisa minus 15
    sisaPcs: -15,
    selisihPcs: 25,
    status: 'DANGER',
    catatan: 'Danger: Botol roll-on minus 15 pcs! Terjadi pengeluaran tanpa input masuk.',
    updatedAt: new Date().toISOString(),
  },
  // CAB-02
  {
    id: 'KMS-004',
    bulan: CURRENT_MONTH,
    idCabang: 'CAB-02',
    namaCabang: 'V91 Surabaya Barat',
    kodeKemasan: 'KMS-30S',
    namaKemasan: 'Botol Spray Kaca Silver 30ml',
    type: 'Spray Silver',
    stokAwalPcs: 80,
    masukPcs: 400,
    keluarPcs: 360,
    sisaPcs: 120,
    selisihPcs: -40,
    status: 'AMAN',
    catatan: 'Aman terjaga',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'KMS-005',
    bulan: CURRENT_MONTH,
    idCabang: 'CAB-02',
    namaCabang: 'V91 Surabaya Barat',
    kodeKemasan: 'KMS-100D',
    namaKemasan: 'Botol Flacon Premium Dropper 100ml',
    type: 'Dropper Flacon',
    stokAwalPcs: 5,
    masukPcs: 30,
    keluarPcs: 48, // keluar > masuk selisih 18 > 12 pcs, sisa -13 pcs -> DANGER
    sisaPcs: -13,
    selisihPcs: 18,
    status: 'DANGER',
    catatan: 'Kritis: Kemasan dropper minus 13 pcs.',
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_BARANG_MASUK: BarangMasukItem[] = [
  {
    id: 'MSK-001',
    tanggal: '2026-10-02',
    idCabang: 'CAB-01',
    namaCabang: 'V91 Bandung Pusat',
    jenisBarang: 'Bibit',
    kodeBarang: 'BBT-001',
    namaBarang: 'Baccarat Rouge 540 Extra',
    kategoriAtauType: 'Oriental Floral',
    jumlah: 3000,
    satuan: 'ml',
    supplier: 'PT Fragrance Aroma Nusantara',
    noFaktur: 'FA-2026/10/012',
    keterangan: 'Kualitas grade A segel utuh',
    recordedBy: 'Ahmad Fauzi',
  },
  {
    id: 'MSK-002',
    tanggal: '2026-10-03',
    idCabang: 'CAB-01',
    namaCabang: 'V91 Bandung Pusat',
    jenisBarang: 'Kemasan',
    kodeBarang: 'KMS-30S',
    namaBarang: 'Botol Spray Kaca Silver 30ml',
    kategoriAtauType: 'Spray Silver',
    jumlah: 300,
    satuan: 'pcs',
    supplier: 'CV Jaya Botol Mandiri',
    noFaktur: 'JBM-9981',
    keterangan: 'Sudah termasuk nozzle atomizer',
    recordedBy: 'Ahmad Fauzi',
  },
  {
    id: 'MSK-003',
    tanggal: '2026-10-04',
    idCabang: 'CAB-02',
    namaCabang: 'V91 Surabaya Barat',
    jenisBarang: 'Bibit',
    kodeBarang: 'BBT-003',
    namaBarang: 'Sauvage Elixir Bold',
    kategoriAtauType: 'Woody Spicy',
    jumlah: 3500,
    satuan: 'ml',
    supplier: 'PT Fragrance Aroma Nusantara',
    noFaktur: 'FA-2026/10/044',
    keterangan: 'Batch baru aroma tajam',
    recordedBy: 'Rian Hidayat',
  },
];

const INITIAL_BARANG_KELUAR_BIBIT: BarangKeluarBibitItem[] = [
  {
    id: 'KLR-B-001',
    tanggal: '2026-10-05',
    idCabang: 'CAB-01',
    namaCabang: 'V91 Bandung Pusat',
    kodeBibit: 'BBT-001',
    namaBibit: 'Baccarat Rouge 540 Extra',
    kategori: 'Oriental Floral',
    kemasanBotolMl: 50,
    persentaseBibit: 60, // 60% bibit murni
    keluarMl: 30, // 50 * 0.60 = 30ml
    hargaJual: 185000,
    noTransaksi: 'TRX-BDG-1001',
    keterangan: 'Racikan Eau De Parfum 50ml tahan 12 jam',
    recordedBy: 'Ahmad Fauzi',
  },
  {
    id: 'KLR-B-002',
    tanggal: '2026-10-05',
    idCabang: 'CAB-01',
    namaCabang: 'V91 Bandung Pusat',
    kodeBibit: 'BBT-001',
    namaBibit: 'Baccarat Rouge 540 Extra',
    kategori: 'Oriental Floral',
    kemasanBotolMl: 30,
    persentaseBibit: 70, // 70% bibit murni
    keluarMl: 21, // 30 * 0.70 = 21ml
    hargaJual: 135000,
    noTransaksi: 'TRX-BDG-1002',
    keterangan: 'Kemasan 30ml spray silver',
    recordedBy: 'Ahmad Fauzi',
  },
  {
    id: 'KLR-B-003',
    tanggal: '2026-10-06',
    idCabang: 'CAB-02',
    namaCabang: 'V91 Surabaya Barat',
    kodeBibit: 'BBT-003',
    namaBibit: 'Sauvage Elixir Bold',
    kategori: 'Woody Spicy',
    kemasanBotolMl: 50,
    persentaseBibit: 50, // 50% bibit murni
    keluarMl: 25, // 50 * 0.50 = 25ml
    hargaJual: 160000,
    noTransaksi: 'TRX-SBY-2001',
    keterangan: 'Paket Gentleman Special',
    recordedBy: 'Rian Hidayat',
  },
];

const INITIAL_BARANG_KELUAR_KEMASAN: BarangKeluarKemasanItem[] = [
  {
    id: 'KLR-K-001',
    tanggal: '2026-10-05',
    idCabang: 'CAB-01',
    namaCabang: 'V91 Bandung Pusat',
    kodeKemasan: 'KMS-50G',
    namaKemasan: 'Botol Spray Kaca Gold 50ml',
    type: 'Spray Gold',
    keluarPcs: 1,
    tujuan: 'Penjualan Botol Racikan',
    keterangan: 'Pasangan transaksi TRX-BDG-1001',
    recordedBy: 'Ahmad Fauzi',
  },
  {
    id: 'KLR-K-002',
    tanggal: '2026-10-05',
    idCabang: 'CAB-01',
    namaCabang: 'V91 Bandung Pusat',
    kodeKemasan: 'KMS-30S',
    namaKemasan: 'Botol Spray Kaca Silver 30ml',
    type: 'Spray Silver',
    keluarPcs: 1,
    tujuan: 'Penjualan Botol Racikan',
    keterangan: 'Pasangan transaksi TRX-BDG-1002',
    recordedBy: 'Ahmad Fauzi',
  },
];

const INITIAL_FINANCIAL: FinancialAnalysisRecord[] = [
  {
    id: 'FIN-001',
    bulan: CURRENT_MONTH,
    idCabang: 'CAB-01',
    namaCabang: 'V91 Bandung Pusat',
    totalKeluarBibitMl: 2650,
    totalHargaJualBibit: 34500000,
    totalKemasanKeluarPcs: 280,
    estimasiBiayaBibit: 10600000, // HPP bibit
    estimasiBiayaKemasan: 2800000, // HPP botol
    estimasiPengeluaranOperasional: 6500000, // Gaji, listrik, sewa
    estimasiLabaKotor: 21100000,
    estimasiLabaBersih: 14600000,
    catatanEvaluasi: 'Performa penjualan sangat baik, efisiensi konversi bibit mencapai 94%. Waspada pengetatan stok Black Opium.',
  },
  {
    id: 'FIN-002',
    bulan: CURRENT_MONTH,
    idCabang: 'CAB-02',
    namaCabang: 'V91 Surabaya Barat',
    totalKeluarBibitMl: 3100,
    totalHargaJualBibit: 41200000,
    totalKemasanKeluarPcs: 360,
    estimasiBiayaBibit: 12400000,
    estimasiBiayaKemasan: 3600000,
    estimasiPengeluaranOperasional: 7200000,
    estimasiLabaKotor: 25200000,
    estimasiLabaBersih: 18000000,
    catatanEvaluasi: 'Omset tertinggi bulan ini. Perlu evaluasi stok dropper 100ml yang mengalami status minus.',
  },
  {
    id: 'FIN-003',
    bulan: CURRENT_MONTH,
    idCabang: 'CAB-03',
    namaCabang: 'V91 Jakarta Selatan',
    totalKeluarBibitMl: 3380,
    totalHargaJualBibit: 45800000,
    totalKemasanKeluarPcs: 390,
    estimasiBiayaBibit: 13520000,
    estimasiBiayaKemasan: 3900000,
    estimasiPengeluaranOperasional: 9500000,
    estimasiLabaKotor: 28380000,
    estimasiLabaBersih: 18880000,
    catatanEvaluasi: 'Omset besar dengan sewa tinggi. Selisih bibit 380ml perlu investigasi pimpinan.',
  },
  {
    id: 'FIN-004',
    bulan: CURRENT_MONTH,
    idCabang: 'CAB-04',
    namaCabang: 'V91 Yogyakarta Malioboro',
    totalKeluarBibitMl: 1950,
    totalHargaJualBibit: 24700000,
    totalKemasanKeluarPcs: 240,
    estimasiBiayaBibit: 7800000,
    estimasiBiayaKemasan: 2400000,
    estimasiPengeluaranOperasional: 5100000,
    estimasiLabaKotor: 14500000,
    estimasiLabaBersih: 9400000,
    catatanEvaluasi: 'Operasional sehat, rasio selisih rendah, perputaran botol 10ml roll-on sangat cepat.',
  },
];

const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'LOG-001',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    userId: 'USR-01',
    userName: 'Chief Administrator (Pusat)',
    userRole: 'administrator',
    actionType: 'LOGIN',
    targetModule: 'Sistem Autentikasi',
    description: 'Administrator berhasil login ke sistem V91.CabORD',
  },
  {
    id: 'LOG-002',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    userId: 'USR-01',
    userName: 'Chief Administrator (Pusat)',
    userRole: 'administrator',
    actionType: 'UPDATE_THRESHOLD',
    targetModule: 'Konfigurasi Penilaian',
    description: 'Inisialisasi threshold evaluasi: Selisih Bibit = 300 ml, Selisih Kemasan = 12 pcs',
  },
];

// Helper Storage Get/Set
function getStored<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key}:`, e);
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error(`Error writing ${key}:`, e);
  }
}

// STORAGE API SERVICE
export const storageService = {
  // Activity Logging
  logActivity(
    actionType: ActivityLog['actionType'],
    targetModule: string,
    description: string,
    branchId?: string
  ): void {
    const currentUser = storageService.getCurrentUser();
    const logs = storageService.getActivityLogs();
    const newLog: ActivityLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'ANONYMOUS',
      userName: currentUser?.fullName || 'Tamu',
      userRole: currentUser?.role || 'guest',
      actionType,
      targetModule,
      description,
      branchId,
    };
    logs.unshift(newLog);
    // Keep last 500 logs
    if (logs.length > 500) logs.length = 500;
    setStored(STORAGE_KEYS.LOGS, logs);
  },

  getActivityLogs(): ActivityLog[] {
    return getStored<ActivityLog[]>(STORAGE_KEYS.LOGS, INITIAL_LOGS);
  },

  clearActivityLogs(): void {
    setStored(STORAGE_KEYS.LOGS, []);
  },

  // Users & Auth
  getUsers(): UserAccount[] {
    return getStored<UserAccount[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  },

  saveUsers(users: UserAccount[]): void {
    setStored(STORAGE_KEYS.USERS, users);
  },

  getCurrentUser(): UserAccount {
    const saved = getStored<UserAccount | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (saved) return saved;
    return DEFAULT_USERS[0]; // Default to Administrator
  },

  setCurrentUser(user: UserAccount): void {
    setStored(STORAGE_KEYS.CURRENT_USER, user);
    storageService.logActivity('LOGIN', 'Autentikasi Pengguna', `User ${user.fullName} (${user.role}) beralih aktif`);
  },

  // Thresholds
  getThresholds(): ThresholdConfig {
    return getStored<ThresholdConfig>(STORAGE_KEYS.THRESHOLDS, DEFAULT_THRESHOLDS);
  },

  updateThresholds(newBibitMl: number, newKemasanPcs: number): ThresholdConfig {
    const cur = storageService.getCurrentUser();
    const config: ThresholdConfig = {
      thresholdBibitMl: Math.max(0, newBibitMl),
      thresholdKemasanPcs: Math.max(0, newKemasanPcs),
      updatedAt: new Date().toISOString(),
      updatedBy: cur.fullName,
    };
    setStored(STORAGE_KEYS.THRESHOLDS, config);

    // Re-evaluate existing items with new thresholds
    storageService.recalculateAllEvaluations(config);

    storageService.logActivity(
      'UPDATE_THRESHOLD',
      'Threshold Penilaian',
      `Nilai selisih dirubah: Bibit = ${config.thresholdBibitMl} ml, Kemasan = ${config.thresholdKemasanPcs} pcs`
    );
    return config;
  },

  recalculateAllEvaluations(thresholds?: ThresholdConfig): void {
    const cfg = thresholds || storageService.getThresholds();
    const bibit = storageService.getBibitMonthly();
    const updatedBibit = bibit.map((item) => {
      const evalRes = calculateBibitStatus(item.masukMl, item.keluarMl, item.sisaMl, cfg.thresholdBibitMl);
      return {
        ...item,
        status: evalRes.status,
        selisihMl: evalRes.selisihMl,
      };
    });
    setStored(STORAGE_KEYS.BIBIT_MONTHLY, updatedBibit);

    const kemasan = storageService.getKemasanMonthly();
    const updatedKemasan = kemasan.map((item) => {
      const evalRes = calculateKemasanStatus(item.masukPcs, item.keluarPcs, item.sisaPcs, cfg.thresholdKemasanPcs);
      return {
        ...item,
        status: evalRes.status,
        selisihPcs: evalRes.selisihPcs,
      };
    });
    setStored(STORAGE_KEYS.KEMASAN_MONTHLY, updatedKemasan);
  },

  // Branches Master
  getBranches(): BranchMaster[] {
    return getStored<BranchMaster[]>(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES);
  },

  saveBranches(branches: BranchMaster[]): void {
    setStored(STORAGE_KEYS.BRANCHES, branches);
  },

  addBranch(branch: Omit<BranchMaster, 'id' | 'createdAt' | 'updatedAt'>): BranchMaster {
    const branches = storageService.getBranches();
    const newBranch: BranchMaster = {
      ...branch,
      id: branch.idCabang.trim() || `CAB-${String(branches.length + 1).padStart(2, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    branches.push(newBranch);
    storageService.saveBranches(branches);
    storageService.logActivity('TAMBAH', 'Database Cabang', `Cabang baru ditambahkan: ${newBranch.namaCabang} (${newBranch.idCabang})`, newBranch.idCabang);
    return newBranch;
  },

  updateBranch(id: string, updates: Partial<BranchMaster>): BranchMaster | null {
    const branches = storageService.getBranches();
    const idx = branches.findIndex((b) => b.id === id || b.idCabang === id);
    if (idx === -1) return null;
    branches[idx] = {
      ...branches[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    storageService.saveBranches(branches);
    storageService.logActivity('EDIT', 'Database Cabang', `Data cabang ${branches[idx].namaCabang} diperbarui`, branches[idx].idCabang);
    return branches[idx];
  },

  deleteBranch(id: string): boolean {
    const branches = storageService.getBranches();
    const target = branches.find((b) => b.id === id || b.idCabang === id);
    if (!target) return false;
    const filtered = branches.filter((b) => b.id !== id && b.idCabang !== id);
    storageService.saveBranches(filtered);
    storageService.logActivity('HAPUS', 'Database Cabang', `Cabang ${target.namaCabang} dihapus`, target.idCabang);
    return true;
  },

  // Database Bulan Bibit
  getBibitMonthly(bulan?: string, branchId?: string): DatabaseBulanBibitItem[] {
    let items = getStored<DatabaseBulanBibitItem[]>(STORAGE_KEYS.BIBIT_MONTHLY, INITIAL_BIBIT_MONTHLY);
    if (bulan) {
      items = items.filter((i) => i.bulan === bulan);
    }
    if (branchId && branchId !== 'ALL') {
      items = items.filter((i) => i.idCabang === branchId);
    }
    return items;
  },

  saveBibitMonthly(items: DatabaseBulanBibitItem[]): void {
    setStored(STORAGE_KEYS.BIBIT_MONTHLY, items);
  },

  addBibitMonthlyItem(item: Omit<DatabaseBulanBibitItem, 'id' | 'sisaMl' | 'selisihMl' | 'status' | 'updatedAt'>): DatabaseBulanBibitItem {
    const all = storageService.getBibitMonthly();
    const thresholds = storageService.getThresholds();
    const sisaMl = (item.stokAwalMl || 0) + item.masukMl - item.keluarMl;
    const evalRes = calculateBibitStatus(item.masukMl, item.keluarMl, sisaMl, thresholds.thresholdBibitMl);

    const newItem: DatabaseBulanBibitItem = {
      ...item,
      id: `BIBIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sisaMl,
      selisihMl: evalRes.selisihMl,
      status: evalRes.status,
      updatedAt: new Date().toISOString(),
    };
    all.push(newItem);
    storageService.saveBibitMonthly(all);
    storageService.logActivity(
      'TAMBAH',
      'Database Bulan Bibit',
      `Tambah bibit ${newItem.namaBibit} (${newItem.bulan}, Cabang: ${newItem.namaCabang}) - Status: ${newItem.status}`,
      newItem.idCabang
    );
    return newItem;
  },

  updateBibitMonthlyItem(id: string, updates: Partial<DatabaseBulanBibitItem>): DatabaseBulanBibitItem | null {
    const all = storageService.getBibitMonthly();
    const idx = all.findIndex((i) => i.id === id);
    if (idx === -1) return null;

    const cur = all[idx];
    const stokAwalMl = updates.stokAwalMl !== undefined ? updates.stokAwalMl : cur.stokAwalMl;
    const masukMl = updates.masukMl !== undefined ? updates.masukMl : cur.masukMl;
    const keluarMl = updates.keluarMl !== undefined ? updates.keluarMl : cur.keluarMl;
    const sisaMl = stokAwalMl + masukMl - keluarMl;

    const thresholds = storageService.getThresholds();
    const evalRes = calculateBibitStatus(masukMl, keluarMl, sisaMl, thresholds.thresholdBibitMl);

    all[idx] = {
      ...cur,
      ...updates,
      stokAwalMl,
      masukMl,
      keluarMl,
      sisaMl,
      selisihMl: evalRes.selisihMl,
      status: evalRes.status,
      updatedAt: new Date().toISOString(),
    };
    storageService.saveBibitMonthly(all);
    storageService.logActivity(
      'EDIT',
      'Database Bulan Bibit',
      `Update bibit ${all[idx].namaBibit} (${all[idx].bulan}, Sisa: ${sisaMl}ml, Status: ${all[idx].status})`,
      all[idx].idCabang
    );
    return all[idx];
  },

  deleteBibitMonthlyItem(id: string): boolean {
    const all = storageService.getBibitMonthly();
    const target = all.find((i) => i.id === id);
    if (!target) return false;
    const filtered = all.filter((i) => i.id !== id);
    storageService.saveBibitMonthly(filtered);
    storageService.logActivity('HAPUS', 'Database Bulan Bibit', `Hapus bibit ${target.namaBibit} (${target.bulan})`, target.idCabang);
    return true;
  },

  // Database Bulan Kemasan
  getKemasanMonthly(bulan?: string, branchId?: string): DatabaseBulanKemasanItem[] {
    let items = getStored<DatabaseBulanKemasanItem[]>(STORAGE_KEYS.KEMASAN_MONTHLY, INITIAL_KEMASAN_MONTHLY);
    if (bulan) {
      items = items.filter((i) => i.bulan === bulan);
    }
    if (branchId && branchId !== 'ALL') {
      items = items.filter((i) => i.idCabang === branchId);
    }
    return items;
  },

  saveKemasanMonthly(items: DatabaseBulanKemasanItem[]): void {
    setStored(STORAGE_KEYS.KEMASAN_MONTHLY, items);
  },

  addKemasanMonthlyItem(item: Omit<DatabaseBulanKemasanItem, 'id' | 'sisaPcs' | 'selisihPcs' | 'status' | 'updatedAt'>): DatabaseBulanKemasanItem {
    const all = storageService.getKemasanMonthly();
    const thresholds = storageService.getThresholds();
    const sisaPcs = (item.stokAwalPcs || 0) + item.masukPcs - item.keluarPcs;
    const evalRes = calculateKemasanStatus(item.masukPcs, item.keluarPcs, sisaPcs, thresholds.thresholdKemasanPcs);

    const newItem: DatabaseBulanKemasanItem = {
      ...item,
      id: `KMS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sisaPcs,
      selisihPcs: evalRes.selisihPcs,
      status: evalRes.status,
      updatedAt: new Date().toISOString(),
    };
    all.push(newItem);
    storageService.saveKemasanMonthly(all);
    storageService.logActivity(
      'TAMBAH',
      'Database Bulan Kemasan',
      `Tambah kemasan ${newItem.namaKemasan} (${newItem.bulan}, Cabang: ${newItem.namaCabang}) - Status: ${newItem.status}`,
      newItem.idCabang
    );
    return newItem;
  },

  updateKemasanMonthlyItem(id: string, updates: Partial<DatabaseBulanKemasanItem>): DatabaseBulanKemasanItem | null {
    const all = storageService.getKemasanMonthly();
    const idx = all.findIndex((i) => i.id === id);
    if (idx === -1) return null;

    const cur = all[idx];
    const stokAwalPcs = updates.stokAwalPcs !== undefined ? updates.stokAwalPcs : cur.stokAwalPcs;
    const masukPcs = updates.masukPcs !== undefined ? updates.masukPcs : cur.masukPcs;
    const keluarPcs = updates.keluarPcs !== undefined ? updates.keluarPcs : cur.keluarPcs;
    const sisaPcs = stokAwalPcs + masukPcs - keluarPcs;

    const thresholds = storageService.getThresholds();
    const evalRes = calculateKemasanStatus(masukPcs, keluarPcs, sisaPcs, thresholds.thresholdKemasanPcs);

    all[idx] = {
      ...cur,
      ...updates,
      stokAwalPcs,
      masukPcs,
      keluarPcs,
      sisaPcs,
      selisihPcs: evalRes.selisihPcs,
      status: evalRes.status,
      updatedAt: new Date().toISOString(),
    };
    storageService.saveKemasanMonthly(all);
    storageService.logActivity(
      'EDIT',
      'Database Bulan Kemasan',
      `Update kemasan ${all[idx].namaKemasan} (${all[idx].bulan}, Sisa: ${sisaPcs}pcs, Status: ${all[idx].status})`,
      all[idx].idCabang
    );
    return all[idx];
  },

  deleteKemasanMonthlyItem(id: string): boolean {
    const all = storageService.getKemasanMonthly();
    const target = all.find((i) => i.id === id);
    if (!target) return false;
    const filtered = all.filter((i) => i.id !== id);
    storageService.saveKemasanMonthly(filtered);
    storageService.logActivity('HAPUS', 'Database Bulan Kemasan', `Hapus kemasan ${target.namaKemasan} (${target.bulan})`, target.idCabang);
    return true;
  },

  // Open New Month Sheet ("Buka Lembar Baru Setiap Bulan Baru")
  bukaLembarBaruBulan(
    targetBulanBaru: string, // YYYY-MM
    sourceBulanLama: string, // YYYY-MM
    carryForwardSisa: boolean = true
  ): { bibitCount: number; kemasanCount: number } {
    const bibitAll = storageService.getBibitMonthly();
    const kemasanAll = storageService.getKemasanMonthly();
    const thresholds = storageService.getThresholds();

    // Check existing items in target month
    const existingBibitInTarget = bibitAll.filter((b) => b.bulan === targetBulanBaru);
    const existingKemasanInTarget = kemasanAll.filter((k) => k.bulan === targetBulanBaru);

    // Items from source month
    const sourceBibit = bibitAll.filter((b) => b.bulan === sourceBulanLama);
    const sourceKemasan = kemasanAll.filter((k) => k.bulan === sourceBulanLama);

    let addedBibitCount = 0;
    sourceBibit.forEach((oldB) => {
      // Don't duplicate if already exists for same branch + code
      const alreadyHas = existingBibitInTarget.some(
        (eb) => eb.idCabang === oldB.idCabang && eb.kodeBibit === oldB.kodeBibit
      );
      if (!alreadyHas) {
        const stokAwal = carryForwardSisa ? Math.max(0, oldB.sisaMl) : 0;
        const sisaMl = stokAwal;
        const evalRes = calculateBibitStatus(0, 0, sisaMl, thresholds.thresholdBibitMl);
        bibitAll.push({
          id: `BIBIT-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          bulan: targetBulanBaru,
          idCabang: oldB.idCabang,
          namaCabang: oldB.namaCabang,
          kodeBibit: oldB.kodeBibit,
          namaBibit: oldB.namaBibit,
          kategori: oldB.kategori,
          stokAwalMl: stokAwal,
          masukMl: 0,
          keluarMl: 0,
          sisaMl,
          selisihMl: 0,
          status: evalRes.status,
          catatan: `Lembar baru ${targetBulanBaru}. Saldo awal dari sisa bulan ${sourceBulanLama}: ${stokAwal} ml`,
          updatedAt: new Date().toISOString(),
        });
        addedBibitCount++;
      }
    });

    let addedKemasanCount = 0;
    sourceKemasan.forEach((oldK) => {
      const alreadyHas = existingKemasanInTarget.some(
        (ek) => ek.idCabang === oldK.idCabang && ek.kodeKemasan === oldK.kodeKemasan
      );
      if (!alreadyHas) {
        const stokAwal = carryForwardSisa ? Math.max(0, oldK.sisaPcs) : 0;
        const sisaPcs = stokAwal;
        const evalRes = calculateKemasanStatus(0, 0, sisaPcs, thresholds.thresholdKemasanPcs);
        kemasanAll.push({
          id: `KMS-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          bulan: targetBulanBaru,
          idCabang: oldK.idCabang,
          namaCabang: oldK.namaCabang,
          kodeKemasan: oldK.kodeKemasan,
          namaKemasan: oldK.namaKemasan,
          type: oldK.type,
          stokAwalPcs: stokAwal,
          masukPcs: 0,
          keluarPcs: 0,
          sisaPcs,
          selisihPcs: 0,
          status: evalRes.status,
          catatan: `Lembar baru ${targetBulanBaru}. Saldo awal dari sisa bulan ${sourceBulanLama}: ${stokAwal} pcs`,
          updatedAt: new Date().toISOString(),
        });
        addedKemasanCount++;
      }
    });

    storageService.saveBibitMonthly(bibitAll);
    storageService.saveKemasanMonthly(kemasanAll);

    storageService.logActivity(
      'LEMBAR_BARU',
      'Manajemen Periode Bulanan',
      `Buka lembar periode baru ${targetBulanBaru} dari ${sourceBulanLama}. Menambahkan ${addedBibitCount} bibit & ${addedKemasanCount} kemasan.`
    );

    return { bibitCount: addedBibitCount, kemasanCount: addedKemasanCount };
  },

  // Barang Masuk
  getBarangMasuk(branchId?: string): BarangMasukItem[] {
    let items = getStored<BarangMasukItem[]>(STORAGE_KEYS.BARANG_MASUK, INITIAL_BARANG_MASUK);
    if (branchId && branchId !== 'ALL') {
      items = items.filter((i) => i.idCabang === branchId);
    }
    return items;
  },

  addBarangMasuk(item: Omit<BarangMasukItem, 'id'>, syncToMonthly: boolean = true): BarangMasukItem {
    const all = storageService.getBarangMasuk();
    const newItem: BarangMasukItem = {
      ...item,
      id: `MSK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    all.unshift(newItem);
    setStored(STORAGE_KEYS.BARANG_MASUK, all);

    // Sync into active month sheet if requested
    if (syncToMonthly) {
      const monthStr = item.tanggal.substring(0, 7); // YYYY-MM
      if (item.jenisBarang === 'Bibit') {
        const bibits = storageService.getBibitMonthly();
        const target = bibits.find(
          (b) => b.bulan === monthStr && b.idCabang === item.idCabang && b.kodeBibit === item.kodeBarang
        );
        if (target) {
          storageService.updateBibitMonthlyItem(target.id, {
            masukMl: target.masukMl + item.jumlah,
          });
        }
      } else {
        const kemasans = storageService.getKemasanMonthly();
        const target = kemasans.find(
          (k) => k.bulan === monthStr && k.idCabang === item.idCabang && k.kodeKemasan === item.kodeBarang
        );
        if (target) {
          storageService.updateKemasanMonthlyItem(target.id, {
            masukPcs: target.masukPcs + item.jumlah,
          });
        }
      }
    }

    storageService.logActivity(
      'TAMBAH',
      'Barang Masuk',
      `Input barang masuk: ${item.namaBarang} (${item.jumlah} ${item.satuan}) Cabang: ${item.namaCabang}`,
      item.idCabang
    );
    return newItem;
  },

  deleteBarangMasuk(id: string): boolean {
    const all = storageService.getBarangMasuk();
    const target = all.find((i) => i.id === id);
    if (!target) return false;
    const filtered = all.filter((i) => i.id !== id);
    setStored(STORAGE_KEYS.BARANG_MASUK, filtered);
    storageService.logActivity('HAPUS', 'Barang Masuk', `Hapus barang masuk: ${target.namaBarang}`, target.idCabang);
    return true;
  },

  // Barang Keluar Bibit
  getBarangKeluarBibit(branchId?: string): BarangKeluarBibitItem[] {
    let items = getStored<BarangKeluarBibitItem[]>(STORAGE_KEYS.BARANG_KELUAR_BIBIT, INITIAL_BARANG_KELUAR_BIBIT);
    if (branchId && branchId !== 'ALL') {
      items = items.filter((i) => i.idCabang === branchId);
    }
    return items;
  },

  addBarangKeluarBibit(
    item: Omit<BarangKeluarBibitItem, 'id' | 'keluarMl'>,
    syncToMonthly: boolean = true
  ): BarangKeluarBibitItem {
    const all = storageService.getBarangKeluarBibit();
    // Formula wajib brief: keluar/ml (hasil kemasan x persentase)
    const keluarMl = Math.round((item.kemasanBotolMl * (item.persentaseBibit / 100)) * 100) / 100;

    const newItem: BarangKeluarBibitItem = {
      ...item,
      id: `KLR-B-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      keluarMl,
    };
    all.unshift(newItem);
    setStored(STORAGE_KEYS.BARANG_KELUAR_BIBIT, all);

    if (syncToMonthly) {
      const monthStr = item.tanggal.substring(0, 7);
      const bibits = storageService.getBibitMonthly();
      const target = bibits.find(
        (b) => b.bulan === monthStr && b.idCabang === item.idCabang && b.kodeBibit === item.kodeBibit
      );
      if (target) {
        storageService.updateBibitMonthlyItem(target.id, {
          keluarMl: target.keluarMl + keluarMl,
        });
      }
    }

    storageService.logActivity(
      'TAMBAH',
      'Barang Keluar Bibit',
      `Penjualan/Keluar bibit: ${item.namaBibit} (${keluarMl} ml, Botol: ${item.kemasanBotolMl}ml @${item.persentaseBibit}%, Rp ${item.hargaJual.toLocaleString('id-ID')})`,
      item.idCabang
    );
    return newItem;
  },

  deleteBarangKeluarBibit(id: string): boolean {
    const all = storageService.getBarangKeluarBibit();
    const target = all.find((i) => i.id === id);
    if (!target) return false;
    const filtered = all.filter((i) => i.id !== id);
    setStored(STORAGE_KEYS.BARANG_KELUAR_BIBIT, filtered);
    storageService.logActivity('HAPUS', 'Barang Keluar Bibit', `Hapus barang keluar bibit: ${target.namaBibit}`, target.idCabang);
    return true;
  },

  // Barang Keluar Kemasan
  getBarangKeluarKemasan(branchId?: string): BarangKeluarKemasanItem[] {
    let items = getStored<BarangKeluarKemasanItem[]>(STORAGE_KEYS.BARANG_KELUAR_KEMASAN, INITIAL_BARANG_KELUAR_KEMASAN);
    if (branchId && branchId !== 'ALL') {
      items = items.filter((i) => i.idCabang === branchId);
    }
    return items;
  },

  addBarangKeluarKemasan(
    item: Omit<BarangKeluarKemasanItem, 'id'>,
    syncToMonthly: boolean = true
  ): BarangKeluarKemasanItem {
    const all = storageService.getBarangKeluarKemasan();
    const newItem: BarangKeluarKemasanItem = {
      ...item,
      id: `KLR-K-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    all.unshift(newItem);
    setStored(STORAGE_KEYS.BARANG_KELUAR_KEMASAN, all);

    if (syncToMonthly) {
      const monthStr = item.tanggal.substring(0, 7);
      const kemasans = storageService.getKemasanMonthly();
      const target = kemasans.find(
        (k) => k.bulan === monthStr && k.idCabang === item.idCabang && k.kodeKemasan === item.kodeKemasan
      );
      if (target) {
        storageService.updateKemasanMonthlyItem(target.id, {
          keluarPcs: target.keluarPcs + item.keluarPcs,
        });
      }
    }

    storageService.logActivity(
      'TAMBAH',
      'Barang Keluar Kemasan',
      `Keluar kemasan: ${item.namaKemasan} (${item.keluarPcs} pcs) - ${item.tujuan}`,
      item.idCabang
    );
    return newItem;
  },

  deleteBarangKeluarKemasan(id: string): boolean {
    const all = storageService.getBarangKeluarKemasan();
    const target = all.find((i) => i.id === id);
    if (!target) return false;
    const filtered = all.filter((i) => i.id !== id);
    setStored(STORAGE_KEYS.BARANG_KELUAR_KEMASAN, filtered);
    storageService.logActivity('HAPUS', 'Barang Keluar Kemasan', `Hapus barang keluar kemasan: ${target.namaKemasan}`, target.idCabang);
    return true;
  },

  // Financial Analysis
  getFinancialRecords(bulan?: string, branchId?: string): FinancialAnalysisRecord[] {
    let items = getStored<FinancialAnalysisRecord[]>(STORAGE_KEYS.FINANCIAL, INITIAL_FINANCIAL);
    if (bulan) {
      items = items.filter((i) => i.bulan === bulan);
    }
    if (branchId && branchId !== 'ALL') {
      items = items.filter((i) => i.idCabang === branchId);
    }
    return items;
  },

  saveFinancialRecords(items: FinancialAnalysisRecord[]): void {
    setStored(STORAGE_KEYS.FINANCIAL, items);
  },

  upsertFinancialRecord(record: FinancialAnalysisRecord): void {
    const all = storageService.getFinancialRecords();
    const idx = all.findIndex((r) => r.id === record.id || (r.bulan === record.bulan && r.idCabang === record.idCabang));
    if (idx >= 0) {
      all[idx] = record;
    } else {
      all.push(record);
    }
    storageService.saveFinancialRecords(all);
    storageService.logActivity('EDIT', 'Analisis Finansial', `Update analisis finansial ${record.namaCabang} (${record.bulan})`, record.idCabang);
  },

  // Reset to Factory Demo Data
  resetAllToDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.BRANCHES);
    localStorage.removeItem(STORAGE_KEYS.BIBIT_MONTHLY);
    localStorage.removeItem(STORAGE_KEYS.KEMASAN_MONTHLY);
    localStorage.removeItem(STORAGE_KEYS.BARANG_MASUK);
    localStorage.removeItem(STORAGE_KEYS.BARANG_KELUAR_BIBIT);
    localStorage.removeItem(STORAGE_KEYS.BARANG_KELUAR_KEMASAN);
    localStorage.removeItem(STORAGE_KEYS.FINANCIAL);
    localStorage.removeItem(STORAGE_KEYS.THRESHOLDS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    storageService.logActivity('TAMBAH', 'Sistem', 'Database direset kembali ke konfigurasi demo awal V91.CabORD');
  },
};
