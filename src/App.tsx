import React, { useState } from "react";
import Dropzone from "./components/Dropzone";
import FileCard from "./components/FileCard";
import ControlPanel from "./components/ControlPanel";
import Header from "./components/Header";
import { generateFileName, downloadFile } from "./utils/helpers";
import { extractMetadata, removeMetadata } from "./utils/metadata";
import { convertImage } from "./utils/fileConversion";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import "./App.css";

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "converting" | "done" | "error";
  progress: number;
  options: {
    outputFormat: string;
    quality: string;
    rename: boolean;
    removeMetadata: boolean;
  };
  metadata: Record<string, string>;
  newFileName: string;
  convertedFile?: File;
  convertedMetadata?: Record<string, string>;
}

const App: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [showOptions, setShowOptions] = useState(false);

  const hasConvertedFiles = files.some((file) => file.status === "done");
  const isConverting = files.some((file) => file.status === "converting");

  const handleDrop = async (uploadedFiles: File[]) => {
    const processedFiles = await Promise.all(
      uploadedFiles.map(async (file) => {
        const metadata = await extractMetadata(file);
        return {
          id: `${file.name}-${Date.now()}`,
          file,
          preview: URL.createObjectURL(file),
          status: "pending" as const,
          progress: 0,
          metadata,
          options: {
            outputFormat: file.type.split("/")[1],
            quality: "original",
            rename: false,
            removeMetadata: false,
          },
          newFileName: file.name,
        };
      })
    );
    setFiles((prevFiles) => [...prevFiles, ...processedFiles]);
    setShowOptions(true);
  };

  const handleOptionsSubmit = (options: Partial<UploadedFile["options"]>) => {
    const updatedFiles = files.map((file) => ({
      ...file,
      options: { ...file.options, ...options },
    }));
    setFiles(updatedFiles);
    startConversion(updatedFiles);
  };

  const startConversion = async (filesToConvert: UploadedFile[]) => {
    const updatedFiles = await Promise.all(
      filesToConvert.map(async (file) => {
        try {
          let inputFile = file.file;

          // Remove metadata if required
          if (file.options.removeMetadata) {
            inputFile = await removeMetadata(file.file);
            // 메타데이터가 제거된 파일의 메타데이터를 다시 추출
            const cleanMetadata = await extractMetadata(inputFile);
            file.metadata = cleanMetadata; // 원본 메타데이터 업데이트
          }

          // Convert image
          const outputFile = await convertImage(inputFile, file.options);

          // Extract metadata from converted file
          const outputMetadata = await extractMetadata(outputFile);

          // Get existing file names
          const existingNames = new Set(files.map((f) => f.newFileName));

          // Rename if required
          const newFileName = file.options.rename
            ? generateFileName(
                file.file.name,
                file.options.outputFormat,
                existingNames
              )
            : file.file.name;

          return {
            ...file,
            status: "done" as const,
            progress: 100,
            newFileName,
            convertedFile: outputFile,
            convertedMetadata: outputMetadata,
          };
        } catch {
          return { ...file, status: "error" as const };
        }
      })
    );
    setFiles(updatedFiles);
  };

  const handleDownload = (file: UploadedFile) => {
    if (file.convertedFile) {
      downloadFile(file.convertedFile);
    }
  };

  const handleAllDownload = () => {
    files
      .filter((file) => file.status === "done" && file.convertedFile)
      .forEach((file) => downloadFile(file.convertedFile!));
  };

  const renderUploadSection = () => {
    if (hasConvertedFiles) {
      return (
        <div className="max-w-[768px] mx-auto bg-green-50 dark:bg-green-900/20 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <CheckCircleIcon className="w-12 h-12 text-green-500 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
            파일 변환이 완료되었습니다!
          </h2>
          <p className="text-green-600 dark:text-green-300">
            각 파일의 다운로드 버튼을 누르거나, 하단의 '모두 다운로드' 버튼을
            눌러 변환된 파일을 저장하세요.
          </p>
        </div>
      );
    }

    return <Dropzone onDrop={handleDrop} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="pt-[60px] px-4 pb-16">
        <div className="py-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            WOW Converter
          </h1>
          <div className="max-w-2xl mx-auto">
            <p className="text-xl text-gray-700 dark:text-gray-200 mb-2">
              웹사이트에 최적화된 이미지 변환을 위한 온라인 도구
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              파일을 서버로 보내지 않아 안전합니다
            </p>
          </div>
        </div>

        {renderUploadSection()}

        <div className="space-y-4 mt-6">
          {files.map((file) => (
            <FileCard key={file.id} file={file} onDownload={handleDownload} />
          ))}
        </div>

        {showOptions && (
          <ControlPanel
            onSubmit={handleOptionsSubmit}
            onDownloadAll={handleAllDownload}
            onClearList={() => {
              setFiles([]);
              setShowOptions(false);
            }}
            isConverting={isConverting}
            hasConvertedFiles={hasConvertedFiles}
            progress={
              files.reduce(
                (acc, file) =>
                  acc + (file.status === "converting" ? file.progress : 0),
                0
              ) / files.length
            }
          />
        )}
      </main>
    </div>
  );
};

export default App;
