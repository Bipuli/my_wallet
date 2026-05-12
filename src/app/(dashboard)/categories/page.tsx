"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { colors } from "@/lib/colors";
import CategoryModal, { CategoryPayload } from "@/components/CategoryModal";
import type { Category } from "@/types/category";

type AlertState = {
  type: "success" | "error";
  message: string;
} | null;

function AlertBox({
  alert,
  onClose,
}: {
  alert: AlertState;
  onClose: () => void;
}) {
  if (!alert) return null;

  const isSuccess = alert.type === "success";

  return (
    <div className="fixed top-5 right-5 z-[60] animate-in slide-in-from-right duration-300">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border min-w-[320px] ${
          isSuccess
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-red-50 border-red-200 text-red-700"
        }`}
      >
        {isSuccess ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}

        <p className="flex-1 text-sm font-medium">{alert.message}</p>

        <button onClick={onClose}>
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<AlertState>(null);

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });

    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };


  
  const savedUser = localStorage.getItem("user");

  if (!savedUser) {
    showAlert("error", "User not found. Please login again.");
    return;
  }

  const user = JSON.parse(savedUser);
  const USER_ID = user.id;

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/categories?user_id=${USER_ID}`);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load categories");
      }

      setCategories(data.categories);
    } catch (error) {
      showAlert("error", "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async (payload: CategoryPayload) => {
    try {
      const isEdit = !!payload.id;

      const res = await fetch("/api/categories", {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save category");
      }

      await fetchCategories();

      showAlert(
        "success",
        isEdit
          ? "Category updated successfully."
          : "Category created successfully.",
      );
    } catch (error) {
      showAlert("error", "Failed to save category.");
      throw error;
    }
  };

  const handleEdit = (category: Category) => {
    setEditData(category);
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category?")) return;

    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete category");
      }

      setCategories((prev) => prev.filter((c) => c.id !== id));

      showAlert("success", "Category deleted successfully.");
    } catch (error) {
      showAlert("error", "Failed to delete category.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Alerts */}
      <AlertBox alert={alert} onClose={() => setAlert(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold" style={{ color: colors.background }}>
          Categories
        </h1>

        <button
          onClick={() => {
            setEditData(null);
            setOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition"
          style={{ backgroundColor: colors.accent }}
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            backgroundColor: colors.primary,
            color: colors.background,
          }}
        >
          Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            backgroundColor: colors.primary,
            color: colors.background,
          }}
        >
          No categories found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="rounded-2xl p-5 border"
              style={{
                backgroundColor: colors.background,
                borderColor: `${colors.accent}55`,
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag size={18} style={{ color: colors.primary }} />

                    <h3
                      className="text-xl font-bold"
                      style={{ color: colors.secondary }}
                    >
                      {category.name}
                    </h3>
                  </div>

                  <span
                    className={`inline-block px-3 py-1 rounded-full ms-6 text-xs font-semibold ${
                      category.type === "INCOME"
                        ? "bg-green-200 text-green-700"
                        : "bg-red-200 text-red-700"
                    }`}
                  >
                    {category.type}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 rounded-lg hover:bg-gray-200"
                    style={{
                      backgroundColor: colors.secondary,
                    }}
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <CategoryModal
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        editData={editData}
        userId={USER_ID}
      />
    </div>
  );
}
