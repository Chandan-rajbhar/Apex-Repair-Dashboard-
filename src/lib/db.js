import { supabase, isSupabaseConfigured } from "./supabase";
import {
  SERVICES,
  APPLIANCE_CATEGORIES,
  TECHNICIANS,
  CUSTOMERS,
  SERVICE_REQUESTS,
  PAYMENTS,
  PROMOTIONS,
  REVIEWS,
  NOTIFICATIONS,
  PRICING_LIST,
  BOOKING_STEPS
} from "./mockData";

// Helper for local storage persistent storage when Supabase is not connected
const getLocal = (key, fallback) => {
  try {
    const val = localStorage.getItem(`apex_db_${key}`);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setLocal = (key, data) => {
  try {
    localStorage.setItem(`apex_db_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to persist ${key}:`, e);
  }
};

// Initialize local storage only if Supabase is not configured
const initLocalStorage = () => {
  if (typeof window === "undefined") return;
  if (isSupabaseConfigured()) {
    // Zero static seed data when connected to Supabase
    return;
  }
  if (!localStorage.getItem("apex_db_initialized")) {
    setLocal("services", SERVICES);
    setLocal("categories", APPLIANCE_CATEGORIES);
    setLocal("technicians", []);
    setLocal("customers", []);
    setLocal("bookings", []);
    setLocal("payments", []);
    setLocal("promotions", []);
    setLocal("reviews", []);
    setLocal("notifications", []);
    setLocal("pricing", PRICING_LIST);
    localStorage.setItem("apex_db_initialized", "true");
  }
};

initLocalStorage();

// Unified Database API
export const db = {
  isConfigured: () => isSupabaseConfigured(),

  // ================= SERVICES =================
  async getServices() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("services").select("*").order("rating", { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn("Supabase fetch services failed, using local db:", e);
      }
    }
    return getLocal("services", SERVICES);
  },

  async addService(service) {
    const newService = {
      ...service,
      id: service.id || `srv-${Date.now()}`,
      rating: Number(service.rating) || 4.90,
      completedRepairs: Number(service.completedRepairs) || 0,
      diagnosticFee: Number(service.diagnosticFee) || 79.00,
      is_active: service.is_active ?? true,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("services").insert([newService]).select();
        if (!error && data?.[0]) return data[0];
      } catch (e) {
        console.warn("Supabase addService failed, persisting locally:", e);
      }
    }

    const current = getLocal("services", SERVICES);
    const updated = [newService, ...current];
    setLocal("services", updated);
    return newService;
  },

  async updateService(id, updates) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("services").update(updates).eq("id", id).select();
        if (!error && data?.[0]) return data[0];
      } catch (e) {
        console.warn("Supabase updateService failed:", e);
      }
    }

    const current = getLocal("services", SERVICES);
    const updated = current.map((s) => (s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s));
    setLocal("services", updated);
    return updated.find((s) => s.id === id);
  },

  async deleteService(id) {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from("services").delete().eq("id", id);
      } catch (e) {
        console.warn("Supabase deleteService error:", e);
      }
    }
    const current = getLocal("services", SERVICES);
    const updated = current.filter((s) => s.id !== id);
    setLocal("services", updated);
    return true;
  },

  // ================= CATEGORIES =================
  async getCategories() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("appliance_categories").select("*").order("display_order");
        if (!error && data) return data;
      } catch (e) {
        console.warn("Supabase categories query failed:", e);
      }
    }
    return getLocal("categories", APPLIANCE_CATEGORIES);
  },

  async addCategory(cat) {
    const newCat = {
      ...cat,
      id: cat.id || cat.name.toLowerCase().replace(/\s+/g, "-"),
      is_active: true,
      display_order: Number(cat.display_order) || 99,
      created_at: new Date().toISOString()
    };
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("appliance_categories").insert([newCat]).select();
        if (!error && data?.[0]) return data[0];
      } catch (e) {
        console.warn("Supabase addCategory failed:", e);
      }
    }
    const current = getLocal("categories", APPLIANCE_CATEGORIES);
    const updated = [...current, newCat];
    setLocal("categories", updated);
    return newCat;
  },

  async updateCategory(id, updates) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("appliance_categories").update(updates).eq("id", id).select();
        if (!error && data?.[0]) return data[0];
      } catch (e) {
        console.warn("Supabase updateCategory failed:", e);
      }
    }
    const current = getLocal("categories", APPLIANCE_CATEGORIES);
    const updated = current.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setLocal("categories", updated);
    return updated.find((c) => c.id === id);
  },

  async deleteCategory(id) {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from("appliance_categories").delete().eq("id", id);
      } catch (e) {
        console.warn("Supabase deleteCategory failed:", e);
      }
    }
    const current = getLocal("categories", APPLIANCE_CATEGORIES);
    const updated = current.filter((c) => c.id !== id);
    setLocal("categories", updated);
    return true;
  },

  // ================= BOOKINGS / SERVICE REQUESTS =================
  async getBookings() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("service_requests")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn("Supabase bookings fetch failed, using local db:", e);
      }
    }
    return getLocal("bookings", SERVICE_REQUESTS);
  },

  async addBooking(booking) {
    const code = booking.booking_code || `AR-${Math.floor(1000 + Math.random() * 9000)}`;
    const stepDef = BOOKING_STEPS.find((s) => s.id === (booking.current_step || 1)) || BOOKING_STEPS[0];
    
    const newBooking = {
      ...booking,
      id: booking.id || `req-${Date.now()}`,
      booking_code: code,
      current_step: booking.current_step || 1,
      status: booking.status || stepDef.key,
      quote_amount: Number(booking.quote_amount) || 0,
      diagnostic_fee: Number(booking.diagnostic_fee) || 79.00,
      total_amount: (Number(booking.quote_amount) || 0) + (Number(booking.diagnostic_fee) || 79.00),
      payment_status: booking.payment_status || "unpaid",
      quote_status: booking.quote_status || (booking.quote_amount > 0 ? "pending" : "none"),
      is_emergency: Boolean(booking.is_emergency),
      created_at: new Date().toISOString(),
      timeline: booking.timeline || [
        {
          step: 1,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          note: "Diagnostic request logged and entered into queue."
        }
      ]
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("service_requests").insert([newBooking]).select();
        if (!error && data?.[0]) return data[0];
      } catch (e) {
        console.warn("Supabase addBooking failed:", e);
      }
    }

    const current = getLocal("bookings", SERVICE_REQUESTS);
    const updated = [newBooking, ...current];
    setLocal("bookings", updated);
    return newBooking;
  },

  async updateBooking(id, updates) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("service_requests").update(updates).eq("id", id).select();
        if (!error && data?.[0]) return data[0];
      } catch (e) {
        console.warn("Supabase updateBooking failed:", e);
      }
    }

    const current = getLocal("bookings", SERVICE_REQUESTS);
    const updated = current.map((b) => {
      if (b.id === id) {
        const next = { ...b, ...updates, updated_at: new Date().toISOString() };
        if (updates.current_step && updates.current_step !== b.current_step) {
          const stepDef = BOOKING_STEPS.find((s) => s.id === updates.current_step);
          next.status = stepDef ? stepDef.key : next.status;
          const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const timeline = [...(next.timeline || [])];
          timeline.push({
            step: updates.current_step,
            time,
            note: stepDef ? stepDef.desc : `Step updated to ${updates.current_step}`
          });
          next.timeline = timeline;
        }
        return next;
      }
      return b;
    });
    setLocal("bookings", updated);
    return updated.find((b) => b.id === id);
  },

  async deleteBooking(id) {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from("service_requests").delete().eq("id", id);
      } catch (e) {
        console.warn("Supabase deleteBooking failed:", e);
      }
    }
    const current = getLocal("bookings", SERVICE_REQUESTS);
    const updated = current.filter((b) => b.id !== id);
    setLocal("bookings", updated);
    return true;
  },

  // ================= CUSTOMERS =================
  async getCustomers() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn("Supabase getCustomers failed:", e);
      }
    }
    return getLocal("customers", CUSTOMERS);
  },

  async addCustomer(customer) {
    const newCust = {
      ...customer,
      id: customer.id || `cust-${Date.now()}`,
      total_bookings: Number(customer.total_bookings) || 0,
      lifetime_spend: Number(customer.lifetime_spend) || 0.0,
      status: customer.status || "active",
      created_at: new Date().toISOString()
    };
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("customers").insert([newCust]).select();
        if (!error && data?.[0]) return data[0];
      } catch (e) {
        console.warn("Supabase addCustomer failed:", e);
      }
    }
    const current = getLocal("customers", CUSTOMERS);
    const updated = [newCust, ...current];
    setLocal("customers", updated);
    return newCust;
  },

  async updateCustomer(id, updates) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("customers").update(updates).eq("id", id).select();
        if (!error && data?.[0]) return data[0];
      } catch (e) {
        console.warn("Supabase updateCustomer failed:", e);
      }
    }
    const current = getLocal("customers", CUSTOMERS);
    const updated = current.map((c) => (c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c));
    setLocal("customers", updated);
    return updated.find((c) => c.id === id);
  },

  async deleteCustomer(id) {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from("customers").delete().eq("id", id);
      } catch (e) {
        console.warn("Supabase deleteCustomer failed:", e);
      }
    }
    const current = getLocal("customers", CUSTOMERS);
    const updated = current.filter((c) => c.id !== id);
    setLocal("customers", updated);
    return true;
  },

  // ================= TECHNICIANS =================
  async getTechnicians() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("technicians").select("*").order("rating", { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn("Supabase getTechnicians failed:", e);
      }
    }
    return getLocal("technicians", TECHNICIANS);
  },

  async addTechnician(tech) {
    const newTech = {
      ...tech,
      id: tech.id || `tech-${Date.now()}`,
      rating: Number(tech.rating) || 4.95,
      completed_jobs: Number(tech.completed_jobs) || 0,
      active_jobs: Number(tech.active_jobs) || 0,
      status: tech.status || "available",
      eta_minutes: Number(tech.eta_minutes) || 15,
      photo_url: tech.photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      created_at: new Date().toISOString()
    };
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("technicians").insert([newTech]).select();
        if (!error && data?.[0]) return data[0];
      } catch (e) {
        console.warn("Supabase addTechnician failed:", e);
      }
    }
    const current = getLocal("technicians", TECHNICIANS);
    const updated = [newTech, ...current];
    setLocal("technicians", updated);
    return newTech;
  },

  async updateTechnician(id, updates) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("technicians").update(updates).eq("id", id).select();
        if (!error && data?.[0]) return data[0];
      } catch (e) {
        console.warn("Supabase updateTechnician failed:", e);
      }
    }
    const current = getLocal("technicians", TECHNICIANS);
    const updated = current.map((t) => (t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t));
    setLocal("technicians", updated);
    return updated.find((t) => t.id === id);
  },

  async deleteTechnician(id) {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from("technicians").delete().eq("id", id);
      } catch (e) {
        console.warn("Supabase deleteTechnician failed:", e);
      }
    }
    const current = getLocal("technicians", TECHNICIANS);
    const updated = current.filter((t) => t.id !== id);
    setLocal("technicians", updated);
    return true;
  },

  // ================= PRICING =================
  async getPricing() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("pricing").select("*");
        if (!error && data) return data;
      } catch (e) {
        console.warn("Supabase getPricing failed:", e);
      }
    }
    return getLocal("pricing", PRICING_LIST);
  },

  async updatePricing(id, updates) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("pricing").update(updates).eq("id", id).select();
        if (!error && data?.[0]) return data[0];
      } catch (e) {
        console.warn("Supabase updatePricing failed:", e);
      }
    }
    const current = getLocal("pricing", PRICING_LIST);
    const updated = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setLocal("pricing", updated);
    return updated.find((p) => p.id === id);
  },

  async addPricing(price) {
    const newPrice = {
      ...price,
      id: price.id || `price-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    const current = getLocal("pricing", PRICING_LIST);
    const updated = [...current, newPrice];
    setLocal("pricing", updated);
    return newPrice;
  },

  async deletePricing(id) {
    const current = getLocal("pricing", PRICING_LIST);
    const updated = current.filter((p) => p.id !== id);
    setLocal("pricing", updated);
    return true;
  },

  // ================= PAYMENTS =================
  async getPayments() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn("Supabase getPayments failed:", e);
      }
    }
    return getLocal("payments", PAYMENTS);
  },

  async addPayment(payment) {
    const newPay = {
      ...payment,
      id: payment.id || `pay-${Date.now()}`,
      invoice_number: payment.invoice_number || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      transaction_id: payment.transaction_id || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      paid_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      status: payment.status || "paid"
    };
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("payments").insert([newPay]).select();
        if (!error && data?.[0]) return data[0];
      } catch (e) {
        console.warn("Supabase addPayment failed:", e);
      }
    }
    const current = getLocal("payments", PAYMENTS);
    const updated = [newPay, ...current];
    setLocal("payments", updated);
    return newPay;
  },

  async updatePayment(id, updates) {
    const current = getLocal("payments", PAYMENTS);
    const updated = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setLocal("payments", updated);
    return updated.find((p) => p.id === id);
  },

  async deletePayment(id) {
    const current = getLocal("payments", PAYMENTS);
    const updated = current.filter((p) => p.id !== id);
    setLocal("payments", updated);
    return true;
  },

  // ================= PROMOTIONS =================
  async getPromotions() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("promotions").select("*");
        if (!error && data) return data;
      } catch (e) {
        console.warn("Supabase getPromotions failed:", e);
      }
    }
    return getLocal("promotions", PROMOTIONS);
  },

  async addPromotion(promo) {
    const newPromo = {
      ...promo,
      id: promo.id || `promo-${Date.now()}`,
      times_used: 0,
      is_active: true,
      created_at: new Date().toISOString()
    };
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("promotions").insert([newPromo]).select();
        if (!error && data?.[0]) return data[0];
      } catch (e) {
        console.warn("Supabase addPromotion failed:", e);
      }
    }
    const current = getLocal("promotions", PROMOTIONS);
    const updated = [newPromo, ...current];
    setLocal("promotions", updated);
    return newPromo;
  },

  async updatePromotion(id, updates) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("promotions").update(updates).eq("id", id).select();
        if (!error && data?.[0]) return data[0];
      } catch (e) {
        console.warn("Supabase updatePromotion failed:", e);
      }
    }
    const current = getLocal("promotions", PROMOTIONS);
    const updated = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setLocal("promotions", updated);
    return updated.find((p) => p.id === id);
  },

  async deletePromotion(id) {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from("promotions").delete().eq("id", id);
      } catch (e) {
        console.warn("Supabase deletePromotion failed:", e);
      }
    }
    const current = getLocal("promotions", PROMOTIONS);
    const updated = current.filter((p) => p.id !== id);
    setLocal("promotions", updated);
    return true;
  },

  // ================= REVIEWS =================
  async getReviews() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn("Supabase getReviews failed:", e);
      }
    }
    return getLocal("reviews", REVIEWS);
  },

  async addReview(review) {
    const newRev = {
      ...review,
      id: review.id || `rev-${Date.now()}`,
      is_verified: true,
      is_published: true,
      review_date: new Date().toISOString().split("T")[0],
      created_at: new Date().toISOString()
    };
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("reviews").insert([newRev]).select();
        if (!error && data?.[0]) return data[0];
      } catch (e) {
        console.warn("Supabase addReview failed:", e);
      }
    }
    const current = getLocal("reviews", REVIEWS);
    const updated = [newRev, ...current];
    setLocal("reviews", updated);
    return newRev;
  },

  async updateReview(id, updates) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("reviews").update(updates).eq("id", id).select();
        if (!error && data?.[0]) return data[0];
      } catch (e) {
        console.warn("Supabase updateReview failed:", e);
      }
    }
    const current = getLocal("reviews", REVIEWS);
    const updated = current.map((r) => (r.id === id ? { ...r, ...updates } : r));
    setLocal("reviews", updated);
    return updated.find((r) => r.id === id);
  },

  async deleteReview(id) {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from("reviews").delete().eq("id", id);
      } catch (e) {
        console.warn("Supabase deleteReview failed:", e);
      }
    }
    const current = getLocal("reviews", REVIEWS);
    const updated = current.filter((r) => r.id !== id);
    setLocal("reviews", updated);
    return true;
  },

  // ================= NOTIFICATIONS =================
  async getNotifications() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn("Supabase getNotifications failed:", e);
      }
    }
    return getLocal("notifications", NOTIFICATIONS);
  },

  async markNotificationRead(id) {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      } catch (e) {
        console.warn("Supabase markNotificationRead failed:", e);
      }
    }
    const current = getLocal("notifications", NOTIFICATIONS);
    const updated = current.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    setLocal("notifications", updated);
    return true;
  },

  async markAllNotificationsRead() {
    const current = getLocal("notifications", NOTIFICATIONS);
    const updated = current.map((n) => ({ ...n, is_read: true }));
    setLocal("notifications", updated);
    return true;
  },

  async deleteNotification(id) {
    const current = getLocal("notifications", NOTIFICATIONS);
    const updated = current.filter((n) => n.id !== id);
    setLocal("notifications", updated);
    return true;
  },

  // ================= DASHBOARD OVERVIEW STATS =================
  async getDashboardStats() {
    const [customers, bookings, payments, services, technicians] = await Promise.all([
      this.getCustomers(),
      this.getBookings(),
      this.getPayments(),
      this.getServices(),
      this.getTechnicians()
    ]);

    const totalCustomers = customers.length;
    const totalRequests = bookings.length;
    const pendingRequests = bookings.filter((b) => b.current_step < 8).length;
    const completedServices = bookings.filter((b) => b.current_step >= 8).length;
    const emergencyRequests = bookings.filter((b) => b.is_emergency).length;

    // Calculate revenue from payments
    const totalRevenue = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

    // Category breakdown
    const categoryCounts = {};
    bookings.forEach((b) => {
      const cat = b.appliance_name || "Other";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const categoryStats = Object.keys(categoryCounts).map((key) => ({
      name: key,
      count: categoryCounts[key],
      percentage: Math.round((categoryCounts[key] / (totalRequests || 1)) * 100)
    }));

    // Active technicians
    const activeTechs = technicians.filter((t) => t.status === "on_job" || t.status === "available").length;

    return {
      totalCustomers,
      totalRequests,
      pendingRequests,
      completedServices,
      emergencyRequests,
      totalRevenue,
      categoryStats,
      activeTechs,
      recentBookings: bookings.slice(0, 5),
      recentCustomers: customers.slice(0, 5)
    };
  }
};

