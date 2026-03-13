import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { transactionsTable } from "@workspace/db";
import { invitesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { hashPassword, verifyPassword, generateToken, generateInviteCode } from "../lib/auth.js";

const router = Router();

const LEVELS = [
  { level: 1, invitesRequired: 0, bonusPoints: 0 },
  { level: 2, invitesRequired: 2, bonusPoints: 10000 },
  { level: 3, invitesRequired: 5, bonusPoints: 25000 },
  { level: 4, invitesRequired: 10, bonusPoints: 50000 },
  { level: 5, invitesRequired: 20, bonusPoints: 100000 },
  { level: 6, invitesRequired: 35, bonusPoints: 200000 },
  { level: 7, invitesRequired: 50, bonusPoints: 300000 },
  { level: 8, invitesRequired: 75, bonusPoints: 500000 },
  { level: 9, invitesRequired: 100, bonusPoints: 750000 },
  { level: 10, invitesRequired: 150, bonusPoints: 1000000 },
];

function calculateLevel(totalInvites: number): number {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalInvites >= LEVELS[i].invitesRequired) {
      return LEVELS[i].level;
    }
  }
  return 1;
}

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, inviteCode } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: "جميع الحقول مطلوبة" });
      return;
    }

    const existing = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existing.length) {
      res.status(400).json({ error: "البريد الإلكتروني مستخدم بالفعل" });
      return;
    }

    const existingUsername = await db.select()
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);

    if (existingUsername.length) {
      res.status(400).json({ error: "اسم المستخدم مستخدم بالفعل" });
      return;
    }

    const passwordHash = hashPassword(password);
    const newInviteCode = generateInviteCode();
    const registrationBonus = 100000;

    let invitedBy: number | undefined;

    if (inviteCode) {
      const referrer = await db.select()
        .from(usersTable)
        .where(eq(usersTable.inviteCode, inviteCode.toUpperCase()))
        .limit(1);

      if (referrer.length) {
        invitedBy = referrer[0].id;
      }
    }

    const [newUser] = await db.insert(usersTable).values({
      username,
      email,
      passwordHash,
      inviteCode: newInviteCode,
      points: registrationBonus,
      robuxBalance: Math.floor((registrationBonus / 1000) * 500),
      invitedBy,
    }).returning();

    // Log registration bonus transaction
    await db.insert(transactionsTable).values({
      userId: newUser.id,
      type: "earn",
      amount: registrationBonus,
      description: "مكافأة التسجيل 🎉",
    });

    // If invited by someone, give them a bonus
    if (invitedBy) {
      const inviteBonus = 25000;
      await db.insert(invitesTable).values({
        referrerId: invitedBy,
        invitedUserId: newUser.id,
      });

      const referrerData = await db.select()
        .from(usersTable)
        .where(eq(usersTable.id, invitedBy))
        .limit(1);

      if (referrerData.length) {
        const newTotalInvites = referrerData[0].totalInvites + 1;
        const newLevel = calculateLevel(newTotalInvites);
        const newPoints = referrerData[0].points + inviteBonus;
        await db.update(usersTable)
          .set({
            points: newPoints,
            robuxBalance: Math.floor((newPoints / 1000) * 500),
            totalInvites: newTotalInvites,
            weeklyInvites: referrerData[0].weeklyInvites + 1,
            level: newLevel,
          })
          .where(eq(usersTable.id, invitedBy));

        await db.insert(transactionsTable).values({
          userId: invitedBy,
          type: "invite_bonus",
          amount: inviteBonus,
          description: `مكافأة دعوة: ${username} 🤝`,
        });
      }
    }

    const token = generateToken(newUser.id);
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    res.json({
      user: {
        ...userWithoutPassword,
        lastDailyReward: userWithoutPassword.lastDailyReward?.toString() ?? null,
        createdAt: userWithoutPassword.createdAt.toISOString(),
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" });
      return;
    }

    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!users.length || !verifyPassword(password, users[0].passwordHash)) {
      res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
      return;
    }

    const user = users[0];
    const token = generateToken(user.id);
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.json({
      user: {
        ...userWithoutPassword,
        lastDailyReward: userWithoutPassword.lastDailyReward?.toString() ?? null,
        createdAt: userWithoutPassword.createdAt.toISOString(),
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

router.post("/logout", (req, res) => {
  res.json({ success: true, message: "تم تسجيل الخروج" });
});

export default router;
