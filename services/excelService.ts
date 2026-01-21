import * as XLSX from 'xlsx';
import { ReceiptItem } from "../types";

export const exportToExcel = (data: ReceiptItem[], fileName: string = 'receipt_data.xlsx') => {
  // Format data for Excel
  const formattedData = data.map((item, index) => ({
    '순번': index + 1,
    '날짜': item.date,
    '상호명': item.merchantName,
    '금액': item.amount,
    '비고': item.notes
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  
  // Auto-width columns roughly
  const wscols = [
    { wch: 6 },  // 순번
    { wch: 15 }, // 날짜
    { wch: 25 }, // 상호명
    { wch: 15 }, // 금액
    { wch: 30 }, // 비고
  ];
  worksheet['!cols'] = wscols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "지출증빙");

  XLSX.writeFile(workbook, fileName);
};
