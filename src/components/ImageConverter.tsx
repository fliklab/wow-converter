import React, { Suspense } from "react";
import { useImageConverter } from "../hooks/useImageConverter";
import type { ImageFormat } from "../utils/imageProcessor";
import { Dropzone } from "./Dropzone";
import { ErrorDisplay } from "./ErrorDisplay";
import { Toast } from "./Toast";
import type { MetadataPolicy } from "../utils/metadataPreservation";

const Results = React.lazy(() =>
  import("./Results").then(({ Results }) => ({ default: Results }))
);
const ControlPanel = React.lazy(() => import("./ControlPanel"));

export const ImageConverter: React.FC = () => {
  const {
    isConverting,
    files,
    results,
    error,
    showToast,
    progress,
    onDrop,
    handleConvert,
    handleDownloadAll,
    handleClear,
    handleRemoveFile,
    handleRenameResults,
    dismissToast,
  } = useImageConverter();

  const completedFileIds = new Set(
    results.map((result) => result.originalFile.id)
  );
  const pendingCount = files.filter(
    (file) => !completedFileIds.has(file.id)
  ).length;

  const handleControlPanelSubmit = (options: {
    outputFormat: string;
    quality: string;
    width: number | null;
    rename: boolean;
    metadataPolicy: MetadataPolicy;
  }) => {
    // 포맷 매핑 (jpg -> jpeg)
    const formatMapping: Record<string, ImageFormat> = {
      jpg: "jpeg",
      jpeg: "jpeg",
      png: "png",
      webp: "webp",
      avif: "avif",
    };

    // 품질 매핑
    const qualityMapping: Record<string, number> = {
      original: 100,
      high: 90,
      medium: 75,
      low: 60,
    };

    void handleConvert({
      format: formatMapping[options.outputFormat] || "jpeg",
      quality: qualityMapping[options.quality] || 75,
      width: options.width,
      rename: options.rename,
      metadataPolicy: options.metadataPolicy,
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-32">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
          WOW Converter
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
          웹사이트에 최적화된 이미지 변환을 위한 온라인 도구
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          파일을 서버로 보내지 않아 안전합니다.
        </p>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        {files.length === 0 ? (
          <Dropzone onDrop={onDrop} isConverting={isConverting} />
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  작업 파일
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  전체 {files.length}개 · 변환 대기 {pendingCount}개
                </p>
              </div>
              <button
                type="button"
                onClick={handleClear}
                disabled={isConverting}
                className="min-h-11 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                새 작업
              </button>
            </div>
            <Dropzone
              onDrop={onDrop}
              isConverting={isConverting}
              compact
            />
          </>
        )}
        <ErrorDisplay error={error} />
        {files.length > 0 && (
          <Suspense
            fallback={
              <p
                className="mt-8 text-sm text-gray-600 dark:text-gray-300"
                role="status"
              >
                파일 정보를 불러오는 중...
              </p>
            }
          >
            <Results
              files={files}
              results={results}
              onRemoveFile={handleRemoveFile}
            />
          </Suspense>
        )}
      </div>

      {files.length > 0 && (
        <Suspense fallback={null}>
          <ControlPanel
            onSubmit={handleControlPanelSubmit}
            onRenameChange={handleRenameResults}
            onDownloadAll={handleDownloadAll}
            isConverting={isConverting}
            progress={progress}
            hasResults={results.length > 0}
            pendingCount={pendingCount}
          />
        </Suspense>
      )}

      {showToast && (
        <Toast
          message={`${results.length}개 파일 변환이 완료되었습니다.`}
          type="success"
          onClose={dismissToast}
        />
      )}
    </div>
  );
};
