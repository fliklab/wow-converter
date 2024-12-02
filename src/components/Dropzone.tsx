import React, { useRef, useState } from "react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";

interface DropzoneProps {
  onDrop: (files: File[]) => void;
}

const Dropzone: React.FC<DropzoneProps> = ({ onDrop }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files);
    onDrop(files);
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      onDrop(files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="max-w-[768px] mx-auto">
      <div
        className={`
          relative rounded-lg border-2 border-dashed p-8 
          transition-all duration-200 cursor-pointer
          ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800/30"
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center gap-3">
          <ArrowUpTrayIcon
            className={`w-10 h-10 ${
              isDragging ? "text-primary" : "text-gray-400 dark:text-gray-500"
            }`}
          />
          <div className="text-center">
            <p className="text-base font-medium text-gray-700 dark:text-gray-200">
              이미지를 드래그하여 업로드하거나
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              클릭하여 파일을 선택하세요
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            지원 형식: JPG, PNG, WebP
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dropzone;
