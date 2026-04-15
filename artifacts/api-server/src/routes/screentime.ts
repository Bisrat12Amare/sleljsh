import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, screenTimeTable } from "@workspace/db";
import {
  GetScreenTimeRecordsQueryParams,
  CreateScreenTimeRecordBody,
  GetWeeklyScreenTimeSummaryQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/screentime", async (req, res): Promise<void> => {
  const params = GetScreenTimeRecordsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let records;
  if (params.data.childId) {
    records = await db.select().from(screenTimeTable).where(eq(screenTimeTable.childId, params.data.childId));
  } else {
    records = await db.select().from(screenTimeTable);
  }

  records.sort((a, b) => b.date.localeCompare(a.date));

  res.json(records.map((r) => ({
    id: r.id,
    childId: r.childId,
    date: r.date,
    minutes: r.minutes,
    limitMinutes: r.limitMinutes,
    exceeded: r.exceeded,
  })));
});

router.post("/screentime", async (req, res): Promise<void> => {
  const parsed = CreateScreenTimeRecordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const exceeded = parsed.data.minutes > parsed.data.limitMinutes;

  const [record] = await db
    .insert(screenTimeTable)
    .values({
      childId: parsed.data.childId,
      date: parsed.data.date,
      minutes: parsed.data.minutes,
      limitMinutes: parsed.data.limitMinutes,
      exceeded,
    })
    .returning();

  res.status(201).json({
    id: record.id,
    childId: record.childId,
    date: record.date,
    minutes: record.minutes,
    limitMinutes: record.limitMinutes,
    exceeded: record.exceeded,
  });
});

router.get("/screentime/weekly-summary", async (req, res): Promise<void> => {
  const params = GetWeeklyScreenTimeSummaryQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const childId = params.data.childId ?? 0;

  // Get last 7 days
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  let allRecords = childId
    ? await db.select().from(screenTimeTable).where(eq(screenTimeTable.childId, childId))
    : await db.select().from(screenTimeTable);

  const weekRecords = allRecords.filter((r) => {
    const recordDate = new Date(r.date);
    return recordDate >= sevenDaysAgo && recordDate <= today;
  });

  weekRecords.sort((a, b) => b.date.localeCompare(a.date));

  const weekTotal = weekRecords.reduce((sum, r) => sum + r.minutes, 0);
  const dailyAverage = weekRecords.length > 0 ? Math.round(weekTotal / weekRecords.length) : 0;
  const daysExceeded = weekRecords.filter((r) => r.exceeded).length;

  res.json({
    childId,
    weekTotal,
    dailyAverage,
    daysExceeded,
    records: weekRecords.map((r) => ({
      id: r.id,
      childId: r.childId,
      date: r.date,
      minutes: r.minutes,
      limitMinutes: r.limitMinutes,
      exceeded: r.exceeded,
    })),
  });
});

export default router;
