import express from "express";
import { config } from "dotenv";
import { HandleError, notFound } from "./middleware/ErrorHandling.ts";
import authroute from "./routes/user_routes.ts";
import { initalizeEmailWorker } from "./utils/Mail_worker.ts";
import cookieParser from "cookie-parser";
import adminrouter from "./routes/admin_routes.ts";

import cors from "cors";
import bookroute from "./routes/books_routes.ts";
import profile from "./routes/profile_routes.ts";

config();
const port = process.env.PORT;

const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
//middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//routes
app.use("/api/authv1", authroute);
app.use("/api/admin", adminrouter);
app.use("/api/book", bookroute);
app.use("/api/profile", profile);
//error handling

app.use(HandleError);
app.use(notFound);
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  initalizeEmailWorker();
  // initializePdfWorker();
});

// import fs from "fs";
// import pdfParse from "pdf-parse";

// const dataBuffer = fs.readFileSync(book.filePath);
// const pdfData = await pdfParse(dataBuffer);

// console.log("Total pages:", pdfData.numpages);

// if (user.country === "NG") {
//   // show Paystack checkout
// } else {
//   // show Stripe checkout
// }
