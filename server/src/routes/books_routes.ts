import express from "express";
import type { Router } from "express";
import {
  getBooks,
  getLatestBooks,
  getFeaturedBooks,
  searchByTitle,
  readBook,
  getSingleBook,
  getReadHistory,
  getUserPoints,
  depositPoints,
} from "../controllers/books_controller.ts";
import { authMiddleware } from "../middleware/verifyToken.ts";
import { authorize } from "../middleware/rolemiddleware.ts";

const bookroute: Router = express.Router();
bookroute.get("/all", authMiddleware, authorize("user", "admin"), getBooks);
bookroute.get("/latest", authMiddleware, authorize("user"), getLatestBooks);
bookroute.get("/feature", authMiddleware, authorize("user"), getFeaturedBooks);
bookroute.get("/point", authMiddleware, authorize("user"), getUserPoints);
bookroute.post("/deposit", authMiddleware, authorize("user"), depositPoints);
bookroute.get("/history", authMiddleware, authorize("user"), getReadHistory);
bookroute.get("/title", authMiddleware, authorize("user"), searchByTitle);
bookroute.get("/read/:bookId", authMiddleware, authorize("user"), readBook);
bookroute.get("/single/:bookId", authMiddleware, getSingleBook);
export default bookroute;
