// 지원하는 이미지 포맷 타입을 정의합니다.
export type ImageFormat = "jpeg" | "webp" | "avif" | "png";

// 지원하는 MIME 타입을 정의합니다.
type MimeType = "image/jpeg" | "image/png" | "image/webp" | "image/avif";

const SUPPORTED_MIME_TYPES = new Set<MimeType>([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

// 실용적인 인코딩 옵션 타입 정의
export type EncodeOptions = {
  jpeg?: { quality?: number };
  webp?: { quality?: number };
  avif?: { quality?: number };
  png?: { quality?: number };
};

// 이미지 처리 결과를 위한 인터페이스입니다.
export interface ProcessingResult {
  blob: Blob;
  format: ImageFormat;
  size: number;
  width: number;
  height: number;
}

// 디코더의 반환 타입 문제를 해결하기 위해, 반환값을 검사하는 Wrapper 함수를 사용합니다.
const decodeImage = async (
  type: MimeType,
  data: ArrayBuffer
): Promise<ImageData> => {
  let result: ImageData | null | undefined;

  switch (type) {
    case "image/jpeg": {
      const { decode } = await import("@jsquash/jpeg");
      result = await decode(data);
      break;
    }
    case "image/png": {
      const { decode } = await import("@jsquash/png");
      result = await decode(data);
      break;
    }
    case "image/webp": {
      const { decode } = await import("@jsquash/webp");
      result = await decode(data);
      break;
    }
    case "image/avif": {
      const { decode } = await import("@jsquash/avif");
      result = await decode(data);
      break;
    }
  }

  if (!result) {
    throw new Error(`${type} 디코딩 실패`);
  }

  return result;
};

/**
 * jSquash 라이브러리를 사용하여 이미지를 처리합니다.
 * @param file 처리할 이미지 파일
 * @param format 처리할 이미지 포맷
 * @param encodeOptions 인코딩 옵션
 * @param targetWidth 목표 이미지 너비
 * @returns 처리된 이미지 결과
 */
export const processImage = async (
  file: File,
  format: ImageFormat,
  _encodeOptions: EncodeOptions,
  targetWidth: number | null
): Promise<ProcessingResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const mimeType = file.type as MimeType;
    if (!SUPPORTED_MIME_TYPES.has(mimeType)) {
      throw new Error(`지원하지 않는 파일 형식입니다: ${file.type}`);
    }
    let imageData = await decodeImage(mimeType, arrayBuffer);

    // 이미지 리사이즈 처리
    if (targetWidth && imageData.width > targetWidth) {
      const aspectRatio = imageData.height / imageData.width;
      const targetHeight = Math.round(targetWidth * aspectRatio);
      const { default: resize } = await import("@jsquash/resize");
      imageData = await resize(imageData, {
        width: targetWidth,
        height: targetHeight,
      });
    }

    const quality = _encodeOptions[format]?.quality;
    let encodedData: ArrayBuffer;

    switch (format) {
      case "jpeg":
        encodedData = await (await import("@jsquash/jpeg")).encode(
          imageData,
          { quality }
        );
        break;
      case "webp":
        encodedData = await (await import("@jsquash/webp")).encode(
          imageData,
          { quality }
        );
        break;
      case "avif":
        encodedData = await (await import("@jsquash/avif")).encode(
          imageData,
          { quality }
        );
        break;
      case "png":
        encodedData = await (await import("@jsquash/png")).encode(imageData);
        break;
    }

    return {
      blob: new Blob([encodedData], { type: `image/${format}` }),
      format: format,
      size: encodedData.byteLength,
      width: imageData.width,
      height: imageData.height,
    };
  } catch (error) {
    console.error("이미지 처리 중 오류 발생:", error);
    throw new Error(
      `이미지 처리 실패: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};
