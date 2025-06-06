// 이 파일은 @squoosh/lib와 craco 설정을 사용했을 때의 상태를 기록하기 위한 것입니다.
// 이 코드는 컴파일은 통과하지만, 런타임에서 "Cannot set property navigator of #<Window>" 오류를 발생시켰습니다.

import { ImagePool } from "@squoosh/lib";
import { cpus } from "os"; // 이 부분 때문에 craco 폴리필 설정이 필요했습니다.

export type ImageFormat = "jpeg" | "webp" | "avif";

export interface ImageProcessingOptions {
  format: ImageFormat;
  quality?: number;
}

// ImagePool을 사용하여 이미지 처리를 관리합니다.
// Squoosh/lib는 시스템의 CPU 코어 수를 기반으로 병렬 처리를 시도합니다.
const imagePool = new ImagePool(cpus().length);

/**
 * @squoosh/lib를 사용하여 이미지를 처리하는 함수.
 * @param file 처리할 이미지 파일
 * @param options 처리 옵션 (포맷, 품질 등)
 * @returns 처리된 이미지 결과
 */
export const processImageWithSquooshLib = async (
  file: File,
  options: ImageProcessingOptions
) => {
  try {
    const image = imagePool.ingestImage(await file.arrayBuffer());

    // @squoosh/lib는 'jpeg' 대신 'mozjpeg'를 키로 사용합니다.
    const encoderKey = options.format === "jpeg" ? "mozjpeg" : options.format;

    // 인코딩 옵션을 설정합니다.
    const encodeOptions = {
      [encoderKey]: {
        quality: options.quality,
      },
    };

    // 이미지 전처리 및 인코딩을 수행합니다.
    await image.encode(encodeOptions);

    const encodedImage = image.encodedWith[encoderKey];
    if (!encodedImage) {
      throw new Error(`${encoderKey}로 인코딩된 이미지를 찾을 수 없습니다.`);
    }

    // @squoosh/lib의 EncodeResult 타입에는 `type` 속성이 없습니다.
    // 당시 상황을 재현하기 위해 `image/` 접두사를 붙여 MIME 타입을 직접 만듭니다.
    return {
      blob: new Blob([encodedImage.binary], {
        type: `image/${options.format}`,
      }),
      format: options.format,
      size: encodedImage.size,
    };
  } catch (error) {
    console.error("@squoosh/lib 처리 중 오류 발생:", error);
    throw new Error("@squoosh/lib를 사용한 이미지 처리 실패");
  }
};
