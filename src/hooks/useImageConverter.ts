import { useCallback, useState } from "react";
import { processImage, ImageFormat } from "../utils/imageProcessor";
import { downloadFile } from "../utils/file";

export interface ConversionSettings {
  format: ImageFormat;
  quality: number;
}

export interface ConversionResult {
  originalName: string;
  convertedName: string;
  format: ImageFormat;
  originalSize: number;
  convertedSize: number;
}

export const useImageConverter = () => {
  const [isConverting, setIsConverting] = useState(false);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<ConversionSettings>({
    quality: 75,
    format: "jpeg",
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        setError(null);
        setIsConverting(true);
        const newResults: ConversionResult[] = [];

        for (const file of acceptedFiles) {
          const result = await processImage(file, {
            quality: settings.quality,
            format: settings.format,
          });

          const extension = result.format;
          const convertedName = `${file.name
            .split(".")
            .slice(0, -1)
            .join(".")}_converted.${extension}`;

          downloadFile(result.blob, convertedName);

          newResults.push({
            originalName: file.name,
            convertedName,
            format: result.format,
            originalSize: file.size,
            convertedSize: result.size,
          });
        }

        setResults((prev) => [...prev, ...newResults]);
      } catch (error) {
        console.error("이미지 변환 중 오류 발생:", error);
        if (error instanceof Error) {
          setError(`변환 실패: ${error.message}`);
        } else {
          setError("알 수 없는 오류가 발생했습니다.");
        }
      } finally {
        setIsConverting(false);
      }
    },
    [settings]
  );

  return {
    isConverting,
    results,
    error,
    settings,
    setSettings,
    onDrop,
  };
};
