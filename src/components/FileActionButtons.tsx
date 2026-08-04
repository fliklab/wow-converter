import React from "react";
import {
  ArrowDownTrayIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface FileActionButtonsProps {
  fileName: string;
  downloadName?: string;
  onDelete: () => void;
  onDownload?: () => void;
}

const baseButtonClass =
  "flex min-h-11 min-w-11 items-center justify-center rounded-xl border bg-white shadow-sm transition duration-200 active:scale-95";

export const FileActionButtons: React.FC<FileActionButtonsProps> = ({
  fileName,
  downloadName,
  onDelete,
  onDownload,
}) => (
  <div className="flex items-center gap-1.5" aria-label="파일 작업">
    {onDownload && downloadName ? (
      <button
        type="button"
        onClick={onDownload}
        className={`${baseButtonClass} border-violet-100 text-primary hover:border-violet-200 hover:bg-violet-50 hover:shadow-md`}
        title="다운로드"
        aria-label={`${downloadName} 다운로드`}
      >
        <ArrowDownTrayIcon className="h-5 w-5" aria-hidden="true" />
      </button>
    ) : null}

    <button
      type="button"
      onClick={onDelete}
      className={`${baseButtonClass} border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow-md`}
      title="파일 삭제"
      aria-label={`${fileName} 삭제`}
    >
      <TrashIcon className="h-5 w-5" aria-hidden="true" />
    </button>
  </div>
);
