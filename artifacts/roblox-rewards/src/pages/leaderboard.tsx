import React from "react";
import { useGetLeaderboard } from "@workspace/api-client-react";
import { formatNumber, cn } from "@/lib/utils";
import { Trophy, Clock, Medal, Crown } from "lucide-react";
import { motion } from "framer-motion";

export default function LeaderboardPage() {
  const { data, isLoading } = useGetLeaderboard();

  if (isLoading) return <div className="p-8 text-center text-xl font-bold">جاري تحميل المتصدرين...</div>;
  if (!data) return null;

  const topThree = data.entries.slice(0, 3);
  const rest = data.entries.slice(3);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <div className="flex flex-col items-center text-center py-8">
        <Trophy className="w-16 h-16 text-accent mb-4 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
        <h1 className="text-4xl font-black mb-4">لوحة الشرف 🏆</h1>
        <div className="bg-secondary/50 border border-border px-4 py-2 rounded-xl flex items-center gap-2 text-muted-foreground font-bold">
          <Clock className="w-5 h-5" />
          يتم تصفير الدعوات الأسبوعية بعد <span className="text-white">{data.resetInDays} أيام</span>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="flex flex-col md:flex-row justify-center items-end gap-4 md:gap-8 mb-12 h-64">
        {/* Second Place */}
        {topThree[1] && (
          <motion.div initial={{y: 50, opacity:0}} animate={{y:0, opacity:1}} transition={{delay: 0.2}} className="w-full md:w-1/3 flex flex-col items-center order-2 md:order-1">
            <div className="text-xl font-black mb-2">{topThree[1].username}</div>
            <div className="text-sm text-muted-foreground font-bold mb-4">{formatNumber(topThree[1].totalInvites)} دعوة</div>
            <div className="w-full bg-gradient-to-t from-gray-400 to-gray-300 h-32 rounded-t-2xl border-t-4 border-gray-100 flex justify-center pt-4 relative overflow-hidden">
              <Medal className="w-8 h-8 text-white opacity-80" />
              <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity"></div>
            </div>
          </motion.div>
        )}

        {/* First Place */}
        {topThree[0] && (
          <motion.div initial={{y: 50, opacity:0}} animate={{y:0, opacity:1}} className="w-full md:w-1/3 flex flex-col items-center order-1 md:order-2 z-10">
            <Crown className="w-10 h-10 text-accent mb-2 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]" />
            <div className="text-2xl font-black mb-1">{topThree[0].username}</div>
            <div className="text-sm font-bold text-accent mb-4">{formatNumber(topThree[0].totalInvites)} دعوة</div>
            <div className="w-full bg-gradient-to-t from-yellow-500 to-yellow-400 h-40 rounded-t-2xl border-t-4 border-yellow-200 flex justify-center pt-4 shadow-[0_0_30px_rgba(255,215,0,0.3)] relative overflow-hidden">
              <Trophy className="w-10 h-10 text-yellow-100 opacity-90" />
              <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity"></div>
            </div>
          </motion.div>
        )}

        {/* Third Place */}
        {topThree[2] && (
          <motion.div initial={{y: 50, opacity:0}} animate={{y:0, opacity:1}} transition={{delay: 0.4}} className="w-full md:w-1/3 flex flex-col items-center order-3">
            <div className="text-xl font-black mb-2">{topThree[2].username}</div>
            <div className="text-sm text-orange-400 font-bold mb-4">{formatNumber(topThree[2].totalInvites)} دعوة</div>
            <div className="w-full bg-gradient-to-t from-orange-700 to-orange-500 h-24 rounded-t-2xl border-t-4 border-orange-300 flex justify-center pt-4 relative overflow-hidden">
              <Medal className="w-8 h-8 text-orange-200 opacity-80" />
              <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity"></div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Rest of the list */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        {rest.map((entry, idx) => (
          <div key={entry.username} className={cn(
            "flex items-center justify-between p-4 border-b border-border/50 hover:bg-secondary/30 transition-colors",
            idx === rest.length - 1 && "border-b-0"
          )}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-black text-muted-foreground">
                {entry.rank}
              </div>
              <span className="font-bold text-lg">{entry.username}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-black">{formatNumber(entry.totalInvites)} دعوة</span>
              <span className="text-xs text-muted-foreground font-medium">{formatNumber(entry.points)} نقطة</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
