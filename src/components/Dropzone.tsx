import React from "react";
import { ArrowUpTrayIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { useDropzone, type DropzoneOptions } from "react-dropzone";

interface DropzoneProps {
  onDrop: (files: File[]) => void;
  isConverting: boolean;
  compact?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onDrop, isConverting, compact = false }) => {
  const dropzoneOptions: DropzoneOptions = {
    onDrop,
    disabled: isConverting,
    multiple: true,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/avif": [".avif"],
    },
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone(dropzoneOptions);
  const stateClasses = isDragReject
    ? "border-red-300 bg-red-50"
    : isDragActive
      ? "border-primary bg-violet-50 shadow-[inset_0_0_0_1px_rgba(109,93,252,0.12)]"
      : "border-violet-200/80 bg-gradient-to-br from-violet-50/80 via-white to-cyan-50/70 hover:border-primary/60 hover:bg-violet-50/70";

  return (
    <div
      {...getRootProps()}
      className={`group cursor-pointer rounded-[22px] border-2 border-dashed text-center transition duration-200 ${compact ? "px-4 py-3" : "px-5 py-10 sm:py-14"} ${stateClasses} ${isConverting ? "cursor-not-allowed opacity-55" : ""}`}
    >
      <input {...getInputProps({ "aria-label": "변환할 이미지 파일 선택" })} />
      <div className={`flex items-center justify-center ${compact ? "gap-3" : "flex-col"}`}>
        <div className={`flex shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-[0_10px_25px_rgba(109,93,252,0.14)] transition group-hover:-translate-y-0.5 ${compact ? "h-11 w-11" : "mb-5 h-16 w-16"}`}>
          {compact ? <PhotoIcon className="h-6 w-6" aria-hidden="true" /> : <ArrowUpTrayIcon className="h-7 w-7" aria-hidden="true" />}
        </div>
        <div className={compact ? "min-w-0 text-left" : ""}>
          <p className={`${compact ? "text-sm" : "text-lg"} font-bold text-slate-800`}>
            {isConverting ? "변환 중에는 파일을 추가할 수 없어요" : isDragReject ? "지원하지 않는 파일이에요" : isDragActive ? "여기에 놓아주세요" : compact ? "이미지 더 추가하기" : "이미지를 여기에 놓아주세요"}
          </p>
          <p className={`${compact ? "mt-0.5 text-xs" : "mt-2 text-sm"} text-slate-500`}>
            {compact ? "드래그하거나 눌러서 선택" : "또는 눌러서 여러 파일을 선택하세요"}
          </p>
        </div>
        {!compact ? (
          <div className="mt-5 flex flex-wrap justify-center gap-2" aria-label="지원 형식">
            {["JPG", "PNG", "WebP", "AVIF"].map((format) => <span key={format} className="rounded-full border border-white bg-white/80 px-2.5 py-1 text-[11px] font-bold text-slate-500 shadow-sm">{format}</span>)}
          </div>
        ) : null}
      </div>
    </div>
  );
};
