import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { childrenTable } from "./children";

export const vaccinationsTable = pgTable("vaccinations", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").notNull().references(() => childrenTable.id, { onDelete: "cascade" }),
  vaccineName: text("vaccine_name").notNull(),
  vaccineNameAm: text("vaccine_name_am").notNull(),
  scheduledAge: text("scheduled_age").notNull(),
  scheduledDate: text("scheduled_date"),
  completedDate: text("completed_date"),
  status: text("status").notNull().default("upcoming"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertVaccinationSchema = createInsertSchema(vaccinationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVaccination = z.infer<typeof insertVaccinationSchema>;
export type Vaccination = typeof vaccinationsTable.$inferSelect;
