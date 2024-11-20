import ExifReader from "exifreader";

/**
 * Extracts metadata from an image file using ExifReader.
 * @param file The file to extract metadata from.
 * @returns An object containing metadata.
 */
export const extractMetadata = async (
  file: File
): Promise<Record<string, string>> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const tags = ExifReader.load(reader.result as ArrayBuffer);
        resolve(formatMetadata(tags));
      } catch (e) {
        resolve({ error: "Failed to extract metadata" });
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Formats metadata into a key-value pair object for display.
 * @param tags The raw metadata tags.
 * @returns A formatted metadata object.
 */
const formatMetadata = (tags: Record<string, any>): Record<string, string> => {
  const metadata: Record<string, string> = {};
  for (const [key, value] of Object.entries(tags)) {
    if (value.description) {
      metadata[key] = value.description;
    }
  }
  return metadata;
};

/**
 * Removes metadata from an image by creating a new Blob without EXIF data.
 * @param file The file from which metadata should be removed.
 * @returns A new File without metadata.
 */
export const removeMetadata = async (file: File): Promise<File> => {
  const reader = new FileReader();
  return new Promise((resolve) => {
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: file.type }));
            }
          },
          file.type,
          1
        );
      };
    };
    reader.readAsDataURL(file);
  });
};
