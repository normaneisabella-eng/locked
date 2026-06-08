import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import checkinsRouter from "./checkins";
import feedRouter from "./feed";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(checkinsRouter);
router.use(feedRouter);
router.use(statsRouter);

export default router;
