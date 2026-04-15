import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, parentingTipsTable } from "@workspace/db";
import { GetTipsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/tips/daily", async (_req, res): Promise<void> => {
  const allTips = await db.select().from(parentingTipsTable);
  if (allTips.length === 0) {
    res.status(404).json({ error: "No tips available" });
    return;
  }

  // Return a tip based on the day of the year for consistency
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const tip = allTips[dayOfYear % allTips.length];

  res.json({
    id: tip.id,
    category: tip.category,
    title: tip.title,
    titleAm: tip.titleAm,
    content: tip.content,
    contentAm: tip.contentAm,
    ageGroup: tip.ageGroup ?? null,
  });
});

router.get("/tips", async (req, res): Promise<void> => {
  const params = GetTipsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let tips;
  if (params.data.category) {
    tips = await db.select().from(parentingTipsTable).where(eq(parentingTipsTable.category, params.data.category));
  } else {
    tips = await db.select().from(parentingTipsTable);
  }

  res.json(tips.map((t) => ({
    id: t.id,
    category: t.category,
    title: t.title,
    titleAm: t.titleAm,
    content: t.content,
    contentAm: t.contentAm,
    ageGroup: t.ageGroup ?? null,
  })));
});

export default router;
