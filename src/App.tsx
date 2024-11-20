import React, { useState } from "react";
import Dropzone from "./components/Dropzone";
import FileCard from "./components/FileCard";
import OptionsModal from "./components/OptionsModal";
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
    setShowOptions(false);
    startConversion(updatedFiles);
  };

  const startConversion = async (filesToConvert: UploadedFile[]) => {
    const updatedFiles = await Promise.all(
      filesToConvert.map(async (file) => {
        try {
          let processedFile = file.file;

          // Remove metadata if required
          if (file.options.removeMetadata) {
            processedFile = await removeMetadata(file.file);
          }

          // Convert image
          const convertedFile = await convertImage(processedFile, file.options);

          // Extract metadata from converted file
          const convertedMetadata = await extractMetadata(convertedFile);

          // Rename if required
          const newFileName = file.options.rename
            ? generateFileName(file.file.name, file.options.outputFormat)
            : file.file.name;

          return {
            ...file,
            status: "done" as const,
            progress: 100,
            newFileName,
            convertedFile,
            convertedMetadata,
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
    <div className="app">
      <header>
        <h1>ifMage</h1>
        <p>안전하고 빠른 이미지 변환 도구</p>
        <p>파일을 서버로 보내지 않아 안전합니다</p>
      </header>
      <Dropzone onDrop={handleDrop} />
      <div className="file-list">
        {files.map((file) => (
          <FileCard key={file.id} file={file} onDownload={handleDownload} />
        ))}
      </div>
      {files.some((file) => file.status === "done") && (
        <button className="all-download" onClick={handleAllDownload}>
          모두 다운로드
        </button>
      )}
      {files.length > 0 && (
        <button className="all-download" onClick={() => setFiles([])}>
          리스트 비우기
        </button>
      )}
      {showOptions && (
        <OptionsModal
          onSubmit={handleOptionsSubmit}
          onCancel={() => setShowOptions(false)}
        />
      )}
    </div>
  );
};

export default App;
