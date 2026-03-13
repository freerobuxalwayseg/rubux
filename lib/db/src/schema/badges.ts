import { pgTable, serial, varchar, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const badgesTable = pgTable("badges", {
  id: serial("id").primaryKey(),
  badgeName: varchar("badge_name", { length: 100 }).notNull(),
  badgeNameAr: varchar("badge_name_ar", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 10 }).notNull(),
  descriptionAr: text("description_ar"),
  requiredInvites: integer("required_invites").default(0).notNull(),
});

export const userBadgesTable = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  badgeId: integer("badge_id").references(() => badgesTable.id).notNull(),
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
});

export const insertBadgeSchema = createInsertSchema(badgesTable).omit({ id: true });
export const insertUserBadgeSchema = createInsertSchema(userBadgesTable).omit({ id: true, awardedAt: true });
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badgesTable.$inferSelect;
export type UserBadge = typeof userBadgesTable.$inferSelect;
