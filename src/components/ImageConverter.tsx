import React from "react";
import { useImageConverter } from "../hooks/useImageConverter";
import { ImageFormat } from "../utils/imageProcessor";
import { Dropzone } from "./Dropzone";
import { Results } from "./Results";
import { ErrorDisplay } from "./ErrorDisplay";
import ControlPanel from "./ControlPanel";

export const ImageConverter: React.FC = () => {
  const {
    isConverting,
    files,
    results,
    error,
    setSettings,
    onDrop,
    handleConvert,
    handleDownloadAll,
    handleClear,
  } = useImageConverter();

  const handleControlPanelSubmit = (options: {
    outputFormat: string;
    quality: string;
    width: number | null;
    rename: boolean;
    removeMetadata: boolean;
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

    // 설정 업데이트
    setSettings({
      format: formatMapping[options.outputFormat] || "jpeg",
      quality: qualityMapping[options.quality] || 75,
      width: options.width,
    });

    // 변환 시작
    handleConvert();
  };

  return (
    <div className="max-w-4xl mx-auto">
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
        <Dropzone onDrop={onDrop} isConverting={isConverting} />
        <ErrorDisplay error={error} />
        <Results files={files} results={results} />
      </div>

      {files.length > 0 && (
        <ControlPanel
          onSubmit={handleControlPanelSubmit}
          onDownloadAll={handleDownloadAll}
          onClearList={handleClear}
          isConverting={isConverting}
          progress={0} // TODO: 실제 진행률 계산 로직 추가
        />
      )}
    </div>
  );
};
