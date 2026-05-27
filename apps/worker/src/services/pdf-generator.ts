import { chromium } from "playwright";
import * as fs from "fs/promises";
import * as path from "path";
import Handlebars from "handlebars";

// Helper for incrementing index in template (used for question numbering)
Handlebars.registerHelper("inc", (value: number) => value + 1);

export async function generatePdf(paper: any): Promise<Buffer> {
  const templatePath = path.resolve(
    __dirname,
    "../templates/paper-template.html",
  );
  const templateSource = await fs.readFile(templatePath, "utf-8");
  const template = Handlebars.compile(templateSource);

  // Build answersList from each question's answerHint
  const answersList: string[] = [];
  if (paper.sections && Array.isArray(paper.sections)) {
    for (const section of paper.sections) {
      if (section.questions && Array.isArray(section.questions)) {
        for (const question of section.questions) {
          answersList.push(question.answerHint || "(Answer not provided)");
        }
      }
    }
  }

  // Prepare all data for the template
  const html = template({
    subject: paper.subject || "General",
    classLevel: paper.classLevel || "",
    timeAllowed: paper.timeAllowed || "1 hour",
    maxMarks: paper.maxMarks || 0,
    compulsoryNote:
      paper.compulsoryNote ||
      "All questions are compulsory unless stated otherwise.",
    sections: paper.sections || [],
    answersList: answersList,
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
