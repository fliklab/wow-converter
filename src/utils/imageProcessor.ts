// 이 파일은 @squoosh/lib와 craco 설정을 사용했을 때의 상태를 기록하기 위한 것입니다.
// 이 코드는 컴파일은 통과하지만, 런타임에서 "Cannot set property navigator of #<Window>" 오류를 발생시켰습니다.

import { encode as encodeJpeg, decode as decodeJpeg } from "@jsquash/jpeg";
import { encode as encodeWebp, decode as decodeWebp } from "@jsquash/webp";
import { encode as encodeAvif, decode as decodeAvif } from "@jsquash/avif";
import { encode as encodePng, decode as decodePng } from "@jsquash/png";

// 지원하는 이미지 포맷 타입을 정의합니다.
export type ImageFormat = "jpeg" | "webp" | "avif" | "png";

// 지원하는 MIME 타입을 정의합니다.
type MimeType = "image/jpeg" | "image/png" | "image/webp" | "image/avif";

// 이미지 처리 옵션을 정의합니다.
export interface ImageProcessingOptions {
  format: ImageFormat;
  quality?: number;
}

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

const decoders: Record<MimeType, (data: ArrayBuffer) => Promise<ImageData>> = {
  "image/jpeg": async (data) => {
    const imageData = await decodeJpeg(data);
    if (!imageData) throw new Error("JPEG 디코딩 실패");
    return imageData;
  },
  "image/png": async (data) => {
    const imageData = await decodePng(data);
    if (!imageData) throw new Error("PNG 디코딩 실패");
    return imageData;
  },
  "image/webp": async (data) => {
    const imageData = await decodeWebp(data);
    if (!imageData) throw new Error("WebP 디코딩 실패");
    return imageData;
  },
  "image/avif": async (data) => {
    const imageData = await decodeAvif(data);
    if (!imageData) throw new Error("AVIF 디코딩 실패");
    return imageData;
  },
};

/**
 * jSquash 라이브러리를 사용하여 이미지를 처리합니다.
 * @param file 처리할 이미지 파일
 * @param options 처리 옵션 (포맷, 품질 등)
 * @returns 처리된 이미지 결과
 */
export const processImage = async (
  file: File,
  options: ImageProcessingOptions
): Promise<ProcessingResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();

    const decoder = decoders[file.type as MimeType];
    if (!decoder) {
      throw new Error(`지원하지 않는 파일 형식입니다: ${file.type}`);
    }
    const imageData = await decoder(arrayBuffer);

    const encode = encoders[options.format];

    const encodedData = await encode(imageData);

    return {
      blob: new Blob([encodedData], { type: `image/${options.format}` }),
      format: options.format,
      size: encodedData.byteLength,
    };
  } catch (error) {
    console.error("이미지 처리 중 오류 발생:", error);
    throw new Error("이미지 처리 실패");
  }
};
