import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import { Shield } from "lucide-react";

export function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#090f1e] text-white select-none">
        <div className="relative flex items-center justify-center mb-6">
          <div className="h-16 w-16 rounded-2xl bg-[#1E7B5A]/20 border border-emerald-400/30 flex items-center justify-center animate-pulse">
            <Shield className="h-8 w-8 text-emerald-400" />
          </div>
          <Spinner size="lg" className="absolute -inset-2 text-emerald-400/40" />
        </div>
        <h2 className="text-sm font-bold tracking-widest uppercase text-white mb-1">
          Apex Repair Enterprise
        </h2>
        <p className="text-xs text-slate-400 font-mono animate-pulse">
          Verifying Super Admin Authorization...
        </p>
      </div>
    );
  }

  // 1. Unauthenticated users -> Redirect to Login
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 2. Non-super_admin or deactivated users -> Redirect to Unauthorized Access page
  if (user.role !== "super_admin" || user.is_active !== true) {
    return <Navigate to="/unauthorized" state={{ from: location.pathname }} replace />;
  }

  // 3. Authorized Super Admin -> Render dashboard
  return children ? children : <Outlet />;
}

