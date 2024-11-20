export const convertImage = async (
  file: File,
  options: {
    outputFormat: string;
    quality: string;
    rename: boolean;
    removeMetadata: boolean;
  }
): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);

        // 품질 값 설정
        let qualityValue = 1.0; // original 품질의 경우 기본값
        if (options.quality === "high") {
          qualityValue = 0.9;
        } else if (options.quality === "medium") {
          qualityValue = 0.6;
        } else if (options.quality === "low") {
          qualityValue = 0.3;
        }

        // MIME 타입 설정
        const mimeType = `image/${options.outputFormat}`;

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const fileName = options.rename
                ? `converted.${options.outputFormat}`
                : file.name.replace(/\.[^/.]+$/, `.${options.outputFormat}`);

              resolve(new File([blob], fileName, { type: mimeType }));
            }
          },
          mimeType,
          qualityValue
        );
      };
    };
    reader.readAsDataURL(file);
  });
};
