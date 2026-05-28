import { Router, Request, Response } from "express";
import { GeneratedPaperModel } from "../models/generated-paper.model";
import { addPdfJob } from "../queues/pdf.queue";
import { requireAuth } from "../middleware/auth";

const router: Router = Router();

// Signed-in history view. Guest papers remain accessible by assignment id.
router.get("/mine", requireAuth, async (req: Request, res: Response) => {
  try {
    const papers = await GeneratedPaperModel.find({
      userId: req.authUser!.userId,
    })
      .sort({ createdAt: -1 })
      .select("-pdfData");

    return res.json({ papers });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
});

// Serve PDF directly from DB (used in production)
router.get("/:paperId/pdf", async (req: Request, res: Response) => {
  try {
    const paper = await GeneratedPaperModel.findById(req.params.paperId);
    if (!paper || !paper.pdfData) {
      return res.status(404).json({ error: "PDF not found" });
    }

    // Generate a clean filename from the paper metadata
    const safeSubject = (paper.subject || "question-paper")
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();
    const now = paper.createdAt || new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const filename = `${safeSubject}-${dateStr}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(paper.pdfData);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve PDF" });
  }
});

// Get paper by assignmentId (for preview)
router.get("/:assignmentId", async (req: Request, res: Response) => {
  try {
    const paper = await GeneratedPaperModel.findOne({
      assignmentId: req.params.assignmentId,
    });
    if (!paper) return res.status(404).json({ error: "Paper not found" });
    return res.json(paper);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/:assignmentId/pdf", async (req: Request, res: Response) => {
  try {
    const paper = await GeneratedPaperModel.findOne({
      assignmentId: req.params.assignmentId,
    });
    if (!paper) return res.status(404).json({ error: "Paper not found" });

    const job = await addPdfJob({
      paperId: paper._id.toString(),
      assignmentId: paper.assignmentId.toString(),
    });

    res.status(202).json({
      message: "PDF generation started",
      jobId: job.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to enqueue PDF generation" });
  }
});

export { router as paperRouter };
