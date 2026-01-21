import Tesseract from 'tesseract.js';
import { ReceiptItem } from "../types";

// Helper to extract structured data from raw text using Regex
const parseReceiptText = (text: string): Omit<ReceiptItem, 'id'> => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // 1. Find Date
  // Regex for YYYY-MM-DD, YYYY.MM.DD, YYYY/MM/DD, YYYY년 MM월 DD일
  const dateRegex = /(\d{4})[-./년\s](\d{1,2})[-./월\s](\d{1,2})/;
  let date = new Date().toISOString().split('T')[0]; // Default to today
  
  for (const line of lines) {
    const match = line.match(dateRegex);
    if (match) {
      const yyyy = match[1];
      const mm = match[2].padStart(2, '0');
      const dd = match[3].padStart(2, '0');
      date = `${yyyy}-${mm}-${dd}`;
      break;
    }
  }

  // 2. Find Amount
  // Strategy: Collect all numbers that look like money. The largest one is likely the total.
  // Filters out phone numbers or date-like numbers where possible.
  const moneyRegex = /[0-9]{1,3}(,[0-9]{3})+(?=[원\s]?)|[0-9]+(?=원)/g;
  const candidates: number[] = [];

  for (const line of lines) {
    // Basic cleaning to help regex
    const cleanLine = line.replace(/ /g, '');
    const matches = cleanLine.match(moneyRegex);
    if (matches) {
      matches.forEach(m => {
        const num = parseInt(m.replace(/[^0-9]/g, ''), 10);
        // Basic sanity check: unlikely to be < 100 won or > 100,000,000 for a receipt usually
        if (!isNaN(num) && num > 0) candidates.push(num);
      });
    }
  }
  
  // Heuristic: Max number is usually the total
  let amount = 0;
  if (candidates.length > 0) {
    amount = Math.max(...candidates);
  }

  // 3. Find Merchant
  // Heuristic: Usually the first line that isn't a date or garbage
  let merchantName = "상호명 확인 필요";
  for (const line of lines) {
    // Skip dates
    if (dateRegex.test(line)) continue;
    // Skip lines that are just numbers or symbols
    if (/^[\d,.\s\W]+$/.test(line)) continue; 
    // Skip very short lines
    if (line.length < 2) continue;
    
    // Assume this is the merchant
    merchantName = line;
    break;
  }

  return {
    date,
    merchantName,
    amount,
    notes: "" 
  };
};

export const analyzeReceiptImage = async (file: File): Promise<Omit<ReceiptItem, 'id'>[]> => {
    try {
        // Run OCR
        // 'kor+eng' loads training data for Korean and English
        const { data: { text } } = await Tesseract.recognize(
            file,
            'kor+eng', 
            { 
              logger: m => console.log(m) // Optional: logs progress to console
            } 
        );
        
        console.log("Raw OCR Text:", text);
        
        const data = parseReceiptText(text);
        return [data];
    } catch (error) {
        console.error("OCR Error:", error);
        throw new Error("이미지 분석에 실패했습니다. 더 선명한 이미지를 사용해 보세요.");
    }
};
