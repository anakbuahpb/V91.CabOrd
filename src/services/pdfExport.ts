import { jsPDF } from 'jspdf';
import {
  BranchMaster,
  DatabaseBulanBibitItem,
  DatabaseBulanKemasanItem,
  BarangMasukItem,
  BarangKeluarBibitItem,
  BarangKeluarKemasanItem,
  FinancialAnalysisRecord,
} from '../types';

export function exportBranchesToPdf(branches: BranchMaster[], title = 'Laporan Database Cabang V91.CabORD') {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('V91.CabORD - SISTEM DATABASE CABANG', 14, 15);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 14, 22);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')} | Total Cabang: ${branches.length}`, 14, 28);
  doc.line(14, 30, pageWidth - 14, 30);

  // Table header
  let y = 38;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('ID Cabang', 14, y);
  doc.text('Nama Cabang', 40, y);
  doc.text('Kode Utama', 95, y);
  doc.text('Barang Utama', 125, y);
  doc.text('Kategori', 175, y);
  doc.text('Analisis Bulan Kemarin', 225, y);

  doc.setLineWidth(0.3);
  doc.line(14, y + 2, pageWidth - 14, y + 2);
  y += 7;

  doc.setFont('helvetica', 'normal');
  branches.forEach((b, index) => {
    if (y > 185) {
      doc.addPage();
      y = 20;
    }
    doc.text(b.idCabang || '-', 14, y);
    doc.text(b.namaCabang.substring(0, 26), 40, y);
    doc.text(b.kodeBarangUtama || '-', 95, y);
    doc.text(b.namaBarangUtama.substring(0, 24), 125, y);
    doc.text(b.kategori.substring(0, 22), 175, y);
    const splitNote = doc.splitTextToSize(b.keteranganAnalisisKemarin || '-', 60);
    doc.text(splitNote[0] || '-', 225, y);
    y += 8;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text('Dokumen Resmi V91.CabORD - Rahasia & Hak Milik Perusahaan', 14, 198);

  doc.save(`V91_CabORD_Database_Cabang_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportBibitMonthlyToPdf(
  items: DatabaseBulanBibitItem[],
  bulan: string,
  thresholdMl: number,
  branchName?: string
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('V91.CabORD - EVALUASI DATABASE BULAN BIBIT', 14, 15);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Periode: ${bulan} | Cabang: ${branchName || 'Semua Cabang'} | Batas Selisih Waspada: > ${thresholdMl} ml`,
    14,
    22
  );
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(
    `Total Item: ${items.length} | Kriteria: Sisa < 0 (DANGER) | Selisih > ${thresholdMl}ml (TIDAK AMAN) | Di Bawah Itu (AMAN)`,
    14,
    27
  );
  doc.line(14, 30, pageWidth - 14, 30);

  let y = 37;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('Cabang', 14, y);
  doc.text('Kode', 50, y);
  doc.text('Nama Bibit', 72, y);
  doc.text('Kategori', 120, y);
  doc.text('Awal', 155, y);
  doc.text('Masuk', 175, y);
  doc.text('Keluar', 195, y);
  doc.text('Sisa (ml)', 215, y);
  doc.text('Selisih', 235, y);
  doc.text('Status', 255, y);

  doc.line(14, y + 2, pageWidth - 14, y + 2);
  y += 7;

  doc.setFont('helvetica', 'normal');
  items.forEach((item) => {
    if (y > 185) {
      doc.addPage();
      y = 20;
    }
    doc.text(item.namaCabang.substring(0, 18), 14, y);
    doc.text(item.kodeBibit, 50, y);
    doc.text(item.namaBibit.substring(0, 24), 72, y);
    doc.text(item.kategori.substring(0, 18), 120, y);
    doc.text(`${item.stokAwalMl}`, 155, y);
    doc.text(`${item.masukMl}`, 175, y);
    doc.text(`${item.keluarMl}`, 195, y);
    doc.text(`${item.sisaMl}`, 215, y);
    doc.text(`${item.selisihMl > 0 ? '+' : ''}${item.selisihMl}`, 235, y);

    if (item.status === 'DANGER') {
      doc.setTextColor(200, 0, 0);
      doc.setFont('helvetica', 'bold');
    } else if (item.status === 'TIDAK_AMAN') {
      doc.setTextColor(200, 120, 0);
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setTextColor(0, 130, 40);
      doc.setFont('helvetica', 'normal');
    }
    doc.text(item.status, 255, y);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'normal');

    y += 7;
  });

  doc.save(`V91_Evaluasi_Bulan_Bibit_${bulan}.pdf`);
}

