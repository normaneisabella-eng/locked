import { Router, type IRouter } from "express";
import { eq, desc, count } from "drizzle-orm";
import { db, checkinsTable } from "@workspace/db";
import { GetCommunityFeedQueryParams, GetCommunityFeedResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/feed", async (req, res): Promise<void> => {
  const params = GetCommunityFeedQueryParams.safeParse(req.query);
  const page = params.success ? (params.data.page ?? 1) : 1;
  const limit = params.success ? (params.data.limit ?? 20) : 20;
  const sport = params.success ? params.data.sport : undefined;
  const offset = (page - 1) * limit;

  const whereClause = sport ? eq(checkinsTable.sport, sport) : undefined;

  const [totalResult, items] = await Promise.all([
    db
      .select({ count: count() })
      .from(checkinsTable)
      .where(whereClause),
    db
      .select({
        id: checkinsTable.id,
        sport: checkinsTable.sport,
        focusScore: checkinsTable.focusScore,
        confidenceScore: checkinsTable.confidenceScore,
        energyScore: checkinsTable.energyScore,
        note: checkinsTable.note,
        createdAt: checkinsTable.createdAt,
      })
      .from(checkinsTable)
      .where(whereClause)
      .orderBy(desc(checkinsTable.createdAt))
      .limit(limit)
      .offset(offset),
  ]);

  res.json(
    GetCommunityFeedResponse.parse({
      items,
      total: totalResult[0]?.count ?? 0,
      page,
      limit,
    }),
  );
});

export default router;
