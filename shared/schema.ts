import { pgTable, text, serial, timestamp, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  amount: real("amount").notNull(),
  type: text("type").notNull(), // 'income' or 'expense'
  date: timestamp("date").defaultNow().notNull(),
  userId: serial("user_id").references(() => users.id),
});

export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertTransactionSchema = createInsertSchema(transactions, {
  name: (schema) => schema.min(1, "Name must not be empty"),
  amount: (schema) => schema.nonnegative("Amount must be a non-negative number"),
  type: (schema) => schema.refine(val => ["income", "expense"].includes(val), {
    message: "Type must be either 'income' or 'expense'"
  }),
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Schema for local storage transactions (without user and id)
export const localTransactionSchema = z.object({
  name: z.string().min(1, "Name must not be empty"),
  amount: z.number().nonnegative("Amount must be a non-negative number"),
  type: z.enum(["income", "expense"]),
  date: z.string(),
  id: z.string(),
  createdAt: z.string().optional(),
});

export type LocalTransaction = z.infer<typeof localTransactionSchema>;
