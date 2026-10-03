import { type Request, type Response, type NextFunction } from "express";
import { db } from "../configs/dbconnection.ts";

import { eq, ilike, and, sql, desc, or } from "drizzle-orm";
import { HandleResponse } from "../utils/HandleResponse.ts";
import {
  booksTable,
  historyTable,
  pointsTable,
  usersTable,
} from "../models/schema.ts";
import { depositSchema } from "../utils/validation.ts";

const PAGES_PER_POINT = 10;
//get feature book
export async function getFeaturedBooks(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const books = await db
      .select()
      .from(booksTable)
      .where(
        and(eq(booksTable.isFeatured, true), eq(booksTable.status, "ready")),
      )
      .orderBy(desc(booksTable.createdAt));

    return HandleResponse(res, true, 200, "featured Book", books);
  } catch (err) {
    next(err);
  }
}

export async function getUserPoints(
  req: any,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user.id;

    const result = await db
      .select({
        total: sql<number>`
          COALESCE(
            SUM(
              CASE 
                WHEN ${pointsTable.type} = 'earn' 
                THEN ${pointsTable.amount}
                ELSE -${pointsTable.amount}
              END
            ), 
          0)
        `,
      })
      .from(pointsTable)
      .where(eq(pointsTable.userId, userId));

    return HandleResponse(res, true, 200, "User points fetched successfully", {
      points: result[0]?.total ?? 0,
    });
  } catch (error) {
    next(error);
  }
}
//get histroy
export async function getReadHistory(
  req: any,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user.id;

    const search = req.query.search as string | undefined;

    const history = await db
      .select({
        historyId: historyTable.id,
        readAt: historyTable.readAt,
        bookId: booksTable.id,
        filePath: booksTable.filePath,
        title: booksTable.title,
        author: booksTable.author,
        category: booksTable.category,
        coverphoto: booksTable.coverphoto,
        pageCount: booksTable.pageCount,
      })
      .from(historyTable)
      .innerJoin(booksTable, eq(historyTable.bookId, booksTable.id))
      .where(
        search
          ? and(
              eq(historyTable.userId, userId),
              ilike(booksTable.title, `%${search}%`),
            )
          : eq(historyTable.userId, userId),
      )
      .orderBy(desc(historyTable.readAt));

    return HandleResponse(
      res,
      true,
      200,
      "Read history retrieved successfully",
      history,
    );
  } catch (error) {
    next(error);
  }
}

//  Get latest books (limit to e.g. 10)
export async function getLatestBooks(
  req: Request,
  res: Response,
  next: NextFunction,
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
      .where(eq(booksTable.status, "ready"))
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
  next: NextFunction,
) {
  try {
    const search = req.query.search as string | undefined;

    const books = await db
      .select()
      .from(booksTable)
      .where(
        search
          ? or(
              ilike(booksTable.title, `%${search}%`),
              ilike(booksTable.category, `%${search}%`),
            )
          : eq(booksTable.status, "ready"),
      );

    if (!books || books.length === 0) {
      return HandleResponse(
        res,
        false,
        404,
        search ? "No books found" : "No books available",
      );
    }

    return HandleResponse(res, true, 200, "all books found", books);
  } catch (err) {
    next(err);
  }
}

