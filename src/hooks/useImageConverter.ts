import { useCallback, useState } from "react";
import {
  processImage,
  ImageFormat,
  EncodeOptions,
} from "../utils/imageProcessor";
import { downloadFile } from "../utils/file";

export interface ConversionSettings {
  format: ImageFormat;
  quality: number;
  width: number | null;
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
  const [settings, setSettings] = useState<ConversionSettings>({
    format: "jpeg",
    quality: 75,
    width: null,
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImageFiles = acceptedFiles.map((file) => ({
      file,
      id: `${file.name}-${file.lastModified}`,
    }));
    setFiles((prevFiles) => [...prevFiles, ...newImageFiles]);
  }, []);

  const handleConvert = useCallback(async () => {
    try {
      setError(null);
      setIsConverting(true);

      const newResults: ConversionResult[] = [];
      const encodeOptions: EncodeOptions = {
        [settings.format]: { quality: settings.quality },
      };

      for (const imageFile of files) {
        const result = await processImage(
          imageFile.file,
          settings.format,
          encodeOptions,
          settings.width
        );
        const extension = settings.format;
        const convertedName = `${imageFile.file.name
          .split(".")
          .slice(0, -1)
          .join(".")}_converted.${extension}`;

        newResults.push({
          originalFile: imageFile,
          convertedBlob: result.blob,
          convertedName,
          format: settings.format,
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
