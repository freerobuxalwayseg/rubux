import React, { useState } from "react";
import { useLogin, useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User, Mail, Lock, Gift } from "lucide-react";
import { useLocation } from "wouter";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  
  const loginMut = useLogin();
  const registerMut = useRegister();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    inviteCode: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      loginMut.mutate(
        { data: { email: formData.email, password: formData.password } },
        {
          onSuccess: (res) => {
            login(res.token);
            setLocation("/dashboard");
          },
          onError: (err: any) => {
            setError(err?.response?.data?.error || "حدث خطأ في تسجيل الدخول");
          }
        }
      );
    } else {
      registerMut.mutate(
        { data: formData },
        {
          onSuccess: (res) => {
            login(res.token);
            setLocation("/dashboard");
          },
          onError: (err: any) => {
            setError(err?.response?.data?.error || "حدث خطأ في إنشاء الحساب");
          }
        }
      );
    }
  };

  const isPending = loginMut.isPending || registerMut.isPending;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative" dir="rtl">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30 mix-blend-screen"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/hero-bg.png)` }}
      />
      
      <div className="w-full max-w-md bg-card/80 backdrop-blur-2xl p-8 rounded-[2rem] border border-border shadow-2xl shadow-black/50 relative z-10">
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-orange-500 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-primary/20 transform rotate-12">
            <span className="text-4xl font-black text-white -rotate-12 block">R</span>
          </div>
          <h1 className="text-3xl font-black mb-2">منصة مكافآت روبلوكس</h1>
          <p className="text-muted-foreground font-medium">العب، ادعُ أصدقائك، واكسب الروبوكس!</p>
        </div>

        <div className="flex bg-secondary p-1 rounded-xl mb-8">
          <button
            type="button"
            className={cn(
              "flex-1 py-3 rounded-lg font-bold transition-all",
              isLogin ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-white"
            )}
            onClick={() => setIsLogin(true)}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            className={cn(
              "flex-1 py-3 rounded-lg font-bold transition-all",
              !isLogin ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-white"
            )}
            onClick={() => setIsLogin(false)}
          >
            حساب جديد
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                name="username"
                placeholder="اسم المستخدم"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-secondary/50 border-2 border-transparent focus:border-primary rounded-xl py-4 pr-12 pl-4 outline-none transition-all font-medium text-white placeholder:text-muted-foreground focus:bg-secondary"
              />
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="email"
              name="email"
              placeholder="البريد الإلكتروني"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-secondary/50 border-2 border-transparent focus:border-primary rounded-xl py-4 pr-12 pl-4 outline-none transition-all font-medium text-white placeholder:text-muted-foreground focus:bg-secondary"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="password"
              name="password"
              placeholder="كلمة المرور"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-secondary/50 border-2 border-transparent focus:border-primary rounded-xl py-4 pr-12 pl-4 outline-none transition-all font-medium text-white placeholder:text-muted-foreground focus:bg-secondary"
            />
          </div>

          {!isLogin && (
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Gift className="h-5 w-5 text-accent" />
              </div>
              <input
                type="text"
                name="inviteCode"
                placeholder="كود الدعوة (اختياري)"
                value={formData.inviteCode}
                onChange={handleChange}
                className="w-full bg-secondary/50 border-2 border-transparent focus:border-accent rounded-xl py-4 pr-12 pl-4 outline-none transition-all font-medium text-white placeholder:text-muted-foreground focus:bg-secondary"
              />
              <p className="text-xs text-accent mt-2 px-2 font-medium">🎁 ستحصل على 100,000 نقطة مجانية عند التسجيل!</p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm font-bold text-center">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-14 text-lg mt-4" disabled={isPending}>
            {isPending ? "جاري التحميل..." : (isLogin ? "دخول 🚀" : "ابدأ اللعب الآن! 🎮")}
          </Button>
        </form>
      </div>
    </div>
  );
}
