import React from "react";
import { useImageConverter } from "../hooks/useImageConverter";
import { SettingsPanel } from "./SettingsPanel";
import { Dropzone } from "./Dropzone";
import { Results } from "./Results";
import { ErrorDisplay } from "./ErrorDisplay";

export const ImageConverter: React.FC = () => {
  const { isConverting, results, error, settings, setSettings, onDrop } =
    useImageConverter();

  return (
    <div className="max-w-xl mx-auto p-6">
      <SettingsPanel settings={settings} onSettingsChange={setSettings} />
      <ErrorDisplay error={error} />
      <Dropzone onDrop={onDrop} isConverting={isConverting} />
      <Results results={results} />
    </div>
  );
};
