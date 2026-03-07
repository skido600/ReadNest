import { type Request, type Response, type NextFunction } from "express";
import { db } from "../configs/dbconnection.ts";

import { eq, ilike, and, or, desc } from "drizzle-orm";
import { HandleResponse } from "../utils/HandleResponse.ts";
import {
  booksTable,
  historyTable,
  pointsTable,
  usersTable,
} from "../models/schema.ts";
import { error } from "node:console";
const PAGES_PER_POINT = 10;
//get feature book
export async function getFeaturedBooks(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const books = await db
      .select()
      .from(booksTable)
      .where(eq(booksTable.isFeatured, true))
      .orderBy(desc(booksTable.createdAt));

    return HandleResponse(res, true, 200, books);
  } catch (err) {
    next(err);
  }
}

//  Get latest books (limit to e.g. 10)
export async function getLatestBooks(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const books = await db
      .select({
        id: booksTable.id,
        title: booksTable.title,
        author: booksTable.author,
        category: booksTable.category,
        coverphoto: booksTable.coverphoto,
        pageCount: booksTable.pageCount,
      })
      .from(booksTable)
      .orderBy(desc(booksTable.createdAt))
      .limit(10);
    return HandleResponse(res, true, 200, "books found", books);
  } catch (err) {
    next(err);
  }
}

//get all books
export async function getBooks(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const category = req.query.category as string | undefined;

    const books = await db
      .select()
      .from(booksTable)
      .where(category ? eq(booksTable.category, category) : undefined);

    if (!books || books.length === 0) {
      return HandleResponse(
        res,
        false,
        404,
        category ? "No books found in this category" : "No books found"
      );
    }

    return HandleResponse(res, true, 200, books);
  } catch (err) {
    next(err);
  }
}

//saerchByTitle
export async function searchByTitle(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      return HandleResponse(res, true, 200, []);
    }

    const books = await db
      .select()
      .from(booksTable)
      .where(ilike(booksTable.title, `%${q}%`))
      .limit(20);

    return HandleResponse(res, true, 200, books);
  } catch (err) {
    next(err);
  }
}
export async function readBook(
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user.id;
    const bookId = req.params.bookId;
    const userRole = req.user.role;
    //  Get book info
    const books = await db
      .select()
      .from(booksTable)
      .where(eq(booksTable.id, bookId));
    const book = books[0];

    if (!book) return HandleResponse(res, false, 404, "Book not found");
    if (book.pageCount === null)
      return HandleResponse(res, false, 500, "Book page count missing");

    //  Check if user already read this book
    const readHistory = await db
      .select()
      .from(historyTable)
      .where(
        and(eq(historyTable.userId, userId), eq(historyTable.bookId, bookId))
      );
    const alreadyRead = readHistory.length > 0;
    const isAdmin = userRole === "admin";
    if (!alreadyRead && !isAdmin) {
      //  Calculate points required
      const pointsRequired = Math.ceil(book.pageCount / PAGES_PER_POINT);

      //  Calculate current user points from pointsTable
      const userPointsTransactions = await db
        .select()
        .from(pointsTable)
        .where(eq(pointsTable.userId, userId));

      let totalPoints = 0;
      for (const p of userPointsTransactions) {
        if (p.type === "earn" || p.type === "purchase") totalPoints += p.amount;
        else if (p.type === "spend") totalPoints -= p.amount;
      }

      if (totalPoints < pointsRequired) {
        return HandleResponse(
          res,
          false,
          403,
          "Not enough points to read this book"
        );
      }

      // Deduct points and save history
      await db.insert(pointsTable).values({
        userId,
        type: "spend",
        amount: pointsRequired,
        reference: bookId,
      });

      await db.insert(historyTable).values({
        userId,
        bookId,
        readAt: new Date(),
      });
    } else if (!alreadyRead && isAdmin) {
      // Only save history for admin
      await db.insert(historyTable).values({
        userId,
        bookId,
        readAt: new Date(),
      });
    }

    //  Serve the book instantly
    return HandleResponse(res, true, 200, "Book ready to read", {
      filePath: book.filePath,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

// get single book
export async function getSingleBook(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { bookId } = req.params;

    if (!bookId) {
      return HandleResponse(res, false, 400, "Book id is required");
    }

    const books = await db
      .select()
      .from(booksTable)
      .where(eq(booksTable.id, bookId))
      .limit(1);

    const book = books[0];

    if (!book) {
      return HandleResponse(res, false, 404, "Book not found");
    }

    return HandleResponse(res, true, 200, "see the book", book);
  } catch (err) {
    next(err);
  }
}
