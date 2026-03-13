import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useCreateWithdrawal } from "@workspace/api-client-react";
import { formatNumber, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

type MethodId = "visa" | "vodafone" | "orange" | "etisalat" | "we";

interface PaymentMethod {
  id: MethodId;
  name: string;
  emoji: string;
  cardGradientFrom: string;
  cardGradientTo: string;
  shadowColor: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  cardLabel: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "visa",
    name: "فيزا / ماستركارد",
    emoji: "💳",
    cardGradientFrom: "from-blue-600",
    cardGradientTo: "to-purple-800",
    shadowColor: "shadow-blue-900/50",
    borderColor: "border-blue-500",
    bgColor: "bg-blue-500/20",
    textColor: "text-blue-400",
    cardLabel: "رقم الكارت",
  },
  {
    id: "vodafone",
    name: "فودافون كاش",
    emoji: "📱",
    cardGradientFrom: "from-red-600",
    cardGradientTo: "to-red-900",
    shadowColor: "shadow-red-900/50",
    borderColor: "border-red-500",
    bgColor: "bg-red-500/20",
    textColor: "text-red-400",
    cardLabel: "رقم المحفظة",
  },
  {
    id: "orange",
    name: "أورنج كاش",
    emoji: "🟠",
    cardGradientFrom: "from-orange-500",
    cardGradientTo: "to-amber-700",
    shadowColor: "shadow-orange-900/50",
    borderColor: "border-orange-500",
    bgColor: "bg-orange-500/20",
    textColor: "text-orange-400",
    cardLabel: "رقم المحفظة",
  },
  {
    id: "etisalat",
    name: "اتصالات كاش",
    emoji: "📡",
    cardGradientFrom: "from-green-600",
    cardGradientTo: "to-emerald-800",
    shadowColor: "shadow-green-900/50",
    borderColor: "border-green-500",
    bgColor: "bg-green-500/20",
    textColor: "text-green-400",
    cardLabel: "رقم المحفظة",
  },
  {
    id: "we",
    name: "WE كاش",
    emoji: "🔮",
    cardGradientFrom: "from-violet-500",
    cardGradientTo: "to-purple-700",
    shadowColor: "shadow-purple-900/50",
    borderColor: "border-violet-400",
    bgColor: "bg-violet-500/20",
    textColor: "text-violet-400",
    cardLabel: "رقم المحفظة",
  },
];

