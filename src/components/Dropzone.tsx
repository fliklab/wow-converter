import React from "react";

interface DropzoneProps {
  onDrop: (files: File[]) => void;
}

const Dropzone: React.FC<DropzoneProps> = ({ onDrop }) => {
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    onDrop(files);
  };

  return (
    <div
      className="dropzone"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <p>Drag and drop your images here</p>
    </div>
  );
};

export default Dropzone;
