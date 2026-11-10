import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSwitchAccount = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#090f1e] p-4 sm:p-6 font-sans text-white select-none relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1E7B5A]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/90 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 text-center relative z-10 backdrop-blur-md">
        {/* Shield Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-5 shadow-lg shadow-rose-950/50">
          <ShieldAlert className="h-8 w-8" />
        </div>

        {/* Badge */}
        <span className="inline-block text-[11px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-3">
          403 Access Denied
        </span>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2">
          Super Admin Privileges Required
        </h1>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
          Access to the Apex Repair Dispatch & Management Console is restricted
          strictly to verified <strong className="text-emerald-400 font-mono">super_admin</strong> accounts.
        </p>

        {/* User context card */}
        <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-left text-xs mb-6 space-y-1.5">
          <div className="flex justify-between items-center text-slate-400 text-[11px]">
            <span>Authenticated User:</span>
            <span className="text-white font-mono">{user?.email || "Unknown"}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400 text-[11px]">
            <span>Current Assigned Role:</span>
            <span className="font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold text-[10px] uppercase">
              {user?.role || "user"}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-400 text-[11px]">
            <span>Account Status:</span>
            <span className={`font-mono text-[10px] font-bold ${user?.is_active ? "text-emerald-400" : "text-rose-400"}`}>
              {user?.is_active ? "ACTIVE" : "INACTIVE / SUSPENDED"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <Button
            type="button"
            onClick={handleSwitchAccount}
            className="w-full h-11 text-xs font-bold gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-[#1E7B5A] hover:from-emerald-700 hover:to-[#176247] text-white shadow-lg cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign In as Authorized Super Admin</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/login")}
            className="w-full h-9 text-xs text-slate-400 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Return to Login
          </Button>
        </div>

        <p className="mt-6 text-[10px] text-slate-500 font-mono">
          Security policy enforced via Supabase Row-Level Authorization.
        </p>
      </div>
    </div>
  );
}

