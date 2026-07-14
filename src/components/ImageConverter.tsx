import React from "react";
import { useImageConverter } from "../hooks/useImageConverter";
import { ImageFormat } from "../utils/imageProcessor";
import { Dropzone } from "./Dropzone";
import { Results } from "./Results";
import { ErrorDisplay } from "./ErrorDisplay";
import { Toast } from "./Toast";
import ControlPanel from "./ControlPanel";

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
    dismissToast,
  } = useImageConverter();

  const handleControlPanelSubmit = (options: {
    outputFormat: string;
    quality: string;
    width: number | null;
    rename: boolean;
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
        {results.length === 0 && (
          <Dropzone onDrop={onDrop} isConverting={isConverting} />
        )}
        <ErrorDisplay error={error} />
        <Results
          files={files}
          results={results}
          onRemoveFile={handleRemoveFile}
        />
      </div>

      {files.length > 0 && (
        <ControlPanel
          onSubmit={handleControlPanelSubmit}
          onDownloadAll={handleDownloadAll}
          onClearList={handleClear}
          isConverting={isConverting}
          progress={progress}
          hasResults={results.length > 0}
          hasFiles={files.length > 0}
        />
      )}

      {showToast && (
        <Toast
          message={`🎉 ${results.length}개 파일 변환이 완료되었습니다!`}
          type="success"
          onClose={dismissToast}
        />
      )}
    </div>
  );
};
