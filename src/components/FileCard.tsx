import React from "react";
import ProgressBar from "./ProgressBar";
import styles from "./FileCard.module.css";

interface FileCardProps {
  file: {
    id: string;
    preview: string;
    status: "pending" | "converting" | "done" | "error";
    progress: number;
    metadata: Record<string, string>;
    newFileName: string;
    convertedFile?: File;
    convertedMetadata?: Record<string, string>;
  };
  onDownload: (file: any) => void;
}

const FileCard: React.FC<FileCardProps> = ({ file, onDownload }) => {
  return (
    <div className="file-card">
      <img src={file.preview} alt={file.newFileName} className="file-preview" />
      <div className="file-details">
        <h3 className="file-name">{file.newFileName}</h3>
        <p className="file-status">Status: {file.status}</p>
        <ProgressBar progress={file.progress} />

        <div className="file-metadata">
          <div className="metadata-section">
            <h4>Input File Metadata</h4>
            {Object.entries(file.metadata).map(([key, value]) => (
              <div key={key} className="metadata-item">
                <strong>{key}</strong>
                <span>{value}</span>
              </div>
            ))}
          </div>

          {file.convertedMetadata && file.status === "done" && (
            <div className="metadata-section">
              <h4>Output File Metadata</h4>
              {Object.entries(file.convertedMetadata).map(([key, value]) => (
                <div key={key} className="metadata-item">
                  <strong>{key}</strong>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="file-name">{file.convertedFile?.name}</p>
        {file.status === "done" && (
          <button
            className={styles["download-button"]}
            onClick={() => onDownload(file)}
          >
            Download
          </button>
        )}
      </div>
    </div>
  );
};

export default FileCard;
