import type {
  ConversionResult,
  ConversionSettings,
} from "../hooks/useImageConverter";
import { trackEvent } from "./core";

type ConversionMode = "new_files" | "reconvert_all";
type DownloadScope = "single" | "all";

const bytesToKilobytes = (bytes: number) => Math.round(bytes / 1024);

const sumBy = <T>(items: T[], getValue: (item: T) => number) =>
  items.reduce((total, item) => total + getValue(item), 0);

const getInputFormats = (files: File[]) =>
  [...new Set(files.map((file) => file.type.split("/")[1] || "unknown"))]
    .sort()
    .join(",");

const getResizeMode = (width: number | null) =>
  width === null ? "original" : "custom";

const getConversionParameters = (
  settings: ConversionSettings,
  fileCount: number,
  conversionMode: ConversionMode
) => ({
  output_format: settings.format,
  quality_value: settings.quality,
  resize_mode: getResizeMode(settings.width),
  target_width: settings.width ?? 0,
  rename_enabled: settings.rename,
  metadata_policy: settings.metadataPolicy,
  file_count: fileCount,
  conversion_mode: conversionMode,
});

export const trackImagesAdded = (files: File[]) => {
  if (files.length === 0) return;

  trackEvent("images_added", {
    file_count: files.length,
    input_formats: getInputFormats(files),
    input_total_kb: bytesToKilobytes(
      sumBy(files, (file) => file.size)
    ),
  });
};

export const trackConversionStarted = (
  settings: ConversionSettings,
  fileCount: number,
  conversionMode: ConversionMode
) => {
  trackEvent(
    "conversion_started",
    getConversionParameters(settings, fileCount, conversionMode)
  );
};

export const trackConversionCompleted = (
  settings: ConversionSettings,
  results: ConversionResult[],
  durationMs: number,
  conversionMode: ConversionMode
) => {
  const inputBytes = sumBy(results, (result) => result.originalSize);
  const outputBytes = sumBy(results, (result) => result.convertedSize);
  const savedBytes = inputBytes - outputBytes;
  const compressionPercent =
    inputBytes === 0 ? 0 : Math.round((savedBytes / inputBytes) * 1000) / 10;

  trackEvent("conversion_completed", {
    ...getConversionParameters(settings, results.length, conversionMode),
    duration_ms: Math.round(durationMs),
    input_total_kb: bytesToKilobytes(inputBytes),
    output_total_kb: bytesToKilobytes(outputBytes),
    saved_kb: bytesToKilobytes(savedBytes),
    compression_percent: compressionPercent,
  });
};

export const trackConversionFailed = (
  settings: ConversionSettings,
  error: unknown
) => {
  trackEvent("conversion_failed", {
    output_format: settings.format,
    metadata_policy: settings.metadataPolicy,
    error_type: error instanceof Error ? error.name : "UnknownError",
  });
};

export const trackConvertedImagesDownloaded = (
  results: ConversionResult[],
  downloadScope: DownloadScope
) => {
  if (results.length === 0) return;

  trackEvent("converted_images_downloaded", {
    download_scope: downloadScope,
    file_count: results.length,
    output_format: [...new Set(results.map((result) => result.format))]
      .sort()
      .join(","),
    output_total_kb: bytesToKilobytes(
      sumBy(results, (result) => result.convertedSize)
    ),
  });
};

export const trackImageRemoved = (wasConverted: boolean) => {
  trackEvent("image_removed", {
    conversion_status: wasConverted ? "converted" : "pending",
  });
};

export const trackWorkflowReset = (fileCount: number, resultCount: number) => {
  trackEvent("workflow_reset", {
    file_count: fileCount,
    converted_file_count: resultCount,
  });
};

export const trackAdvancedOptionsToggled = (isOpen: boolean) => {
  trackEvent("advanced_options_toggled", {
    state: isOpen ? "open" : "closed",
  });
};
