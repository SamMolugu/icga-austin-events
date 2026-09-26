import { Router, type IRouter } from "express";
import { SyncCalendarResponse } from "@workspace/api-zod";
import { syncIcgaSources } from "../lib/icga-sync";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.post("/organizer/sync", requireAuth, async (_req, res): Promise<void> => {
  const result = await syncIcgaSources();
  res.json(SyncCalendarResponse.parse({
    events: result.events,
    funds: result.funds,
    live: result.live,
    syncedAt: new Date(),
  }));
});

export default router;
