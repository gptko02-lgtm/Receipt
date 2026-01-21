import React, { useState, useCallback } from 'react';
import { ReceiptItem, ProcessingStatus } from './types';
import { analyzeReceiptImage } from './services/geminiService';
import { exportToExcel } from './services/excelService';
import { FileUpload } from './components/FileUpload';
import { ReceiptTable } from './components/ReceiptTable';
import { FileSpreadsheet, RefreshCcw, CheckCircle2, Search } from 'lucide-react';

const App: React.FC = () => {
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>({ step: 'idle', message: '정리를 시작할까요?' });

  const handleFileUpload = useCallback(async (files: FileList) => {
    setStatus({ step: 'analyzing', message: 'Gemini 3 Flash가 영수증을 분석하고 있습니다. 잠시만 기다려 주세요!' });
    
    const newReceipts: ReceiptItem[] = [];
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const results = await analyzeReceiptImage(file);
        // Add IDs to results
        const itemsWithIds = results.map(item => ({
          ...item,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }));
        newReceipts.push(...itemsWithIds);
      } catch (error) {
        console.error(`File ${file.name} failed:`, error);
        errorCount++;
      }
    }

    setReceipts(prev => [...prev, ...newReceipts]);

    if (errorCount > 0 && newReceipts.length === 0) {
      setStatus({ 
        step: 'idle', 
        message: '이미지가 다소 흐릿하여 정보를 읽기 어렵습니다. 조금 더 밝은 곳에서 촬영한 사진을 업로드해 주시겠어요?' 
      });
    } else if (newReceipts.length > 0) {
      setStatus({ 
        step: 'review', 
        message: '표의 내용 중 수정이 필요한 부분이 있다면 말씀해 주세요. 완료되었다면 엑셀로 다운로드하세요.' 
      });
    } else {
      setStatus({ step: 'idle', message: '분석할 수 있는 영수증을 찾지 못했습니다.' });
    }
  }, []);

  const handleUpdateReceipt = (id: string, field: keyof ReceiptItem, value: string | number) => {
    setReceipts(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleDeleteReceipt = (id: string) => {
    setReceipts(prev => prev.filter(item => item.id !== id));
  };

  const handleDownload = () => {
    exportToExcel(receipts, `영수증_정리_${new Date().toISOString().split('T')[0]}.xlsx`);
    setStatus({ step: 'completed', message: '깔끔하게 정리되었습니다! 엑셀 파일을 확인해보세요.' });
    setTimeout(() => {
       setStatus({ step: 'idle', message: '또 다른 영수증을 정리해드릴까요?' });
    }, 3000);
  };

  const handleReset = () => {
    setReceipts([]);
    setStatus({ step: 'idle', message: '정리를 시작할까요?' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-sky-200">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 py-6 sticky top-0 z-10 bg-opacity-90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-sky-200">
              <FileSpreadsheet size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">영수증 정리 정돈 <span className="text-xs font-normal text-sky-200 bg-sky-600 px-2 py-0.5 rounded-full ml-1">AI</span></h1>
          </div>
          <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${status.step === 'analyzing' ? 'bg-amber-400 animate-pulse' : 'bg-sky-500'}`}></span>
            {status.step === 'analyzing' ? 'AI 분석 중...' : '대기 중'}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-12">
        
        {/* Intro / Status Section */}
        <section className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-slate-600 text-sm font-medium border border-slate-200 shadow-sm">
            {status.step === 'analyzing' && <Search className="animate-spin text-sky-500" size={16} />}
            {status.step === 'review' && <CheckCircle2 className="text-green-500" size={16} />}
            {status.step === 'idle' && <span className="text-sky-500">✨</span>}
            {status.message}
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 leading-tight">
            복잡한 영수증,<br />
            <span className="text-sky-500">AI가 한 번에</span> 정리해 드립니다.
          </h2>
          <p className="text-slate-500">
            영수증 사진을 업로드하면 Gemini 3 Flash가 날짜, 상호명, 금액을<br/>
            정확히 읽어내어 편집 가능한 엑셀 파일로 만들어 드립니다.
          </p>
        </section>

        {/* Upload Section */}
        <section className="max-w-2xl mx-auto">
          <FileUpload onFileSelect={handleFileUpload} disabled={status.step === 'analyzing'} />
        </section>

        {/* Data Table Section */}
        {receipts.length > 0 && (
          <section className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="text-2xl">📊</span> 정리된 내역
                <span className="text-sm font-normal text-slate-400 ml-2">({receipts.length}건)</span>
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <RefreshCcw size={16} />
                  초기화
                </button>
                <button
                  onClick={handleDownload}
                  className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg shadow-md shadow-sky-200 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 font-bold"
                >
                  <FileSpreadsheet size={18} />
                  엑셀 다운로드
                </button>
              </div>
            </div>

            <ReceiptTable 
              data={receipts} 
              onUpdate={handleUpdateReceipt}
              onDelete={handleDeleteReceipt}
            />
          </section>
        )}
      </main>

      <footer className="border-t border-slate-100 py-8 mt-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} 영수증 정리 정돈 Agent. Powered by Gemini 3 Flash.
        </div>
      </footer>
    </div>
  );
};

export default App;