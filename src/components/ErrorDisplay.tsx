import React from "react";

interface ErrorDisplayProps {
  error: string | null;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) {
    return null;
  }

  return (
    <div
      className="my-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md"
      role="alert"
    >
      <p>
        <strong className="font-bold">오류:</strong> {error}
      </p>
    </div>
  );
};
