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
import * as bookService from "../services/admin_service.ts";

export async function uploadBook(
  req: any,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const bookFile = req.files?.book?.[0];
    const coverFile = req.files?.cover?.[0];
    const { title, author, isFeatured, description, category } = req.body;

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
    const wordCount = description.trim().split(/\s+/).length;
    if (wordCount < 20) {
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

    const pdfBuffer = fs.readFileSync(bookFile.path);

    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageCount = pdfDoc.getPageCount();
    // Get number of pages

    //  Upload PDF to Cloudinary
    const bookUpload = await uploadTocloudinary.uploadBook(bookFile.path);

    //  Upload cover image to Cloudinary
    const coverUpload = await uploadTocloudinary.uploadCoverBook(
      coverFile.path,
    );
    // Save to database
    await db.insert(booksTable).values({
      title,
      author,
      description,
      isFeatured,
      userId: req.user.id,
      category,
      filePath: bookUpload.url,
      filePublicId: bookUpload.publicId,
      coverphoto: coverUpload.url,
      coverPublicId: coverUpload.publicId,
      pageCount,
    });
    // await generateLandingCache();
    // 4 Delete local files
    fs.unlinkSync(bookFile.path);
    fs.unlinkSync(coverFile.path);

    return HandleResponse(res, true, 201, "Book uploaded successfully");
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

    await uploadTocloudinary.deleteFile(book.filePublicId);
    await uploadTocloudinary.deleteFile(book.coverPublicId);

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
    await uploadTocloudinary.deleteFile(existingBook.filePublicId);

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
    await uploadTocloudinary.deleteFile(existingBook.coverPublicId);

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
