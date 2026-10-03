import { Queue, Worker } from "bullmq";
import { client as connection } from "../redis";
import fs from "fs";
import { PDFDocument } from "pdf-lib";
import { eq } from "drizzle-orm";
import { uploadTocloudinary } from "../uploadTocloudinary";
import { booksTable } from "../../models/schema";
import { db } from "../../configs/dbconnection";

export const bookQueue = new Queue("book-upload", {
  connection,
});

export const uploadWorker = () => {
  const worker = new Worker(
    "book-upload",
    async (job) => {
      try {
        const pdfBuffer = await fs.promises.readFile(job.data.bookPath);

        const uploadStart = Date.now();

        const [pdfDoc, bookUpload, coverUpload] = await Promise.all([
          PDFDocument.load(pdfBuffer),
          uploadTocloudinary.uploadBook(job.data.bookPath),
          uploadTocloudinary.uploadCoverBook(job.data.coverPath),
        ]);

        await db
          .update(booksTable)
          .set({
            filePath: bookUpload.url,
            filePublicId: bookUpload.publicId,
            coverphoto: coverUpload.url,
            coverPublicId: coverUpload.publicId,
            pageCount: pdfDoc.getPageCount(),
            status: "ready",
          })
          .where(eq(booksTable.id, job.data.bookId));

        await Promise.allSettled([
          fs.promises.unlink(job.data.bookPath),
          fs.promises.unlink(job.data.coverPath),
        ]);
      } catch (error) {
        console.error(`❌ JOB ERROR: ${job.id}`, error);
        throw error;
      }
    },
    {
      connection,
      concurrency: 2,
    },
  );

  worker.on("ready", () => {
    console.log(" Book worker connected to Redis");
  });

  worker.on("active", (job) => {
    console.log(`BOOK JOB ACTIVE: ${job.id}`);
  });

  worker.on("completed", (job) => {
    console.log(`BOOK JOB COMPLETED: ${job.id}`);
  });

  worker.on("failed", async (job, err) => {
    console.error(` BOOK JOB FAILED: ${job?.id}`);
    console.error(err.message);

    if (job && job.attemptsMade >= (job.opts.attempts ?? 1)) {
      await db
        .update(booksTable)
        .set({
          status: "failed",
        })
        .where(eq(booksTable.id, job.data.bookId));

      await Promise.allSettled([
        fs.promises.unlink(job.data.bookPath),
        fs.promises.unlink(job.data.coverPath),
      ]);
    }
  });

  worker.on("error", (err) => {
    console.error(" BOOK WORKER ERROR:", err);
  });

  console.log("Book upload worker initialized");

  return worker;
};
