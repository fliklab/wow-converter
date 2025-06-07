import React from "react";
import { ImageConverter } from "./components/ImageConverter";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          웹 기반 이미지 변환기
        </h1>
        <ImageConverter />
      </div>
    </div>
  );
};

export default App;
