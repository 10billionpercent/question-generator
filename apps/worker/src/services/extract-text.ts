import * as fs from "fs/promises";
import * as PdfParse from "pdf-parse-new";

interface ExtractableFile {
  path: string;
  originalName: string;
  mimetype: string;
}

export async function extractText(
  file?: ExtractableFile,
): Promise<string | undefined> {
  if (!file) return undefined;

  if (file.mimetype === "application/pdf") {
    const buffer = await fs.readFile(file.path);
    const result = await PdfParse.default(buffer);
    return result.text;
  }

  if (file.mimetype === "text/plain" || file.originalName.endsWith(".txt")) {
    return fs.readFile(file.path, "utf-8");
  }

  throw new Error("Unsupported file type. Please upload a PDF or text file.");
}
