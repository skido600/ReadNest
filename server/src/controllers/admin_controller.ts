import { type Request, type Response, type NextFunction } from "express";

import {
  booksTable,
  historyTable,
  pointsTable,
  usersTable,
} from "../models/schema.ts";
import { db } from "../configs/dbconnection.ts";
import { validateupdates } from "../utils/validation.ts";
import { HandleResponse } from "../utils/HandleResponse.ts";
import fs from "fs";
import { PDFDocument } from "pdf-lib";
import { uploadTocloudinary } from "../utils/uploadTocloudinary.ts";
import { eq } from "drizzle-orm";
import { generateLandingCache } from "../utils/generateLandingCache.ts";

import { bookQueue } from "../utils/queues/bookQueue.ts";

bookQueue;
export async function uploadBook(
  req: any,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const bookFile = req.files?.book?.[0];
    const coverFile = req.files?.cover?.[0];
    const { title, author, description, category } = req.body;

    const isFeatured =
      req.body.isFeatured === "true" || req.body.isFeatured === true;

    const { error } = validateupdates.validate({
      title,
      author,
      description,
      category,
    });
    if (error) {
      return HandleResponse(
        res,
        false,
        400,
        error.details[0]?.message || "Validation failed",
      );
    }

    if (description.trim().split(/\s+/).length < 20) {
      return HandleResponse(
        res,
        false,
        400,
        "Description must be at least 20 words",
      );
    }
    if (!bookFile || !coverFile) {
      return HandleResponse(res, false, 400, "Book and cover required");
    }

    // Insert row right away so the user has an ID to track
    const [book] = await db
      .insert(booksTable)
      .values({
        title,
        author,
        description,
        isFeatured,
        userId: req.user.id,
        category,
        status: "processing",
      })
      .returning({ id: booksTable.id });
    if (!book) {
      return HandleResponse(res, false, 500, "Failed to create book record");
    }
    await bookQueue.add(
      "process-book",
      {
        bookId: book.id,
        bookPath: bookFile.path,
        coverPath: coverFile.path,
      },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );

    return HandleResponse(
      res,
      true,
      202,
      "Book received and is being processed",
    );
  } catch (err) {
    next(err);
  }
}

//  UPDATE BOOK
export async function updateBook(req: any, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { title, author, isFeatured, category, description } = req.body;

    // Validate text fields
    const { error } = validateupdates.validate({
      title,
      author,
      isFeatured,
      description,
      category,
    });
    if (error) {
      return HandleResponse(
        res,
        false,
        400,
        error.details[0]?.message as string,
      );
    }

    // Check if book exists
    const [existingBook] = await db
      .select()
      .from(booksTable)
      .where(eq(booksTable.id, id))
      .limit(1);

    if (!existingBook) {
      return HandleResponse(res, false, 404, "Book not found");
    }

    const updateData: any = {};

    if (title) updateData.title = title;
    if (author) updateData.author = author;
    if (category) updateData.category = category;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (description) updateData.description = description;
    if (Object.keys(updateData).length === 0) {
      return HandleResponse(res, false, 400, "Nothing to update");
    }

    // Update only text fields in the database
    await db.update(booksTable).set(updateData).where(eq(booksTable.id, id));

    await generateLandingCache();

    return HandleResponse(res, true, 200, "Book updated successfully");
  } catch (err) {
    next(err);
  }
}

//  DELETE BOOK
export async function deleteBook(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    if (!id) {
      return HandleResponse(res, false, 400, "Book id is required");
    }
    const [book] = await db
      .select()
      .from(booksTable)
      .where(eq(booksTable.id, id))
      .limit(1);

    if (!book) {
      return HandleResponse(res, false, 404, "Book not found");
    }

    await uploadTocloudinary.deleteFile(book.filePublicId as string);
    await uploadTocloudinary.deleteFile(book.coverPublicId as string);

    await db.delete(booksTable).where(eq(booksTable.id, id));

    await generateLandingCache();

    return HandleResponse(res, true, 200, "Book deleted successfully");
  } catch (err) {
    next(err);
  }
}

//updatefile
export async function updateBookFile(
  req: any,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const bookFile = req.file;

    if (!id) return HandleResponse(res, false, 400, "Book id is required");
    if (!bookFile) return HandleResponse(res, false, 400, "PDF file required");

    const [existingBook] = await db
      .select()
      .from(booksTable)
      .where(eq(booksTable.id, id))
      .limit(1);

    if (!existingBook) return HandleResponse(res, false, 404, "Book not found");

    const pdfBuffer = fs.readFileSync(bookFile.path);
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // delete old PDF from cloudinary
    await uploadTocloudinary.deleteFile(existingBook.filePublicId as string);

    // upload new PDF
    const newBook = await uploadTocloudinary.uploadBook(bookFile.path);

    await db
      .update(booksTable)
      .set({
        filePath: newBook.url,
        filePublicId: newBook.publicId,
        pageCount: pdfDoc.getPageCount(),
      })
      .where(eq(booksTable.id, id));

    fs.unlinkSync(bookFile.path);
    await generateLandingCache();

    return HandleResponse(res, true, 200, "PDF updated successfully");
  } catch (err) {
    next(err);
  }
}

//update cover
export async function updateBookCover(
  req: any,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    const coverFile = req.file;
    if (!id) return HandleResponse(res, false, 400, "Book id is required");
    if (!coverFile)
      return HandleResponse(res, false, 400, "Cover file required");

    const [existingBook] = await db
      .select()
      .from(booksTable)
      .where(eq(booksTable.id, id))
      .limit(1);

    if (!existingBook) return HandleResponse(res, false, 404, "Book not found");

    // delete old cover from cloudinary
    await uploadTocloudinary.deleteFile(existingBook.coverPublicId as string);

    // upload new cover
    const newCover = await uploadTocloudinary.uploadCoverBook(coverFile.path);

    await db
      .update(booksTable)
      .set({
        coverphoto: newCover.url,
        coverPublicId: newCover.publicId,
      })
      .where(eq(booksTable.id, id));

    fs.unlinkSync(coverFile.path);
    await generateLandingCache();

    return HandleResponse(res, true, 200, "Cover updated successfully");
  } catch (err) {
    next(err);
  }
}
