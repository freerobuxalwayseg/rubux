import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import invitesRouter from "./invites.js";
import rewardsRouter from "./rewards.js";
import leaderboardRouter from "./leaderboard.js";
import transactionsRouter from "./transactions.js";
import withdrawalsRouter from "./withdrawals.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/invites", invitesRouter);
router.use("/rewards", rewardsRouter);
router.use("/leaderboard", leaderboardRouter);
router.use("/transactions", transactionsRouter);
router.use("/withdrawals", withdrawalsRouter);
router.use("/admin", adminRouter);

export default router;
