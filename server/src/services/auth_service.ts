import { eq, or, sql } from "drizzle-orm";
import { db } from "../configs/dbconnection.ts";
import {
  loginSecurityTable,
  otpTable,
  pointsTable,
  usersTable,
} from "../models/schema.ts";
import argon2 from "argon2";
import { hmacProcess, Otpcode } from "../utils/generateOtp.ts";
import { queue as emailworker } from "../utils/Mail_worker.ts";
import jwt from "jsonwebtoken";
import Tokens from "../utils/JWT_helper.ts";

const FORGETPASSWORD_SEC = process.env.FORGETPASSWORD_SEC as string;
const MAX_FAILED_ATTEMPTS = 10; // lock after 10 wrong tries
const LOCK_DURATION = 15 * 60 * 1000; // 15 minutes
export const registerUser = async (
  user_name: string,
  email: string,
  password: string,
) => {
  try {
    const normalizedInput = email.toLowerCase().trim();
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, normalizedInput));

    if (existingUser.length > 0) {
      throw new Error("User already exists");
    }
    const hashedPassword = await argon2.hash(password);
    //otp code
    const code = Otpcode();
    const hashedCode = hmacProcess(
      code,
      process.env.HMAC_VERIFICATION_CODE_SECRET as string,
    );

    const [newUser] = await db
      .insert(usersTable)
      .values({
        user_name,
        email: normalizedInput,
        password: hashedPassword,
      })
      .returning();
    if (!newUser) {
      throw new Error("User not found");
    }
    // Track points in pointsTable
    await db.insert(pointsTable).values({
      userId: newUser.id,
      type: "earn",
      amount: 30000,
      reference: "signup-bonus",
    });
    // delete old OTPs if any
    await db.delete(otpTable).where(eq(otpTable.userId, newUser.id));

    // save OTP
    await db.insert(otpTable).values({
      userId: newUser.id,
      email: normalizedInput,
      code: hashedCode,
    });

    await emailworker.add(
      "send-email",
      {
        type: "otp",
        user: newUser,
        verificationLink: code,
      },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 3000 },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );

    return newUser;
  } catch (error) {
    throw error;
  }
};

export const VerifyEmailService = async (
  email: string,
  code: string,
): Promise<void> => {
  try {
    const normalizedInput = email.toLowerCase().trim();
    const [user] = await db
      .select()
      .from(usersTable)
      .where(
        or(
          eq(usersTable.email, normalizedInput),
          eq(usersTable.user_name, normalizedInput),
        ),
      );

    if (!user) throw new Error("User not found");
    if (user.isVerified) throw new Error("User already verified");

    const [otp] = await db
      .select()
      .from(otpTable)
      .where(eq(otpTable.userId, user.id));
    if (!otp) throw new Error("OTP not found");

    const expiresAt = new Date(otp.createdAt).getTime() + 10 * 60 * 1000;
    if (Date.now() > expiresAt) {
      throw new Error("OTP expired");
    }

    // Hash the code from query to compare
    const hashedCode = hmacProcess(
      code as string,
      process.env.HMAC_VERIFICATION_CODE_SECRET as string,
    );

    if (hashedCode !== otp.code) {
      throw new Error("Invalid verification code");
    }

    // Mark user as verified
    await db
      .update(usersTable)
      .set({ isVerified: true })
      .where(eq(usersTable.id, user.id));
    await db.delete(otpTable).where(eq(otpTable.userId, user.id));
  } catch (error) {
    throw error;
  }
};

