import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { rewardsTable } from "./rewards";

export const redemptionStatusEnum = pgEnum("redemption_status", ["pending", "completed", "rejected"]);

export const redemptionsTable = pgTable("redemptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  rewardId: integer("reward_id").references(() => rewardsTable.id).notNull(),
  status: redemptionStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRedemptionSchema = createInsertSchema(redemptionsTable).omit({ id: true, createdAt: true });
export type InsertRedemption = z.infer<typeof insertRedemptionSchema>;
export type Redemption = typeof redemptionsTable.$inferSelect;