//saerchByTitle
export async function searchByTitle(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      return HandleResponse(res, true, 200, []);
    }

    const books = await db
      .select()
      .from(booksTable)
      .where(
        and(eq(booksTable.status, "ready"), ilike(booksTable.title, `%${q}%`)),
      )
      .limit(20);

    return HandleResponse(res, true, 200, books);
  } catch (err) {
    next(err);
  }
}
export async function readBook(
  req: any,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user.id;
    const bookId = req.params.bookId;

    // Fetch book and history together
    const [bookResult, historyResult] = await Promise.all([
      db
        .select({
          id: booksTable.id,
          pageCount: booksTable.pageCount,
          filePath: booksTable.filePath,
        })
        .from(booksTable)
        .where(and(eq(booksTable.id, bookId), eq(booksTable.status, "ready")))
        .limit(1),

      db
        .select({ id: historyTable.id })
        .from(historyTable)
        .where(
          and(eq(historyTable.userId, userId), eq(historyTable.bookId, bookId)),
        )
        .limit(1),
    ]);

    const book = bookResult[0];

    if (!book) {
      return HandleResponse(res, false, 404, "Book not found");
    }

    if (!book.pageCount) {
      return HandleResponse(res, false, 500, "Book page count missing");
    }

    const alreadyRead = historyResult.length > 0;

    // User already unlocked book
    if (alreadyRead) {
      return HandleResponse(res, true, 200, "Book ready to read", {
        filePath: book.filePath,
      });
    }

    const pointsRequired = Math.ceil(book.pageCount / PAGES_PER_POINT);

    // Get current points
    const pointsResult = await db
      .select({
        total: sql<number>`
          COALESCE(
            SUM(
              CASE
                WHEN ${pointsTable.type} = 'earn'
                THEN ${pointsTable.amount}
                ELSE -${pointsTable.amount}
              END
            ),
          0)
        `,
      })
      .from(pointsTable)
      .where(eq(pointsTable.userId, userId));

    const currentPoints = Number(pointsResult[0]?.total ?? 0);

    if (currentPoints < pointsRequired) {
      return HandleResponse(res, false, 403, "Not enough points", {
        code: "INSUFFICIENT_POINTS",
        requiredPoints: pointsRequired,
        currentPoints,
      });
    }

    await Promise.all([
      db.insert(pointsTable).values({
        userId,
        type: "spend",
        amount: pointsRequired,
        reference: bookId,
      }),

      db.insert(historyTable).values({
        userId,
        bookId,
        readAt: new Date(),
      }),
    ]);

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
  next: NextFunction,
) {
  try {
    const { bookId } = req.params;

    if (!bookId) {
      return HandleResponse(res, false, 400, "Book id is required");
    }

    const books = await db
      .select()
      .from(booksTable)
      .where(and(eq(booksTable.id, bookId), eq(booksTable.status, "ready")))
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

export async function depositPoints(
  req: any,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user.id;

    const { amount } = req.body;
    const { error } = depositSchema.validate({
      amount,
    });

    if (error) {
      return HandleResponse(
        res,
        false,
        400,
        error.details?.[0]?.message || "Invalid deposit amount",
      );
    }

    if (amount <= 0) {
      return HandleResponse(
        res,
        false,
        400,
        "Deposit amount must be greater than 0",
      );
    }

    if (amount > 5000) {
      return HandleResponse(res, false, 400, "Maximum deposit is 5000 points");
    }

    // Add points
    await db.insert(pointsTable).values({
      userId,
      type: "earn",
      amount,
      reference: "deposit",
    });

    return HandleResponse(res, true, 200, "Points deposited successfully", {
      deposited: amount,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: any, res: Response, next: NextFunction) {
  try {
    const userId = req.user.id;
    console.log("from me", userId);
    const [user] = await db
      .select({
        id: usersTable.id,
        user_name: usersTable.user_name,
        email: usersTable.email,
        role: usersTable.role,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      return HandleResponse(res, false, 404, "User not found");
    }

    return HandleResponse(res, true, 200, "User fetched successfully", user);
  } catch (err) {
    next(err);
  }
}

export async function downloadBook(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { bookId } = req.params;

    if (!bookId) {
      return HandleResponse(res, false, 400, "Book id is required");
    }

    const books = await db
      .select({
        id: booksTable.id,
        title: booksTable.title,
        filePath: booksTable.filePath,
      })
      .from(booksTable)
      .where(eq(booksTable.id, bookId))
      .limit(1);

    const book = books[0];

    if (!book) {
      return HandleResponse(res, false, 404, "Book not found");
    }

    if (!book.filePath) {
      return HandleResponse(res, false, 404, "Book PDF not found");
    }

    // Fetch PDF from Cloudinary
    const response = await fetch(book.filePath);

    if (!response.ok || !response.body) {
      return HandleResponse(res, false, 500, "Failed to fetch book PDF");
    }

    const filename = `${book.title || "book"}`
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
      .trim();

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}.pdf"`,
    );

    res.setHeader("Content-Type", "application/pdf");
    const contentLength = response.headers.get("content-length");

    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    // Convert Web ReadableStream → Node response
    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      res.write(Buffer.from(value));
    }

    res.end();
  } catch (error) {
    console.error("Download book error:", error);
    next(error);
  }
}

export async function downloadBook2(
  req: any,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;

    if (!bookId) {
      return HandleResponse(res, false, 400, "Book id is required");
    }

    // Check if user has already unlocked/read this book
    const history = await db
      .select({ id: historyTable.id })
      .from(historyTable)
      .where(
        and(eq(historyTable.userId, userId), eq(historyTable.bookId, bookId)),
      )
      .limit(1);

    if (history.length === 0) {
      return HandleResponse(
        res,
        false,
        403,
        "You must unlock and read this book before downloading it",
      );
    }

    // Get book
    const books = await db
      .select({
        id: booksTable.id,
        title: booksTable.title,
        filePath: booksTable.filePath,
      })
      .from(booksTable)
      .where(and(eq(booksTable.id, bookId), eq(booksTable.status, "ready")))
      .limit(1);

    const book = books[0];

    if (!book) {
      return HandleResponse(res, false, 404, "Book not found");
    }

    if (!book.filePath) {
      return HandleResponse(res, false, 404, "Book PDF not found");
    }

    // Fetch PDF from Cloudinary
    const response = await fetch(book.filePath);

    if (!response.ok || !response.body) {
      return HandleResponse(res, false, 500, "Failed to fetch book PDF");
    }

    const filename = `${book.title || "book"}`
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
      .trim();

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}.pdf"`,
    );

    res.setHeader("Content-Type", "application/pdf");

    const contentLength = response.headers.get("content-length");

    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      res.write(Buffer.from(value));
    }

    res.end();
  } catch (error) {
    console.error("Download book error:", error);
    next(error);
  }
}
