import { encode as encodeJpeg, decode as decodeJpeg } from "@jsquash/jpeg";
import { encode as encodeWebp, decode as decodeWebp } from "@jsquash/webp";
import { encode as encodeAvif, decode as decodeAvif } from "@jsquash/avif";
import { encode as encodePng, decode as decodePng } from "@jsquash/png";
import resize from "@jsquash/resize";

// 지원하는 이미지 포맷 타입을 정의합니다.
export type ImageFormat = "jpeg" | "webp" | "avif" | "png";

// 지원하는 MIME 타입을 정의합니다.
type MimeType = "image/jpeg" | "image/png" | "image/webp" | "image/avif";

// 1. 포맷별 옵션 타입 정의
export type JpegEncodeOptions = { quality?: number; progressive?: boolean };
export type WebpEncodeOptions = {
  quality?: number;
  lossless?: boolean;
  method?: number;
};
export type AvifEncodeOptions = { cqLevel?: number; speed?: number };
export type PngEncodeOptions = { compressionLevel?: number };

export type EncodeOptions =
  | { format: "jpeg"; options?: JpegEncodeOptions }
  | { format: "webp"; options?: WebpEncodeOptions }
  | { format: "avif"; options?: AvifEncodeOptions }
  | { format: "png"; options?: PngEncodeOptions };

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

// 압축 모드 타입
export type CompressionMode = "fast" | "normal" | "max";

// 포맷별 압축 모드 기본값 상수
export const DEFAULT_COMPRESSION_MODE: CompressionMode = "normal";

export const WEBP_METHOD_BY_COMPRESSION: Record<CompressionMode, number> = {
  fast: 0,
  normal: 4,
  max: 6,
};

export const AVIF_SPEED_BY_COMPRESSION: Record<CompressionMode, number> = {
  fast: 10,
  normal: 6,
  max: 0,
};

export const PNG_COMPRESSION_LEVEL_BY_COMPRESSION: Record<
  CompressionMode,
  number
> = {
  fast: 1,
  normal: 6,
  max: 9,
};

export const JPEG_PROGRESSIVE_BY_COMPRESSION: Record<CompressionMode, boolean> =
  {
    fast: false,
    normal: false,
    max: true,
  };

/**
 * jSquash 라이브러리를 사용하여 이미지를 처리합니다.
 * @param file 처리할 이미지 파일
 * @param encodeOptions 인코딩 옵션
 * @param targetWidth 목표 이미지 너비
 * @returns 처리된 이미지 결과
 */
export const processImage = async (
  file: File,
  encodeOptions: EncodeOptions,
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

    const encode = encoders[encodeOptions.format] as (
      imageData: ImageData,
      options?: any
    ) => Promise<ArrayBuffer>;
    let encodedData: ArrayBuffer;
    if (encodeOptions.options) {
      encodedData = await encode(imageData, encodeOptions.options);
    } else {
      encodedData = await encode(imageData);
    }

    return {
      blob: new Blob([encodedData], { type: `image/${encodeOptions.format}` }),
      format: encodeOptions.format,
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
