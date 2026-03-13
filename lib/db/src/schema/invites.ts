import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const invitesTable = pgTable("invites", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").references(() => usersTable.id).notNull(),
  invitedUserId: integer("invited_user_id").references(() => usersTable.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInviteSchema = createInsertSchema(invitesTable).omit({ id: true, createdAt: true });
export type InsertInvite = z.infer<typeof insertInviteSchema>;
export type Invite = typeof invitesTable.$inferSelect;
