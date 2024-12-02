/**
 * Generates a unique file name if renaming is required.
 * @param originalName The original file name.
 * @param format The target format (e.g., "jpg", "png").
 * @param existingNames A set of existing file names.
 * @returns A new file name with timestamp.
 */
export const generateFileName = (
  originalName: string,
  format: string,
  existingNames: Set<string>
): string => {
  const baseName = originalName.split(".")[0];
  let counter = 1;
  let newName = `${baseName}.${format}`;

  while (existingNames.has(newName)) {
    newName = `${baseName}_${counter}.${format}`;
    counter++;
  }

  return newName;
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
