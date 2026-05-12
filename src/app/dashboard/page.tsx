"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  PieChart as PieChartIcon,
  LogOut,
  Receipt,
  Tags,
  Menu,
  X,
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
} from "lucide-react";
import { colors } from "@/lib/colors";
import { BudgetWithCategory } from "@/types/budget";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "Transactions", href: "/transactions", icon: Receipt },
  { label: "Categories", href: "/categories", icon: Tags },
  { label: "Budgets", href: "/budgets", icon: PieChartIcon },
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
  const router = useRouter();
  const [dashboard, setDashboard] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  });

  const [expenseData, setExpenseData] = useState<
    { name: string; value: number }[]
  >([]);

  const [mobileOpen, setMobileOpen] = useState(false);

  // Logged-in user
  const [userEmail, setUserEmail] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [budgets, setBudgets] = useState<BudgetWithCategory[]>([]);

  //Load Budget to design
  useEffect(() => {
    const loadBudgets = async () => {
      if (!userId) return;

      const res = await fetch(`/api/budget?user_id=${userId}`);
      const data = await res.json();

      if (res.ok) {
        setBudgets(data.budgets);
      }
    };

    loadBudgets();
  }, [userId]);

  //   Fetch from API
  useEffect(() => {
    const loadExpenses = async () => {
      if (!userId) return;

      const res = await fetch(`/api/transactions?user_id=${userId}`);
      const data = await res.json();

      if (!res.ok) return;

      // group by category
      const grouped: Record<string, number> = {};

      data.transactions.forEach((t: any) => {
        if (t.type === "EXPENSE") {
          const category = t.category?.name || "Other";
          grouped[category] = (grouped[category] || 0) + Number(t.amount);
        }
      });

      const formatted = Object.entries(grouped).map(([name, value]) => ({
        name,
        value,
      }));

      setExpenseData(formatted);
    };

    loadExpenses();
  }, [userId]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      const user = JSON.parse(savedUser);
      setUserId(user.id);
    }
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!userId) return;

      const res = await fetch(`/api/dashboard?user_id=${userId}`);
      const data = await res.json();

      if (res.ok) {
        setDashboard({
          income: data.income,
          expense: data.expense,
          balance: data.balance,
        });
      }
    };

    if (userId) loadDashboard();
  }, [userId]);

  // Load user from session (/api/me)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/me", {
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok) {
          setUserEmail(data.user.email);
        } else {
          setUserEmail("");
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
      });

      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Dashboard summary cards
  const summaryCards = [
    {
      title: "Total Balance",
      amount: `Rs ${dashboard.balance.toFixed(2)}`,
      icon: Wallet,
      valueColor: colors.primary,
    },
    {
      title: "Total Income",
      amount: `Rs ${dashboard.income.toFixed(2)}`,
      icon: TrendingUp,
      valueColor: "#16a34a",
    },
    {
      title: "Total Expenses",
      amount: `Rs ${dashboard.expense.toFixed(2)}`,
      icon: TrendingDown,
      valueColor: "#dc2626",
    },
  ];

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

          {/* Navigation */}
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

            <p
              className="font-semibold break-all"
              style={{ color: colors.primary }}
            >
              {loadingUser ? "Loading..." : userEmail || "Not logged in"}
            </p>
          </div>

          <button
            onClick={handleLogout}
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

      {/* ================= MAIN CONTENT ================= */}
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

        {/* Main Page Content */}
        <main className="p-4 md:p-6 lg:p-8">
          {/* Show dashboard widgets only on /dashboard */}
          {pathname === "/dashboard" && (
            <>
              {/* Top Banner */}
              <section
                className="rounded-3xl p-6 md:p-8 mb-8 border flex flex-col md:flex-row md:items-center md:justify-between gap-6"
                style={{
                  backgroundColor: colors.background,
                  borderColor: `${colors.accent}55`,
                }}
              >
                <div>
                  <h2
                    className="text-3xl md:text-4xl font-bold"
                    style={{ color: colors.primary }}
                  >
                    Dashboard Summary
                  </h2>
                  <p
                    className="mt-2 italic font-medium"
                    style={{ color: colors.secondary }}
                  >
                    Track your financial health in real time.
                  </p>
                </div>

                <button
                  onClick={() => router.push("/transactions")}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl shadow-md font-semibold text-white"
                  style={{
                    backgroundColor: colors.primary,
                  }}
                >
                  <Plus size={20} />
                  New Transaction
                </button>
              </section>

              {/* Summary Cards */}
              <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {summaryCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <div
                      key={card.title}
                      className="rounded-3xl p-6 border"
                      style={{
                        backgroundColor: colors.background,
                        borderColor: `${colors.accent}55`,
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p
                            className="text-xs uppercase tracking-[0.2em] font-semibold mb-2"
                            style={{
                              color: colors.secondary,
                            }}
                          >
                            {card.title}
                          </p>

                          <h3
                            className="text-4xl font-bold"
                            style={{
                              color: card.valueColor,
                            }}
                          >
                            {card.amount}
                          </h3>
                        </div>

                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center"
                          style={{
                            backgroundColor: colors.accent,
                            color: colors.primary,
                          }}
                        >
                          <Icon size={26} />
                        </div>
                      </div>

                      <p
                        className="text-sm font-medium"
                        style={{
                          color: colors.secondary,
                        }}
                      >
                        Current month overview
                      </p>
                    </div>
                  );
                })}
              </section>

              {/* Charts Section */}
              <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                {/* Expense Distribution */}
                <div
                  className="rounded-3xl p-6 border min-h-[400px]"
                  style={{
                    borderColor: `${colors.accent}55`,
                    backgroundColor: colors.background,
                  }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <PieChartIcon
                      size={30}
                      style={{
                        color: colors.secondary,
                      }}
                    />
                    <h3
                      className="text-2xl font-bold"
                      style={{
                        color: colors.primary,
                      }}
                    >
                      Expense Distribution
                    </h3>
                  </div>

                  <div className="h-[300px] flex items-center justify-center">
                    <div className="w-full h-[300px] relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenseData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            innerRadius={60}
                            isAnimationActive={true}
                            animationDuration={900}
                          >
                            {expenseData.map((_, index) => (
                              <Cell
                                key={index}
                                fill={
                                  ["#547792", "#94B4C1", "#213448", "#F59E0B"][
                                    index % 4
                                  ]
                                }
                              />
                            ))}
                          </Pie>

                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* Center text */}
                      <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <p style={{ color: colors.secondary }}>
                          Total Expenses
                        </p>
                        <p
                          className="text-xl font-bold"
                          style={{ color: colors.primary }}
                        >
                          Rs {expenseData.reduce((a, b) => a + b.value, 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Budget Progress */}
                <div
                  className="rounded-3xl p-6 border min-h-[400px]"
                  style={{
                    borderColor: `${colors.accent}55`,
                    backgroundColor: colors.background,
                  }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <ShieldCheck
                      size={24}
                      style={{
                        color: colors.secondary,
                      }}
                    />
                    <h3
                      className="text-2xl font-bold"
                      style={{
                        color: colors.primary,
                      }}
                    >
                      Budget Progress
                    </h3>
                  </div>

                  <div className="space-y-4 h-[300px]  overflow-y-auto pr-2">
                    {budgets.length === 0 ? (
                      <div
                        className="h-full rounded-2xl border-2  border-dashed flex items-center justify-center"
                        style={{
                          borderColor: `${colors.accent}66`,
                        }}
                      >
                        <p
                          className="italic font-medium text-center px-6"
                          style={{
                            color: colors.secondary,
                          }}
                        >
                          Create budgets to track your spending.
                        </p>
                      </div>
                    ) : (
                      budgets.map((budget) => {
                        const spent = Number(budget.spent || 0);
                        const amount = Number(budget.amount);
                        const percent =
                          amount > 0
                            ? Math.min((spent / amount) * 100, 100)
                            : 0;
                        const remaining = amount - spent;
                        const isOverBudget = spent > amount;

                        return (
                          <div
                            key={budget.id}
                            className="rounded-2xl p-4 border"
                            style={{
                              borderColor: `${colors.accent}55`,
                              backgroundColor: `${colors.primary}`,
                            }}
                          >
                            {/* Header */}
                            <div className="flex justify-between items-center mb-3">
                              <div>
                                <p
                                  className="font-semibold"
                                  style={{ color: colors.accent }}
                                >
                                  {budget.categoryName}
                                </p>
                                <p
                                  className="text-xs"
                                  style={{ color: colors.background }}
                                >
                                  {budget.month}/{budget.year}
                                </p>
                              </div>

                              <p
                                className="text-sm font-bold"
                                style={{
                                  color: isOverBudget
                                    ? "#dc2626"
                                    : colors.background,
                                }}
                              >
                                {percent.toFixed(0)}%
                              </p>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${percent}%`,
                                  backgroundColor: isOverBudget
                                    ? "#dc2626"
                                    : spent >= amount * 0.8
                                      ? "#f59e0b"
                                      : "#16a34a",
                                }}
                              />
                            </div>

                            {/* Details */}
                            <div className="flex justify-between mt-3 text-sm">
                              <span style={{ color: colors.background }}>
                                Spent: Rs {spent.toFixed(2)}
                              </span>
                              <span style={{ color: colors.background }}>
                                Budget: Rs {amount.toFixed(2)}
                              </span>
                            </div>

                            <div className="mt-1 text-xs">
                              <span
                                style={{
                                  color: isOverBudget
                                    ? "#dc2626"
                                    : colors.background,
                                }}
                              >
                                {isOverBudget
                                  ? `Exceeded by Rs ${Math.abs(remaining).toFixed(2)}`
                                  : `Remaining Rs ${remaining.toFixed(2)}`}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Child pages */}
          {children}
        </main>
      </div>

      {/* ================= MOBILE DRAWER ================= */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />

          <aside
            className="absolute top-0 left-0 w-full p-6"
            style={{
              backgroundColor: colors.background,
            }}
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
      )}
    </div>
  );
}
