import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  isSupabaseConfigured,
  supabaseUrl,
  supabaseAnonKey,
  updateSupabaseCredentials,
  supabase,
} from "@/lib/supabase";
import { Database, CheckCircle, AlertTriangle, Copy, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function SupabaseStatusModal({ isOpen, onClose }) {
  const [url, setUrl] = useState(supabaseUrl || "");
  const [key, setKey] = useState(supabaseAnonKey || "");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const isConfigured = isSupabaseConfigured();

  const handleSave = () => {
    updateSupabaseCredentials(url, key);
    toast.success("Supabase credentials updated! Reloading application...");
    onClose();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      if (!url || !key) {
        setTestResult({ success: false, message: "Please provide both Supabase URL and Anon Key." });
        return;
      }
      if (!supabase) {
        setTestResult({
          success: false,
          message: "Please save credentials first so the client can initialize."
        });
        return;
      }

      const { data, error } = await supabase.from("services").select("id").limit(1);
      if (error) {
        setTestResult({
          success: false,
          message: `Database responded with error: ${error.message}. Did you run supabase-schema.sql in the Supabase SQL editor?`
        });
      } else {
        setTestResult({
          success: true,
          message: "Successfully connected to Supabase and verified tables!"
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: `Connection failed: ${err.message}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopySchemaNote = () => {
    navigator.clipboard.writeText("supabase-schema.sql is located in your project root.");
    toast.info("Copied schema file note to clipboard!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isConfigured ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
              <Database className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-[#16264a]">
                Supabase Integration & Status
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Configure your real-time PostgreSQL backend hosted on Supabase
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Status banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
              isConfigured
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                : "bg-amber-50/70 border-amber-200 text-amber-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {isConfigured ? (
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              )}
              <div>
                <p className="font-semibold">
                  {isConfigured
                    ? "Supabase Credentials Active"
                    : "Running with Local Reactive Database Fallback"}
                </p>
                <p className="text-[11px] opacity-80">
                  {isConfigured
                    ? "All queries and mutations are routed to Supabase."
                    : "Full CRUD is functional locally. Enter your Supabase keys below to sync with your cloud database."}
                </p>
              </div>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-semibold">Supabase Project URL</Label>
              <Input
                placeholder="https://your-project.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-1 font-mono text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Supabase Anon / Public Key</Label>
              <Input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="mt-1 font-mono text-xs"
              />
            </div>
          </div>

          {/* Test connection result */}
          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs border ${
                testResult.success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              {testResult.message}
            </div>
          )}

          {/* Migration helper */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>Database Schema & Migration</span>
              <span className="text-[11px] font-mono bg-slate-200 px-1.5 py-0.5 rounded">
                supabase-schema.sql
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              We generated a complete <code className="text-[#223f6b] font-semibold">supabase-schema.sql</code> file with all 11 tables, RLS policies, indexes, and full Apex seed data. Run it in your Supabase SQL Editor.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="text-xs"
          >
            {isTesting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Test Live Connection
          </Button>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Close
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="bg-[#223f6b] hover:bg-[#16264a] text-white text-xs"
            >
              Save & Apply
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

