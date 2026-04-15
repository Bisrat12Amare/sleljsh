import { pgTable, text, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { childrenTable } from "./children";

export const growthRecordsTable = pgTable("growth_records", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").notNull().references(() => childrenTable.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  heightCm: real("height_cm").notNull(),
  weightKg: real("weight_kg").notNull(),
  ageMonths: integer("age_months").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGrowthRecordSchema = createInsertSchema(growthRecordsTable).omit({ id: true, createdAt: true });
export type InsertGrowthRecord = z.infer<typeof insertGrowthRecordSchema>;
export type GrowthRecord = typeof growthRecordsTable.$inferSelect;
