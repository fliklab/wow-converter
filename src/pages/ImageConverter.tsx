import React, { useState } from "react";
import Dropzone from "../components/Dropzone";
import FileCard from "../components/FileCard";
import ControlPanel from "../components/ControlPanel";
import { FileInfo } from "../types/files";

const ImageConverter: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleDrop = (droppedFiles: File[]) => {
    const newFiles: FileInfo[] = droppedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substring(7),
      status: "waiting",
      preview: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleConversionComplete = () => {
    setIsComplete(true);
    setIsConverting(false);
  };

  const handleDownload = (file: FileInfo) => {
    if (file.convertedUrl) {
      const link = document.createElement("a");
      link.href = file.convertedUrl;
      link.download = `converted-${file.file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {!isComplete && <Dropzone onDrop={handleDrop} />}
      {isComplete && (
        <div className="max-w-[768px] mx-auto mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            변환이 완료되었습니다!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            아래에서 변환된 파일들을 다운로드할 수 있습니다.
          </p>
        </div>
      )}
      {files.length > 0 && (
        <div className="max-w-[768px] mx-auto">
          <div className="space-y-4">
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onDownload={() => handleDownload(file)}
              />
            ))}
          </div>
          <ControlPanel
            onConvert={() => setIsConverting(true)}
            onReset={() => {
              setFiles([]);
              setIsComplete(false);
              setIsConverting(false);
            }}
            isConverting={isConverting}
            onConversionComplete={handleConversionComplete}
          />
        </div>
      )}
    </div>
  );
};

export default ImageConverter;
