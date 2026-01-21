export interface ReceiptItem {
  id: string;
  date: string;
  merchantName: string;
  amount: number;
  notes: string;
}

export interface ProcessingStatus {
  step: 'idle' | 'analyzing' | 'review' | 'completed';
  message: string;
}
