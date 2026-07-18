import type { ImageFormat } from "./imageProcessor";

export type MetadataPolicy = "remove" | "preserve";

const EXIF_HEADER = new Uint8Array([0x45, 0x78, 0x69, 0x66, 0x00, 0x00]);
const PNG_SIGNATURE = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

const matches = (bytes: Uint8Array, offset: number, expected: Uint8Array) =>
  expected.every((value, index) => bytes[offset + index] === value);

const ascii = (bytes: Uint8Array, offset: number, length: number) =>
  String.fromCharCode(...bytes.subarray(offset, offset + length));

const extractJpegExif = (bytes: Uint8Array): Uint8Array | null => {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;

  let offset = 2;
  while (offset + 4 <= bytes.length && bytes[offset] === 0xff) {
    const marker = bytes[offset + 1];
    if (marker === 0xda || marker === 0xd9) break;

    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (length < 2 || offset + 2 + length > bytes.length) break;

    const payloadOffset = offset + 4;
    if (marker === 0xe1 && matches(bytes, payloadOffset, EXIF_HEADER)) {
      return bytes.slice(payloadOffset + EXIF_HEADER.length, offset + 2 + length);
    }
    offset += 2 + length;
  }

  return null;
};

const extractPngExif = (bytes: Uint8Array): Uint8Array | null => {
  if (!matches(bytes, 0, PNG_SIGNATURE)) return null;

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = PNG_SIGNATURE.length;
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset);
    const type = ascii(bytes, offset + 4, 4);
    const dataStart = offset + 8;
    const nextOffset = dataStart + length + 4;
    if (nextOffset > bytes.length) break;
    if (type === "eXIf") return bytes.slice(dataStart, dataStart + length);
    if (type === "IEND") break;
    offset = nextOffset;
  }

  return null;
};

const extractWebpExif = (bytes: Uint8Array): Uint8Array | null => {
  if (ascii(bytes, 0, 4) !== "RIFF" || ascii(bytes, 8, 4) !== "WEBP") {
    return null;
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const type = ascii(bytes, offset, 4);
    const length = view.getUint32(offset + 4, true);
    const dataStart = offset + 8;
    if (dataStart + length > bytes.length) break;
    if (type === "EXIF") {
      const data = bytes.slice(dataStart, dataStart + length);
      return matches(data, 0, EXIF_HEADER)
        ? data.slice(EXIF_HEADER.length)
        : data;
    }
    offset = dataStart + length + (length % 2);
  }

  return null;
};

const extractExif = (bytes: Uint8Array, mimeType: string) => {
  if (mimeType === "image/jpeg") return extractJpegExif(bytes);
  if (mimeType === "image/png") return extractPngExif(bytes);
  if (mimeType === "image/webp") return extractWebpExif(bytes);
  return null;
};

const attachJpegExif = (bytes: Uint8Array, tiffData: Uint8Array) => {
  const payloadLength = EXIF_HEADER.length + tiffData.length;
  const markerLength = payloadLength + 2;
  if (markerLength > 0xffff || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return bytes;
  }

  const result = new Uint8Array(bytes.length + payloadLength + 4);
  result.set(bytes.subarray(0, 2), 0);
  result.set([0xff, 0xe1, markerLength >> 8, markerLength & 0xff], 2);
  result.set(EXIF_HEADER, 6);
  result.set(tiffData, 6 + EXIF_HEADER.length);
  result.set(bytes.subarray(2), 6 + payloadLength);
  return result;
};

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let value = 0; value < 256; value += 1) {
    let crc = value;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
    table[value] = crc >>> 0;
  }
  return table;
})();

const crc32 = (bytes: Uint8Array) => {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};

const createPngChunk = (type: string, data: Uint8Array) => {
  const result = new Uint8Array(data.length + 12);
  const view = new DataView(result.buffer);
  view.setUint32(0, data.length);
  const typeBytes = new TextEncoder().encode(type);
  result.set(typeBytes, 4);
  result.set(data, 8);
  view.setUint32(8 + data.length, crc32(result.subarray(4, 8 + data.length)));
  return result;
};

