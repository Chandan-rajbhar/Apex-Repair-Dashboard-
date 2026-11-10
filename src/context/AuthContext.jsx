import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";

const AuthContext = createContext(null);

const DEFAULT_DEMO_USER = {
  id: "usr-admin-01",
  name: "Admin Dispatcher",
  email: "admin@apexrepair.com",
  role: "Administrator",
  phone: "(877) 225-2046",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("apex_auth_user");
      return saved ? JSON.parse(saved) : DEFAULT_DEMO_USER;
    } catch {
      return DEFAULT_DEMO_USER;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If Supabase is configured, listen to auth state changes
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const supaUser = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Staff Member",
            email: session.user.email,
            role: session.user.user_metadata?.role || "Staff Member",
            phone: session.user.user_metadata?.phone || "",
            avatar: session.user.user_metadata?.avatar_url || DEFAULT_DEMO_USER.avatar,
          };
          setUser(supaUser);
          localStorage.setItem("apex_auth_user", JSON.stringify(supaUser));
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const supaUser = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Staff Member",
            email: session.user.email,
            role: session.user.user_metadata?.role || "Staff Member",
            phone: session.user.user_metadata?.phone || "",
            avatar: session.user.user_metadata?.avatar_url || DEFAULT_DEMO_USER.avatar,
          };
          setUser(supaUser);
          localStorage.setItem("apex_auth_user", JSON.stringify(supaUser));
        } else if (_event === "SIGNED_OUT") {
          setUser(null);
          localStorage.removeItem("apex_auth_user");
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      // 1. If Supabase configured, attempt live auth
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error && data?.user) {
          const loggedUser = {
            id: data.user.id,
            name: data.user.user_metadata?.full_name || email.split("@")[0],
            email: data.user.email,
            role: data.user.user_metadata?.role || "Administrator",
            avatar: data.user.user_metadata?.avatar_url || DEFAULT_DEMO_USER.avatar,
          };
          setUser(loggedUser);
          localStorage.setItem("apex_auth_user", JSON.stringify(loggedUser));
          toast.success(`Welcome back, ${loggedUser.name}!`);
          return { success: true, user: loggedUser };
        } else if (error && !email.toLowerCase().includes("apexrepair.com")) {
          // If non-demo and Supabase failed, return error
          toast.error(error.message || "Failed to sign in to Supabase.");
          return { success: false, error: error.message };
        }
      }

      // 2. Local / Demo mode fallback
      // Check stored custom registered users or fallback to demo
      let registeredUsers = [];
      try {
        registeredUsers = JSON.parse(localStorage.getItem("apex_registered_users") || "[]");
      } catch {
        registeredUsers = [];
      }

      const found = registeredUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

      const authenticatedUser = found
        ? {
            id: found.id,
            name: found.name,
            email: found.email,
            role: found.role || "Administrator",
            avatar: found.avatar || DEFAULT_DEMO_USER.avatar,
          }
        : {
            ...DEFAULT_DEMO_USER,
            email: email.trim(),
            name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Staff Member",
          };

      setUser(authenticatedUser);
      localStorage.setItem("apex_auth_user", JSON.stringify(authenticatedUser));
      toast.success(`Signed in successfully as ${authenticatedUser.name}`);
      return { success: true, user: authenticatedUser };
    } catch (err) {
      toast.error("An unexpected error occurred during sign in.");
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async ({ name, email, password, role = "Administrator", phone = "" }) => {
    setIsLoading(true);
    try {
      // 1. If Supabase configured, attempt live registration
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role,
              phone,
            },
          },
        });

        if (!error && data?.user) {
          const newUser = {
            id: data.user.id,
            name,
            email,
            role,
            phone,
            avatar: DEFAULT_DEMO_USER.avatar,
          };
          setUser(newUser);
          localStorage.setItem("apex_auth_user", JSON.stringify(newUser));
          toast.success("Account created successfully in Supabase!");
          return { success: true, user: newUser };
        } else if (error && !email.toLowerCase().includes("apexrepair.com")) {
          toast.error(error.message || "Failed to create account in Supabase.");
          return { success: false, error: error.message };
        }
      }

      // 2. Local fallback registration
      const newUser = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        role,
        phone,
        avatar: DEFAULT_DEMO_USER.avatar,
        created_at: new Date().toISOString(),
      };

      let registeredUsers = [];
      try {
        registeredUsers = JSON.parse(localStorage.getItem("apex_registered_users") || "[]");
      } catch {
        registeredUsers = [];
      }

      registeredUsers.push({ ...newUser, password });
      localStorage.setItem("apex_registered_users", JSON.stringify(registeredUsers));

      setUser(newUser);
      localStorage.setItem("apex_auth_user", JSON.stringify(newUser));
      toast.success(`Account created! Welcome to Apex Repair, ${name}.`);
      return { success: true, user: newUser };
    } catch (err) {
      toast.error("Failed to create account.");
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
      console.warn("Supabase sign out error:", e);
    }
    setUser(null);
    localStorage.removeItem("apex_auth_user");
    toast.info("You have been signed out.");
  };

  const quickDemoLogin = (role = "Administrator") => {
    const demoUser = {
      ...DEFAULT_DEMO_USER,
      role,
      name: role === "Administrator" ? "Admin Dispatcher" : `${role} Specialist`,
    };
    setUser(demoUser);
    localStorage.setItem("apex_auth_user", JSON.stringify(demoUser));
    toast.success(`Logged in as ${demoUser.name} (${role})`);
    return demoUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        signup,
        logout,
        quickDemoLogin,
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

