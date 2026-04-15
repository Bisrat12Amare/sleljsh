import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, childrenTable } from "@workspace/db";
import { CreateChildBody, GetChildParams, UpdateChildParams, UpdateChildBody, DeleteChildParams } from "@workspace/api-zod";
import { differenceInMonths, parseISO } from "date-fns";

const router: IRouter = Router();

function getAgeMonths(dateOfBirth: string): number {
  try {
    return Math.max(0, differenceInMonths(new Date(), parseISO(dateOfBirth)));
  } catch {
    return 0;
  }
}

function formatChild(child: typeof childrenTable.$inferSelect) {
  return {
    id: child.id,
    userId: child.userId,
    name: child.name,
    gender: child.gender,
    dateOfBirth: child.dateOfBirth,
    ageMonths: getAgeMonths(child.dateOfBirth),
    createdAt: child.createdAt.toISOString(),
  };
}

router.get("/children", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  let userId: number | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.slice(7);
      const decoded = Buffer.from(token, "base64").toString("utf-8");
      const payload = JSON.parse(decoded);
      userId = payload.userId;
    } catch {
      // ignore
    }
  }

  if (!userId) {
    res.json([]);
    return;
  }

  const children = await db.select().from(childrenTable).where(eq(childrenTable.userId, userId));
  res.json(children.map(formatChild));
});

router.post("/children", async (req, res): Promise<void> => {
  const parsed = CreateChildBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [child] = await db.insert(childrenTable).values(parsed.data).returning();
  res.status(201).json(formatChild(child));
});

router.get("/children/:id", async (req, res): Promise<void> => {
  const params = GetChildParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [child] = await db.select().from(childrenTable).where(eq(childrenTable.id, params.data.id));
  if (!child) {
    res.status(404).json({ error: "Child not found" });
    return;
  }

  res.json(formatChild(child));
});

router.patch("/children/:id", async (req, res): Promise<void> => {
  const params = UpdateChildParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateChildBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [child] = await db
    .update(childrenTable)
    .set(parsed.data)
    .where(eq(childrenTable.id, params.data.id))
    .returning();

  if (!child) {
    res.status(404).json({ error: "Child not found" });
    return;
  }

  res.json(formatChild(child));
});

router.delete("/children/:id", async (req, res): Promise<void> => {
  const params = { id: parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10) };
  if (isNaN(params.id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [child] = await db.delete(childrenTable).where(eq(childrenTable.id, params.id)).returning();
  if (!child) {
    res.status(404).json({ error: "Child not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
