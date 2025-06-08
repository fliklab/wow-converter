import React from "react";
import { UserConversionSettings } from "../hooks/useImageConverter";
import { ImageFormat } from "../utils/imageProcessor";

interface SettingsPanelProps {
  settings: UserConversionSettings;
  onSettingsChange: React.Dispatch<
    React.SetStateAction<UserConversionSettings>
  >;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-4">이미지 변환 설정</h2>
      <div className="space-y-4">
        <div>
          <label className="form-label">품질 (0-100) - 현재 미적용</label>
          <input
            type="number"
            min="0"
            max="100"
            disabled
            value={settings.qualityLevel}
            onChange={(e) =>
              onSettingsChange((prev: UserConversionSettings) => ({
                ...prev,
                quality: Number(e.target.value),
              }))
            }
            className="form-input bg-gray-100"
          />
        </div>
        <div>
          <label className="form-label">출력 형식</label>
          <select
            value={settings.format}
            onChange={(e) =>
              onSettingsChange((prev: UserConversionSettings) => ({
                ...prev,
                format: e.target.value as ImageFormat,
              }))
            }
            className="form-select"
          >
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
            <option value="avif">AVIF</option>
            <option value="png">PNG</option>
          </select>
        </div>
      </div>
    </div>
  );
};
