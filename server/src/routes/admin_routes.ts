import express from "express";
import type { Router } from "express";
import { authMiddleware } from "../middleware/verifyToken.ts";
import {
  uploadBook,
  updateBook,
  deleteBook,
  updateBookFile,
  updateBookCover,
} from "../controllers/admin_controller.ts";
import upload from "../utils/multer.ts";

const adminrouter: Router = express.Router();

adminrouter.post(
  "/upload",
  authMiddleware,
  upload.fields([
    { name: "book", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  uploadBook
);
adminrouter.put(
  "/editbook/:id",
  authMiddleware,
  upload.fields([
    { name: "book", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  updateBook
);
// update PDF only
adminrouter.put(
  "/updatebookfile/:id",
  authMiddleware,
  upload.single("book"),
  updateBookFile
);

// update cover only
adminrouter.put(
  "/updatebookcover/:id",
  authMiddleware,
  upload.single("cover"),
  updateBookCover
);

adminrouter.delete("/delete/:id", authMiddleware, deleteBook);
export default adminrouter;
