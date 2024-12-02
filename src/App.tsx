import React, { useState } from "react";
import Dropzone from "./components/Dropzone";
import FileCard from "./components/FileCard";
import ControlPanel from "./components/ControlPanel";
import Header from "./components/Header";
import { generateFileName, downloadFile } from "./utils/helpers";
import { extractMetadata, removeMetadata } from "./utils/metadata";
import { convertImage } from "./utils/fileConversion";
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="pt-[60px] pb-[200px]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="py-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              WOW Converter
            </h1>
            <div className="max-w-2xl mx-auto">
              <p className="text-xl text-gray-700 dark:text-gray-200 mb-2">
                웹사이트에 최적화된 이미지 변환을 위한 온라인 도구
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                파일을 서버로 보내지 않아 안전합니다.
              </p>
            </div>
          </div>

          <Dropzone onDrop={handleDrop} />

          <div className="space-y-4 mt-6">
            {files.map((file) => (
              <FileCard key={file.id} file={file} onDownload={handleDownload} />
            ))}
          </div>
        </div>
      </main>

      {showOptions && (
        <ControlPanel
          onSubmit={handleOptionsSubmit}
          onDownloadAll={handleAllDownload}
          onClearList={() => setFiles([])}
          isConverting={files.some((file) => file.status === "converting")}
          progress={
            files.reduce(
              (acc, file) =>
                acc + (file.status === "converting" ? file.progress : 0),
              0
            ) / files.length
          }
        />
      )}
    </div>
  );
};

export default App;
