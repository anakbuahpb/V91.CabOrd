import * as XLSX from 'xlsx';

export function exportToExcel(data: Record<string, any>[], filename: string, sheetName = 'Data') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function parseExcelFile<T>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json<T>(worksheet);
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

export function exportAllDatabasesBackup(data: {
  branches: any[];
  bibitMonthly: any[];
  kemasanMonthly: any[];
  barangMasuk: any[];
  barangKeluarBibit: any[];
  barangKeluarKemasan: any[];
  financial: any[];
  logs: any[];
}) {
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.branches), 'Master Cabang');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.bibitMonthly), 'Bulan Bibit');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.kemasanMonthly), 'Bulan Kemasan');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.barangMasuk), 'Barang Masuk');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.barangKeluarBibit), 'Keluar Bibit');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.barangKeluarKemasan), 'Keluar Kemasan');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.financial), 'Analisis Toko');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.logs), 'Audit Trail');

  XLSX.writeFile(workbook, `V91_CabORD_Full_Backup_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
