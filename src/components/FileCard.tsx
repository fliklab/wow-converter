import React, { useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import type { ImageFile, ConversionResult } from "../hooks/useImageConverter";
import { downloadFile } from "../utils/file";
import { FileActionButtons } from "./FileActionButtons";
import { trackConvertedImagesDownloaded } from "../analytics/converterEvents";

interface FileCardProps {
  type: "uploaded" | "result";
  imageFile: ImageFile;
  result?: ConversionResult;
  onRemoveFile: (fileId: string) => void;
}

interface EnhancedImageMetadata {
  // 기본 정보
  width: number;
  height: number;
  type: string;
  size: number;
  lastModified: number;

  // 색상 정보
  colorSpace?: string;
  bitDepth?: number;
  hasAlpha?: boolean;

  // EXIF 데이터
  exifData?: {
    make?: string;
    model?: string;
    software?: string;
    dateTime?: string;
    orientation?: number;
    xResolution?: number;
    yResolution?: number;
    resolutionUnit?: number;
    iso?: number;
    fNumber?: number;
    exposureTime?: string;
    focalLength?: number;
    flash?: number;
    whiteBalance?: number;
    colorSpace?: number;
    pixelXDimension?: number;
    pixelYDimension?: number;
  };

  // 파일 형식별 정보
  compression?: string;
  quality?: number;
}

export const FileCard: React.FC<FileCardProps> = ({
  type,
  imageFile,
  result,
  onRemoveFile,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<EnhancedImageMetadata | null>(null);

  // 파일 미리보기 URL 및 메타데이터 생성
  React.useEffect(() => {
    const url = URL.createObjectURL(imageFile.file);
    setPreviewUrl(url);

    // 이미지 기본 메타데이터 추출
    const img = new Image();
    img.onload = async () => {
      // Canvas를 사용하여 색상 정보 분석
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 1;
      canvas.height = 1;

      if (ctx) {
        ctx.drawImage(img, 0, 0, 1, 1);

        // 첫 번째 픽셀 분석으로 알파 채널 확인 (간단한 방법)
        const imageData = ctx.getImageData(0, 0, 1, 1);
        const hasAlpha = imageData.data[3] < 255;

        // 기본 메타데이터 설정
        const basicMetadata: EnhancedImageMetadata = {
          width: img.width,
          height: img.height,
          type: imageFile.file.type,
          size: imageFile.file.size,
          lastModified: imageFile.file.lastModified,
          hasAlpha,
          bitDepth: 8, // 웹에서는 일반적으로 8비트
          colorSpace: hasAlpha ? "RGBA" : "RGB",
        };
        setMetadata(basicMetadata);

        // EXIF 데이터 추출 (타입 안전성을 위해 try-catch 사용)
        try {
          const EXIF = await import("exif-js");
          EXIF.getData(imageFile.file as any, () => {
            try {
              const exifData = {
                make: EXIF.getTag(imageFile.file as any, "Make"),
                model: EXIF.getTag(imageFile.file as any, "Model"),
                software: EXIF.getTag(imageFile.file as any, "Software"),
                dateTime: EXIF.getTag(imageFile.file as any, "DateTime"),
                orientation: EXIF.getTag(imageFile.file as any, "Orientation"),
                xResolution: EXIF.getTag(imageFile.file as any, "XResolution"),
                yResolution: EXIF.getTag(imageFile.file as any, "YResolution"),
                resolutionUnit: EXIF.getTag(
                  imageFile.file as any,
                  "ResolutionUnit"
                ),
                iso: EXIF.getTag(imageFile.file as any, "ISOSpeedRatings"),
                fNumber: EXIF.getTag(imageFile.file as any, "FNumber"),
                exposureTime: EXIF.getTag(
                  imageFile.file as any,
                  "ExposureTime"
                ),
                focalLength: EXIF.getTag(imageFile.file as any, "FocalLength"),
                flash: EXIF.getTag(imageFile.file as any, "Flash"),
                whiteBalance: EXIF.getTag(
                  imageFile.file as any,
                  "WhiteBalance"
                ),
                colorSpace: EXIF.getTag(imageFile.file as any, "ColorSpace"),
                pixelXDimension: EXIF.getTag(
                  imageFile.file as any,
                  "PixelXDimension"
                ),
                pixelYDimension: EXIF.getTag(
                  imageFile.file as any,
                  "PixelYDimension"
                ),
              };

              // 빈 값들 제거
              const cleanExifData = Object.fromEntries(
                Object.entries(exifData).filter(
                  ([_, value]) => value != null && value !== ""
                )
              );

              setMetadata({
                ...basicMetadata,
                exifData:
                  Object.keys(cleanExifData).length > 0
                    ? cleanExifData
                    : undefined,
              });
            } catch (err) {
              console.warn("EXIF 데이터 파싱 실패:", err);
              setMetadata(basicMetadata);
            }
          });
        } catch (err) {
          console.warn("EXIF 데이터 추출 실패:", err);
          setMetadata(basicMetadata);
        }

      }
    };
    img.src = url;

    return () => URL.revokeObjectURL(url);
  }, [imageFile.file]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString("ko-KR");
  };

  const formatExposureTime = (exposureTime: any): string => {
    if (typeof exposureTime === "number") {
      return exposureTime < 1
        ? `1/${Math.round(1 / exposureTime)}s`
        : `${exposureTime}s`;
    }
    return String(exposureTime);
  };

  const getResolutionUnit = (unit: number): string => {
    switch (unit) {
      case 2:
        return "inches";
      case 3:
        return "cm";
      default:
        return "unknown";
    }
  };

  const getFlashStatus = (flash: number): string => {
    const flashFired = flash & 0x01;
    return flashFired ? "Flash fired" : "Flash did not fire";
  };

  const handleDownload = () => {
    if (result) {
      trackConvertedImagesDownloaded([result], "single");
      downloadFile(result.convertedBlob, result.convertedName);
    }
  };

  const getFileExtension = (filename: string): string => {
    return filename.split(".").pop()?.toUpperCase() || "";
  };

  const getCompressionRate = (): number => {
    if (!result) return 0;
    return (1 - result.convertedSize / result.originalSize) * 100;
  };

  const compressionRate = getCompressionRate();
  const isSmaller = compressionRate >= 0;
  const isSameSize = Math.abs(compressionRate) < 0.05;
  const displayedCompressionRate = Math.abs(compressionRate).toFixed(1);
  const sizeChangeLabel = isSameSize
    ? "동일"
    : isSmaller
      ? "↓ 절감"
      : "↑ 증가";
  const sizeDifference = result
    ? Math.abs(result.originalSize - result.convertedSize)
    : 0;

  return (
    <article className="rounded-[20px] border border-slate-200/80 bg-slate-50/70 p-3.5 transition hover:border-violet-200 hover:bg-violet-50/30 sm:p-4">
      <div className="flex items-start gap-4">
        {/* 썸네일 */}
        <div className="flex-shrink-0">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={imageFile.file.name}
              className="h-16 w-16 rounded-2xl border border-white object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200">
              <svg
                className="h-8 w-8 text-slate-400"
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
            <h3 className="truncate font-bold text-slate-900">
              {type === "result" && result
                ? result.convertedName
                : imageFile.file.name}
            </h3>
            <div
              className="ml-4 flex items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <FileActionButtons
                fileName={imageFile.file.name}
                downloadName={result?.convertedName}
                onDelete={() => onRemoveFile(imageFile.id)}
                onDownload={result ? handleDownload : undefined}
              />

              {/* 확장/축소 버튼 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
                aria-label={isExpanded ? "파일 세부 정보 숨기기" : "파일 세부 정보 보기"}
                aria-expanded={isExpanded}
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

          <div className="mt-1 text-xs text-slate-500 sm:text-sm">
            {type === "result" && result ? (
              <div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/70 px-2 py-1 text-[11px] font-bold text-slate-600">
                    <CheckCircleIcon className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    변환 완료
                  </span>
                  <span
                    className={`inline-flex items-baseline gap-1 rounded-xl px-2.5 py-1.5 tabular-nums ${
                      isSameSize
                        ? "bg-slate-100 text-slate-700"
                        : isSmaller
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    <strong className="text-xl font-extrabold tracking-tight">
                      {displayedCompressionRate}%
                    </strong>
                    <span className="text-xs font-bold">{sizeChangeLabel}</span>
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-slate-500">
                  <span className="tabular-nums">
                    {formatFileSize(result.originalSize)}
                    <span className="mx-1 text-slate-400" aria-hidden="true">→</span>
                    <span className="font-bold text-slate-700">{formatFileSize(result.convertedSize)}</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold">{result.format.toUpperCase()}</span>
                  <span aria-hidden="true">·</span>
                  <span>{result.width}×{result.height}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-medium">
                  {getFileExtension(imageFile.file.name)}
                </span>
                <span>•</span>
                <span>{formatFileSize(imageFile.file.size)}</span>
                {metadata && (
                  <>
                    <span>•</span>
                    <span>
                      {metadata.width}×{metadata.height}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 확장된 정보 */}
      {isExpanded && (
        <div
          className="mt-4 border-t border-slate-200 pt-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-1 gap-6">
            {/* 기본 파일 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 원본 파일 정보 */}
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                  원본 파일 정보
                </h4>
                <div className="space-y-2 text-sm">
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
                      {imageFile.file.type}
                    </span>
                  </div>
                  {metadata && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          해상도:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {metadata.width} × {metadata.height} px
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          종횡비:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {(metadata.width / metadata.height).toFixed(2)}:1
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          총 픽셀:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {(metadata.width * metadata.height).toLocaleString()}{" "}
                          px
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          수정일:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {formatDate(metadata.lastModified)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          색상 공간:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {metadata.colorSpace || "RGB"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          비트 깊이:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {metadata.bitDepth || 8} bits
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          투명도:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {metadata.hasAlpha ? "있음" : "없음"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 변환된 파일 정보 (변환 결과일 때만) */}
              {type === "result" && result && (
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                    변환된 파일 정보
                  </h4>
                  <div className="space-y-2 text-sm">
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
                        image/{result.format}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        해상도:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {result.width} × {result.height} px
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        압축률:
                      </span>
                      <span
                        className={`font-medium ${
                          isSmaller
                            ? "text-green-600 dark:text-green-400"
                            : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {displayedCompressionRate}% {sizeChangeLabel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        {isSmaller ? "절약된 용량:" : "증가한 용량:"}
                      </span>
                      <span
                        className={`font-medium ${
                          isSmaller
                            ? "text-green-600 dark:text-green-400"
                            : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {formatFileSize(sizeDifference)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* EXIF 데이터 섹션 */}
            {metadata?.exifData &&
              Object.keys(metadata.exifData).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                    EXIF 메타데이터
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 text-sm">
                      {metadata.exifData.make && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            제조사:
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {metadata.exifData.make}
                          </span>
                        </div>
                      )}
                      {metadata.exifData.model && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            모델:
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {metadata.exifData.model}
                          </span>
                        </div>
                      )}
                      {metadata.exifData.software && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            소프트웨어:
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {metadata.exifData.software}
                          </span>
                        </div>
                      )}
                      {metadata.exifData.dateTime && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            촬영일시:
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {metadata.exifData.dateTime}
                          </span>
                        </div>
                      )}
                      {metadata.exifData.iso && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            ISO:
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {metadata.exifData.iso}
                          </span>
                        </div>
                      )}
                      {metadata.exifData.fNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            조리개:
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            f/{metadata.exifData.fNumber}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      {metadata.exifData.exposureTime && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            셔터스피드:
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {formatExposureTime(metadata.exifData.exposureTime)}
                          </span>
                        </div>
                      )}
                      {metadata.exifData.focalLength && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            초점거리:
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {metadata.exifData.focalLength}mm
                          </span>
                        </div>
                      )}
                      {metadata.exifData.flash !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            플래시:
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {getFlashStatus(metadata.exifData.flash)}
                          </span>
                        </div>
                      )}
                      {metadata.exifData.xResolution &&
                        metadata.exifData.yResolution && (
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">
                              해상도:
                            </span>
                            <span className="text-gray-900 dark:text-white">
                              {metadata.exifData.xResolution} ×{" "}
                              {metadata.exifData.yResolution}{" "}
                              {getResolutionUnit(
                                metadata.exifData.resolutionUnit || 2
                              )}
                            </span>
                          </div>
                        )}
                      {metadata.exifData.orientation && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            방향:
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {metadata.exifData.orientation}
                          </span>
                        </div>
                      )}
                      {metadata.exifData.colorSpace && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            색상공간:
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {metadata.exifData.colorSpace === 1
                              ? "sRGB"
                              : "Uncalibrated"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      )}
    </article>
  );
};
