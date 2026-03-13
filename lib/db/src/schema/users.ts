import { pgTable, serial, varchar, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  email: varchar("email", { length: 100 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  points: integer("points").default(100000).notNull(),
  robuxBalance: integer("robux_balance").default(0).notNull(),
  inviteCode: varchar("invite_code", { length: 20 }).unique().notNull(),
  invitedBy: integer("invited_by").references((): any => usersTable.id),
  totalInvites: integer("total_invites").default(0).notNull(),
  weeklyInvites: integer("weekly_invites").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  registrationIp: varchar("registration_ip", { length: 45 }),
  lastDailyReward: date("last_daily_reward"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
