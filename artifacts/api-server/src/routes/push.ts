import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, pushSubscriptionsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import webpush from "web-push";

const router: IRouter = Router();

router.post("/push/subscribe", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId;
  const { endpoint, keys } = req.body ?? {};
  if (typeof endpoint !== "string" || !keys?.p256dh || !keys?.auth) {
    res.status(400).json({ error: "Invalid subscription payload" });
    return;
  }

  await db
    .insert(pushSubscriptionsTable)
    .values({ userId, endpoint, p256dh: keys.p256dh, auth: keys.auth })
    .onConflictDoUpdate({
      target: pushSubscriptionsTable.endpoint,
      set: { userId, p256dh: keys.p256dh, auth: keys.auth },
    });

  res.json({ ok: true });
});

router.delete("/push/subscribe", requireAuth, async (req, res): Promise<void> => {
  const { endpoint } = req.body ?? {};
  if (typeof endpoint !== "string") {
    res.status(400).json({ error: "Missing endpoint" });
    return;
  }

  await db
    .delete(pushSubscriptionsTable)
    .where(eq(pushSubscriptionsTable.endpoint, endpoint));

  res.json({ ok: true });
});

export async function sendCheckinReminders(log: (msg: string) => void) {
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  if (!vapidPublicKey || !vapidPrivateKey) {
    log("VAPID keys not configured, skipping reminders");
    return;
  }

  webpush.setVapidDetails("mailto:locked@example.com", vapidPublicKey, vapidPrivateKey);

  const subs = await db.select().from(pushSubscriptionsTable);
  log(`Sending check-in reminders to ${subs.length} subscriptions`);

  const payload = JSON.stringify({
    title: "Time to check in 🔒",
    body: "How's your focus, confidence, and energy today? 2 minutes.",
    url: "/checkin",
  });

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload,
      ).catch(async (err: any) => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await db.delete(pushSubscriptionsTable).where(eq(pushSubscriptionsTable.endpoint, sub.endpoint));
          log(`Removed stale subscription: ${sub.endpoint}`);
        }
        throw err;
      }),
    ),
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;
  log(`Reminders: ${sent} sent, ${failed} failed`);
}

export default router;
