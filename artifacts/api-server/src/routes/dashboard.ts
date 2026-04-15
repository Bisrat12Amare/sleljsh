import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, childrenTable, vaccinationsTable, growthRecordsTable, screenTimeTable, parentingTipsTable } from "@workspace/db";
import { GetDashboardSummaryQueryParams } from "@workspace/api-zod";
import { differenceInMonths, parseISO } from "date-fns";

const router: IRouter = Router();

function getAgeMonths(dateOfBirth: string): number {
  try {
    return Math.max(0, differenceInMonths(new Date(), parseISO(dateOfBirth)));
  } catch {
    return 0;
  }
}

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const params = GetDashboardSummaryQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const childId = params.data.childId;
  if (!childId) {
    res.status(400).json({ error: "childId is required" });
    return;
  }

  const [child] = await db.select().from(childrenTable).where(eq(childrenTable.id, childId));
  if (!child) {
    res.status(404).json({ error: "Child not found" });
    return;
  }

  const vaccinations = await db.select().from(vaccinationsTable).where(eq(vaccinationsTable.childId, childId));
  const upcomingVaccinations = vaccinations.filter((v) => v.status === "upcoming").length;
  const completedVaccinations = vaccinations.filter((v) => v.status === "completed").length;

  const growthRecords = await db
    .select()
    .from(growthRecordsTable)
    .where(eq(growthRecordsTable.childId, childId));

  growthRecords.sort((a, b) => b.date.localeCompare(a.date));
  const latestGrowth = growthRecords[0] ?? null;

  const today = new Date().toISOString().split("T")[0];
  const screenTimeRecords = await db.select().from(screenTimeTable).where(eq(screenTimeTable.childId, childId));
  const todayRecord = screenTimeRecords.find((r) => r.date === today);

  const allTips = await db.select().from(parentingTipsTable);
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const dailyTip = allTips.length > 0 ? allTips[dayOfYear % allTips.length] : null;

  const ageMonths = getAgeMonths(child.dateOfBirth);
  let ageGroup = "1-2 years";
  if (ageMonths < 6) ageGroup = "0-6 months";
  else if (ageMonths < 12) ageGroup = "6-12 months";
  else if (ageMonths < 24) ageGroup = "1-2 years";
  else if (ageMonths < 60) ageGroup = "2-5 years";
  else ageGroup = "5+ years";

  res.json({
    child: {
      id: child.id,
      userId: child.userId,
      name: child.name,
      gender: child.gender,
      dateOfBirth: child.dateOfBirth,
      ageMonths,
      createdAt: child.createdAt.toISOString(),
    },
    upcomingVaccinations,
    completedVaccinations,
    latestGrowth: latestGrowth ? {
      id: latestGrowth.id,
      childId: latestGrowth.childId,
      date: latestGrowth.date,
      heightCm: latestGrowth.heightCm,
      weightKg: latestGrowth.weightKg,
      ageMonths: latestGrowth.ageMonths,
      notes: latestGrowth.notes ?? null,
    } : null,
    todayScreenTime: todayRecord?.minutes ?? 0,
    screenTimeLimit: todayRecord?.limitMinutes ?? 60,
    screenTimeExceeded: todayRecord?.exceeded ?? false,
    dailyTip: dailyTip ? {
      id: dailyTip.id,
      category: dailyTip.category,
      title: dailyTip.title,
      titleAm: dailyTip.titleAm,
      content: dailyTip.content,
      contentAm: dailyTip.contentAm,
      ageGroup: dailyTip.ageGroup ?? null,
    } : null,
    recentNutritionPlan: ageGroup,
  });
});

export default router;
