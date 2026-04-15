import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import childrenRouter from "./children";
import nutritionRouter from "./nutrition";
import vaccinationsRouter from "./vaccinations";
import growthRouter from "./growth";
import screenTimeRouter from "./screentime";
import tipsRouter from "./tips";
import dashboardRouter from "./dashboard";
import smsRouter from "./sms";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(childrenRouter);
router.use(nutritionRouter);
router.use(vaccinationsRouter);
router.use(growthRouter);
router.use(screenTimeRouter);
router.use(tipsRouter);
router.use(dashboardRouter);
router.use(smsRouter);

export default router;
