import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const paymentMethodEnum = pgEnum("payment_method", ["visa", "vodafone", "orange", "etisalat"]);
export const withdrawalStatusEnum = pgEnum("withdrawal_status", ["pending", "processing", "completed", "rejected"]);

export const withdrawalsTable = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  amountRobux: integer("amount_robux").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentDetailsEncrypted: text("payment_details_encrypted").notNull(),
  status: withdrawalStatusEnum("status").default("pending").notNull(),
  rejectionReason: text("rejection_reason"),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});

export const insertWithdrawalSchema = createInsertSchema(withdrawalsTable).omit({ id: true, requestedAt: true });
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type Withdrawal = typeof withdrawalsTable.$inferSelect;
