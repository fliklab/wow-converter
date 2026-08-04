import React, { useState } from "react";
import {
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  LockClosedIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import type { MetadataPolicy } from "../utils/metadataPreservation";
import { HelpTooltip } from "./HelpTooltip";

interface ControlPanelProps {
  onSubmit: (options: {
    outputFormat: string;
    quality: string;
    width: number | null;
    rename: boolean;
    metadataPolicy: MetadataPolicy;
  }) => void;
  onRenameChange: (rename: boolean) => void;
  onDownloadAll: () => void;
  isConverting: boolean;
  progress: number;
  hasResults?: boolean;
  pendingCount?: number;
}

const formats = [
  { value: "jpg", label: "JPG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WebP" },
  { value: "avif", label: "AVIF" },
];

const qualityLabels: Record<string, string> = {
  original: "최고 품질",
  high: "높은 품질",
  medium: "균형",
  low: "작은 용량",
};

const MAX_WIDTH = 16384;

const ControlPanel: React.FC<ControlPanelProps> = ({
  onSubmit,
  onRenameChange,
  onDownloadAll,
  isConverting,
  progress,
  hasResults = false,
  pendingCount = 0,
}) => {
  const [outputFormat, setOutputFormat] = useState("jpg");
  const [quality, setQuality] = useState("original");
  const [width, setWidth] = useState<number | null>(null);
  const [rename, setRename] = useState(false);
  const [metadataPolicy, setMetadataPolicy] = useState<MetadataPolicy>("remove");
  const [showDetails, setShowDetails] = useState(false);
  const [widthError, setWidthError] = useState("");

  const predefinedWidths = [400, 640, 860, 1024];
  const effectiveMetadataPolicy = outputFormat === "avif" ? "remove" : metadataPolicy;
  const qualityDisabled = outputFormat === "png";
  const effectiveQuality = qualityDisabled ? "original" : quality;

  const selectWidth = (nextWidth: number | null) => {
    setWidth(nextWidth);
    setWidthError("");
  };

  const handleWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    if (rawValue === "") {
      selectWidth(null);
      return;
    }

    const nextWidth = Number(rawValue);
    setWidth(Number.isFinite(nextWidth) ? nextWidth : null);
    setWidthError(
      Number.isInteger(nextWidth) && nextWidth >= 1 && nextWidth <= MAX_WIDTH
        ? ""
        : `1~${MAX_WIDTH.toLocaleString()}px 사이의 정수를 입력해 주세요.`
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (widthError) return;
    onSubmit({
      outputFormat,
      quality: effectiveQuality,
      width,
      rename,
      metadataPolicy: effectiveMetadataPolicy,
    });
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 shadow-[0_-18px_55px_rgba(45,43,80,0.16)] backdrop-blur-xl md:static md:mt-6 md:rounded-[28px] md:border md:border-white/90 md:shadow-[0_20px_55px_rgba(73,69,124,0.1)]">
      <form onSubmit={handleSubmit} className="mx-auto max-h-[78dvh] max-w-3xl overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 md:max-h-none md:overflow-visible md:p-6">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200 md:hidden" aria-hidden="true" />

        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-base font-bold text-slate-900">
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-primary" aria-hidden="true" />
              변환 옵션
            </div>
            <p className="mt-1 text-xs text-slate-500">자주 쓰는 옵션만 먼저 보여드려요.</p>
          </div>
          <div className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-primary">
            {outputFormat.toUpperCase()} · {qualityLabels[effectiveQuality]}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <fieldset>
            <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">출력 형식</legend>
            <div className="grid grid-cols-4 gap-2">
              {formats.map((format) => (
                <label key={format.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="output-format"
                    value={format.value}
                    checked={outputFormat === format.value}
                    onChange={(event) => setOutputFormat(event.target.value)}
                    className="peer sr-only"
                  />
                  <span className="flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-2 text-sm font-bold text-slate-600 transition peer-checked:border-primary peer-checked:bg-violet-50 peer-checked:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 hover:border-violet-300">
                    {format.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">품질</span>
            <select
              value={effectiveQuality}
              onChange={(event) => setQuality(event.target.value)}
              disabled={qualityDisabled}
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            >
              <option value="original">최고 품질 · 100</option>
              <option value="high">높은 품질 · 90</option>
              <option value="medium">균형 · 75</option>
              <option value="low">작은 용량 · 60</option>
            </select>
            {qualityDisabled ? <span className="mt-1.5 block text-xs text-slate-500">PNG는 무손실 방식으로 저장됩니다.</span> : null}
          </label>
        </div>

        <button
          type="button"
          onClick={() => setShowDetails((visible) => !visible)}
          aria-expanded={showDetails}
          aria-controls="advanced-options"
          className="mt-4 flex min-h-11 w-full items-center justify-between rounded-xl px-1 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
        >
          <span>세부 옵션 {showDetails ? "숨기기" : "보기"}</span>
          <ChevronDownIcon className={`h-5 w-5 transition-transform ${showDetails ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>

        {showDetails ? (
          <div id="advanced-options" className="space-y-5 border-t border-slate-100 pt-4">
            <fieldset>
              <legend className="mb-2 text-sm font-bold text-slate-800">가로 크기</legend>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => selectWidth(null)} className={`min-h-11 rounded-xl border px-3 text-sm font-semibold transition ${width === null ? "border-primary bg-violet-50 text-primary" : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"}`}>원본 유지</button>
                {predefinedWidths.map((preset) => (
                  <button key={preset} type="button" onClick={() => selectWidth(preset)} className={`min-h-11 rounded-xl border px-3 text-sm font-semibold transition ${width === preset ? "border-primary bg-violet-50 text-primary" : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"}`}>{preset}px</button>
                ))}
                <label className="min-w-28 flex-1">
                  <span className="sr-only">사용자 지정 가로 크기</span>
                  <input type="number" min="1" max={MAX_WIDTH} step="1" value={width ?? ""} onChange={handleWidthChange} placeholder="직접 입력" aria-invalid={Boolean(widthError)} aria-describedby={widthError ? "width-error" : undefined} className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
                </label>
              </div>
              <p className="mt-2 text-xs text-slate-500">원본보다 작을 때만 비율을 유지해 축소합니다.</p>
              {widthError ? <p id="width-error" className="mt-1 text-xs font-medium text-red-600" role="alert">{widthError}</p> : null}
            </fieldset>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4">
                <input type="checkbox" checked={rename} onChange={(event) => { setRename(event.target.checked); onRenameChange(event.target.checked); }} className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary" />
                <span><span className="block text-sm font-bold text-slate-800">파일명 단순화</span><span className="block text-xs text-slate-500">converted-1 형식으로 저장</span></span>
              </label>

              <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4">
                <LockClosedIcon className="h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
                <label htmlFor="metadata-policy" className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 text-sm font-bold text-slate-800">메타데이터 <HelpTooltip label="메타데이터 처리 도움말">위치·촬영 기기 등 개인정보를 제거하거나 지원되는 EXIF를 유지합니다. AVIF는 항상 제거됩니다.</HelpTooltip></span>
                  <select id="metadata-policy" value={effectiveMetadataPolicy} onChange={(event) => setMetadataPolicy(event.target.value as MetadataPolicy)} disabled={outputFormat === "avif"} className="mt-1 w-full bg-transparent text-xs font-medium text-slate-600 outline-none disabled:cursor-not-allowed">
                    <option value="remove">개인정보 보호를 위해 제거</option>
                    <option value="preserve">가능한 항목 보존</option>
                  </select>
                </label>
              </div>
            </div>
          </div>
        ) : null}

        {isConverting ? (
          <div className="mt-4" role="status" aria-live="polite">
            <div className="mb-1.5 flex justify-between text-xs font-semibold text-slate-600"><span>이미지를 변환하고 있어요</span><span className="tabular-nums">{progress}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400 transition-[width] duration-300" style={{ width: `${progress}%` }} /></div>
          </div>
        ) : null}

        <div className="mt-4 flex justify-center gap-2 sm:gap-3">
          <button type="submit" disabled={isConverting || Boolean(widthError)} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-[#767cfb] px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(109,93,252,0.28)] transition hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:min-w-52">
            <PhotoIcon className="h-5 w-5" aria-hidden="true" />
            {pendingCount > 0 ? `${pendingCount}개 이미지 변환` : "전체 다시 변환"}
          </button>
          {hasResults ? (
            <button type="button" onClick={onDownloadAll} disabled={isConverting} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:border-primary/30 hover:bg-violet-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:min-w-44">
              <ArrowDownTrayIcon className="h-5 w-5" aria-hidden="true" />
              모두 다운로드
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
};

export default ControlPanel;
