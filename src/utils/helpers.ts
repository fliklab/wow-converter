/**
 * Generates a unique file name if renaming is required.
 * @param originalName The original file name.
 * @param format The target format (e.g., "jpg", "png").
 * @returns A new file name with timestamp.
 */
export const generateFileName = (
  originalName: string,
  format: string
): string => {
  const baseName = originalName.split(".")[0];
  const timestamp = Date.now();
  return `${baseName}_${timestamp}.${format}`;
};

/**
 * Creates a download link for a given file.
 * @param file The file to download.
 */
export const downloadFile = (file: File) => {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
