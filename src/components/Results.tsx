import React from "react";
import { ConversionResult, ImageFile } from "../hooks/useImageConverter";
import { FileCard } from "./FileCard";

interface ResultsProps {
  files: ImageFile[];
  results: ConversionResult[];
  onRemoveFile: (fileId: string) => void;
}

export const Results: React.FC<ResultsProps> = ({
  files,
  results,
  onRemoveFile,
}) => {
  // 변환 결과가 있으면 결과를 표시, 없으면 업로드된 파일들을 표시
  const hasResults = results.length > 0;

  if (files.length === 0 && results.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      {hasResults ? (
        <div className="space-y-4">
          {results.map((result, index) => (
            <FileCard
              key={`result-${index}`}
              type="result"
              imageFile={result.originalFile}
              result={result}
              onRemoveFile={onRemoveFile}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {files.map((imageFile) => (
            <FileCard
              key={imageFile.id}
              type="uploaded"
              imageFile={imageFile}
              onRemoveFile={onRemoveFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};
