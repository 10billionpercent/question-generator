import * as fs from "fs/promises";
import * as PdfParse from "pdf-parse-new";

export async function extractText(
  source: string | Buffer,
  mimetype: string,
  originalName: string,
): Promise<string> {
  // Determine if source is a file path or a buffer
  let buffer: Buffer;
  if (typeof source === "string") {
    buffer = await fs.readFile(source);
  } else {
    buffer = source;
  }

  if (mimetype === "application/pdf" || originalName.endsWith(".pdf")) {
    const result = await PdfParse.default(buffer);
    return result.text;
  } else if (mimetype === "text/plain" || originalName.endsWith(".txt")) {
    return buffer.toString("utf-8");
  } else {
    throw new Error("Unsupported file type");
  }
}
