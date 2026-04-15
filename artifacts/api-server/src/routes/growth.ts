import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, growthRecordsTable } from "@workspace/db";
import {
  GetGrowthRecordsQueryParams,
  CreateGrowthRecordBody,
  DeleteGrowthRecordParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/growth", async (req, res): Promise<void> => {
  const params = GetGrowthRecordsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let records;
  if (params.data.childId) {
    records = await db.select().from(growthRecordsTable).where(eq(growthRecordsTable.childId, params.data.childId));
  } else {
    records = await db.select().from(growthRecordsTable);
  }

  records.sort((a, b) => a.date.localeCompare(b.date));

  res.json(records.map((r) => ({
    id: r.id,
    childId: r.childId,
    date: r.date,
    heightCm: r.heightCm,
    weightKg: r.weightKg,
    ageMonths: r.ageMonths,
    notes: r.notes ?? null,
  })));
});

router.post("/growth", async (req, res): Promise<void> => {
  const parsed = CreateGrowthRecordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [record] = await db
    .insert(growthRecordsTable)
    .values({
      childId: parsed.data.childId,
      date: parsed.data.date,
      heightCm: parsed.data.heightCm,
      weightKg: parsed.data.weightKg,
      ageMonths: parsed.data.ageMonths,
      notes: parsed.data.notes ?? null,
    })
    .returning();

  res.status(201).json({
    id: record.id,
    childId: record.childId,
    date: record.date,
    heightCm: record.heightCm,
    weightKg: record.weightKg,
    ageMonths: record.ageMonths,
    notes: record.notes ?? null,
  });
});

router.delete("/growth/:id", async (req, res): Promise<void> => {
  const params = DeleteGrowthRecordParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [record] = await db
    .delete(growthRecordsTable)
    .where(eq(growthRecordsTable.id, params.data.id))
    .returning();

  if (!record) {
    res.status(404).json({ error: "Growth record not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
