import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const parentingTipsTable = pgTable("parenting_tips", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  titleAm: text("title_am").notNull(),
  content: text("content").notNull(),
  contentAm: text("content_am").notNull(),
  ageGroup: text("age_group"),
});

export const insertParentingTipSchema = createInsertSchema(parentingTipsTable).omit({ id: true });
export type InsertParentingTip = z.infer<typeof insertParentingTipSchema>;
export type ParentingTip = typeof parentingTipsTable.$inferSelect;
