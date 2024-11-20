import React, { useState } from "react";
import "./OptionsModal.css";

interface OptionsModalProps {
  onSubmit: (options: {
    outputFormat: string;
    quality: string;
    rename: boolean;
    removeMetadata: boolean;
  }) => void;
  onCancel: () => void;
}

const OptionsModal: React.FC<OptionsModalProps> = ({ onSubmit, onCancel }) => {
  const [outputFormat, setOutputFormat] = useState("jpg");
  const [quality, setQuality] = useState("original");
  const [rename, setRename] = useState(false);
  const [removeMetadata, setRemoveMetadata] = useState(false);

  const handleSubmit = () => {
    onSubmit({ outputFormat, quality, rename, removeMetadata });
  };

  return (
    <div className="modal">
      <h2>변환 옵션 선택</h2>
      <label>
        출력 형식:
        <select
          value={outputFormat}
          onChange={(e) => setOutputFormat(e.target.value)}
        >
          <option value="jpg">JPG</option>
          <option value="png">PNG</option>
          <option value="webp">WebP</option>
        </select>
      </label>
      <label>
        품질:
        <select value={quality} onChange={(e) => setQuality(e.target.value)}>
          <option value="original">원본 그대로</option>
          <option value="high">높은 품질</option>
          <option value="medium">중간 품질</option>
          <option value="low">낮은 품질</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={rename}
          onChange={(e) => setRename(e.target.checked)}
        />
        파일 이름 초기화
      </label>
      <label>
        <input
          type="checkbox"
          checked={removeMetadata}
          onChange={(e) => setRemoveMetadata(e.target.checked)}
        />
        메타데이터 제거
      </label>
      <button onClick={handleSubmit}>변환 시작</button>
      <button onClick={onCancel}>취소</button>
    </div>
  );
};

export default OptionsModal;
