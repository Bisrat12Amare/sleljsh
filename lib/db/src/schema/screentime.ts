import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { childrenTable } from "./children";

export const screenTimeTable = pgTable("screen_time", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").notNull().references(() => childrenTable.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  minutes: integer("minutes").notNull(),
  limitMinutes: integer("limit_minutes").notNull().default(60),
  exceeded: boolean("exceeded").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertScreenTimeSchema = createInsertSchema(screenTimeTable).omit({ id: true, createdAt: true });
export type InsertScreenTime = z.infer<typeof insertScreenTimeSchema>;
export type ScreenTime = typeof screenTimeTable.$inferSelect;
