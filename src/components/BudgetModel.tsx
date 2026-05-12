"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { colors } from "@/lib/colors";
import type { BudgetInput } from "@/types/budget";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (budget: BudgetInput) => void;
  editData?: BudgetInput | null;
  categories: { id: number; name: string }[];
  userId: number;
};

export default function BudgetModal({
  open,
  onClose,
  onSave,
  editData,
  categories,
  userId,
}: Props) {
  const [categoryId, setCategoryId] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    if (editData) {
      setCategoryId(editData.category_id);
      setAmount(editData.amount);
      setMonth(editData.month);
      setYear(editData.year);
    } else {
      setCategoryId(0);
      setAmount(0);
      setMonth(new Date().getMonth() + 1);
      setYear(new Date().getFullYear());
    }
  }, [editData, open]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!categoryId || amount <= 0) return;

  onSave({
  category_id: categoryId,
  amount,
  month,
  year,
  user_id: userId,
});

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* modal */}
      <div
        className="relative w-full max-w-xl rounded-3xl shadow-2xl p-6"
        style={{ backgroundColor: colors.primary }}
      >
        {/* header */}
        <div className="flex justify-between items-center mb-6">
          <h2
            className="text-2xl font-bold"
            style={{ color: colors.background }}
          >
            {editData ? "Edit Budget" : "New Budget"}
          </h2>

          <button onClick={onClose}>
            <X style={{ color: colors.background }} />
          </button>
        </div>

        {/* CATEGORY */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-blue-300 mb-1">
            CATEGORY
          </p>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="w-full p-3 rounded-xl border"
            style={{
              backgroundColor: colors.background,
              color: colors.primary,
              borderColor: colors.accent,
            }}
          >
            <option value={0}>Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* AMOUNT */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-blue-300 mb-1">
            BUDGET AMOUNT
          </p>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full p-3 rounded-xl border"
            style={{
              backgroundColor: colors.background,
              color: colors.primary,
              borderColor: colors.accent,
            }}
          />
        </div>

        {/* PERIOD */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold text-blue-300 mb-1">
              MONTH
            </p>
            <input
              type="number"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full p-3 rounded-xl border"
              style={{
                backgroundColor: colors.background,
                color: colors.primary,
                borderColor: colors.accent,
              }}
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-blue-300 mb-1">
              YEAR
            </p>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full p-3 rounded-xl border"
              style={{
                backgroundColor: colors.background,
                color: colors.primary,
                borderColor: colors.accent,
              }}
            />
          </div>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          className="w-full py-4 rounded-2xl text-white font-bold tracking-widest"
          style={{ backgroundColor: "#2F4F6F" }}
        >
          COMMIT BUDGET
        </button>

        {/* abort */}
        <p
          onClick={onClose}
          className="text-center mt-4 text-xs tracking-widest text-blue-300 cursor-pointer"
        >
          ABORT OPERATION
        </p>
      </div>
    </div>
  );
}