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
      className="my-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      <p>
        <strong className="font-bold">변환할 수 없습니다.</strong> {error}
      </p>
    </div>
  );
};
