import React, { useState } from "react";
import { ImageFile, ConversionResult } from "../hooks/useImageConverter";
import { downloadFile } from "../utils/file";

interface FileCardProps {
  type: "uploaded" | "result";
  imageFile: ImageFile;
  result?: ConversionResult;
}

export const FileCard: React.FC<FileCardProps> = ({
  type,
  imageFile,
  result,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 파일 미리보기 URL 생성
  React.useEffect(() => {
    const url = URL.createObjectURL(imageFile.file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile.file]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = () => {
    if (result) {
      downloadFile(result.convertedBlob, result.convertedName);
    }
  };

  const getFileExtension = (filename: string): string => {
    return filename.split(".").pop()?.toUpperCase() || "";
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
      <div className="flex items-start gap-4">
        {/* 썸네일 */}
        <div className="flex-shrink-0">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={imageFile.file.name}
              className="w-16 h-16 rounded-lg object-cover border border-gray-300 dark:border-gray-500"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        {/* 파일 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {type === "result" && result
                ? result.convertedName
                : imageFile.file.name}
            </h3>
            <div className="flex items-center gap-2 ml-4">
              {/* 다운로드 버튼 (변환 결과일 때만) */}
              {type === "result" && result && (
                <button
                  onClick={handleDownload}
                  className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  title="다운로드"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-4-4m4 4l4-4m5-5v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2z"
                    />
                  </svg>
                </button>
              )}

              {/* 확장/축소 버튼 */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <svg
                  className={`w-5 h-5 transform transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">
              {type === "result" && result
                ? getFileExtension(result.convertedName)
                : getFileExtension(imageFile.file.name)}
            </span>
            <span>•</span>
            <span>
              {type === "result" && result
                ? formatFileSize(result.convertedSize)
                : formatFileSize(imageFile.file.size)}
            </span>
          </div>
        </div>
      </div>

      {/* 확장된 정보 */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 원본 파일 정보 */}
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                원본 파일 정보
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    파일명:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {imageFile.file.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    파일 크기:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatFileSize(imageFile.file.size)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    파일 형식:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {getFileExtension(imageFile.file.name)}
                  </span>
                </div>
              </div>
            </div>

            {/* 변환된 파일 정보 (변환 결과일 때만) */}
            {type === "result" && result && (
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  변환된 파일 정보
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      파일명:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {result.convertedName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      파일 크기:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formatFileSize(result.convertedSize)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      파일 형식:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {result.format.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      압축률:
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      {(
                        (1 - result.convertedSize / result.originalSize) *
                        100
                      ).toFixed(1)}
                      % 감소
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
