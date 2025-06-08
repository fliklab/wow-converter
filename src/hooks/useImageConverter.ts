import { useCallback, useState } from "react";
import {
  processImage,
  ImageFormat,
  // EncodeOptions,
  CompressionMode,
} from "../utils/imageProcessor";
import { downloadFile } from "../utils/file";

export type QualityLevel = "original" | "high" | "medium" | "low";

export interface UserConversionSettings {
  format: "jpeg" | "webp" | "avif" | "png";
  qualityLevel: QualityLevel;
  lossless: boolean;
  width: number | null;
  compressionMode?: CompressionMode;
}

export interface ImageFile {
  file: File;
  id: string;
}

export interface ConversionResult {
  originalFile: ImageFile;
  convertedBlob: Blob;
  convertedName: string;
  format: ImageFormat;
  originalSize: number;
  convertedSize: number;
}

export const useImageConverter = () => {
  const [isConverting, setIsConverting] = useState(false);
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [settings, setSettings] = useState<UserConversionSettings>({
    format: "jpeg",
    qualityLevel: "high",
    lossless: false,
    width: null,
    compressionMode: "normal",
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImageFiles = acceptedFiles.map((file) => ({
      file,
      id: `${file.name}-${file.lastModified}`,
    }));
    console.log("onDrop", acceptedFiles);
    setFiles((prevFiles) => [...prevFiles, ...newImageFiles]);
  }, []);

  function mapUserSettingsToEncodeOptions(user: UserConversionSettings) {
    const compressionMode: CompressionMode = user.compressionMode || "normal";
    switch (user.format) {
      case "jpeg": {
        const options: import("../utils/imageProcessor").JpegEncodeOptions = {};
        if (user.qualityLevel !== "original") {
          options.quality =
            user.qualityLevel === "high"
              ? 90
              : user.qualityLevel === "medium"
              ? 75
              : 50;
        }
        // progressive: 고압축일 때만 true
        options.progressive = compressionMode === "max";
        return { format: "jpeg", options } as const;
      }
      case "webp": {
        const options: import("../utils/imageProcessor").WebpEncodeOptions = {};
        if (user.lossless) {
          options.lossless = true;
        } else if (user.qualityLevel !== "original") {
          options.quality =
            user.qualityLevel === "high"
              ? 90
              : user.qualityLevel === "medium"
              ? 75
              : 50;
        }
        // method: 0(빠름), 4(보통), 6(최고압축)
        options.method =
          compressionMode === "fast" ? 0 : compressionMode === "normal" ? 4 : 6;
        return { format: "webp", options } as const;
      }
      case "avif": {
        const options: import("../utils/imageProcessor").AvifEncodeOptions = {};
        if (user.lossless) {
          options.cqLevel = 0;
        } else if (user.qualityLevel !== "original") {
          options.cqLevel =
            user.qualityLevel === "high"
              ? 20
              : user.qualityLevel === "medium"
              ? 33
              : 50;
        }
        // speed: 10(빠름), 6(보통), 0(최고압축)
        options.speed =
          compressionMode === "fast"
            ? 10
            : compressionMode === "normal"
            ? 6
            : 0;
        return { format: "avif", options } as const;
      }
      case "png": {
        const options: import("../utils/imageProcessor").PngEncodeOptions = {};
        if (user.lossless) {
          options.compressionLevel = 9;
        } else {
          options.compressionLevel =
            compressionMode === "fast"
              ? 1
              : compressionMode === "normal"
              ? 6
              : 9;
        }
        return { format: "png", options } as const;
      }
      default:
        throw new Error("지원하지 않는 포맷");
    }
  }

  const handleConvert = useCallback(async () => {
    try {
      setError(null);
      setIsConverting(true);

      const newResults: ConversionResult[] = [];
      const encodeOptions = mapUserSettingsToEncodeOptions(settings);

      for (const imageFile of files) {
        const result = await processImage(
          imageFile.file,
          encodeOptions,
          settings.width
        );
        const extension = encodeOptions.format;
        const convertedName = `${imageFile.file.name
          .split(".")
          .slice(0, -1)
          .join(".")}_converted.${extension}`;

        newResults.push({
          originalFile: imageFile,
          convertedBlob: result.blob,
          convertedName,
          format: encodeOptions.format,
          originalSize: imageFile.file.size,
          convertedSize: result.blob.size,
        });
      }

      setResults(newResults);
      setShowToast(true);
    } catch (err) {
      console.error("이미지 변환 중 오류 발생:", err);
      setError(
        err instanceof Error
          ? `변환 실패: ${err.message}`
          : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setIsConverting(false);
    }
  }, [files, settings]);

  const handleDownloadAll = useCallback(() => {
    if (results.length === 0) return;

    results.forEach((result) => {
      downloadFile(result.convertedBlob, result.convertedName);
    });
  }, [results]);

  const handleClear = useCallback(() => {
    setFiles([]);
    setResults([]);
    setError(null);
  }, []);

  const handleRemoveFile = useCallback((fileId: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    // 만약 변환 결과에서도 해당 파일이 있다면 제거
    setResults((prevResults) =>
      prevResults.filter((result) => result.originalFile.id !== fileId)
    );
  }, []);

  const dismissToast = useCallback(() => {
    setShowToast(false);
  }, []);

  return {
    isConverting,
    files,
    results,
    error,
    showToast,
    settings,
    setSettings,
    onDrop,
    handleConvert,
    handleDownloadAll,
    handleClear,
    handleRemoveFile,
    dismissToast,
  };
};