const attachPngExif = (bytes: Uint8Array, tiffData: Uint8Array) => {
  if (!matches(bytes, 0, PNG_SIGNATURE) || bytes.length < 33) return bytes;
  const ihdrEnd = 33;
  const chunk = createPngChunk("eXIf", tiffData);
  const result = new Uint8Array(bytes.length + chunk.length);
  result.set(bytes.subarray(0, ihdrEnd));
  result.set(chunk, ihdrEnd);
  result.set(bytes.subarray(ihdrEnd), ihdrEnd + chunk.length);
  return result;
};

const createWebpChunk = (type: string, data: Uint8Array) => {
  const result = new Uint8Array(8 + data.length + (data.length % 2));
  result.set(new TextEncoder().encode(type), 0);
  new DataView(result.buffer).setUint32(4, data.length, true);
  result.set(data, 8);
  return result;
};

const writeUint24 = (bytes: Uint8Array, offset: number, value: number) => {
  bytes[offset] = value & 0xff;
  bytes[offset + 1] = (value >> 8) & 0xff;
  bytes[offset + 2] = (value >> 16) & 0xff;
};

const attachWebpExif = (
  bytes: Uint8Array,
  tiffData: Uint8Array,
  width: number,
  height: number
) => {
  if (ascii(bytes, 0, 4) !== "RIFF" || ascii(bytes, 8, 4) !== "WEBP") {
    return bytes;
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const chunks: Uint8Array[] = [];
  let extendedHeader: Uint8Array | null = null;
  let hasAlphaChunk = false;
  let offset = 12;

  while (offset + 8 <= bytes.length) {
    const type = ascii(bytes, offset, 4);
    const length = view.getUint32(offset + 4, true);
    const chunkLength = 8 + length + (length % 2);
    if (offset + chunkLength > bytes.length) break;

    if (type === "VP8X") {
      extendedHeader = bytes.slice(offset, offset + chunkLength);
    } else if (type !== "EXIF") {
      const chunk = bytes.slice(offset, offset + chunkLength);
      chunks.push(chunk);
      if (type === "ALPH") hasAlphaChunk = true;
    }
    offset += chunkLength;
  }

  if (extendedHeader) {
    extendedHeader[8] |= 0x08;
  } else {
    const payload = new Uint8Array(10);
    payload[0] = 0x08 | (hasAlphaChunk ? 0x10 : 0);
    writeUint24(payload, 4, Math.max(0, width - 1));
    writeUint24(payload, 7, Math.max(0, height - 1));
    extendedHeader = createWebpChunk("VP8X", payload);
  }

  const exifChunk = createWebpChunk("EXIF", tiffData);
  const bodyLength = 4 + extendedHeader.length +
    chunks.reduce((total, chunk) => total + chunk.length, 0) + exifChunk.length;
  const result = new Uint8Array(8 + bodyLength);
  result.set(new TextEncoder().encode("RIFF"), 0);
  new DataView(result.buffer).setUint32(4, bodyLength, true);
  result.set(new TextEncoder().encode("WEBP"), 8);
  let resultOffset = 12;
  result.set(extendedHeader, resultOffset);
  resultOffset += extendedHeader.length;
  for (const chunk of chunks) {
    result.set(chunk, resultOffset);
    resultOffset += chunk.length;
  }
  result.set(exifChunk, resultOffset);
  return result;
};

export const preserveSupportedMetadata = async (
  source: File,
  converted: Blob,
  format: ImageFormat,
  width: number,
  height: number
): Promise<Blob> => {
  const sourceBytes = new Uint8Array(await source.arrayBuffer());
  const tiffData = extractExif(sourceBytes, source.type);
  if (!tiffData || format === "avif") return converted;

  const convertedBytes = new Uint8Array(await converted.arrayBuffer());
  let bytes = convertedBytes;
  if (format === "jpeg") bytes = attachJpegExif(convertedBytes, tiffData);
  if (format === "png") bytes = attachPngExif(convertedBytes, tiffData);
  if (format === "webp") {
    bytes = attachWebpExif(convertedBytes, tiffData, width, height);
  }

  return new Blob([bytes], { type: converted.type });
};
