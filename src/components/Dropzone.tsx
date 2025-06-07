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
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
    >
      <input {...getInputProps()} />
      {isConverting ? (
        <p className="text-gray-600">변환 중...</p>
      ) : isDragActive ? (
        <p className="text-blue-500">파일을 여기에 놓으세요</p>
      ) : (
        <p className="text-gray-500">
          이미지를 드래그 앤 드롭하거나 클릭하여 선택하세요
        </p>
      )}
    </div>
  );
};
