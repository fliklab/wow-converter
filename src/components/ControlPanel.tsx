import React, { useState } from "react";

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
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onSubmit,
  onDownloadAll,
  onClearList,
  isConverting,
  progress,
}) => {
  const [outputFormat, setOutputFormat] = useState("jpg");
  const [quality, setQuality] = useState("original");
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

  return (
    <div className="max-w-[768px] mx-auto mt-8 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg shadow-sm">
      <div className="p-6 space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-gray-700 dark:text-text-primary">
              출력 형식:
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="px-2 py-1 border border-gray-300 dark:border-border rounded bg-white dark:bg-card text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-primary/50 outline-none"
              >
                <option value="jpg">JPG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-gray-700 dark:text-text-primary">
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

          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-gray-700 dark:text-text-primary">
              가로 길이:
            </label>
            <div className="flex gap-2 flex-wrap">
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
              className="w-24 px-2 py-1 border border-gray-300 dark:border-border rounded bg-white dark:bg-card text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-primary/50 outline-none"
            />
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          <label className="flex items-center gap-2 text-gray-700 dark:text-text-primary cursor-pointer">
            <input
              type="checkbox"
              checked={rename}
              onChange={(e) => setRename(e.target.checked)}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            파일 이름 초기화
          </label>
          <label className="flex items-center gap-2 text-gray-700 dark:text-text-primary cursor-pointer">
            <input
              type="checkbox"
              checked={removeMetadata}
              onChange={(e) => setRemoveMetadata(e.target.checked)}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            메타데이터 제거
          </label>
        </div>

        {isConverting && (
          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
            <div
              className="h-full bg-primary transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            onClick={handleSubmit}
            disabled={isConverting}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            변환 시작
          </button>
          <button
            onClick={onDownloadAll}
            disabled={isConverting}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            모두 다운로드
          </button>
          <button
            onClick={onClearList}
            disabled={isConverting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            리스트 비우기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
