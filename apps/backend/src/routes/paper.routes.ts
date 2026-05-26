import { Router, Request, Response } from "express";
import { GeneratedPaperModel } from "../models/generated-paper.model";
import { addPdfJob } from "../queues/pdf.queue";

const router: Router = Router();
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
