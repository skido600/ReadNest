import {
  uuid,
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";

// Users table
export const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: text().notNull(),

  country: text(),
  role: varchar({ length: 50 }).default("user"),
  otp: text(),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
//points
export const pointsTable = pgTable("points", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  type: varchar({ length: 50 }).notNull(),
  amount: integer("amount").notNull(), // positive number
  reference: text(), // e.g., Paystack transaction id or bookId
  createdAt: timestamp("created_at").defaultNow(),
});
//history
export const historyTable = pgTable("history", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  bookId: uuid("book_id")
    .notNull()
    .references(() => booksTable.id, { onDelete: "cascade" }),
  readAt: timestamp("read_at").defaultNow(),
});
export const otpTable = pgTable("otp", {
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  email: varchar({ length: 255 }).notNull(),
  code: text("code").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
// User sessions table
export const userSession = pgTable("user_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  refreshToken: text("refresh_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  lastSeen: timestamp("last_seen").defaultNow().notNull(), // <-- new
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const bookStatusEnum = pgEnum("book_status", [
  "processing",
  "ready",
  "failed",
]);

// Books table
export const booksTable = pgTable("books", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text().notNull(),
  author: text().notNull(),
  description: text().notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  category: text("category").default("Thriller").notNull(),
  isFeatured: boolean("is_featured").notNull().default(false),

  // Filled in later by the worker, so they must be nullable
  filePath: text(),
  filePublicId: text(),
  coverphoto: text(),
  coverPublicId: text(),

  status: bookStatusEnum("status").notNull().default("ready"),
  pageCount: integer("page_count"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const loginSecurityTable = pgTable("login_security", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  failedAttempts: integer("failed_attempts").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
