import React, { Suspense, useMemo } from "react";
import { ShieldCheckIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useImageConverter } from "../hooks/useImageConverter";
import type { ImageFormat } from "../utils/imageProcessor";
import type { MetadataPolicy } from "../utils/metadataPreservation";
import { Dropzone } from "./Dropzone";
import { ErrorDisplay } from "./ErrorDisplay";
import { Toast } from "./Toast";

const Results = React.lazy(() =>
  import("./Results").then(({ Results }) => ({ default: Results }))
);
const ControlPanel = React.lazy(() => import("./ControlPanel"));

interface ControlOptions {
  outputFormat: string;
  quality: string;
  width: number | null;
  rename: boolean;
  metadataPolicy: MetadataPolicy;
}

const formatMapping: Record<string, ImageFormat> = {
  jpg: "jpeg",
  jpeg: "jpeg",
  png: "png",
  webp: "webp",
  avif: "avif",
};

const qualityMapping: Record<string, number> = {
  original: 100,
  high: 90,
  medium: 75,
  low: 60,
};

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

  const completedFileIds = useMemo(
    () => new Set(results.map((result) => result.originalFile.id)),
    [results]
  );
  const pendingCount = files.reduce(
    (count, file) => count + (completedFileIds.has(file.id) ? 0 : 1),
    0
  );

  const handleControlPanelSubmit = (options: ControlOptions) => {
    const format = formatMapping[options.outputFormat];
    const quality = qualityMapping[options.quality];
    if (!format || quality === undefined) return;

    void handleConvert({
      format,
      quality,
      width: options.width,
      rename: options.rename,
      metadataPolicy: options.metadataPolicy,
    });
  };

  return (
    <div className={files.length > 0 ? "pb-[25rem] md:pb-0" : ""}>
      <header className="mb-7 text-center sm:mb-9">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-xs font-bold tracking-wide text-primary shadow-sm backdrop-blur">
          <SparklesIcon className="h-4 w-4" aria-hidden="true" />
          WEB OPTIMIZATION WIZARD
        </div>
        <h1 className="text-balance text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-5xl">
          이미지를 더 가볍게,
          <span className="block bg-gradient-to-r from-[#6d5dfc] via-[#777cfb] to-[#36b9dc] bg-clip-text text-transparent">
            화질은 선명하게
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-6 text-slate-600 sm:text-base">
          JPG, PNG, WebP, AVIF를 원하는 형식과 크기로 빠르게 변환하세요.
        </p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <ShieldCheckIcon className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          모든 작업은 브라우저에서만 처리됩니다
        </p>
      </header>

      <section className="rounded-[28px] border border-white/90 bg-white/90 p-4 shadow-[0_24px_70px_rgba(73,69,124,0.13)] backdrop-blur sm:p-6" aria-label="이미지 변환 작업">
        {files.length === 0 ? (
          <Dropzone onDrop={onDrop} isConverting={isConverting} />
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-4 px-1">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">작업 파일</h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  전체 {files.length}개 · {pendingCount > 0 ? `변환 대기 ${pendingCount}개` : "모두 변환됨"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClear}
                disabled={isConverting}
                className="min-h-11 shrink-0 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                새 작업
              </button>
            </div>
            <Dropzone onDrop={onDrop} isConverting={isConverting} compact />
          </>
        )}

        <ErrorDisplay error={error} />
        {files.length > 0 ? (
          <Suspense fallback={<p className="mt-6 text-sm text-slate-500" role="status">파일 정보를 불러오는 중...</p>}>
            <Results files={files} results={results} onRemoveFile={handleRemoveFile} />
          </Suspense>
        ) : null}
      </section>

      {files.length > 0 ? (
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
      ) : null}

      {showToast ? (
        <Toast message={`${results.length}개 파일 변환이 완료되었습니다.`} type="success" onClose={dismissToast} />
      ) : null}
    </div>
  );
};
