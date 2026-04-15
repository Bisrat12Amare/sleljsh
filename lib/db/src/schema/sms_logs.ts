import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const smsLogsTable = pgTable("sms_logs", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  childId: integer("child_id"),
  status: text("status").notNull().default("simulated"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSmsLogSchema = createInsertSchema(smsLogsTable).omit({ id: true, createdAt: true });
export type InsertSmsLog = z.infer<typeof insertSmsLogSchema>;
export type SmsLog = typeof smsLogsTable.$inferSelect;
