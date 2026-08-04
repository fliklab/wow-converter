import React from "react";
import { ImageConverter } from "./components/ImageConverter";

const App: React.FC = () => (
  <div className="app-shell min-h-dvh">
    <div className="ambient ambient-left" aria-hidden="true" />
    <div className="ambient ambient-right" aria-hidden="true" />
    <main className="relative mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <ImageConverter />
    </main>
  </div>
);

export default App;
