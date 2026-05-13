"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Alert from "@/components/Message";
import {
  BarChart3,
  PieChart,
  LogOut,
  Receipt,
  Tags,
  Menu,
  X,
} from "lucide-react";
import { colors } from "@/lib/colors";
import router from "next/router";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "Transactions", href: "/transactions", icon: Receipt },
  { label: "Categories", href: "/categories", icon: Tags },
  { label: "Budgets", href: "/budgets", icon: PieChart },
];

function Navigation({
  pathname,
  onNavigate,
  mobile = false,
}: {
  pathname: string;
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  return (
    <nav className="space-y-3">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
            style={{
              backgroundColor: active ? colors.primary : "transparent",
              color: active
                ? "white"
                : mobile
                  ? colors.secondary
                  : colors.background,
            }}
          >
            <Icon size={20} />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);

  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  // Load user from localStorage first, then verify with server
  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUserEmail(user.email || "");
      } catch (error) {
        console.error("Invalid user in localStorage", error);
        localStorage.removeItem("user");
      }
    }

    // 2. Verify session from server
    const loadUser = async () => {
      try {
        const res = await fetch("/api/me", {
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok) {
          setUserEmail(data.user.email);

          // Update localStorage
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          setUserEmail("");
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Failed to load user", error);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, []);

  // Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      setShowLogoutAlert(false);

      setAlert({
        type: "success",
        message: "Logged out successfully!",
      });

      setTimeout(() => {
        router.push("/login");
      }, 800);
    } catch (error) {
      setAlert({
        type: "error",
        message: "Logout failed!",
      });
    }
  };
  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: colors.primary }}
    >
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside
        className="hidden lg:flex w-72 flex-col justify-between p-6 border-r"
        style={{
          backgroundColor: colors.secondary,
          borderColor: `${colors.accent}55`,
        }}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <img
              src="/images/logo.png"
              alt="My Wallet Logo"
              className="w-16 h-16"
              style={{
                filter: `drop-shadow(0 0 8px ${colors.accent})`,
              }}
            />
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: colors.background }}
              >
                My Wallet
              </h1>
              <p className="text-xs" style={{ color: colors.background }}>
                Finance Tracker
              </p>
            </div>
          </div>

          <Navigation pathname={pathname} />
        </div>

        {/* User Section */}
        <div>
          <div
            className="rounded-2xl p-4 mb-4"
            style={{
              backgroundColor: colors.background,
              border: `1px solid ${colors.accent}55`,
            }}
          >
            <p
              className="text-xs uppercase tracking-wider mb-1"
              style={{ color: colors.secondary }}
            >
              Logged In User
            </p>
            <p className="font-semibold" style={{ color: colors.primary }}>
              {userEmail || "Loading"}
            </p>
          </div>

          <button
             onClick={() => setShowLogoutAlert(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold"
            style={{
              color: "#e11d48",
              border: "1px solid #fecdd3",
              backgroundColor: colors.background,
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {showLogoutAlert && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className=" p-6 rounded-xl shadow-lg w-[500px]" style={{backgroundColor:colors.primary}}>
            <h2 className="text-lg font-semibold mb-4">
              Do you want to logout?
            </h2>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutAlert(false)}
                className="px-3 py-1 bg-gray-300 rounded"
                style={{color:colors.primary}}
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MOBILE DRAWER ================= */}
      <div className="fixed inset-0 z-50 lg:hidden pointer-events-none">
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        />

        {/* Drawer */}
        <aside
          onClick={(e) => e.stopPropagation()}
          className={`absolute left-0 top-0 w-full p-6 transform transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-y-0" : "-translate-y-full"
          }`}
          style={{ backgroundColor: colors.background }}
        >
          <div className="flex justify-between items-center mb-8">
            <h2
              className="text-2xl font-bold"
              style={{ color: colors.primary }}
            >
              My Wallet
            </h2>

            <button onClick={() => setMobileOpen(false)}>
              <X size={24} style={{ color: colors.primary }} />
            </button>
          </div>

          <Navigation
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
            mobile
          />
        </aside>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="flex-1">
        {/* Mobile Header */}
        <header className="lg:hidden p-4 flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: colors.background }}
            >
              My Wallet
            </h1>
            <p className="text-sm" style={{ color: colors.accent }}>
              Finance Tracker
            </p>
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg"
            style={{ backgroundColor: colors.background }}
          >
            <Menu size={24} style={{ color: colors.primary }} />
          </button>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
