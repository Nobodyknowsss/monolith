import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
] as const;

export type SupportedMimeType = (typeof SUPPORTED_MIME_TYPES)[number];

export function isSupportedMimeType(t: string): t is SupportedMimeType {
  return (SUPPORTED_MIME_TYPES as readonly string[]).includes(t);
}

export async function parseFile(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  switch (mimeType) {
    case "application/pdf": {
      // pdf-parse v2 transfers the TypedArray to a worker, so we hand it the
      // buffer and never read it again here.
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      try {
        const result = await parser.getText();
        return result.text;
      } finally {
        await parser.destroy();
      }
    }
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    case "text/plain": {
      return buffer.toString("utf-8");
    }
    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
}
