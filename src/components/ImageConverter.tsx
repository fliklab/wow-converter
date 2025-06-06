import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  processImage,
  ImageProcessingOptions,
  ImageFormat,
} from "../utils/imageProcessor";

interface ConversionSettings {
  format: ImageFormat;
  quality: number;
}

interface ConversionResult {
  originalName: string;
  convertedName: string;
  format: ImageFormat;
  originalSize: number;
  convertedSize: number;
}

export const ImageConverter: React.FC = () => {
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

          newResults.push({
            originalName: file.name,
            convertedName,
            format: result.format,
            originalSize: file.size,
            convertedSize: result.size,
          });

          // 다운로드
          const url = URL.createObjectURL(result.blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = convertedName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp", ".avif"],
    },
  });

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">이미지 변환 설정</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              품질 (0-100) - 현재 미적용
            </label>
            <input
              type="number"
              min="0"
              max="100"
              disabled
              value={settings.quality}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  quality: Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border rounded-md bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">출력 형식</label>
            <select
              value={settings.format}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  format: e.target.value as ImageFormat,
                }))
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
              <option value="avif">AVIF</option>
              <option value="png">PNG</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div
          className="my-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md"
          role="alert"
        >
          <p>
            <strong className="font-bold">오류:</strong> {error}
          </p>
        </div>
      )}

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
      >
        <input {...getInputProps()} />
        {isConverting ? (
          <p className="text-gray-600">변환 중...</p>
        ) : isDragActive ? (
          <p className="text-blue-500">파일을 여기에 놓으세요</p>
        ) : (
          <p className="text-gray-500">
            이미지를 드래그 앤 드롭하거나 클릭하여 선택하세요
          </p>
        )}
      </div>

      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">변환 결과</h3>
          <div className="space-y-2">
            {results.map((result, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-md text-sm">
                <p>
                  <span className="font-medium">원본:</span>{" "}
                  {result.originalName}
                </p>
                <p>
                  <span className="font-medium">변환됨:</span>{" "}
                  {result.convertedName}
                </p>
                <p>
                  <span className="font-medium">크기:</span>{" "}
                  {(result.originalSize / 1024).toFixed(1)}KB →{" "}
                  {(result.convertedSize / 1024).toFixed(1)}KB
                </p>
                <p>
                  <span className="font-medium">압축률:</span>{" "}
                  {(
                    (1 - result.convertedSize / result.originalSize) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
