import express from "express";
import type { Router } from "express";
import {
  getBooks,
  getLatestBooks,
  getFeaturedBooks,
  searchByTitle,
  readBook,
  getSingleBook,
} from "../controllers/books_controller.ts";
import { authMiddleware } from "../middleware/verifyToken.ts";

const bookroute: Router = express.Router();
bookroute.get("/all", authMiddleware, getBooks);
bookroute.get("/latest", authMiddleware, getLatestBooks);
bookroute.get("/feature", authMiddleware, getFeaturedBooks);
bookroute.get("/title", authMiddleware, searchByTitle);
bookroute.get("/read/:bookId", authMiddleware, readBook);
bookroute.get("/single/:bookId", authMiddleware, getSingleBook);
export default bookroute;
