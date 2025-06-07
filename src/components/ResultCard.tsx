import React from "react";
import { ConversionResult } from "../hooks/useImageConverter";

interface ResultCardProps {
  result: ConversionResult;
}

const ResultDetail: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <p>
    <span className="font-medium">{label}:</span> {value}
  </p>
);

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const sizeReduction = (
    (1 - result.convertedSize / result.originalSize) *
    100
  ).toFixed(1);

  return (
    <div className="bg-gray-50 p-3 rounded-md text-sm">
      <ResultDetail label="원본" value={result.originalName} />
      <ResultDetail label="변환됨" value={result.convertedName} />
      <ResultDetail
        label="크기"
        value={`${(result.originalSize / 1024).toFixed(1)}KB → ${(
          result.convertedSize / 1024
        ).toFixed(1)}KB`}
      />
      <ResultDetail label="압축률" value={`${sizeReduction}%`} />
    </div>
  );
};
