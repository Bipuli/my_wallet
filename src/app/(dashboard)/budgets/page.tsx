"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Wallet } from "lucide-react";
import { colors } from "@/lib/colors";
import BudgetModal from "@/components/BudgetModel";
import { Category } from "@/types/category";
import type { BudgetWithCategory } from "@/types/budget";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetWithCategory[]>([]);

  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editData, setEditData] = useState<BudgetWithCategory | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      const user = JSON.parse(savedUser);
      setUserId(user.id);
    }
  }, []);

  /**
   * FETCH BUDGETS
   */
  const fetchBudgets = async (id: number) => {
    const res = await fetch(`/api/budget?user_id=${id}`);
    const data = await res.json();

    if (res.ok) {
      setBudgets(data.budgets);
    }
  };

  /**
   * FETCH CATEGORIES
   */
  const fetchCategories = async (id: number) => {
    const res = await fetch(`/api/categories?user_id=${id}`);
    const data = await res.json();

    if (res.ok) {
      setCategories(data.categories);
    }
  };

  /**
   * INIT LOAD
   */
useEffect(() => {
  if (userId) {
    fetchBudgets(userId);
    fetchCategories(userId);
  }
}, [userId]);

  /**
   * SAVE (CREATE / UPDATE)
   */
const handleSave = async (data: any) => {
  let res: Response;

  const payload = {
    ...data,
    user_id: userId, 
  };

  if (editData) {
    res = await fetch("/api/budget", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editData.id,
        ...payload,
      }),
    });
  } else {
    res = await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  const result = await res.json();

  if (!res.ok) {
    alert(result.error);
    return;
  }

  if (userId) {
    const updated = await fetch(`/api/budget?user_id=${userId}`);
    const data = await updated.json();
    setBudgets(data.budgets);
  }

  setOpen(false);
  setEditData(null);
};

  //  EDIT
  const handleEdit = (budget: BudgetWithCategory) => {
    setEditData(budget);
    setOpen(true);
  };

  // DELETE

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this budget?")) return;

    await fetch(`/api/budget?id=${id}`, {
      method: "DELETE",
    });

    if (userId) fetchBudgets(userId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: colors.background }}
        >
          Budgets
        </h1>

        <button
          onClick={() => {
            setEditData(null);
            setOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white w-full sm:w-auto"
          style={{ backgroundColor: colors.accent }}
        >
          <Plus size={18} />
          Create Budget
        </button>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="grid gap-4 md:hidden">
        {budgets.map((b) => {
          const percent = b.spent
            ? Math.min((b.spent / b.amount) * 100, 100)
            : 0;

          const isOver = percent >= 100;

          return (
            <div
              key={b.id}
              className="rounded-2xl p-4 border"
              style={{
                backgroundColor: colors.secondary,
                borderColor: `${colors.accent}55`,
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <Wallet size={16} />
                    <h2
                      className="font-bold"
                      style={{ color: colors.secondary }}
                    >
                      {b.categoryName}
                    </h2>
                  </div>

                  <p className="text-sm opacity-70 mt-1">
                    {b.month}/{b.year}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => handleEdit(b)}>
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* progress */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Spent: {b.spent}</span>
                  <span>Budget: {b.amount}</span>
                </div>

                <div className="w-full h-2 bg-gray-300 rounded-full">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: isOver ? "red" : colors.accent,
                    }}
                  />
                </div>

                {isOver && (
                  <p className="text-red-600 text-xs mt-2">Over budget</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div
        className="hidden md:block w-full overflow-x-auto rounded-2xl border"
        style={{
          backgroundColor: colors.background,
          borderColor: `${colors.accent}55`,
        }}
      >
        <table className="w-full text-sm">
          <thead
            style={{
              backgroundColor: `${colors.accent}20`,
              color: colors.primary,
            }}
          >
            <tr className="text-left">
              <th className="p-4">Category</th>
              <th className="p-4">Period</th>
              <th className="p-4">Budget (Rs)</th>
              <th className="p-4">Spent</th>
              <th className="p-4">Progress</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {budgets.map((b) => {
              const percent = b.spent
                ? Math.min((b.spent / b.amount) * 100, 100)
                : 0;

              const isOver = percent >= 100;

              return (
                <tr
                  key={b.id}
                  className="border-t"
                  style={{
                    borderColor: `${colors.accent}33`,
                    color: colors.secondary,
                  }}
                >
                  <td className="p-4 font-semibold flex items-center gap-2">
                    <Wallet size={16} />
                    {b.categoryName}
                  </td>

                  <td className="p-4">
                    {b.month}/{b.year}
                  </td>

                  <td className="p-4">{b.amount}</td>

                  <td className="p-4">
                    <span
                      className={isOver ? "text-red-600 font-semibold" : ""}
                    >
                      {b.spent}
                    </span>
                  </td>

                  <td className="p-4 w-[220px]">
                    <div className="w-full h-2 bg-gray-300 rounded-full">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: isOver ? "red" : colors.accent,
                        }}
                      />
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => handleEdit(b)}>
                        <Edit size={18} />
                      </button>

                      <button
                        onClick={() => handleDelete(b.id)}
                        className="text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {userId && (
        <BudgetModal
          open={open}
          onClose={() => setOpen(false)}
          onSave={handleSave}
          editData={editData}
          categories={categories}
          userId={userId}
        />
      )}
    </div>
  );
}
