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
  if (files.length === 0 && results.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="space-y-4">
        {files.map((imageFile) => {
          const result = results.find(
            (item) => item.originalFile.id === imageFile.id
          );

          return (
            <FileCard
              key={imageFile.id}
              type={result ? "result" : "uploaded"}
              imageFile={imageFile}
              result={result}
              onRemoveFile={onRemoveFile}
            />
          );
        })}
      </div>
    </div>
  );
};
