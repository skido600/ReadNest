// import { Queue, Worker } from "bullmq";
// import { client as redisClient } from "./redis.ts"; // your Redis connection

// import fs from "fs/promises";
// import { PDFDocument } from "pdf-lib";
// import { db } from "../configs/dbconnection.ts";
// import { booksTable } from "../models/schema.ts";
// import { eq } from "drizzle-orm";

// export const pdfQueue = new Queue("pdf-processing", {
//   connection: redisClient,
// });
// export const initializePdfWorker = () => {
//   const worker = new Worker(
//     "pdf-processing",
//     async (job: { data: { bookId: string; filePath: string } }) => {
//       const { bookId, filePath } = job.data;

//       try {
//         const buffer = await fs.readFile(filePath); // read PDF async
//         const pdfDoc = await PDFDocument.load(buffer);
//         const pageCount = pdfDoc.getPageCount();

//         // update DB
//         await db
//           .update(booksTable)
//           .set({ pageCount })
//           .where(eq(booksTable.id, bookId));

//         console.log(`Page count for book ${bookId} updated: ${pageCount}`);
//         // Now delete the local file safely
//         await fs.unlink(filePath);
//       } catch (err) {
//         console.error(`Failed to process PDF for book ${bookId}:`, err);
//       }
//     },
//     { connection: redisClient }
//   );

//   worker.on("failed", (job, err) => {
//     console.error(`pdf upload job failed for job ${job}:`, err);
//   });

//   return worker;
// };
