import { encode as encodeJpeg, decode as decodeJpeg } from "@jsquash/jpeg";
import { encode as encodeWebp, decode as decodeWebp } from "@jsquash/webp";
import { encode as encodeAvif, decode as decodeAvif } from "@jsquash/avif";
import { encode as encodePng, decode as decodePng } from "@jsquash/png";
import resize from "@jsquash/resize";

// 지원하는 이미지 포맷 타입을 정의합니다.
export type ImageFormat = "jpeg" | "webp" | "avif" | "png";

// 지원하는 MIME 타입을 정의합니다.
type MimeType = "image/jpeg" | "image/png" | "image/webp" | "image/avif";

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
}

// 각 포맷에 맞는 인코더/디코더 함수를 매핑합니다.
const encoders = {
  jpeg: encodeJpeg,
  webp: encodeWebp,
  avif: encodeAvif,
  png: encodePng,
};

// 디코더의 반환 타입 문제를 해결하기 위해, 반환값을 검사하는 Wrapper 함수를 사용합니다.
const decoders: Record<MimeType, (data: ArrayBuffer) => Promise<ImageData>> = {
  "image/jpeg": async (data) => {
    const result = await decodeJpeg(data);
    if (!result) throw new Error("JPEG 디코딩 실패");
    return result;
  },
  "image/png": async (data) => {
    const result = await decodePng(data);
    if (!result) throw new Error("PNG 디코딩 실패");
    return result;
  },
  "image/webp": async (data) => {
    const result = await decodeWebp(data);
    if (!result) throw new Error("WebP 디코딩 실패");
    return result;
  },
  "image/avif": async (data) => {
    const result = await decodeAvif(data);
    if (!result) throw new Error("AVIF 디코딩 실패");
    return result;
  },
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
    const decoder = decoders[file.type as MimeType];
    if (!decoder) {
      throw new Error(`지원하지 않는 파일 형식입니다: ${file.type}`);
    }
    let imageData = await decoder(arrayBuffer);

    // 이미지 리사이즈 처리
    if (targetWidth && imageData.width > targetWidth) {
      const aspectRatio = imageData.height / imageData.width;
      const targetHeight = Math.round(targetWidth * aspectRatio);
      imageData = await resize(imageData, {
        width: targetWidth,
        height: targetHeight,
      });
    }

    const encode = encoders[format];

    // 인코더에 옵션을 전달하지 않고 기본 인코딩 사용
    // TODO: 품질 옵션은 추후 각 라이브러리의 정확한 API 확인 후 구현
    const encodedData = await encode(imageData);

    return {
      blob: new Blob([encodedData], { type: `image/${format}` }),
      format: format,
      size: encodedData.byteLength,
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
