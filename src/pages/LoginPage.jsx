import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import authHeroImg from "@/assets/images/auth-hero.jpg";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot Password modal state
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);

  const destination = location.state?.from || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your staff email address.");
      return;
    }
    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      navigate(destination, { replace: true });
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error("Please provide your registered email address.");
      return;
    }
    setIsSendingReset(true);
    setTimeout(() => {
      setIsSendingReset(false);
      setIsForgotOpen(false);
      toast.success(
        `Password recovery link dispatched to ${forgotEmail}. Please check your inbox.`
      );
      setForgotEmail("");
    }, 900);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#f8fafc] font-sans antialiased">
      {/* ================= LEFT 50% SHOWCASE PANEL (100% UNUNCROPPED FULL IMAGE) ================= */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#090f1e] text-white flex-col justify-between p-6 xl:p-8 relative overflow-hidden select-none min-h-screen lg:h-screen lg:sticky lg:top-0 border-r border-slate-800">
        {/* Ambient Blurred Backdrop to smoothly fill negative space */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src={authHeroImg}
            alt=""
            className="w-full h-full object-cover blur-3xl opacity-20 scale-110"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-[#090f1e]/70 backdrop-blur-sm" />
        </div>

        {/* Top Header: Brand Identity */}
        <div className="relative z-10 flex items-center justify-between pb-2 shrink-0">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-[#1E7B5A] flex items-center justify-center text-white shadow-lg shadow-[#1E7B5A]/30 group-hover:scale-105 transition-transform border border-emerald-400/30">
              <svg
                className="w-5 h-5"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="50" r="46" fill="#1E7B5A" />
                <path
                  d="M32 50 L45 63 L68 37"
                  stroke="white"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-none">
                APEX REPAIR
              </span>
              <span className="text-[10px] font-semibold text-emerald-300 tracking-widest uppercase">
                Appliance Service Console
              </span>
            </div>
          </Link>

          <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-white/[0.08] text-slate-200 border border-white/10 backdrop-blur-md">
            Enterprise Fleet v2.4
          </span>
        </div>

        {/* Centerpiece: 100% UNUNCROPPED FULL IMAGE (ZERO PIXELS CUT OFF) */}
        <div className="relative z-10 flex-1 min-h-0 flex items-center justify-center my-auto w-full py-4">
          <img
            src={authHeroImg}
            alt="Apex Appliance Repair Service Van & Field Technician"
            className="max-w-full max-h-full w-auto h-auto object-contain rounded-2xl shadow-2xl shadow-black/85 border border-white/10 transition-all duration-300 hover:shadow-black"
          />
        </div>

        {/* Bottom Minimal Operational Status Line */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-white">
              24/7 Field Dispatch & Emergency Operations
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            © {new Date().getFullYear()} Apex Appliance Repair Inc.
          </span>
        </div>
      </div>

      {/* ================= RIGHT 50% AUTHENTICATION FORM PANEL ================= */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 md:p-12 lg:p-10 xl:p-14 overflow-y-auto min-h-screen bg-white">
        {/* Mobile / Tablet Visual Hero Banner (< lg) - 100% UNUNCROPPED */}
        <div className="lg:hidden relative w-full rounded-2xl overflow-hidden mb-6 shadow-md border border-slate-200 select-none shrink-0 bg-slate-950">
          <img
            src={authHeroImg}
            alt="Apex Appliance Repair Fleet"
            className="w-full h-auto object-contain block"
          />
        </div>

        {/* Mobile Header Brand (< lg) */}
        <div className="lg:hidden flex items-center justify-between w-full max-w-md mx-auto mb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#1E7B5A] flex items-center justify-center text-white shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="46" fill="#1E7B5A" />
                <path d="M32 50 L45 63 L68 37" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-extrabold text-sm tracking-tight text-[#16264a]">APEX REPAIR</span>
          </div>
        </div>

        {/* Center Auth Card */}
        <div className="w-full max-w-md mx-auto my-auto space-y-6">
          {/* Title & Subtitle */}
          <div className="text-center sm:text-left space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16264a] tracking-tight">
              Sign In
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Authorized personnel only. Access is monitored and logged.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="admin@apexrepair.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-10 text-xs bg-slate-50 border-slate-200 focus-visible:bg-white rounded-xl transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-700">Password</Label>
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-xs font-semibold text-[#1E7B5A] hover:text-[#176247] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-10 text-xs bg-slate-50 border-slate-200 focus-visible:bg-white rounded-xl transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#1E7B5A] focus:ring-[#1E7B5A] cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-xs text-slate-600 font-medium cursor-pointer"
              >
                Keep me signed in on this terminal
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-xs font-bold gap-2 rounded-xl bg-gradient-to-r from-[#1E7B5A] to-[#223f6b] hover:from-[#176247] hover:to-[#1a3257] text-white shadow-md shadow-[#1E7B5A]/20 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  <span>Authenticating Credentials...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Legal / Security disclaimer */}
          <p className="text-[11px] text-center text-slate-400 leading-relaxed px-4">
            This system is for authorized Apex Appliance Repair personnel only.
            Unauthorized access is prohibited and may be subject to legal action.
          </p>

          {/* Switch to Signup */}
          <div className="text-center pt-1">
            <span className="text-xs text-slate-500">
              Don't have an account?{" "}
            </span>
            <Link
              to="/signup"
              className="text-xs font-bold text-[#1E7B5A] hover:text-[#176247] hover:underline"
            >
              Create one →
            </Link>
          </div>
        </div>

        {/* Mobile footer */}
        <div className="w-full max-w-md mx-auto text-center pt-6 text-[11px] text-slate-400 lg:hidden">
          © {new Date().getFullYear()} Apex Appliance Repair Inc.
        </div>
      </div>

      {/* ================= FORGOT PASSWORD DIALOG ================= */}
      <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-bold text-[#16264a] flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#1E7B5A]" />
              Reset Password
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Enter your registered email address to receive password recovery instructions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleForgotPassword} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Staff Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="admin@apexrepair.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="pl-10 h-10 text-xs bg-slate-50 border-slate-200 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsForgotOpen(false)}
                className="text-xs text-slate-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSendingReset}
                size="sm"
                className="text-xs font-semibold bg-[#1E7B5A] hover:bg-[#176247] text-white"
              >
                {isSendingReset ? (
                  <>
                    <Spinner size="sm" className="text-white mr-1.5" />
                    Sending Link...
                  </>
                ) : (
                  "Send Recovery Link"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
