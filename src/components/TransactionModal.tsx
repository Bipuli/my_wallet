"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { colors } from "@/lib/colors";
import type { Transaction, TransactionType } from "@/types/transaction";
import type { Category } from "@/types/category";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (
    data: Omit<Transaction, "id" | "created_at" | "updated_at" | "category">
  ) => void;
  editData?: Transaction | null;
  userId: number;
  categories: Category[];
};

export default function TransactionModal({
  open,
  onClose,
  onSave,
  editData,
  userId,
  categories,
}: Props) {
  const [form, setForm] = useState({
    title: "",
    amount: 0,
    type: "EXPENSE" as TransactionType,
    date: "",
    note: "",
    category_id: 0,
  });

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title,
        amount: editData.amount,
        type: editData.type,
        date: editData.date?.slice(0, 10) || "",
        note: editData.note || "",
        category_id: editData.category_id,
      });
    } else {
      setForm({
        title: "",
        amount: 0,
        type: "EXPENSE",
        date: new Date().toISOString().slice(0, 10),
        note: "",
        category_id: 0,
      });
    }
  }, [editData, open]);

  if (!open) return null;

  const handleChange = (
    key: keyof typeof form,
    value: string | number
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      alert("Title is required.");
      return;
    }

    if (form.amount <= 0) {
      alert("Amount must be greater than 0.");
      return;
    }

    if (!form.date) {
      alert("Date is required.");
      return;
    }

    if (!form.category_id) {
      alert("Please select a category.");
      return;
    }

    onSave({
      title: form.title.trim(),
      amount: form.amount,
      type: form.type,
      date: form.date,
      note: form.note.trim(),
      category_id: form.category_id,
      user_id: userId,
    });

    onClose();
  };

  const filteredCategories = categories.filter(
    (category) => category.type === form.type
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl rounded-3xl shadow-2xl p-6"
        style={{ backgroundColor: colors.primary }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2
            className="text-2xl font-bold"
            style={{ color: colors.background }}
          >
            {editData ? "Edit Transaction" : "New Transaction"}
          </h2>

          <button onClick={onClose}>
            <X style={{ color: colors.background }} />
          </button>
        </div>

        {/* Type Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <button
            onClick={() => handleChange("type", "EXPENSE")}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              form.type === "EXPENSE"
                ? "bg-slate-700 text-white"
                : "text-slate-500"
            }`}
          >
            EXPENSE
          </button>

          <button
            onClick={() => handleChange("type", "INCOME")}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              form.type === "INCOME"
                ? "bg-slate-700 text-white"
                : "text-slate-500"
            }`}
          >
            INCOME
          </button>
        </div>

        {/* Title */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-blue-400 mb-1">TITLE</p>
          <input
            placeholder="e.g. Grocery Shopping"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full p-3 rounded-xl border"
            style={{
              backgroundColor: colors.background,
              color: colors.primary,
              borderColor: colors.accent,
            }}
          />
        </div>

        {/* Amount + Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs font-semibold text-blue-400 mb-1">AMOUNT</p>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) =>
                handleChange("amount", Number(e.target.value))
              }
              className="w-full p-3 rounded-xl border"
              style={{
                backgroundColor: colors.background,
                color: colors.primary,
                borderColor: colors.accent,
              }}
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-blue-400 mb-1">
              CATEGORY
            </p>
            <select
              value={form.category_id}
              onChange={(e) =>
                handleChange("category_id", Number(e.target.value))
              }
              className="w-full p-3 rounded-xl border"
              style={{
                backgroundColor: colors.background,
                color: colors.primary,
                borderColor: colors.accent,
              }}
            >
              <option value={0}>Select Category</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date + Note */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold text-blue-400 mb-1">DATE</p>
            <input
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
              className="w-full p-3 rounded-xl border"
              style={{
                backgroundColor: colors.background,
                color: colors.primary,
                borderColor: colors.accent,
              }}
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-blue-400 mb-1">NOTE</p>
            <input
              placeholder="Optional details..."
              value={form.note}
              onChange={(e) => handleChange("note", e.target.value)}
              className="w-full p-3 rounded-xl border"
              style={{
                backgroundColor: colors.background,
                color: colors.primary,
                borderColor: colors.accent,
              }}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full py-4 rounded-2xl text-white font-bold tracking-widest"
          style={{ backgroundColor: "#2F4F6F" }}
        >
          COMMIT ENTRY
        </button>

        {/* Cancel */}
        <p
          onClick={onClose}
          className="text-center mt-4 text-xs tracking-widest text-blue-400 cursor-pointer"
        >
          ABORT OPERATION
        </p>
      </div>
    </div>
  );
}