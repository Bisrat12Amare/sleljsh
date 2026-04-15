import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, vaccinationsTable } from "@workspace/db";
import {
  GetVaccinationsQueryParams,
  CreateVaccinationBody,
  UpdateVaccinationParams,
  UpdateVaccinationBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

// Ethiopian vaccination schedule (EPI - Expanded Programme on Immunization)
const ETHIOPIAN_VACCINE_SCHEDULE = [
  {
    vaccineName: "BCG",
    vaccineNameAm: "ቢሲጂ",
    scheduledAge: "At birth",
    description: "Protects against tuberculosis (TB)",
    doses: 1,
  },
  {
    vaccineName: "OPV 0 (Oral Polio Vaccine)",
    vaccineNameAm: "ኦፒቪ 0",
    scheduledAge: "At birth",
    description: "First dose of oral polio vaccine",
    doses: 1,
  },
  {
    vaccineName: "Hepatitis B (HepB)",
    vaccineNameAm: "ሄፓቲስ ቢ",
    scheduledAge: "At birth",
    description: "Protects against Hepatitis B virus",
    doses: 1,
  },
  {
    vaccineName: "Pentavalent 1 (DPT-HepB-Hib)",
    vaccineNameAm: "ፔንታቫሌንት 1",
    scheduledAge: "6 weeks",
    description: "Protects against diphtheria, pertussis, tetanus, hepatitis B, and Hib",
    doses: 3,
  },
  {
    vaccineName: "OPV 1",
    vaccineNameAm: "ኦፒቪ 1",
    scheduledAge: "6 weeks",
    description: "Second dose of oral polio vaccine",
    doses: 1,
  },
  {
    vaccineName: "PCV 1 (Pneumococcal)",
    vaccineNameAm: "ፒሲቪ 1",
    scheduledAge: "6 weeks",
    description: "Protects against pneumococcal disease",
    doses: 3,
  },
  {
    vaccineName: "Rotavirus 1",
    vaccineNameAm: "ሮታቫይረስ 1",
    scheduledAge: "6 weeks",
    description: "Protects against rotavirus diarrhea",
    doses: 2,
  },
  {
    vaccineName: "Pentavalent 2",
    vaccineNameAm: "ፔንታቫሌንት 2",
    scheduledAge: "10 weeks",
    description: "Second dose of pentavalent vaccine",
    doses: 3,
  },
  {
    vaccineName: "OPV 2",
    vaccineNameAm: "ኦፒቪ 2",
    scheduledAge: "10 weeks",
    description: "Third dose of oral polio vaccine",
    doses: 1,
  },
  {
    vaccineName: "PCV 2",
    vaccineNameAm: "ፒሲቪ 2",
    scheduledAge: "10 weeks",
    description: "Second dose of pneumococcal vaccine",
    doses: 3,
  },
  {
    vaccineName: "Rotavirus 2",
    vaccineNameAm: "ሮታቫይረስ 2",
    scheduledAge: "10 weeks",
    description: "Second dose of rotavirus vaccine",
    doses: 2,
  },
  {
    vaccineName: "Pentavalent 3",
    vaccineNameAm: "ፔንታቫሌንት 3",
    scheduledAge: "14 weeks",
    description: "Third dose of pentavalent vaccine",
    doses: 3,
  },
  {
    vaccineName: "OPV 3",
    vaccineNameAm: "ኦፒቪ 3",
    scheduledAge: "14 weeks",
    description: "Fourth dose of oral polio vaccine",
    doses: 1,
  },
  {
    vaccineName: "PCV 3",
    vaccineNameAm: "ፒሲቪ 3",
    scheduledAge: "14 weeks",
    description: "Third dose of pneumococcal vaccine",
    doses: 3,
  },
  {
    vaccineName: "IPV (Inactivated Polio Vaccine)",
    vaccineNameAm: "አይፒቪ",
    scheduledAge: "14 weeks",
    description: "Inactivated polio vaccine for additional protection",
    doses: 1,
  },
  {
    vaccineName: "Measles-Rubella (MR) 1",
    vaccineNameAm: "ኩፍኝ-ሩቤላ 1",
    scheduledAge: "9 months",
    description: "First dose against measles and rubella",
    doses: 2,
  },
  {
    vaccineName: "Vitamin A",
    vaccineNameAm: "ቪታሚን ኤ",
    scheduledAge: "9 months",
    description: "Vitamin A supplementation for immune support",
    doses: 1,
  },
  {
    vaccineName: "Measles-Rubella (MR) 2",
    vaccineNameAm: "ኩፍኝ-ሩቤላ 2",
    scheduledAge: "18 months",
    description: "Second dose against measles and rubella",
    doses: 2,
  },
];

router.get("/vaccinations/schedule", async (_req, res): Promise<void> => {
  res.json(ETHIOPIAN_VACCINE_SCHEDULE);
});

router.get("/vaccinations", async (req, res): Promise<void> => {
  const params = GetVaccinationsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let records;
  if (params.data.childId) {
    records = await db.select().from(vaccinationsTable).where(eq(vaccinationsTable.childId, params.data.childId));
  } else {
    records = await db.select().from(vaccinationsTable);
  }

  res.json(records.map((r) => ({
    id: r.id,
    childId: r.childId,
    vaccineName: r.vaccineName,
    vaccineNameAm: r.vaccineNameAm,
    scheduledAge: r.scheduledAge,
    scheduledDate: r.scheduledDate ?? null,
    completedDate: r.completedDate ?? null,
    status: r.status,
    notes: r.notes ?? null,
  })));
});

router.post("/vaccinations", async (req, res): Promise<void> => {
  const parsed = CreateVaccinationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [record] = await db
    .insert(vaccinationsTable)
    .values({
      childId: parsed.data.childId,
      vaccineName: parsed.data.vaccineName,
      vaccineNameAm: parsed.data.vaccineNameAm,
      scheduledAge: parsed.data.scheduledAge,
      scheduledDate: parsed.data.scheduledDate ?? null,
      notes: parsed.data.notes ?? null,
      status: "upcoming",
    })
    .returning();

  res.status(201).json({
    id: record.id,
    childId: record.childId,
    vaccineName: record.vaccineName,
    vaccineNameAm: record.vaccineNameAm,
    scheduledAge: record.scheduledAge,
    scheduledDate: record.scheduledDate ?? null,
    completedDate: record.completedDate ?? null,
    status: record.status,
    notes: record.notes ?? null,
  });
});

router.patch("/vaccinations/:id", async (req, res): Promise<void> => {
  const params = UpdateVaccinationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateVaccinationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.completedDate !== undefined) updateData.completedDate = parsed.data.completedDate;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;

  const [record] = await db
    .update(vaccinationsTable)
    .set(updateData)
    .where(eq(vaccinationsTable.id, params.data.id))
    .returning();

  if (!record) {
    res.status(404).json({ error: "Vaccination record not found" });
    return;
  }

  res.json({
    id: record.id,
    childId: record.childId,
    vaccineName: record.vaccineName,
    vaccineNameAm: record.vaccineNameAm,
    scheduledAge: record.scheduledAge,
    scheduledDate: record.scheduledDate ?? null,
    completedDate: record.completedDate ?? null,
    status: record.status,
    notes: record.notes ?? null,
  });
});

export default router;