export function exportKemasanMonthlyToPdf(
  items: DatabaseBulanKemasanItem[],
  bulan: string,
  thresholdPcs: number,
  branchName?: string
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('V91.CabORD - EVALUASI DATABASE BULAN KEMASAN', 14, 15);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Periode: ${bulan} | Cabang: ${branchName || 'Semua Cabang'} | Batas Selisih Waspada: > ${thresholdPcs} pcs`,
    14,
    22
  );
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(
    `Total Kemasan: ${items.length} | Kriteria: Sisa < 0 (DANGER) | Selisih > ${thresholdPcs} pcs (TIDAK AMAN) | Di Bawah Itu (AMAN)`,
    14,
    27
  );
  doc.line(14, 30, pageWidth - 14, 30);

  let y = 37;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('Cabang', 14, y);
  doc.text('Kode', 55, y);
  doc.text('Nama Kemasan', 80, y);
  doc.text('Type', 135, y);
  doc.text('Awal', 165, y);
  doc.text('Masuk', 185, y);
  doc.text('Keluar', 205, y);
  doc.text('Sisa (pcs)', 225, y);
  doc.text('Selisih', 245, y);
  doc.text('Status', 265, y);

  doc.line(14, y + 2, pageWidth - 14, y + 2);
  y += 7;

  doc.setFont('helvetica', 'normal');
  items.forEach((item) => {
    if (y > 185) {
      doc.addPage();
      y = 20;
    }
    doc.text(item.namaCabang.substring(0, 18), 14, y);
    doc.text(item.kodeKemasan, 55, y);
    doc.text(item.namaKemasan.substring(0, 26), 80, y);
    doc.text(item.type.substring(0, 14), 135, y);
    doc.text(`${item.stokAwalPcs}`, 165, y);
    doc.text(`${item.masukPcs}`, 185, y);
    doc.text(`${item.keluarPcs}`, 205, y);
    doc.text(`${item.sisaPcs}`, 225, y);
    doc.text(`${item.selisihPcs > 0 ? '+' : ''}${item.selisihPcs}`, 245, y);

    if (item.status === 'DANGER') {
      doc.setTextColor(200, 0, 0);
      doc.setFont('helvetica', 'bold');
    } else if (item.status === 'TIDAK_AMAN') {
      doc.setTextColor(200, 120, 0);
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setTextColor(0, 130, 40);
      doc.setFont('helvetica', 'normal');
    }
    doc.text(item.status, 265, y);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'normal');

    y += 7;
  });

  doc.save(`V91_Evaluasi_Bulan_Kemasan_${bulan}.pdf`);
}

export function exportLeadershipReportToPdf(
  financials: FinancialAnalysisRecord[],
  bibitItems: DatabaseBulanBibitItem[],
  kemasanItems: DatabaseBulanKemasanItem[],
  bulan: string
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('V91.CabORD - LAPORAN EKSEKUTIF PIMPINAN', 14, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Periode Evaluasi: ${bulan} | Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 25);
  doc.setLineWidth(0.5);
  doc.line(14, 28, pageWidth - 14, 28);

  // Summary Metrics
  const totalOmset = financials.reduce((acc, f) => acc + f.totalHargaJualBibit, 0);
  const totalLaba = financials.reduce((acc, f) => acc + f.estimasiLabaBersih, 0);
  const totalBibitMl = bibitItems.reduce((acc, b) => acc + b.keluarMl, 0);
  const dangerBibit = bibitItems.filter((b) => b.status === 'DANGER').length;
  const tidakAmanBibit = bibitItems.filter((b) => b.status === 'TIDAK_AMAN').length;
  const dangerKemasan = kemasanItems.filter((k) => k.status === 'DANGER').length;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('I. RINGKASAN KINERJA & INDIKATOR KUNCI', 14, 36);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Pemasukan Omset : Rp ${totalOmset.toLocaleString('id-ID')}`, 18, 44);
  doc.text(`Estimasi Laba Bersih    : Rp ${totalLaba.toLocaleString('id-ID')}`, 18, 51);
  doc.text(`Total Volume Bibit Terjual : ${totalBibitMl.toLocaleString('id-ID')} ml`, 18, 58);
  doc.text(`Peringatan Bibit DANGER  : ${dangerBibit} Item (Minus Stok)`, 110, 44);
  doc.text(`Peringatan Bibit TIDAK AMAN: ${tidakAmanBibit} Item (> 300ml selisih)`, 110, 51);
  doc.text(`Peringatan Kemasan DANGER: ${dangerKemasan} Item (Minus Stok)`, 110, 58);

  // Table per Branch
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('II. ANALISIS KEUANGAN & PENILAIAN CABANG', 14, 72);

  let y = 80;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('ID', 14, y);
  doc.text('Nama Cabang', 30, y);
  doc.text('Keluar (ml)', 75, y);
  doc.text('Total Omset (Rp)', 105, y);
  doc.text('Laba Bersih (Rp)', 145, y);
  doc.line(14, y + 2, pageWidth - 14, y + 2);
  y += 7;

  doc.setFont('helvetica', 'normal');
  financials.forEach((f) => {
    doc.text(f.idCabang, 14, y);
    doc.text(f.namaCabang.substring(0, 22), 30, y);
    doc.text(`${f.totalKeluarBibitMl.toLocaleString('id-ID')} ml`, 75, y);
    doc.text(`Rp ${f.totalHargaJualBibit.toLocaleString('id-ID')}`, 105, y);
    doc.text(`Rp ${f.estimasiLabaBersih.toLocaleString('id-ID')}`, 145, y);
    y += 7;
  });

  // Actionable Recommendations
  y += 6;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('III. SARAN & REKOMENDASI PIMPINAN', 14, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const recommendations = [
    `1. Prioritas Restock Segera: Segera kirim pasokan tambahan untuk ${dangerBibit + dangerKemasan} item berstatus DANGER guna menghindari kekosongan stok toko.`,
    '2. Audit Selisih > 300ml: Lakukan pengecekan fisik (stock opname) pada cabang dengan indikator TIDAK AMAN untuk meminimalisir potensi kebocoran atau takaran berlebih.',
    '3. Efisiensi Botol & Kemasan: Pastikan data keluar kemasan selalu sinkron dengan transaksi penjualan bibit parfum agar catatan stok akurat 100%.',
    '4. Evaluasi Margin Cabang: Cabang dengan rasio laba bersih sehat dapat diberikan reward suplai bibit aroma eksklusif grade luxury.',
  ];

  recommendations.forEach((rec) => {
    const lines = doc.splitTextToSize(rec, pageWidth - 28);
    lines.forEach((line: string) => {
      doc.text(line, 14, y);
      y += 6;
    });
  });

  // Signature lines
  y = 250;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Disiapkan Oleh:', 24, y);
  doc.text('Mengetahui & Menyetujui:', 130, y);
  doc.text('Administrator Sistem V91', 24, y + 22);
  doc.text('Direktur Utama / Pimpinan', 130, y + 22);

  doc.save(`V91_Laporan_Pimpinan_${bulan}.pdf`);
}

