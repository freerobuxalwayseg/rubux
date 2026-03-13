import { pgTable, serial, varchar, integer, boolean, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const rewardsTable = pgTable("rewards", {
  id: serial("id").primaryKey(),
  rewardName: varchar("reward_name", { length: 100 }).notNull(),
  rewardNameAr: varchar("reward_name_ar", { length: 100 }).notNull(),
  pointsCost: integer("points_cost").notNull(),
  robuxValue: integer("robux_value").notNull(),
  imageUrl: varchar("image_url", { length: 255 }),
  requiredLevel: integer("required_level").default(1).notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),
  descriptionAr: text("description_ar"),
});

export const insertRewardSchema = createInsertSchema(rewardsTable).omit({ id: true });
export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Reward = typeof rewardsTable.$inferSelect;
