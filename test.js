const { io } = require("socket.io-client");

const assignmentId = process.argv[2];
const jobId = process.argv[3]; // optional: if you have a job ID

if (!assignmentId) {
  console.error("Usage: node test.js <assignmentId> [jobId]");
  process.exit(1);
}

const socket = io("http://localhost:4000");

socket.on("connect", () => {
  console.log("Connected:", socket.id);
  socket.emit("subscribe_to_assignment", assignmentId);
  console.log(`Subscribed to assignment ${assignmentId}`);
  if (jobId) {
    socket.emit("subscribe_to_job", jobId);
    console.log(`Subscribed to job ${jobId}`);
  }
});

socket.onAny((event, ...args) => {
  console.log(`📨 event: ${event}`, args);
});

socket.on("generation_completed", (d) => {
  console.log("Completed! Paper ID:", d.paperId);
  console.log("PDF URL:", d.paper?.pdfUrl || d.pdfUrl);
});
socket.on("generation_failed", (d) => console.error("Failed:", d.error));
