import JSZip from "jszip";
import { downloadFile } from "./file";

export interface FileToZip {
  name: string;
  blob: Blob;
}

/**
 * 여러 파일들을 zip으로 압축하여 다운로드합니다.
 * @param files 압축할 파일들의 배열
 * @param zipName 생성할 zip 파일의 이름
 */
export const zipAndDownload = async (
  files: FileToZip[],
  zipName: string
): Promise<void> => {
  try {
    const zip = new JSZip();

    // 각 파일을 zip에 추가
    for (const file of files) {
      zip.file(file.name, file.blob);
    }

    // zip 파일 생성
    const zipBlob = await zip.generateAsync({ type: "blob" });

    // zip 파일 다운로드
    downloadFile(zipBlob, zipName);
  } catch (error) {
    console.error("ZIP 파일 생성 중 오류 발생:", error);
    throw new Error("ZIP 파일 생성에 실패했습니다.");
  }
};
