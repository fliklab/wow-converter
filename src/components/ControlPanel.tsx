import React from "react";

interface ControlPanelProps {
  onConvert: () => void;
  onReset: () => void;
  isConverting: boolean;
  onConversionComplete: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onConvert,
  onReset,
  isConverting,
  onConversionComplete,
}) => {
  return (
    <div className="mt-6 flex justify-center gap-4">
      <button
        onClick={onConvert}
        disabled={isConverting}
        className={`px-6 py-2 rounded-lg font-semibold text-white bg-primary hover:bg-primary-hover transition-colors ${
          isConverting ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isConverting ? "변환 중..." : "변환 시작"}
      </button>
      <button
        onClick={onReset}
        disabled={isConverting}
        className="px-6 py-2 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        초기화
      </button>
    </div>
  );
};

export default ControlPanel;
