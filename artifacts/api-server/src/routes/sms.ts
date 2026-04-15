import { Router, type IRouter } from "express";
import { db, smsLogsTable } from "@workspace/db";
import { SendSmsReminderBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/sms/send-reminder", async (req, res): Promise<void> => {
  const parsed = SendSmsReminderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { phone, message, childId } = parsed.data;

  // Log the simulated SMS (in production, integrate with Twilio or Africa's Talking)
  logger.info({ phone, message, childId }, "SIMULATED SMS: Would send message to phone");

  await db.insert(smsLogsTable).values({
    phone,
    message,
    childId: childId ?? null,
    status: "simulated",
  });

  const loggedAt = new Date().toISOString();

  res.json({
    success: true,
    message: `SMS reminder simulated for ${phone}. Message: "${message}"`,
    loggedAt,
  });
});

export default router;
