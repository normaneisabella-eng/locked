import { Router, type IRouter } from "express";
import { eq, desc, and, gte, lt, count } from "drizzle-orm";
import { db, checkinsTable, usersTable } from "@workspace/db";
import {
  CreateCheckinBody,
  ListMyCheckinsQueryParams,
  ListMyCheckinsResponse,
  GetTodayCheckinResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/checkins", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId;
  const params = ListMyCheckinsQueryParams.safeParse(req.query);
  const page = params.success ? (params.data.page ?? 1) : 1;
  const limit = params.success ? (params.data.limit ?? 20) : 20;
  const offset = (page - 1) * limit;

  const [totalResult, checkins] = await Promise.all([
    db.select({ count: count() }).from(checkinsTable).where(eq(checkinsTable.userId, userId)),
    db
      .select()
      .from(checkinsTable)
      .where(eq(checkinsTable.userId, userId))
      .orderBy(desc(checkinsTable.createdAt))
      .limit(limit)
      .offset(offset),
  ]);

  res.json(
    ListMyCheckinsResponse.parse({
      checkins,
      total: totalResult[0]?.count ?? 0,
      page,
      limit,
    }),
  );
});

router.post("/checkins", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId;
  const parsed = CreateCheckinBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.userId, userId));
  if (!user) {
    res.status(400).json({ error: "User profile not found. Complete onboarding first." });
    return;
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const [existing] = await db
    .select()
    .from(checkinsTable)
    .where(
      and(
        eq(checkinsTable.userId, userId),
        gte(checkinsTable.createdAt, todayStart),
        lt(checkinsTable.createdAt, tomorrowStart),
      ),
    );

  if (existing) {
    res.status(400).json({ error: "Already checked in today." });
    return;
  }

  const [checkin] = await db
    .insert(checkinsTable)
    .values({
      userId,
      sport: user.sport,
      focusScore: parsed.data.focusScore,
      confidenceScore: parsed.data.confidenceScore,
      energyScore: parsed.data.energyScore,
      note: parsed.data.note ?? null,
    })
    .returning();

  res.status(201).json(checkin);
});

router.get("/checkins/today", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const [existing] = await db
    .select()
    .from(checkinsTable)
    .where(
      and(
        eq(checkinsTable.userId, userId),
        gte(checkinsTable.createdAt, todayStart),
        lt(checkinsTable.createdAt, tomorrowStart),
      ),
    );

  res.json(GetTodayCheckinResponse.parse({ checkin: existing ?? null }));
});

export default router;
