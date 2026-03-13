import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { authMiddleware, AuthenticatedRequest } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const topUsers = await db.select({
      id: usersTable.id,
      username: usersTable.username,
      totalInvites: usersTable.totalInvites,
      points: usersTable.points,
    })
      .from(usersTable)
      .orderBy(desc(usersTable.totalInvites))
      .limit(50);

    const entries = topUsers.map((u, index) => ({
      rank: index + 1,
      username: u.username,
      totalInvites: u.totalInvites,
      points: u.points,
    }));

    const currentUserRank = entries.findIndex(e => e.username === (topUsers.find(u => u.id === req.userId!)?.username));

    // Days until Monday reset (weekly leaderboard)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;

    res.json({
      entries,
      resetInDays: daysUntilMonday,
      currentUserRank: currentUserRank >= 0 ? currentUserRank + 1 : null,
    });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

export default router;
