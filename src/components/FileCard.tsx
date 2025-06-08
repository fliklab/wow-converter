import React, { useState } from "react";
import { ImageFile, ConversionResult } from "../hooks/useImageConverter";
import { downloadFile } from "../utils/file";
import * as EXIF from "exif-js";

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
    img.onload = () => {
      // Canvas를 사용하여 색상 정보 분석
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;

      if (ctx) {
        ctx.drawImage(img, 0, 0);

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

        // EXIF 데이터 추출 (타입 안전성을 위해 try-catch 사용)
        try {
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

        // EXIF가 없는 경우 기본 메타데이터만 설정
        setTimeout(() => {
          if (!metadata) {
            setMetadata(basicMetadata);
          }
        }, 500);
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

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 cursor-pointer"
      onClick={handleCardClick}
    >
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
            <div
              className="flex items-center gap-2 ml-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 제거 버튼 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile(imageFile.id);
                }}
                className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                title="파일 제거"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>

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
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
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
            {type === "result" && result ? (
              <>
                <span className="font-bold text-green-600 dark:text-green-400">
                  변환 완료({getCompressionRate().toFixed(1)}% 감소)
                </span>
                <span>•</span>
                <span className="font-medium">
                  {result.format.toUpperCase()}
                </span>
                <span>•</span>
                <span>{formatFileSize(result.convertedSize)}</span>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* 확장된 정보 */}
      {isExpanded && (
        <div
          className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600"
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
                        압축률:
                      </span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {getCompressionRate().toFixed(1)}% 감소
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        절약된 용량:
                      </span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {formatFileSize(
                          result.originalSize - result.convertedSize
                        )}
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
    </div>
  );
};
