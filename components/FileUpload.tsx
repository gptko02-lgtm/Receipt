import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (files: FileList) => void;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files);
    }
  };

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300
        flex flex-col items-center justify-center
        ${disabled ? 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed' : 'border-sky-300 bg-sky-50 hover:bg-sky-100 hover:border-sky-500'}
      `}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        className="hidden"
        accept="image/*,application/pdf"
        multiple
      />
      <div className={`p-4 rounded-full mb-4 ${disabled ? 'bg-gray-200' : 'bg-white shadow-sm text-sky-500'}`}>
        <Upload size={32} />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">
        {disabled ? '분석 중입니다...' : '영수증 이미지를 여기에 드래그하거나 클릭하세요'}
      </h3>
      <p className="text-sm text-slate-500">
        JPG, PNG, PDF 파일 지원
      </p>
    </div>
  );
};
