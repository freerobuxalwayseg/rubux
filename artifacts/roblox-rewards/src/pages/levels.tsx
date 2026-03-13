import React from "react";
import { useAuth } from "@/lib/auth";
import { formatNumber, cn } from "@/lib/utils";
import { Star, Lock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const LEVELS_DATA = [
  { level: 1, invites: 0, bonus: 0, title: "مبتدئ" },
  { level: 2, invites: 2, bonus: 10000, title: "نشيط" },
  { level: 3, invites: 5, bonus: 25000, title: "مؤثر" },
  { level: 4, invites: 10, bonus: 50000, title: "مشهور" },
  { level: 5, invites: 20, bonus: 100000, title: "نجم" },
  { level: 6, invites: 35, bonus: 200000, title: "سوبر ستار" },
  { level: 7, invites: 50, bonus: 300000, title: "بطل" },
  { level: 8, invites: 75, bonus: 500000, title: "أسطورة" },
  { level: 9, invites: 100, bonus: 750000, title: "خرافي" },
  { level: 10, invites: 150, bonus: 1000000, title: "زعيم المنصة" },
];

export default function LevelsPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      <div className="text-center py-8">
        <h1 className="text-4xl font-black mb-4">مستويات الحساب ⭐</h1>
        <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
          كلما دعوت أصدقاء أكثر، ارتفع مستواك وحصلت على مكافآت ضخمة. مستواك الحالي هو <span className="text-primary font-bold">المستوى {user.level}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {LEVELS_DATA.map((lvl, idx) => {
          const isCompleted = user.level > lvl.level;
          const isCurrent = user.level === lvl.level;
          const isLocked = user.level < lvl.level;

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={lvl.level}
              className={cn(
                "relative p-6 rounded-3xl border-2 transition-all duration-300 overflow-hidden flex flex-col items-center text-center",
                isCurrent ? "border-accent bg-card shadow-xl shadow-accent/20 scale-105 z-10" : 
                isCompleted ? "border-success/50 bg-success/5" : 
                "border-border bg-card/50 opacity-70"
              )}
            >
              {isCurrent && (
                <div className="absolute top-0 inset-x-0 h-1 bg-accent shadow-[0_0_10px_#FFD700]"></div>
              )}
              
              <div className="mb-4 relative">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black relative z-10",
                  isCurrent ? "bg-accent text-accent-foreground" : 
                  isCompleted ? "bg-success text-white" : 
                  "bg-secondary text-muted-foreground"
                )}>
                  {lvl.level}
                </div>
                {isCurrent && (
                  <div className="absolute inset-0 bg-accent blur-xl opacity-50 rounded-full"></div>
                )}
              </div>

              <h3 className="font-bold text-lg mb-1">{lvl.title}</h3>
              <p className="text-sm text-muted-foreground font-medium mb-4">
                {lvl.invites} دعوة
              </p>

              <div className="mt-auto w-full">
                <div className="bg-background py-2 px-3 rounded-xl border border-border">
                  <span className="text-xs text-muted-foreground block mb-1">المكافأة</span>
                  <span className="font-black text-accent text-sm">
                    +{formatNumber(lvl.bonus)} <Star className="w-3 h-3 inline pb-0.5" />
                  </span>
                </div>
              </div>

              <div className="absolute top-3 right-3">
                {isCompleted && <CheckCircle2 className="w-6 h-6 text-success" />}
                {isLocked && <Lock className="w-5 h-5 text-muted-foreground" />}
              </div>
              
              {isCurrent && (
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-accent/20 blur-2xl rounded-full"></div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
