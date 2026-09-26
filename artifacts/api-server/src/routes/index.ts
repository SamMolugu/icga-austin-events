import { Router, type IRouter } from "express";
import healthRouter from "./health";
import eventsRouter from "./events";
import registrationsRouter from "./registrations";
import donationsRouter from "./donations";
import analyticsRouter from "./analytics";
import webhooksRouter from "./webhooks";
import marketingRouter from "./marketing";
import flyersRouter from "./flyers";
import impactRouter from "./impact";

const router: IRouter = Router();

router.use(healthRouter);
router.use(eventsRouter);
router.use(registrationsRouter);
router.use(donationsRouter);
router.use(analyticsRouter);
router.use(webhooksRouter);
router.use(marketingRouter);
router.use(flyersRouter);
router.use(impactRouter);

export default router;
