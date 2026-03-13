import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useClaimDailyReward } from "@workspace/api-client-react";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Gift, Star, Trophy, Users, ChevronLeft, Coins } from "lucide-react";
import { Link } from "wouter";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const { user, refetchUser } = useAuth();
  const claimMut = useClaimDailyReward();
  const [showConfetti, setShowConfetti] = useState(false);
  const [rewardMsg, setRewardMsg] = useState("");

  if (!user) return null;

  const handleClaimDaily = () => {
    claimMut.mutate(undefined, {
      onSuccess: (res) => {
        setShowConfetti(true);
        setRewardMsg(`🎉 مبروك! كسبت ${formatNumber(res.pointsEarned)} نقطة!`);
        refetchUser();
        setTimeout(() => setShowConfetti(false), 5000);
        setTimeout(() => setRewardMsg(""), 6000);
      },
      onError: (err: any) => {
        setRewardMsg(err?.response?.data?.error || "لقد حصلت على المكافأة اليوم بالفعل!");
        setTimeout(() => setRewardMsg(""), 3000);
      }
    });
  };

  // 400 robux costs 100,000 pts 
  const nextRewardCost = 100000;
  const progressPercent = Math.min(100, (user.points / nextRewardCost) * 100);

  return (
    <div className="space-y-8">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />}
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary/20 to-accent/10 border border-primary/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full"></div>
        <div className="relative z-10 text-center md:text-right">
          <h1 className="text-3xl font-black mb-2">أهلاً بك يا بطل، {user.username}! 👋</h1>
          <p className="text-lg text-muted-foreground font-medium">أنت في المستوى {user.level}. استمر في دعوة الأصدقاء للوصول للقمة.</p>
        </div>
        
        <Button 
          variant="gold" 
          size="lg" 
          className="relative z-10 text-lg w-full md:w-auto shrink-0"
          onClick={handleClaimDaily}
          disabled={claimMut.isPending}
        >
          <Gift className="w-5 h-5 ml-2" />
          استلم مكافأتك اليومية (5,000+)
        </Button>
      </div>

      <AnimatePresence>
        {rewardMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card border border-border p-4 rounded-xl text-center font-bold text-lg text-white shadow-lg"
          >
            {rewardMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Points Card */}
        <div className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden hover:border-primary/50 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center">
              <Star className="w-6 h-6 text-accent" />
            </div>
          </div>
          <h3 className="text-muted-foreground font-bold mb-1">نقاطك الحالية</h3>
          <div className="text-4xl font-black text-white text-shadow-glow">
            {formatNumber(user.points)}
          </div>
          <img src={`${import.meta.env.BASE_URL}images/points-star.png`} alt="Star" className="absolute -left-6 -bottom-6 w-32 h-32 opacity-20 group-hover:scale-110 transition-transform duration-500" />
        </div>

        {/* Robux Card */}
        <div className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden hover:border-success/50 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-success/20 rounded-2xl flex items-center justify-center">
              <Coins className="w-6 h-6 text-success" />
            </div>
            <Link href="/earnings" className="text-xs font-bold text-success bg-success/10 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-success hover:text-white transition-colors">
              سحب الرصيد <ChevronLeft className="w-3 h-3" />
            </Link>
          </div>
          <h3 className="text-muted-foreground font-bold mb-1">رصيد الروبوكس</h3>
          <div className="text-4xl font-black text-white drop-shadow-md">
            {formatNumber(user.robuxBalance)} <span className="text-xl text-success">R$</span>
          </div>
          <img src={`${import.meta.env.BASE_URL}images/robux-coin.png`} alt="Robux" className="absolute -left-4 -bottom-4 w-28 h-28 opacity-20 group-hover:scale-110 transition-transform duration-500" />
        </div>

        {/* Invites Card */}
        <div className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden hover:border-blue-500/50 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <Link href="/invite" className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-blue-500 hover:text-white transition-colors">
              دعوة المزيد <ChevronLeft className="w-3 h-3" />
            </Link>
          </div>
          <h3 className="text-muted-foreground font-bold mb-1">إجمالي الدعوات</h3>
          <div className="text-4xl font-black text-white">
            {formatNumber(user.totalInvites)}
          </div>
          <Trophy className="absolute -left-4 -bottom-4 w-32 h-32 text-blue-500 opacity-5 group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-card border border-border rounded-3xl p-8">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">الهدف القادم 🎯</h2>
            <p className="text-muted-foreground">احصل على 400 روبوكس مقابل 100,000 نقطة</p>
          </div>
          <div className="text-xl font-black text-accent">{formatNumber(user.points)} / {formatNumber(nextRewardCost)}</div>
        </div>
        
        <div className="w-full h-6 bg-secondary rounded-full overflow-hidden border border-border relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-l from-accent to-orange-500 relative"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMjBMMjAgMEgwaHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPjwvc3ZnPg==')] opacity-50"></div>
          </motion.div>
        </div>
        
        {progressPercent >= 100 && (
          <div className="mt-6 flex justify-center">
            <Link href="/rewards">
              <Button size="lg" className="w-full sm:w-auto px-12 text-lg">
                اذهب لصفحة المكافآت لاستبدالها! ✨
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
