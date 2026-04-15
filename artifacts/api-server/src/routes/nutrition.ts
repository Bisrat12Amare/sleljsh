import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, nutritionTipsTable } from "@workspace/db";
import { GetNutritionTipsQueryParams, GetMealPlanQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/nutrition", async (req, res): Promise<void> => {
  const params = GetNutritionTipsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let tips;
  if (params.data.ageGroup) {
    tips = await db.select().from(nutritionTipsTable).where(eq(nutritionTipsTable.ageGroup, params.data.ageGroup));
  } else {
    tips = await db.select().from(nutritionTipsTable);
  }

  res.json(tips);
});

router.get("/nutrition/meal-plan", async (req, res): Promise<void> => {
  const params = GetMealPlanQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  // Determine age group based on ageMonths
  const ageMonths = params.data.ageMonths ?? 12;
  let ageGroup = "6-12 months";
  if (ageMonths < 6) ageGroup = "0-6 months";
  else if (ageMonths < 12) ageGroup = "6-12 months";
  else if (ageMonths < 24) ageGroup = "1-2 years";
  else if (ageMonths < 60) ageGroup = "2-5 years";
  else ageGroup = "5+ years";

  const allTips = await db
    .select()
    .from(nutritionTipsTable)
    .where(eq(nutritionTipsTable.ageGroup, ageGroup));

  const breakfast = allTips.filter((t) => t.mealType === "breakfast");
  const lunch = allTips.filter((t) => t.mealType === "lunch");
  const dinner = allTips.filter((t) => t.mealType === "dinner");

  res.json({ ageGroup, breakfast, lunch, dinner });
});

export default router;
