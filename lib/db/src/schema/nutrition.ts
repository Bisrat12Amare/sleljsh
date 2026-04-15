import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const nutritionTipsTable = pgTable("nutrition_tips", {
  id: serial("id").primaryKey(),
  ageGroup: text("age_group").notNull(),
  mealType: text("meal_type").notNull(),
  foodName: text("food_name").notNull(),
  foodNameAm: text("food_name_am").notNull(),
  description: text("description").notNull(),
  calories: integer("calories"),
});

export const insertNutritionTipSchema = createInsertSchema(nutritionTipsTable).omit({ id: true });
export type InsertNutritionTip = z.infer<typeof insertNutritionTipSchema>;
export type NutritionTip = typeof nutritionTipsTable.$inferSelect;
