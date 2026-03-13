import React from "react";
import { useAuth } from "@/lib/auth";
import { useGetTransactions } from "@workspace/api-client-react";
import { cn, formatNumber } from "@/lib/utils";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { ArrowLeftRight, Coins, Star, ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";

export default function EarningsPage() {
  const { user } = useAuth();
  const { data: transactions, isLoading } = useGetTransactions();

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Conversion Info */}
        <div className="flex-1 bg-gradient-to-br from-card to-secondary p-8 rounded-3xl border border-border relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ArrowLeftRight className="w-32 h-32" />
          </div>
          <h2 className="text-2xl font-black mb-2 relative z-10">حاسبة التحويل 🧮</h2>
          <p className="text-muted-foreground font-medium mb-6 relative z-10">
            كل 1,000 نقطة تساوي 500 روبوكس
          </p>
          
          <div className="flex items-center justify-between bg-background/50 p-4 rounded-2xl border border-border relative z-10">
            <div className="text-center">
              <span className="block text-sm text-muted-foreground mb-1 font-bold">نقاطك</span>
              <span className="text-2xl font-black text-accent">{formatNumber(user.points)}</span>
            </div>
            <ArrowLeftRight className="w-6 h-6 text-muted-foreground" />
            <div className="text-center">
              <span className="block text-sm text-muted-foreground mb-1 font-bold">تساوي روبوكس</span>
              <span className="text-2xl font-black text-success">
                {formatNumber(Math.floor((user.points / 1000) * 500))} R$
              </span>
            </div>
          </div>
        </div>

        {/* Current Robux Balance */}
        <div className="flex-1 bg-card p-8 rounded-3xl border border-border flex flex-col justify-center text-center">
          <div className="w-16 h-16 bg-success/20 text-success rounded-2xl mx-auto flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8" />
          </div>
          <h3 className="text-muted-foreground font-bold mb-2">رصيدك القابل للسحب</h3>
          <div className="text-5xl font-black mb-6 drop-shadow-md">
            {formatNumber(user.robuxBalance)} <span className="text-2xl text-success">R$</span>
          </div>
          <Link href="/withdraw">
            <Button className="w-full text-lg h-14" variant="default" disabled={user.robuxBalance < 1000}>
              سحب الأرباح 💸
            </Button>
          </Link>
          {user.robuxBalance < 1000 && (
            <p className="text-xs text-destructive mt-3 font-bold">الحد الأدنى للسحب 1,000 روبوكس</p>
          )}
        </div>
      </div>

      {/* Transactions History */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border/50 bg-secondary/20">
          <h3 className="text-xl font-black">سجل المعاملات 📜</h3>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground font-bold">جاري التحميل...</div>
        ) : transactions?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground font-bold">لا توجد معاملات حتى الآن.</div>
        ) : (
          <div className="divide-y divide-border/50">
            {transactions?.map((tx) => {
              const isPositive = ['earn', 'invite_bonus', 'daily_reward'].includes(tx.type);
              
              return (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-secondary/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      isPositive ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive"
                    )}>
                      {isPositive ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(tx.createdAt), "dd MMMM yyyy - hh:mm a", { locale: ar })}
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    "font-black text-lg flex items-center gap-1",
                    isPositive ? "text-accent" : "text-destructive"
                  )}>
                    {isPositive ? "+" : "-"}{formatNumber(tx.amount)} 
                    {tx.type === 'withdraw' ? <span className="text-sm">R$</span> : <Star className="w-4 h-4 fill-current" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