export function exportBatchSlipPdf(
  title: string,
  subtitle: string,
  branchName: string,
  operatorName: string,
  headers: string[],
  rows: (string | number)[][],
  summaryText?: string
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Kop
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('V91.CabORD - DOKUMEN BUKTI TRANSAKSI CABANG', 14, 15);
  doc.setFontSize(11);
  doc.text(title.toUpperCase(), 14, 22);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80);
  doc.text(subtitle, 14, 28);
  doc.text(
    `Cabang: ${branchName} | Petugas: ${operatorName} | Tanggal: ${new Date().toLocaleString('id-ID')}`,
    14,
    33
  );

  doc.setLineWidth(0.4);
  doc.setDrawColor(50);
  doc.line(14, 36, pageWidth - 14, 36);

  // Table header
  let y = 44;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);

  const colWidth = (pageWidth - 28) / headers.length;
  headers.forEach((h, i) => {
    doc.text(h, 14 + i * colWidth, y);
  });

  doc.line(14, y + 2, pageWidth - 14, y + 2);
  y += 7;

  // Table body
  doc.setFont('helvetica', 'normal');
  rows.forEach((row) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    row.forEach((cell, ci) => {
      const text = String(cell ?? '-');
      doc.text(text.substring(0, 24), 14 + ci * colWidth, y);
    });
    y += 6.5;
  });

  if (summaryText) {
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(summaryText, 14, y);
  }

  // Signature Block
  y = 250;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Petugas Input Cabang:', 24, y);
  doc.text('Mengetahui Supervisor:', 130, y);
  doc.text(`(${operatorName})`, 24, y + 20);
  doc.text('(____________________)', 130, y + 20);

  doc.save(`V91_Bukti_${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
}
