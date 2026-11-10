import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AdminLayout } from "./components/layout/AdminLayout";
import { DashboardOverview } from "./pages/DashboardOverview";
import { ServicesPage } from "./pages/ServicesPage";
import { BookingsPage } from "./pages/BookingsPage";
import { CustomersPage } from "./pages/CustomersPage";
import { TechniciansPage } from "./pages/TechniciansPage";
import { SchedulingPage } from "./pages/SchedulingPage";
import { PricingPage } from "./pages/PricingPage";
import { EmergencyPage } from "./pages/EmergencyPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { PromotionsPage } from "./pages/PromotionsPage";
import { ReviewsPage } from "./pages/ReviewsPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: "13px",
          },
        }}
      />
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="technicians" element={<TechniciansPage />} />
          <Route path="scheduling" element={<SchedulingPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="emergency" element={<EmergencyPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="promotions" element={<PromotionsPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