export default function WithdrawPage() {
  const { user, refetchUser } = useAuth();
  const withdrawMut = useCreateWithdrawal();
  const [, setLocation] = useLocation();

  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const [amount, setAmount] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [cardName, setCardName] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);

  const [error, setError] = useState("");

  if (!user) return null;

  const handleNextStep1 = () => {
    if (!selectedMethod) {
      setError("الرجاء اختيار طريقة الدفع أولاً");
      return;
    }
    const numAmount = parseInt(amount.replace(/,/g, ""));
    if (isNaN(numAmount) || numAmount < 1000) {
      setError("الحد الأدنى للسحب هو 1,000 روبلكس");
      return;
    }
    if (numAmount > user.robuxBalance) {
      setError("رصيدك غير كافٍ");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleNextStep2 = () => {
    const rawNum = cardNumber.replace(/\s/g, "");
    if (rawNum.length < 10) {
      setError("الرجاء إدخال رقم صحيح");
      return;
    }
    if (!cardName) {
      setError("الرجاء إدخال الاسم");
      return;
    }
    if (selectedMethod?.id === "visa" && (!cardExpiry || !cardCVC)) {
      setError("الرجاء إكمال بيانات الكارت");
      return;
    }
    setError("");
    setStep(3);
  };

  const handleConfirm = () => {
    const paymentDetails = `Number: ${cardNumber.slice(-4)}, Name: ${cardName}`;
    withdrawMut.mutate(
      {
        data: {
          amountRobux: parseInt(amount.replace(/,/g, "")),
          paymentMethod: (selectedMethod!.id === "we" ? "etisalat" : selectedMethod!.id) as any,
          paymentDetails,
        },
      },
      {
        onSuccess: () => {
          refetchUser();
          setStep(4);
        },
        onError: (err: any) => {
          setError(err?.response?.data?.error || "حدث خطأ أثناء تقديم الطلب");
        },
      }
    );
  };

  const formatCardInput = (val: string) => {
    const v = val.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : val;
  };

  const m = selectedMethod;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black">سحب الأرباح 💸</h1>
        <div className="text-left">
          <span className="text-sm text-muted-foreground block font-bold">رصيدك</span>
          <span className="text-xl font-black text-success">{formatNumber(user.robuxBalance)} R$</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between items-center relative mb-12 px-4">
        <div className="absolute top-1/2 left-4 right-4 h-1 bg-border -z-10 -translate-y-1/2 rounded-full" />
        <div
          className="absolute top-1/2 right-4 h-1 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-500"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        />
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-black text-lg transition-all duration-300",
              step >= s
                ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30"
                : "bg-card border-2 border-border text-muted-foreground"
            )}
          >
            {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-destructive/20 border border-destructive text-destructive p-4 rounded-xl flex items-center gap-2 font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="bg-card border border-border p-6 md:p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
        <AnimatePresence mode="wait">

          {/* STEP 1 */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-lg font-bold mb-4">اختر طريقة السحب:</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {PAYMENT_METHODS.map((pm) => (
                    <button
                      key={pm.id}
                      onClick={() => setSelectedMethod(pm)}
                      className={cn(
                        "p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all duration-200",
                        selectedMethod?.id === pm.id
                          ? `${pm.bgColor} ${pm.textColor} ${pm.borderColor} scale-105 shadow-lg`
                          : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50 hover:scale-102"
                      )}
                    >
                      <span className="text-3xl">{pm.emoji}</span>
                      <span className="font-bold text-sm text-center">{pm.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-bold mb-4">المبلغ (روبلكس):</label>
                <input
                  type="text"
                  placeholder="مثال: 5000"
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setAmount(val ? Number(val).toLocaleString("en-US") : "");
                  }}
                  className="w-full bg-secondary text-2xl font-black p-4 rounded-xl border border-border focus:border-primary outline-none dir-ltr text-left"
                />
              </div>

              <Button className="w-full h-14 text-lg" onClick={handleNextStep1}>
                التالي <ArrowRight className="w-5 h-5 mr-2" />
              </Button>
            </motion.div>
          )}

          {/* STEP 2 - Card form for ALL methods */}
          {step === 2 && m && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={() => setStep(1)}
                  className="p-2 bg-secondary rounded-lg hover:bg-border transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-xl font-bold">بيانات {m.name}</h2>
                  <p className="text-sm text-muted-foreground">أدخل بيانات الكارت</p>
                </div>
                <span className="mr-auto text-3xl">{m.emoji}</span>
              </div>

              {/* 3D Card Visual */}
              <div className="w-full max-w-[360px] mx-auto" style={{ height: 220, perspective: 1000 }}>
                <div
                  className="w-full h-full relative transition-transform duration-700"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Front */}
                  <div
                    className={cn(
                      "absolute inset-0 w-full h-full rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between",
                      `bg-gradient-to-br ${m.cardGradientFrom} ${m.cardGradientTo}`,
                      m.shadowColor
                    )}
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-2xl">{m.emoji}</span>
                      <div className="w-12 h-8 bg-yellow-400/80 rounded px-1 flex items-center justify-center">
                        <div className="w-full h-full border border-yellow-200/50 rounded-sm" />
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-xl tracking-widest mb-3 dir-ltr text-left">
                        {cardNumber || "•••• •••• •••• ••••"}
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="font-bold uppercase truncate max-w-[200px] text-sm">
                          {cardName || "الاسم الكامل"}
                        </div>
                        <div className="font-mono text-sm">{cardExpiry || "MM/YY"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Back */}
                  <div
                    className={cn(
                      "absolute inset-0 w-full h-full rounded-2xl shadow-xl",
                      `bg-gradient-to-br ${m.cardGradientTo} from-slate-800`
                    )}
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <div className="w-full h-12 bg-black mt-6" />
                    <div className="px-6 mt-4">
                      <div className="w-full h-10 bg-white rounded flex items-center justify-end px-3">
                        <span className="font-mono text-black font-bold">{cardCVC || "•••"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2">{m.cardLabel}</label>
                  <input
                    type="text"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardInput(e.target.value))}
                    className="w-full bg-secondary p-4 rounded-xl border border-border focus:border-primary outline-none font-mono dir-ltr text-left"
                    placeholder="0000 0000 0000 0000"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-muted-foreground mb-2">تاريخ الانتهاء</label>
                    <input
                      type="text"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (val.length >= 2) val = val.slice(0, 2) + "/" + val.slice(2);
                        setCardExpiry(val);
                      }}
                      className="w-full bg-secondary p-4 rounded-xl border border-border focus:border-primary outline-none font-mono dir-ltr text-center"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-muted-foreground mb-2">رمز CVC</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCVC}
                      onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, ""))}
                      onFocus={() => setIsFlipped(true)}
                      onBlur={() => setIsFlipped(false)}
                      className="w-full bg-secondary p-4 rounded-xl border border-border focus:border-primary outline-none font-mono dir-ltr text-center"
                      placeholder="•••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2">الاسم الكامل</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    className="w-full bg-secondary p-4 rounded-xl border border-border focus:border-primary outline-none dir-ltr text-left"
                    placeholder="JOHN DOE"
                  />
                </div>
              </div>

              <Button className="w-full h-14 text-lg" onClick={handleNextStep2}>
                مراجعة الطلب
              </Button>
            </motion.div>
          )}

          {/* STEP 3: Summary */}
          {step === 3 && m && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setStep(2)} className="p-2 bg-secondary rounded-lg hover:bg-border transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold">تأكيد طلب السحب</h2>
              </div>

              <div className="bg-secondary/50 rounded-2xl p-6 space-y-4 border border-border divide-y divide-border/50">
                <div className="flex justify-between items-center pb-4">
                  <span className="text-muted-foreground font-bold">المبلغ:</span>
                  <span className="text-2xl font-black text-success">{amount} R$</span>
                </div>
                <div className="flex justify-between items-center py-4">
                  <span className="text-muted-foreground font-bold">طريقة الدفع:</span>
                  <span className="font-bold">{m.emoji} {m.name}</span>
                </div>
                <div className="flex justify-between items-center py-4">
                  <span className="text-muted-foreground font-bold">الحساب:</span>
                  <span className="font-mono font-bold dir-ltr">**** {cardNumber.replace(/\s/g, "").slice(-4)}</span>
                </div>
                <div className="flex justify-between items-center py-4">
                  <span className="text-muted-foreground font-bold">الاسم:</span>
                  <span className="font-bold dir-ltr">{cardName}</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-muted-foreground font-bold">وقت المعالجة:</span>
                  <span className="font-bold text-orange-400">1 - 3 أيام عمل</span>
                </div>
              </div>

              <Button
                className="w-full h-14 text-lg"
                onClick={handleConfirm}
                disabled={withdrawMut.isPending}
              >
                {withdrawMut.isPending ? "جاري الإرسال..." : "تأكيد وإرسال الطلب ✅"}
              </Button>
            </motion.div>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 space-y-6"
            >
              <div className="w-24 h-24 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-black">تم استلام طلبك بنجاح! 🎉</h2>
              <p className="text-muted-foreground font-medium max-w-md mx-auto">
                سيتم مراجعة طلب السحب وتحويل المبلغ إلى حسابك خلال 1 إلى 3 أيام عمل.
              </p>
              <div className="pt-8">
                <Button onClick={() => setLocation("/earnings")} variant="outline" className="h-12 px-8">
                  العودة للأرباح
                </Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
