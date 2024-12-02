import React from "react";
import { FileInfo } from "../types/files";

interface FileCardProps {
  file: FileInfo;
  onDownload: () => void;
}

const FileCard: React.FC<FileCardProps> = ({ file, onDownload }) => {
  return (
    <div className="flex items-start bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg p-4 gap-4">
      <img
        src={file.preview}
        alt={file.file.name}
        className="w-20 h-20 object-cover rounded"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 truncate">
            {file.file.name}
          </h3>
          {file.status === "completed" && (
            <span className="px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-full">
              변환 완료
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {(file.file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>
      {file.status === "completed" && file.convertedUrl && (
        <button
          onClick={onDownload}
          className="px-3 py-1 text-sm font-medium text-primary border border-primary rounded hover:bg-primary hover:text-white transition-colors"
        >
          다운로드
        </button>
      )}
    </div>
  );
};

export default FileCard;
