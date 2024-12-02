import React, { useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

interface FileItem {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "converting" | "done" | "error";
  progress: number;
  metadata: Record<string, string>;
  newFileName: string;
  convertedFile?: File;
  convertedMetadata?: Record<string, string>;
  options: {
    outputFormat: string;
    quality: string;
    rename: boolean;
    removeMetadata: boolean;
  };
}

interface FileCardProps {
  file: FileItem;
  onDownload: (file: FileItem) => void;
}

const FileCard: React.FC<FileCardProps> = ({ file, onDownload }) => {
  const [isExtended, setIsExtended] = useState(false);

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getBasicMetadata = (metadata: Record<string, string>) => {
    const basic: Record<string, string> = {};
    const resolution = Object.entries(metadata).find(
      ([key]) =>
        key.toLowerCase().includes("resolution") ||
        key.toLowerCase().includes("width") ||
        key.toLowerCase().includes("height")
    );
    if (resolution) {
      basic[resolution[0]] = resolution[1];
    }
    return basic;
  };

  const getDetailedMetadata = (metadata: Record<string, string>) => {
    const basicKeys = Object.keys(getBasicMetadata(metadata));
    return Object.entries(metadata).filter(([key]) => !basicKeys.includes(key));
  };

  const renderMinified = () => (
    <div className="flex items-start gap-4">
      <img
        src={file.preview}
        alt={file.file.name}
        className="w-16 h-16 rounded object-cover"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {file.status === "done" && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              변환 완료
            </span>
          )}
          <h3 className="font-medium text-gray-900 dark:text-text-primary truncate">
            {file.file.name}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-text-secondary">
          <span>{file.file.type.split("/")[1].toUpperCase()}</span>
          <span>•</span>
          <span>{formatFileSize(file.file.size)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {file.status === "done" && file.convertedFile && (
          <button
            onClick={() => onDownload(file)}
            className="p-2 text-primary hover:text-primary-hover transition-colors"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={() => setIsExtended(!isExtended)}
          className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          {isExtended ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );

  const renderExtended = () => (
    <div className="space-y-4">
      {renderMinified()}
      <div className="pl-20 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700 dark:text-text-secondary">
              원본 파일 정보
            </h4>
            <div className="space-y-1">
              <div className="flex items-center text-sm">
                <span className="w-24 text-gray-500 dark:text-text-secondary">
                  파일명:
                </span>
                <span className="text-gray-900 dark:text-text-primary">
                  {file.file.name}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <span className="w-24 text-gray-500 dark:text-text-secondary">
                  파일 크기:
                </span>
                <span className="text-gray-900 dark:text-text-primary">
                  {formatFileSize(file.file.size)}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <span className="w-24 text-gray-500 dark:text-text-secondary">
                  파일 형식:
                </span>
                <span className="text-gray-900 dark:text-text-primary">
                  {file.file.type.split("/")[1].toUpperCase()}
                </span>
              </div>
              {Object.entries(getBasicMetadata(file.metadata)).map(
                ([key, value]) => (
                  <div key={key} className="flex items-center text-sm">
                    <span className="w-24 text-gray-500 dark:text-text-secondary">
                      {key}:
                    </span>
                    <span className="text-gray-900 dark:text-text-primary">
                      {value}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {file.status === "done" && file.convertedFile && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700 dark:text-text-secondary">
                변환된 파일 정보
              </h4>
              <div className="space-y-1">
                <div className="flex items-center text-sm">
                  <span className="w-24 text-gray-500 dark:text-text-secondary">
                    파일명:
                  </span>
                  <span className="text-gray-900 dark:text-text-primary">
                    {file.convertedFile.name}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-24 text-gray-500 dark:text-text-secondary">
                    파일 크기:
                  </span>
                  <span className="text-gray-900 dark:text-text-primary">
                    {formatFileSize(file.convertedFile.size)}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-24 text-gray-500 dark:text-text-secondary">
                    파일 형식:
                  </span>
                  <span className="text-gray-900 dark:text-text-primary">
                    {file.convertedFile.type.split("/")[1].toUpperCase()}
                  </span>
                </div>
                {Object.entries(
                  getBasicMetadata(file.convertedMetadata || {})
                ).map(([key, value]) => (
                  <div key={key} className="flex items-center text-sm">
                    <span className="w-24 text-gray-500 dark:text-text-secondary">
                      {key}:
                    </span>
                    <span className="text-gray-900 dark:text-text-primary">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 상세 메타데이터 섹션 */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700 dark:text-text-secondary">
            상세 메타데이터
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              {getDetailedMetadata(file.metadata).map(([key, value]) => (
                <div key={key} className="flex items-center text-sm">
                  <span className="w-24 text-gray-500 dark:text-text-secondary">
                    {key}:
                  </span>
                  <span className="text-gray-900 dark:text-text-primary">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            {file.status === "done" && file.convertedMetadata && (
              <div className="space-y-1">
                {getDetailedMetadata(file.convertedMetadata).map(
                  ([key, value]) => (
                    <div key={key} className="flex items-center text-sm">
                      <span className="w-24 text-gray-500 dark:text-text-secondary">
                        {key}:
                      </span>
                      <span className="text-gray-900 dark:text-text-primary">
                        {value}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[768px] mx-auto bg-white dark:bg-card rounded-lg shadow-sm border border-gray-200 dark:border-border p-4">
      {isExtended ? renderExtended() : renderMinified()}
    </div>
  );
};

export default FileCard;
