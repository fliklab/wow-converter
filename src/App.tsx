import React from "react";
import { ImageConverter } from "./components/ImageConverter";

const App: React.FC = () => {
  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <ImageConverter />
      </main>
    </div>
  );
};

export default App;
