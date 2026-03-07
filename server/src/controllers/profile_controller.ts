import { type Request, type Response, type NextFunction } from "express";
import { HandleResponse } from "../utils/HandleResponse.ts";
import { pointsTable, usersTable } from "../models/schema.ts";
import { db } from "../configs/dbconnection.ts";
import { eq } from "drizzle-orm";
import argon2 from "argon2";

// historyTable
export async function Editprofilepassword(
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authuser = req.user.id;
    const {
      oldpassword,
      password,
    }: {
      oldpassword: string;
      password: string;
    } = req.body;

    if (!authuser) {
      return HandleResponse(res, false, 404, "unauthorized user");
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, authuser));

    if (!user) {
      return HandleResponse(res, false, 400, "user not found");
    }

    const validPassword = await argon2.verify(user.password, oldpassword);
    if (!validPassword) {
      return HandleResponse(res, false, 400, "Incorrect old password");
    }
    const hashedPassword = await argon2.hash(password);
    await db
      .update(usersTable)
      .set({ password: hashedPassword })
      .where(eq(usersTable.id, authuser));

    return HandleResponse(res, true, 200, "Password updated successfully");
  } catch (error) {
    next(error);
  }
}

export async function GetAmount(
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authuser = req.user.id;

    const [points] = await db
      .select()
      .from(pointsTable)
      .where(eq(pointsTable.userId, authuser));

    if (!points) {
      return HandleResponse(res, false, 400, "user not found");
    }

    return HandleResponse(res, true, 200, "User history", points);
  } catch (error) {
    next(error);
  }
}
