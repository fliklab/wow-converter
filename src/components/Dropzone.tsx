import React from "react";
import { useDropzone, DropzoneOptions } from "react-dropzone";

interface DropzoneProps {
  onDrop: (files: File[]) => void;
  isConverting: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onDrop, isConverting }) => {
  const dropzoneOptions: DropzoneOptions = {
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp", ".avif"],
    },
  };

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone(dropzoneOptions);

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-xl p-12 text-center cursor-pointer 
        transition-all duration-200 ease-in-out
        ${
          isDragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
        }
        ${isConverting ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <input {...getInputProps()} disabled={isConverting} />

      <div className="flex flex-col items-center space-y-4">
        {/* Upload Icon */}
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isDragActive
              ? "bg-blue-100 dark:bg-blue-900/30"
              : "bg-gray-100 dark:bg-gray-700"
          }`}
        >
          <svg
            className={`w-8 h-8 ${
              isDragActive
                ? "text-blue-500"
                : "text-gray-400 dark:text-gray-500"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        {/* Main Message */}
        <div>
          {isConverting ? (
            <>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                변환 중...
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                잠시만 기다려주세요
              </p>
            </>
          ) : isDragActive ? (
            <>
              <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
                이미지를 드래그해서 업로드하거나
              </p>
              <p className="text-sm text-blue-500 dark:text-blue-300 mt-1">
                클릭하여 파일을 선택하세요
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                이미지를 드래그해서 업로드하거나
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                클릭하여 파일을 선택하세요
              </p>
            </>
          )}
        </div>

        {/* Supported Formats */}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          지원 형식: JPG, PNG, WebP
        </p>
      </div>
    </div>
  );
};
