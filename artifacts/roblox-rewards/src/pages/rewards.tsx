import React, { useState } from "react";
import { useGetRewards, useRedeemReward } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { formatNumber, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Coins, Star, Lock, AlertCircle } from "lucide-react";
import Confetti from "react-confetti";
import { motion } from "framer-motion";

export default function RewardsPage() {
  const { user, refetchUser } = useAuth();
  const { data: rewards, isLoading } = useGetRewards();
  const redeemMut = useRedeemReward();
  
  const [msg, setMsg] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  if (isLoading) return <div className="p-8 text-center text-xl font-bold">جاري تحميل المكافآت...</div>;
  if (!user || !rewards) return null;

  const handleRedeem = (rewardId: number) => {
    setMsg(null);
    redeemMut.mutate(
      { data: { rewardId } },
      {
        onSuccess: () => {
          setShowConfetti(true);
          setMsg({ type: 'success', text: "تم الاستبدال بنجاح! الروبوكس الآن في رصيدك." });
          refetchUser();
          setTimeout(() => setShowConfetti(false), 5000);
          setTimeout(() => setMsg(null), 6000);
        },
        onError: (err: any) => {
          setMsg({ type: 'error', text: err?.response?.data?.error || "فشل الاستبدال. تأكد من رصيدك." });
        }
      }
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />}
      
      <div className="flex flex-col md:flex-row items-center justify-between bg-card p-6 rounded-3xl border border-border mb-8">
        <div>
          <h1 className="text-3xl font-black mb-2">متجر المكافآت 🎁</h1>
          <p className="text-muted-foreground font-medium">استبدل نقاطك بروبوكس حقيقي فوراً.</p>
        </div>
        <div className="mt-4 md:mt-0 bg-secondary/50 px-6 py-3 rounded-2xl border border-border">
          <span className="text-sm text-muted-foreground block mb-1">نقاطك المتاحة للاستبدال</span>
          <span className="text-2xl font-black text-accent flex items-center gap-2">
            {formatNumber(user.points)} <Star className="w-5 h-5 fill-accent" />
          </span>
        </div>
      </div>

      {msg && (
        <motion.initial animate={{opacity: 1, y: 0}} initial={{opacity: 0, y: -10}}>
          <div className={cn(
            "p-4 rounded-xl border flex items-center gap-3 font-bold text-lg",
            msg.type === 'success' ? "bg-success/20 border-success text-success" : "bg-destructive/20 border-destructive text-destructive"
          )}>
            {msg.type === 'error' && <AlertCircle className="w-6 h-6" />}
            {msg.text}
          </div>
        </motion.initial>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rewards.map((reward) => {
          const canAfford = user.points >= reward.pointsCost;
          const levelMet = user.level >= reward.requiredLevel;
          const isLocked = reward.isLocked || !levelMet;

          return (
            <div key={reward.id} className="bg-card rounded-[2rem] p-6 border-2 border-border relative overflow-hidden group hover:border-primary/50 transition-colors flex flex-col">
              
              {isLocked && (
                <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-[2rem]">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4 border border-border shadow-lg">
                    <Lock className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-bold text-lg">مقفلة 🔒</p>
                  <p className="text-sm text-muted-foreground">يتطلب المستوى {reward.requiredLevel}</p>
                </div>
              )}

              <div className="h-40 flex items-center justify-center relative mb-6">
                <div className="absolute inset-0 bg-success/10 rounded-2xl transform -rotate-6 group-hover:rotate-0 transition-transform duration-300"></div>
                <img src={`${import.meta.env.BASE_URL}images/robux-coin.png`} alt="Robux" className="w-24 h-24 object-contain relative z-10 drop-shadow-2xl group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute bottom-2 right-2 bg-success text-white text-xs font-black px-3 py-1 rounded-full shadow-lg z-20 transform rotate-12">
                  {formatNumber(reward.robuxValue)} R$
                </div>
              </div>

              <h3 className="text-2xl font-black text-center mb-2">{reward.nameAr}</h3>
              <p className="text-center text-muted-foreground font-medium text-sm mb-6 h-10">
                {reward.descriptionAr || `استبدل ${formatNumber(reward.pointsCost)} نقطة للحصول على ${formatNumber(reward.robuxValue)} روبوكس.`}
              </p>

              <div className="mt-auto space-y-4">
                <div className="flex justify-between items-center bg-background rounded-xl p-3 border border-border">
                  <span className="font-bold text-muted-foreground text-sm">التكلفة:</span>
                  <span className={cn("font-black text-lg flex items-center gap-1", canAfford ? "text-accent" : "text-destructive")}>
                    {formatNumber(reward.pointsCost)} <Star className="w-4 h-4 fill-current" />
                  </span>
                </div>

                <Button 
                  className="w-full h-14 text-lg" 
                  disabled={!canAfford || redeemMut.isPending || isLocked}
                  onClick={() => handleRedeem(reward.id)}
                  variant={canAfford ? "default" : "secondary"}
                >
                  {redeemMut.isPending && redeemMut.variables?.data.rewardId === reward.id 
                    ? "جاري..." 
                    : canAfford 
                      ? "استبدال الآن! 🚀" 
                      : "نقاط غير كافية"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
