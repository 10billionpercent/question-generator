import { chromium } from "playwright";
import * as fs from "fs/promises";
import * as path from "path";
import Handlebars from "handlebars";

// Helper for incrementing index in template
Handlebars.registerHelper("inc", (value: number) => value + 1);

export async function generatePdf(paper: any): Promise<Buffer> {
  const templatePath = path.resolve(
    __dirname,
    "../templates/paper-template.html",
  );
  const templateSource = await fs.readFile(templatePath, "utf-8");
  const template = Handlebars.compile(templateSource);

  const html = template({
    title: paper.title || "Question Paper",
    totalMarks: paper.totalMarks,
    duration: paper.duration || "2 hours",
    sections: paper.sections,
  });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.setContent(html, { waitUntil: "networkidle" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "20mm",
      right: "20mm",
    },
    preferCSSPageSize: true,
  });

  await browser.close();
  return Buffer.from(pdfBuffer);
}
