import React, { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

interface ControlPanelProps {
  onSubmit: (options: {
    outputFormat: string;
    quality: string;
    width: number | null;
    rename: boolean;
    removeMetadata: boolean;
  }) => void;
  onDownloadAll: () => void;
  onClearList: () => void;
  isConverting: boolean;
  progress: number;
  hasConvertedFiles?: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onSubmit,
  onDownloadAll,
  onClearList,
  isConverting,
  progress,
  hasConvertedFiles = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [outputFormat, setOutputFormat] = useState("webp");
  const [quality, setQuality] = useState("high");
  const [width, setWidth] = useState<number | null>(null);
  const [rename, setRename] = useState(false);
  const [removeMetadata, setRemoveMetadata] = useState(false);

  const predefinedWidths = [200, 400, 640, 860, 1024];

  const handleSubmit = () => {
    onSubmit({ outputFormat, quality, width, rename, removeMetadata });
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? null : parseInt(e.target.value);
    setWidth(value);
  };

  const getQualityText = () => {
    switch (quality) {
      case "original":
        return "원본";
      case "high":
        return "높은 품질";
      case "medium":
        return "중간 품질";
      case "low":
        return "낮은 품질";
      default:
        return "";
    }
  };

  const renderSummary = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
            변환:
          </span>
          <span className="font-medium text-gray-900 dark:text-text-primary whitespace-nowrap">
            {outputFormat.toUpperCase()} / {getQualityText()}
          </span>
        </div>
        {width && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
              크기:
            </span>
            <span className="font-medium text-gray-900 dark:text-text-primary whitespace-nowrap">
              {width}px
            </span>
          </div>
        )}
        {(rename || removeMetadata) && (
          <div className="flex flex-wrap items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
            {rename && <span className="whitespace-nowrap">이름 초기화</span>}
            {rename && removeMetadata && <span>•</span>}
            {removeMetadata && (
              <span className="whitespace-nowrap">메타데이터 제거</span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
        <div className="flex gap-2 flex-1 sm:flex-none">
          {!isConverting && !hasConvertedFiles && (
            <button
              onClick={handleSubmit}
              className="flex-1 sm:flex-none px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded font-medium transition-colors"
            >
              변환 시작
            </button>
          )}
          {(isConverting || hasConvertedFiles) && (
            <>
              <button
                onClick={onDownloadAll}
                disabled={isConverting}
                className="flex-1 sm:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                모두 다운로드
              </button>
              <button
                onClick={onClearList}
                disabled={isConverting}
                className="flex-1 sm:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                다시 하기
              </button>
            </>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          {isExpanded ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );

  const renderDetails = () => (
    <div className="border-t border-gray-200 dark:border-border p-4 sm:p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center gap-2 text-gray-700 dark:text-text-primary whitespace-nowrap">
              출력 형식:
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="px-2 py-1 border border-gray-300 dark:border-border rounded bg-white dark:bg-card text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-primary/50 outline-none"
              >
                <option value="webp">WebP</option>
                <option value="jpg">JPG</option>
                <option value="png">PNG</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-gray-700 dark:text-text-primary whitespace-nowrap">
              품질:
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="px-2 py-1 border border-gray-300 dark:border-border rounded bg-white dark:bg-card text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-primary/50 outline-none"
              >
                <option value="original">원본 그대로</option>
                <option value="high">높은 품질</option>
                <option value="medium">중간 품질</option>
                <option value="low">낮은 품질</option>
              </select>
            </label>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-gray-700 dark:text-text-primary cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={rename}
                onChange={(e) => setRename(e.target.checked)}
                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
              />
              파일 이름 초기화
            </label>
            <label className="flex items-center gap-2 text-gray-700 dark:text-text-primary cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={removeMetadata}
                onChange={(e) => setRemoveMetadata(e.target.checked)}
                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
              />
              메타데이터 제거
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <label className="text-gray-700 dark:text-text-primary">
              가로 길이:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {predefinedWidths.map((w) => (
                <button
                  key={w}
                  className={`px-2 py-1 border rounded text-sm transition-colors ${
                    width === w
                      ? "bg-primary text-white border-primary"
                      : "border-gray-300 dark:border-border bg-white dark:bg-card text-gray-700 dark:text-text-primary hover:bg-gray-50 dark:hover:bg-card/80"
                  }`}
                  onClick={() => setWidth(w)}
                >
                  {w}px
                </button>
              ))}
            </div>
            <input
              type="number"
              value={width || ""}
              onChange={handleWidthChange}
              placeholder="직접 입력"
              className="w-full sm:w-32 px-2 py-1 border border-gray-300 dark:border-border rounded bg-white dark:bg-card text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-primary/50 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[768px] mx-auto mt-8 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg shadow-sm">
      {renderSummary()}
      {isExpanded && renderDetails()}
      {isConverting && (
        <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-b overflow-hidden">
          <div
            className="h-full bg-primary transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
