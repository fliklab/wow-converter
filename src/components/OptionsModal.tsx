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
      <h2>Select Conversion Options</h2>
      <label>
        Output Format:
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
        Quality:
        <select value={quality} onChange={(e) => setQuality(e.target.value)}>
          <option value="original">Original</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={rename}
          onChange={(e) => setRename(e.target.checked)}
        />
        Rename Files
      </label>
      <label>
        <input
          type="checkbox"
          checked={removeMetadata}
          onChange={(e) => setRemoveMetadata(e.target.checked)}
        />
        Remove Metadata
      </label>
      <button onClick={handleSubmit}>Start Conversion</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};

export default OptionsModal;
