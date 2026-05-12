"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { colors } from "@/lib/colors";
import type { Category, CategoryType } from "@/types/category";

export type CategoryPayload = {
  id?: number; // Present only when editing
  name: string;
  type: CategoryType;
  user_id: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: CategoryPayload) => Promise<void> | void;
  editData?: Category | null;
  userId: number;
};

export default function CategoryModal({
  open,
  onClose,
  onSave,
  editData,
  userId,
}: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("EXPENSE");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (editData) {
      setName(editData.name);
      setType(editData.type);
    } else {
      setName("");
      setType("EXPENSE");
    }
  }, [editData, open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!name.trim()) return;

    try {
      setLoading(true);

      const payload: CategoryPayload = {
        id: editData?.id,
        name: name.trim(),
        type,
        user_id: userId,
      };

      await onSave(payload);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
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
            className="text-2xl font-bold tracking-wide"
            style={{ color: colors.background }}
          >
            {editData ? "Edit Category" : "New Category"}
          </h2>

          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-lg hover:bg-white/10"
          >
            <X style={{ color: colors.background }} />
          </button>
        </div>

        {/* Category Name */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-blue-300 mb-1">
            CATEGORY NAME
          </p>

          <input
            type="text"
            placeholder="e.g. Food, Salary, Rent"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-xl border outline-none"
            style={{
              backgroundColor: colors.background,
              color: colors.primary,
              borderColor: colors.accent,
            }}
          />
        </div>

        {/* Category Type */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-blue-300 mb-1">
            CATEGORY TYPE
          </p>

          <select
            value={type}
            onChange={(e) => setType(e.target.value as CategoryType)}
            className="w-full p-3 rounded-xl border outline-none"
            style={{
              backgroundColor: colors.background,
              color: colors.primary,
              borderColor: colors.accent,
            }}
          >
            <option value="INCOME">INCOME</option>
            <option value="EXPENSE">EXPENSE</option>
          </select>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 rounded-2xl text-white font-bold tracking-widest disabled:opacity-50"
          style={{ backgroundColor: "#2F4F6F" }}
        >
          {loading
            ? "SAVING..."
            : editData
            ? "UPDATE CATEGORY"
            : "COMMIT CATEGORY"}
        </button>

        {/* Cancel */}
        <p
          onClick={!loading ? onClose : undefined}
          className="text-center mt-4 text-xs tracking-widest text-blue-300 cursor-pointer"
        >
          ABORT OPERATION
        </p>
      </div>
    </div>
  );
}