import { useCallback, useState } from "react";
import type { ImageFormat, EncodeOptions } from "../utils/imageProcessor";
import { downloadFile } from "../utils/file";
import type { MetadataPolicy } from "../utils/metadataPreservation";
import {
  trackConversionCompleted,
  trackConversionFailed,
  trackConversionStarted,
  trackConvertedImagesDownloaded,
  trackImageRemoved,
  trackImagesAdded,
  trackWorkflowReset,
} from "../analytics/converterEvents";

export interface ConversionSettings {
  format: ImageFormat;
  quality: number;
  width: number | null;
  rename: boolean;
  metadataPolicy: MetadataPolicy;
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
  width: number;
  height: number;
}

const getConvertedName = (
  imageFile: ImageFile,
  format: ImageFormat,
  rename: boolean,
  allFiles: ImageFile[]
) => {
  const extension = format === "jpeg" ? "jpg" : format;

  if (rename) {
    const fileIndex = allFiles.findIndex((file) => file.id === imageFile.id);
    return allFiles.length > 1
      ? `converted-${fileIndex + 1}.${extension}`
      : `converted.${extension}`;
  }

  const originalName = imageFile.file.name.replace(/\.[^/.]+$/, "");
  return `${originalName}_converted.${extension}`;
};

export const useImageConverter = () => {
  const [isConverting, setIsConverting] = useState(false);
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    trackImagesAdded(acceptedFiles);
    const newImageFiles = acceptedFiles.map((file) => ({
      file,
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
    }));
    setFiles((prevFiles) => [...prevFiles, ...newImageFiles]);
    setError(null);
    setShowToast(false);
  }, []);

  const handleConvert = useCallback(async (settings: ConversionSettings) => {
    const startedAt = performance.now();
    let conversionMode: "new_files" | "reconvert_all" = "new_files";
    try {
      setError(null);
      setIsConverting(true);
      setShowToast(false);
      setProgress(0);

      const completedFileIds = new Set(
        results.map((result) => result.originalFile.id)
      );
      const pendingFiles = files.filter((file) => !completedFileIds.has(file.id));
      const shouldReconvertAll = pendingFiles.length === 0;
      const filesToConvert = shouldReconvertAll ? files : pendingFiles;
      conversionMode = shouldReconvertAll ? "reconvert_all" : "new_files";
      trackConversionStarted(settings, filesToConvert.length, conversionMode);

      if (shouldReconvertAll) {
        setResults([]);
      } else {
        setResults((previousResults) =>
          previousResults.map((result) => ({
            ...result,
            convertedName: getConvertedName(
              result.originalFile,
              result.format,
              settings.rename,
              files
            ),
          }))
        );
      }

      const newResults: ConversionResult[] = [];
      const encodeOptions: EncodeOptions = {
        [settings.format]: { quality: settings.quality },
      };
      const { processImage } = await import("../utils/imageProcessor");
      const preserveMetadata =
        settings.metadataPolicy === "preserve"
          ? (await import("../utils/metadataPreservation"))
              .preserveSupportedMetadata
          : null;

      for (const [index, imageFile] of filesToConvert.entries()) {
        const result = await processImage(
          imageFile.file,
          settings.format,
          encodeOptions,
          settings.width
        );
        const convertedBlob = preserveMetadata
          ? await preserveMetadata(
              imageFile.file,
              result.blob,
              settings.format,
              result.width,
              result.height
            )
          : result.blob;
        const convertedName = getConvertedName(
          imageFile,
          settings.format,
          settings.rename,
          files
        );

        newResults.push({
          originalFile: imageFile,
          convertedBlob,
          convertedName,
          format: settings.format,
          originalSize: imageFile.file.size,
          convertedSize: convertedBlob.size,
          width: result.width,
          height: result.height,
        });

        setProgress(
          Math.round(((index + 1) / filesToConvert.length) * 100)
        );
      }

      setResults((previousResults) =>
        shouldReconvertAll
          ? newResults
          : [...previousResults, ...newResults]
      );
      trackConversionCompleted(
        settings,
        newResults,
        performance.now() - startedAt,
        conversionMode
      );
      setShowToast(true);
    } catch (err) {
      console.error("이미지 변환 중 오류 발생:", err);
      trackConversionFailed(settings, err);
      setError(
        err instanceof Error
          ? `변환 실패: ${err.message}`
          : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setIsConverting(false);
    }
  }, [files, results]);

  const handleDownloadAll = useCallback(() => {
    if (results.length === 0) return;

    trackConvertedImagesDownloaded(results, "all");
    results.forEach((result) => {
      downloadFile(result.convertedBlob, result.convertedName);
    });
  }, [results]);

  const handleClear = useCallback(() => {
    trackWorkflowReset(files.length, results.length);
    setFiles([]);
    setResults([]);
    setError(null);
    setShowToast(false);
    setProgress(0);
  }, [files.length, results.length]);

  const handleRemoveFile = useCallback((fileId: string) => {
    trackImageRemoved(results.some((result) => result.originalFile.id === fileId));
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    // 만약 변환 결과에서도 해당 파일이 있다면 제거
    setResults((prevResults) =>
      prevResults.filter((result) => result.originalFile.id !== fileId)
    );
  }, [results]);

  const handleRenameResults = useCallback(
    (rename: boolean) => {
      setResults((previousResults) =>
        previousResults.map((result) => ({
          ...result,
          convertedName: getConvertedName(
            result.originalFile,
            result.format,
            rename,
            files
          ),
        }))
      );
    },
    [files]
  );

  const dismissToast = useCallback(() => {
    setShowToast(false);
  }, []);

  return {
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
  };
};
