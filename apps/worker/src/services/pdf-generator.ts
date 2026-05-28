import Handlebars from "handlebars";
import * as fs from "fs/promises";
import * as path from "path";

Handlebars.registerHelper("inc", (value: number) => value + 1);

const BROWSERLESS_API_KEY = process.env.BROWSERLESS_API_KEY || "";
const BROWSERLESS_URL = `https://production-sfo.browserless.io/pdf?token=${encodeURIComponent(BROWSERLESS_API_KEY)}`;

export async function generatePdf(paper: any): Promise<Buffer> {
  const templatePath = path.resolve(
    __dirname,
    "..",
    "..",
    "src",
    "templates",
    "paper-template.html",
  );

  const templateSource = await fs.readFile(templatePath, "utf-8");
  const template = Handlebars.compile(templateSource);

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

  const html = template({
    institutionName: paper.institutionName || "Institution Name",
    subject: paper.subject || "General",
    classLevel: paper.classLevel || "",
    timeAllowed: paper.timeAllowed || "1 hour",
    maxMarks: paper.maxMarks || 0,
    compulsoryNote:
      paper.compulsoryNote ||
      "All questions are compulsory unless stated otherwise.",
    sections: paper.sections || [],
    answersList,
  });

  const response = await fetch(BROWSERLESS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
    body: JSON.stringify({
      html,
      options: {
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true, 
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Browserless PDF generation failed: ${response.status} ${errorText}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
