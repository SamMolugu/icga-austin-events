import crypto from "node:crypto";
import { Router, type IRouter } from "express";
import { db, activityTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/webhooks/github", async (req, res): Promise<void> => {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  const signature = req.header("x-hub-signature-256");
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body ?? {}));

  if (!secret || !signature) {
    res.status(503).json({ error: "GitHub webhook secret is not configured" });
    return;
  }

  const expected = `sha256=${crypto.createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
    res.status(401).json({ error: "Invalid webhook signature" });
    return;
  }

  const payload = JSON.parse(rawBody.toString("utf8")) as { ref?: string; after?: string; repository?: { full_name?: string } };
  const eventName = req.header("x-github-event") ?? "unknown";
  await db.insert(activityTable).values({
    type: "notification",
    message: `GitHub ${eventName} received for ${payload.repository?.full_name ?? "repository"}${payload.ref ? ` on ${payload.ref}` : ""}`,
  });
  req.log.info({ eventName, commit: payload.after }, "Accepted GitHub webhook");
  res.status(202).json({ accepted: true });
});

export default router;