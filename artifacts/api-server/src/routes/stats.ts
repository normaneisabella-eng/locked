import { Router, type IRouter } from "express";
import { eq, desc, avg, count, sql } from "drizzle-orm";
import { db, checkinsTable } from "@workspace/db";
import { GetMyStatsResponse, GetMyTrendResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/stats/me", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).userId;

  const allCheckins = await db
    .select()
    .from(checkinsTable)
    .where(eq(checkinsTable.clerkId, clerkId))
    .orderBy(desc(checkinsTable.createdAt));

  const totalCheckins = allCheckins.length;

  if (totalCheckins === 0) {
    res.json(
      GetMyStatsResponse.parse({
        totalCheckins: 0,
        currentStreak: 0,
        longestStreak: 0,
        avgFocus: 0,
        avgConfidence: 0,
        avgEnergy: 0,
        avgOverall: 0,
      }),
    );
    return;
  }

  // Calculate streaks — checkins ordered newest first
  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build set of unique dates (YYYY-MM-DD)
  const dates = new Set(
    allCheckins.map((c) => c.createdAt.toISOString().slice(0, 10)),
  );

  // Streak calculation: count consecutive days going back from today
  let checkDate = new Date(today);
  while (true) {
    const dateStr = checkDate.toISOString().slice(0, 10);
    if (dates.has(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Longest streak
  const sortedDates = Array.from(dates).sort();
  let tempStreak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, 1, currentStreak);

  const avgFocus =
    allCheckins.reduce((s, c) => s + c.focusScore, 0) / totalCheckins;
  const avgConfidence =
    allCheckins.reduce((s, c) => s + c.confidenceScore, 0) / totalCheckins;
  const avgEnergy =
    allCheckins.reduce((s, c) => s + c.energyScore, 0) / totalCheckins;
  const avgOverall = (avgFocus + avgConfidence + avgEnergy) / 3;

  res.json(
    GetMyStatsResponse.parse({
      totalCheckins,
      currentStreak,
      longestStreak,
      avgFocus: Math.round(avgFocus * 10) / 10,
      avgConfidence: Math.round(avgConfidence * 10) / 10,
      avgEnergy: Math.round(avgEnergy * 10) / 10,
      avgOverall: Math.round(avgOverall * 10) / 10,
    }),
  );
});

router.get("/stats/me/trend", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).userId;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const checkins = await db
    .select()
    .from(checkinsTable)
    .where(
      sql`${checkinsTable.clerkId} = ${clerkId} AND ${checkinsTable.createdAt} >= ${thirtyDaysAgo}`,
    )
    .orderBy(checkinsTable.createdAt);

  // Group by date
  const byDate = new Map<
    string,
    { focus: number[]; confidence: number[]; energy: number[] }
  >();

  for (const c of checkins) {
    const date = c.createdAt.toISOString().slice(0, 10);
    if (!byDate.has(date)) {
      byDate.set(date, { focus: [], confidence: [], energy: [] });
    }
    const entry = byDate.get(date)!;
    entry.focus.push(c.focusScore);
    entry.confidence.push(c.confidenceScore);
    entry.energy.push(c.energyScore);
  }

  const trend = Array.from(byDate.entries()).map(([date, vals]) => {
    const avgF = vals.focus.reduce((a, b) => a + b, 0) / vals.focus.length;
    const avgC =
      vals.confidence.reduce((a, b) => a + b, 0) / vals.confidence.length;
    const avgE = vals.energy.reduce((a, b) => a + b, 0) / vals.energy.length;
    return {
      date,
      focusScore: Math.round(avgF * 10) / 10,
      confidenceScore: Math.round(avgC * 10) / 10,
      energyScore: Math.round(avgE * 10) / 10,
      overall: Math.round(((avgF + avgC + avgE) / 3) * 10) / 10,
    };
  });

  res.json(GetMyTrendResponse.parse(trend));
});

export default router;
