import React from "react";
import { ConversionResult } from "../hooks/useImageConverter";
import { ResultCard } from "./ResultCard";

interface ResultsProps {
  results: ConversionResult[];
}

export const Results: React.FC<ResultsProps> = ({ results }) => {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">변환 결과</h3>
      <div className="space-y-2">
        {results.map((result, index) => (
          <ResultCard key={index} result={result} />
        ))}
      </div>
    </div>
  );
};
