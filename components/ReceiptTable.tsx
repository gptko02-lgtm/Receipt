import React from 'react';
import { ReceiptItem } from '../types';
import { Trash2 } from 'lucide-react';

interface ReceiptTableProps {
  data: ReceiptItem[];
  onUpdate: (id: string, field: keyof ReceiptItem, value: string | number) => void;
  onDelete: (id: string) => void;
}

export const ReceiptTable: React.FC<ReceiptTableProps> = ({ data, onUpdate, onDelete }) => {
  if (data.length === 0) return null;

  return (
    <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-sm text-left text-slate-700">
        <thead className="text-xs text-slate-600 uppercase bg-slate-100 border-b border-gray-200">
          <tr>
            <th scope="col" className="px-6 py-3 w-16 text-center">순번</th>
            <th scope="col" className="px-6 py-3">날짜 (YYYY-MM-DD)</th>
            <th scope="col" className="px-6 py-3">상호명</th>
            <th scope="col" className="px-6 py-3 text-right">금액 (원)</th>
            <th scope="col" className="px-6 py-3">비고 (수정)</th>
            <th scope="col" className="px-6 py-3 text-center">삭제</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id} className="bg-white border-b hover:bg-sky-50 transition-colors">
              <td className="px-6 py-4 text-center font-medium text-slate-900">
                {index + 1}
              </td>
              <td className="px-6 py-4">
                <input
                  type="text"
                  value={item.date}
                  onChange={(e) => onUpdate(item.id, 'date', e.target.value)}
                  className="bg-transparent border-b border-transparent hover:border-sky-300 focus:border-sky-500 focus:outline-none w-full transition-colors"
                  placeholder="YYYY-MM-DD"
                />
              </td>
              <td className="px-6 py-4">
                <input
                  type="text"
                  value={item.merchantName}
                  onChange={(e) => onUpdate(item.id, 'merchantName', e.target.value)}
                  className="bg-transparent border-b border-transparent hover:border-sky-300 focus:border-sky-500 focus:outline-none w-full font-medium text-slate-800"
                />
              </td>
              <td className="px-6 py-4 text-right">
                <input
                  type="number"
                  value={item.amount}
                  onChange={(e) => onUpdate(item.id, 'amount', Number(e.target.value))}
                  className="bg-transparent border-b border-transparent hover:border-sky-300 focus:border-sky-500 focus:outline-none w-full text-right"
                />
              </td>
              <td className="px-6 py-4">
                <input
                  type="text"
                  value={item.notes}
                  onChange={(e) => onUpdate(item.id, 'notes', e.target.value)}
                  placeholder="내용 입력"
                  className="bg-transparent border-b border-transparent hover:border-sky-300 focus:border-sky-500 focus:outline-none w-full text-slate-500"
                />
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-red-400 hover:text-red-600 transition-colors p-1"
                  title="삭제"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
          {data.length > 0 && (
            <tr className="bg-slate-50 font-bold text-slate-800">
              <td colSpan={3} className="px-6 py-4 text-center">합계</td>
              <td className="px-6 py-4 text-right">
                {data.reduce((sum, item) => sum + (item.amount || 0), 0).toLocaleString()}원
              </td>
              <td colSpan={2}></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