export const LoginService = async (email: string, password: string) => {
  try {
    const normalizedInput = email.toLowerCase().trim();

    //  Find user by email or username
    const [user] = await db
      .select()
      .from(usersTable)
      .where(
        or(
          eq(usersTable.email, normalizedInput),
          eq(usersTable.user_name, normalizedInput),
        ),
      );

    if (!user) throw new Error("User not found");

    //  Get or create login security row
    let [security] = await db
      .select()
      .from(loginSecurityTable)
      .where(eq(loginSecurityTable.userId, user.id));

    if (!security) {
      const now = new Date();

      await db.insert(loginSecurityTable).values({
        userId: user.id,
        failedAttempts: 0,
        createdAt: now,
        updatedAt: now,
      });

      security = {
        userId: user.id,
        failedAttempts: 0,
        createdAt: now,
        updatedAt: now,
      };
    }

    // Check if account is locked
    if (security.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      const lockExpires = new Date(
        security.createdAt.getTime() + LOCK_DURATION,
      );
      if (lockExpires > new Date()) {
        throw new Error(
          `Account locked due to too many failed attempts. Try again at ${lockExpires.toLocaleTimeString()}`,
        );
      } else {
        // Lock expired → reset counter
        await db
          .update(loginSecurityTable)
          .set({
            failedAttempts: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(loginSecurityTable.userId, user.id));

        // Reset local variable
        security.failedAttempts = 0;
        security.createdAt = new Date();
      }
    }

    //  Check if email is verified
    if (!user.isVerified) {
      const [otp] = await db
        .select()
        .from(otpTable)
        .where(eq(otpTable.userId, user.id));
      const isExpired =
        !otp || Date.now() > new Date(otp.createdAt).getTime() + 10 * 60 * 1000;

      if (isExpired) {
        const code = Otpcode();
        const hashedCode = hmacProcess(
          code,
          process.env.HMAC_VERIFICATION_CODE_SECRET as string,
        );
        await db.delete(otpTable).where(eq(otpTable.userId, user.id));
        await db.insert(otpTable).values({
          userId: user.id,
          email: user.email,
          code: hashedCode,
        });

        await emailworker.add(
          "send-email",
          {
            type: "otp",
            user: user,
            verificationLink: code,
          },
          {
            attempts: 3,
            backoff: { type: "exponential", delay: 3000 },
            removeOnComplete: true,
            removeOnFail: true,
          },
        );

        throw new Error(
          "Your OTP expired. A new verification code has been sent to your email. Please check your inbox.",
        );
      } else {
        throw new Error(
          "check your email box and verify your email before logging in.",
        );
      }
    }

    //  Check password
    const validPassword = await argon2.verify(user.password, password);

    if (!validPassword) {
      // Increment failed attempts
      await db
        .update(loginSecurityTable)
        .set({
          failedAttempts: security.failedAttempts + 1,
          createdAt:
            security.failedAttempts === 0 ? new Date() : security.createdAt,
          updatedAt: new Date(),
        })
        .where(eq(loginSecurityTable.userId, user.id));

      throw new Error("Invalid email or password");
    }

    //  Reset failedAttempts on successful login
    if (security.failedAttempts > 0) {
      await db
        .update(loginSecurityTable)
        .set({
          failedAttempts: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(loginSecurityTable.userId, user.id));
    }

    //  Generate tokens
    const accessToken = Tokens.accessToken(user);
    const refreshToken = Tokens.refreshToken(user);

    return { user, accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

export async function forgotPasswordService(email: string) {
  try {
    const normalizedInput = email.toLowerCase();
    const [user] = await db
      .select()
      .from(usersTable)
      .where(
        or(
          eq(usersTable.email, normalizedInput),
          eq(usersTable.user_name, normalizedInput),
        ),
      );

    if (!user) throw new Error("User not found");
    const code = Otpcode();
    const hashedCode = hmacProcess(
      code,
      process.env.HMAC_VERIFICATION_CODE_SECRET as string,
    );
    await db.delete(otpTable).where(eq(otpTable.userId, user.id));
    // save new OTP
    await db.insert(otpTable).values({
      userId: user.id,
      email: user.email,
      code: hashedCode,
    });

    await emailworker.add(
      "send-email",
      {
        type: "reset-password",
        user: user,
        verificationLink: code,
      },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 3000 },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
    return {
      email,
      message:
        "Password reset code sent to your email. the code will expire in the next 10mins",
    };
  } catch (error) {
    throw error;
  }
}

export async function verifyCodeService(email: string, code: string) {
  try {
    const normalizedInput = email.toLowerCase();
    const [user] = await db
      .select()
      .from(usersTable)
      .where(
        or(
          eq(usersTable.email, normalizedInput),
          eq(usersTable.user_name, normalizedInput),
        ),
      );
    if (!user) throw new Error("User not found");

    const [otp] = await db
      .select()
      .from(otpTable)
      .where(eq(otpTable.userId, user.id));
    if (!otp) throw new Error("OTP not found");

    const expiresAt = new Date(otp.createdAt).getTime() + 10 * 60 * 1000;
    if (Date.now() > expiresAt) throw new Error("OTP expired");

    const hashedCode = hmacProcess(
      code,
      process.env.HMAC_VERIFICATION_CODE_SECRET as string,
    );

    if (hashedCode !== otp.code) throw new Error("Invalid verification code");

    const forgetpasswordToken = jwt.sign(
      { id: user.id, email: user.email },
      FORGETPASSWORD_SEC,
      { expiresIn: "1hr" },
    );
    return { forgetpasswordToken };
  } catch (error) {
    throw error;
  }
}
export async function resetPasswordService(
  resetToken: string,
  newPassword: string,
  confirmNewpassword: string,
) {
  try {
    if (newPassword !== confirmNewpassword) {
      throw new Error("Passwords do not match");
    }

    // Verify JWT token
    const decoded = jwt.verify(resetToken, FORGETPASSWORD_SEC) as any;
    const userId = decoded.id;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!user) throw new Error("Invalid or expired reset token");

    const hashedPassword = await argon2.hash(newPassword);
    await db
      .update(usersTable)
      .set({ password: hashedPassword })
      .where(eq(usersTable.id, userId));

    await db.delete(otpTable).where(eq(otpTable.userId, userId));
  } catch (error) {
    throw error;
  }
}
