import fs from "fs";
import { PDFDocument } from "pdf-lib";
import { db } from "../configs/dbconnection.ts";
import { booksTable } from "../models/schema.ts";
import { eq } from "drizzle-orm";
import { validateupdates } from "../utils/validation.ts";
import { uploadTocloudinary } from "../utils/uploadTocloudinary.ts";
import { generateLandingCache } from "../utils/generateLandingCache.ts";
// uploadBookService;
export async function uploadBookService(req: any) {
  try {
    const bookFile = req.files?.book?.[0];
    const coverFile = req.files?.cover?.[0];
    const { title, author, isFeatured, category } = req.body;

    const { error } = validateupdates.validate({
      title,
      author,
      isFeatured,
      category,
    });
    if (error) throw { status: 400, message: error.details[0]?.message };

    if (!bookFile || !coverFile) throw new Error("Book and cover required");

    const pdfBuffer = fs.readFileSync(bookFile.path);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageCount = pdfDoc.getPageCount();
    const bookUpload = await uploadTocloudinary.uploadBook(bookFile.path);
    const coverUpload = await uploadTocloudinary.uploadCoverBook(
      coverFile.path
    );

    await db.insert(booksTable).values({
      title,
      author,
      isFeatured,
      userId: req.user.id,
      category,
      filePath: bookUpload.url,
      filePublicId: bookUpload.publicId,
      coverphoto: coverUpload.url,
      coverPublicId: coverUpload.publicId,
      pageCount: pageCount,
    });

    // await generateLandingCache();

    // fs.unlinkSync(bookFile.path);
    // fs.unlinkSync(coverFile.path);

    return { message: "Book uploaded successfully" };
  } catch (error) {
    throw error;
  }
}
// updateBookService
export async function updateBookService(id: string, data: any) {
  try {
    const { title, author, isFeatured, category } = data;

    const { error } = validateupdates.validate({
      title,
      author,
      isFeatured,
      category,
    });
    if (error) throw new Error(error.details[0]?.message);

    const [existingBook] = await db
      .select()
      .from(booksTable)
      .where(eq(booksTable.id, id))
      .limit(1);
    if (!existingBook) throw new Error("Book not found");

    const updateData: any = {};
    if (title) updateData.title = title;
    if (author) updateData.author = author;
    if (category) updateData.category = category;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

    if (Object.keys(updateData).length === 0)
      throw new Error("Nothing to update");

    await db.update(booksTable).set(updateData).where(eq(booksTable.id, id));
    await generateLandingCache();

    return { message: "Book updated successfully" };
  } catch (error) {
    throw error;
  }
}
//deleteBookService
export async function deleteBookService(id: string) {
  try {
    const [book] = await db
      .select()
      .from(booksTable)
      .where(eq(booksTable.id, id))
      .limit(1);
    if (!book) throw { status: 404, message: "Book not found" };

    await uploadTocloudinary.deleteFile(book.filePublicId);
    await uploadTocloudinary.deleteFile(book.coverPublicId);

    await db.delete(booksTable).where(eq(booksTable.id, id));
    await generateLandingCache();

    return { message: "Book deleted successfully" };
  } catch (error) {
    throw error;
  }
}
//updateBookFileService
export async function updateBookFileService(req: any) {
  try {
    if (!req.file) throw { status: 400, message: "PDF file required" };

    const [existingBook] = await db
      .select()
      .from(booksTable)
      .where(eq(booksTable.id, req.params.id))
      .limit(1);
    if (!existingBook) throw { status: 404, message: "Book not found" };

    const pdfBuffer = fs.readFileSync(req.file);
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    await uploadTocloudinary.deleteFile(existingBook.filePublicId);
    const newBook = await uploadTocloudinary.uploadBook(req.file);

    await db
      .update(booksTable)
      .set({
        filePath: newBook.url,
        filePublicId: newBook.publicId,
        pageCount: pdfDoc.getPageCount(),
      })
      .where(eq(booksTable.id, req.id));

    fs.unlinkSync(req.file.path);
    await generateLandingCache();

    return { message: "PDF updated successfully" };
  } catch (error) {
    throw error;
  }
}
//updatecoverservice
export async function updateBookCoverService(
  id: string,
  file: Express.Multer.File
) {
  try {
    if (!file) throw { status: 400, message: "Cover file required" };

    const [existingBook] = await db
      .select()
      .from(booksTable)
      .where(eq(booksTable.id, id))
      .limit(1);
    if (!existingBook) throw { status: 404, message: "Book not found" };

    await uploadTocloudinary.deleteFile(existingBook.coverPublicId);
    const newCover = await uploadTocloudinary.uploadCoverBook(file.path);

    await db
      .update(booksTable)
      .set({
        coverphoto: newCover.url,
        coverPublicId: newCover.publicId,
      })
      .where(eq(booksTable.id, id));

    fs.unlinkSync(file.path);
    await generateLandingCache();

    return { message: "Cover updated successfully" };
  } catch (error) {
    throw error;
  }
}
