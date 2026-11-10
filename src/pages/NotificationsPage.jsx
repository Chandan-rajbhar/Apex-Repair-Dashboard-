import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { SpinnerCustom } from "@/components/ui/spinner";
import {
  Bell,
  AlertTriangle,
  CalendarCheck,
  CreditCard,
  UserCheck,
  CheckCheck,
  Trash2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const list = await db.getNotifications();
      setNotifications(list || []);
    } catch (e) {
      toast.error("Failed to load notifications from Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await db.markNotificationRead(id);
      toast.success("Notification marked as read.");
      await loadNotifications();
    } catch (err) {
      toast.error("Failed to update notification.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await db.markAllNotificationsRead();
      toast.success("All notifications marked as read!");
      await loadNotifications();
    } catch (err) {
      toast.error("Failed to mark all as read.");
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await db.deleteNotification(id);
      toast.success("Notification dismissed.");
      await loadNotifications();
    } catch (err) {
      toast.error("Failed to delete notification.");
    }
  };

  const filtered = notifications.filter((n) => {
    if (filterType === "all") return true;
    if (filterType === "unread") return !n.is_read;
    return n.type === filterType;
  });

  const getIcon = (type) => {
    switch (type) {
      case "emergency":
        return <AlertTriangle className="h-5 w-5 text-rose-600" />;
      case "quote":
      case "booking":
        return <CalendarCheck className="h-5 w-5 text-blue-600" />;
      case "payment":
        return <CreditCard className="h-5 w-5 text-emerald-600" />;
      case "technician":
        return <UserCheck className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#16264a]">Notifications Center</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational alerts, emergency dispatch pings, quote authorizations, and cleared payments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-xs bg-white gap-1.5"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark All as Read
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {["all", "unread", "emergency", "booking", "quote", "payment"].map((type) => (
          <Button
            key={type}
            variant={filterType === type ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType(type)}
            className={`text-xs capitalize h-8 ${
              filterType === type ? "bg-[#223f6b] text-white" : "bg-white text-slate-600"
            }`}
          >
            {type === "all" ? "All Alerts" : type}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {isLoading ? (
          <div className="p-12 text-center border border-slate-200/90 rounded-2xl bg-white shadow-2xs">
            <SpinnerCustom text="Loading operational notifications & alerts..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white space-y-2">
            <Bell className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No notifications found</p>
            <p className="text-xs text-slate-400">You are all caught up with active dispatch events.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <Card
              key={item.id}
              onClick={() => item.link && navigate(item.link)}
              className={`border transition-all cursor-pointer hover:shadow-xs ${
                !item.is_read
                  ? "bg-blue-50/40 border-blue-200/80"
                  : "bg-white border-slate-200/80"
              }`}
            >
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shrink-0 shadow-2xs">
                    {getIcon(item.type)}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-[#16264a]">
                        {item.title}
                      </span>
                      {!item.is_read && (
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600">{item.message}</p>
                    <p className="text-[10px] text-slate-400 font-mono pt-1">
                      {formatDateTime(item.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!item.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleMarkAsRead(item.id, e)}
                      className="text-xs h-7 text-blue-600 hover:text-blue-800"
                    >
                      Mark read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDelete(item.id, e)}
                    className="h-7 w-7 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

