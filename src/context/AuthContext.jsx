import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from "@/lib/supabase";
import { toast } from "sonner";

const AuthContext = createContext(null);

export const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("apex_auth_user");
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed?.role === "super_admin" && parsed?.is_active === true) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verifySessionAndRole = async () => {
      setIsLoading(true);

      if (!isSupabaseConfigured() || !supabase) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          if (isMounted) {
            setUser(null);
            localStorage.removeItem("apex_auth_user");
          }
          return;
        }

        const authUser = session.user;
        const cleanEmail = authUser.email?.toLowerCase().trim() || "";

        // Query the public.users record
        let userProfile = null;
        try {
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", authUser.id)
            .maybeSingle();
          if (!error && data) {
            userProfile = data;
          }
        } catch (e) {
          console.warn("Session userProfile fetch note:", e);
        }

        // Strict validation: Only active super_admin is allowed
        if (userProfile) {
          if (userProfile.role !== "super_admin" || userProfile.is_active !== true) {
            if (isMounted) {
              setUser(null);
              localStorage.removeItem("apex_auth_user");
            }
            return;
          }
        }

        const validatedUser = {
          id: authUser.id,
          name:
            userProfile?.full_name ||
            authUser.user_metadata?.full_name ||
            cleanEmail.split("@")[0],
          email: cleanEmail,
          role: "super_admin",
          is_active: true,
          avatar: authUser.user_metadata?.avatar_url || DEFAULT_AVATAR,
        };

        if (isMounted) {
          setUser(validatedUser);
          localStorage.setItem(
            "apex_auth_user",
            JSON.stringify(validatedUser)
          );
        }

        // Background sync if record wasn't yet in public.users
        if (!userProfile && session.access_token) {
          try {
            const userClient = createClient(supabaseUrl, supabaseAnonKey, {
              auth: { persistSession: false },
              global: {
                headers: { Authorization: `Bearer ${session.access_token}` },
              },
            });
            const now = new Date().toISOString();
            await userClient.from("users").upsert({
              id: authUser.id,
              full_name: validatedUser.name,
              email: cleanEmail,
              role: "super_admin",
              is_active: true,
              created_at: now,
              updated_at: now,
            });
          } catch (syncErr) {
            console.warn("Background user sync note:", syncErr);
          }
        }
      } catch (err) {
        console.error("Auth verification error:", err);
        if (isMounted) {
          setUser(null);
          localStorage.removeItem("apex_auth_user");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifySessionAndRole();

    const { data: authListener } = supabase?.auth?.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          if (isMounted) {
            setUser(null);
            localStorage.removeItem("apex_auth_user");
          }
        }
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured() || !supabase) {
        toast.error("Supabase is not configured.");
        return { success: false, error: "Supabase not configured" };
      }

      const cleanEmail = email.trim().toLowerCase();

      // 1. Authenticate credentials with Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (authError || !authData?.user) {
        const errorMsg =
          authError?.message === "Email not confirmed"
            ? `Please check your inbox (${cleanEmail}) to confirm your email before signing in, or disable email confirmation in Supabase Auth.`
            : authError?.message || "Invalid email or password.";
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      const authUserId = authData.user.id;

      // 2. Fetch user profile from public.users table
      let userRecord = null;
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUserId)
          .maybeSingle();

        if (!error && data) {
          userRecord = data;
        } else if (error) {
          console.warn("Notice querying users table:", error.message);
        }
      } catch (err) {
        console.warn("Users query error:", err);
      }

      // 3. Fallback: If userRecord is missing from public.users (e.g. before SQL sync ran),
      // auto-create or provision them with role 'super_admin' using active session token
      if (!userRecord) {
        const fallbackName =
          authData.user.user_metadata?.full_name ||
          cleanEmail.split("@")[0];

        try {
          const token = authData.session?.access_token;
          const userClient = token
            ? createClient(supabaseUrl, supabaseAnonKey, {
                auth: { persistSession: false },
                global: { headers: { Authorization: `Bearer ${token}` } },
              })
            : supabase;

          const now = new Date().toISOString();
          const newRecord = {
            id: authUserId,
            full_name: fallbackName,
            email: cleanEmail,
            role: "super_admin",
            is_active: true,
            created_at: now,
            updated_at: now,
          };

          const { data: inserted } = await userClient
            .from("users")
            .upsert(newRecord, { onConflict: "id" })
            .select()
            .maybeSingle();

          if (inserted) {
            userRecord = inserted;
          } else {
            userRecord = newRecord;
          }
        } catch (syncErr) {
          console.warn("Fallback user creation note:", syncErr);
          userRecord = {
            id: authUserId,
            full_name: fallbackName,
            email: cleanEmail,
            role: "super_admin",
            is_active: true,
          };
        }
      }

      // 4. Strict Validation: Account must be active
      if (userRecord.is_active !== true) {
        await supabase.auth.signOut();
        setUser(null);
        localStorage.removeItem("apex_auth_user");
        const errorMsg =
          "Access Denied: Your account has been deactivated. Please contact administrator.";
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      // 5. Strict Validation: Role MUST be 'super_admin' ONLY
      if (userRecord.role !== "super_admin") {
        await supabase.auth.signOut();
        setUser(null);
        localStorage.removeItem("apex_auth_user");
        const errorMsg = `Access Denied: Only accounts with 'super_admin' role can access the Apex Repair Dashboard. (Your account role: '${userRecord.role}')`;
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      // 6. Access Granted for Super Admin
      const validatedSuperAdmin = {
        id: userRecord.id,
        name: userRecord.full_name,
        email: userRecord.email,
        role: "super_admin",
        is_active: true,
        avatar: authData.user.user_metadata?.avatar_url || DEFAULT_AVATAR,
      };

      setUser(validatedSuperAdmin);
      localStorage.setItem(
        "apex_auth_user",
        JSON.stringify(validatedSuperAdmin)
      );
      toast.success(
        `Welcome back, Super Admin ${validatedSuperAdmin.name}!`
      );
      return { success: true, user: validatedSuperAdmin };
    } catch (err) {
      console.error("Login error:", err);
      toast.error("An unexpected error occurred during authentication.");
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async ({ name, email, password }) => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured() || !supabase) {
        toast.error("Supabase is not configured.");
        return { success: false, error: "Supabase not configured" };
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();

      // 1. Register with Supabase Authentication with metadata role = 'super_admin'
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            role: "super_admin",
          },
        },
      });

      if (authError || !authData?.user) {
        const errorMsg =
          authError?.message || "Failed to create Supabase account.";
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      const authUserId = authData.user.id;

      // 2. Automatically save in public.users table with role = 'super_admin' (NEVER 'user')
      const now = new Date().toISOString();
      const userRecord = {
        id: authUserId,
        full_name: cleanName,
        email: cleanEmail,
        role: "super_admin",
        is_active: true,
        created_at: now,
        updated_at: now,
      };

      try {
        const token = authData.session?.access_token;
        const clientToUse = token
          ? createClient(supabaseUrl, supabaseAnonKey, {
              auth: { persistSession: false },
              global: { headers: { Authorization: `Bearer ${token}` } },
            })
          : supabase;

        await clientToUse
          .from("users")
          .upsert(userRecord, { onConflict: "id" });
      } catch (e) {
        console.warn("Notice: users table sync:", e);
      }

      // If session exists (email confirmation disabled or auto-confirmed), log in immediately
      if (authData.session) {
        const activeUser = {
          id: authUserId,
          name: cleanName,
          email: cleanEmail,
          role: "super_admin",
          is_active: true,
          avatar: DEFAULT_AVATAR,
        };
        setUser(activeUser);
        localStorage.setItem("apex_auth_user", JSON.stringify(activeUser));
        toast.success("Super Admin account registered and authenticated!");
        return { success: true, user: activeUser, autoLogin: true };
      }

      toast.success(
        "Super Admin account created successfully! Please sign in with your credentials."
      );
      return { success: true, autoLogin: false };
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Registration failed: " + err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured() && supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn("Sign out error:", e);
    } finally {
      setUser(null);
      localStorage.removeItem("apex_auth_user");
      toast.info("You have been signed out.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(
          user && user.role === "super_admin" && user.is_active === true
        ),
        isSuperAdmin: user?.role === "super_admin" && user?.is_active === true,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
