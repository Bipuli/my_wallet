"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { colors } from "@/lib/colors";
import TransactionModal from "@/components/TransactionModal";
import type {
  Transaction,
  TransactionType,
} from "@/types/transaction";
import type { Category } from "@/types/category";

const mockCategories: Category[] = [
  {
    id: 1,
    name: "Salary",
    type: "INCOME",
    user_id: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Freelance",
    type: "INCOME",
    user_id: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Food",
    type: "EXPENSE",
    user_id: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: "Transport",
    type: "EXPENSE",
    user_id: 1,
    created_at: new Date().toISOString(),
  },
];

export default function TransactionsPage() {
  const [userId, setUserId] = useState<number | null>(null);


useEffect(() => {
  const savedUser = localStorage.getItem("user");

  if (savedUser) {
    const user = JSON.parse(savedUser);
    setUserId(user.id);
  }
}, []);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories ,setCategories] = useState<Category[]>([]);

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<Transaction | null>(null);

  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] =
    useState<"" | TransactionType>("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");


// Update fetchTransactions()
const fetchTransactions = async (id: number) => {
  try {
    setLoading(true);

    const response = await fetch(
      `/api/transactions?user_id=${id}`
    );

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || "Failed to load transactions");
      return;
    }

    const formatted: Transaction[] = result.transactions.map(
      (t: Transaction) => ({
        ...t,
        amount: Number(t.amount),
      })
    );

    setTransactions(formatted);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  /**
   * FETCH CATEGORIES 
   */

  const fetchCategories = async (id: number) => {
    try {
      const res = await fetch(`/api/categories?user_id=${id}`);
      const data = await res.json();

      if (res.ok) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error("Category fetch error:", err);
    }
  };

// Update this useEffect:
useEffect(() => {
  if (userId) {
    fetchTransactions(userId);
    fetchCategories(userId);
  }
}, [userId]);

  /**
   * SAVE (CREATE / UPDATE)
   */
  const handleSave = async (
    data: Omit<
      Transaction,
      "id" | "created_at" | "updated_at" | "category"
    >
  ) => {
    try {
      let response: Response;

      // UPDATE
      if (editData) {
        response = await fetch("/api/transactions", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editData.id,
            ...data,
          }),
        });
      }
      // CREATE
      else {
        response = await fetch("/api/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Failed to save transaction");
        return;
      }

      // Reload from DB to get latest data with category join
    if (userId) await fetchTransactions(userId);

      setEditData(null);
      setOpen(false);

      alert(result.message || "Transaction saved successfully.");
    } catch (error) {
      console.error("Save Transaction Error:", error);
      alert("Something went wrong.");
    }
  };

  /**
   * EDIT
   */
  const handleEdit = (transaction: Transaction) => {
    setEditData(transaction);
    setOpen(true);
  };

  /**
   * DELETE
   */
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this transaction?")) return;

    try {
      const response = await fetch(
        `/api/transactions?id=${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Failed to delete transaction");
        return;
      }

    if (userId) await fetchTransactions(userId);

      alert(result.message || "Transaction deleted.");
    } catch (error) {
      console.error("Delete Transaction Error:", error);
      alert("Something went wrong.");
    }
  };

  /**
   * CATEGORY FILTER OPTIONS
   */
  // const categoryOptions = useMemo(() => {
  //   const map = new Map<number, string>();

  //   transactions.forEach((t) => {
  //     if (t.category) {
  //       map.set(t.category.id, t.category.name);
  //     }
  //   });

  //   return Array.from(map.entries()).map(([id, name]) => ({
  //     id,
  //     name,
  //   }));
  // }, [transactions]);

   const categoryOptions = useMemo(() => categories, [categories]);

  /**
   * FILTERED TRANSACTIONS
   */
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const categoryName = t.category?.name || "";

      const matchesSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        categoryName
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (t.note || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        !categoryFilter ||
        String(t.category_id) === categoryFilter;

      const matchesType =
        !typeFilter || t.type === typeFilter;

      const matchesFromDate =
        !fromDate || t.date >= fromDate;

      const matchesToDate =
        !toDate || t.date <= toDate;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesFromDate &&
        matchesToDate
      );
    });
  }, [
    transactions,
    search,
    categoryFilter,
    typeFilter,
    fromDate,
    toDate,
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1
          className="text-3xl font-bold"
          style={{ color: colors.background }}
        >
          Transactions
        </h1>

        <button
          onClick={() => {
            setEditData(null);
            setOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition"
          style={{ backgroundColor: colors.accent }}
        >
          <Plus size={18} />
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div
        className="p-4 md:p-6 rounded-2xl"
        style={{ backgroundColor: colors.primary }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
          {/* Search */}
          <div className="xl:col-span-2 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: colors.secondary }}
            />
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none"
            />
          </div>

          {/* Category */}
          <select  style={{color: colors.accent}}
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value)
            }
            className="w-full px-4 py-3 rounded-xl border outline-none"
          >
            <option value="">All Categories</option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Type */}
          <select style={{color: colors.accent}}
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(
                e.target.value as "" | TransactionType
              )
            }
            className="w-full px-4 py-3 rounded-xl border outline-none"
          >
            <option value="">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>

          {/* From Date */}
          <input
            type="date"
            value={fromDate}
            onChange={(e) =>
              setFromDate(e.target.value)
            }
            className="w-full px-4 py-3 rounded-xl border outline-none"
          />

          {/* To Date */}
          <input
            type="date"
            value={toDate}
            onChange={(e) =>
              setToDate(e.target.value)
            }
            className="w-full px-4 py-3 rounded-xl border outline-none"
          />
        </div>
      </div>

      {/* Transactions List */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          backgroundColor: colors.background,
          borderColor: `${colors.accent}55`,
        }}
      >
        {loading ? (
          <div
            className="p-8 text-center"
            style={{ color: colors.secondary }}
          >
            Loading transactions...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div
            className="p-8 text-center"
            style={{ color: colors.secondary }}
          >
            No transactions found.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTransactions.map((t) => (
              <div
                key={t.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                {/* Left */}
                <div>
                  <p
                    className="font-bold text-lg"
                    style={{ color: colors.primary }}
                  >
                    {t.title}
                  </p>

                  <div
                    className="text-sm flex flex-wrap gap-2"
                    style={{ color: colors.secondary }}
                  >
                    <span>
                      {t.category?.name || "No Category"}
                    </span>
                    <span>•</span>
                    <span>{t.date}</span>
                    <span>•</span>
                    <span>{t.type}</span>
                  </div>

                  {t.note && (
                    <p
                      className="text-sm mt-1"
                      style={{ color: colors.secondary }}
                    >
                      {t.note}
                    </p>
                  )}
                </div>

                {/* Right */}
                <div className="flex items-center gap-4">
                  <span
                    className={`font-bold text-lg ${
                      t.type === "INCOME"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    Rs {Number(t.amount).toFixed(2)}
                  </span>

                  <button
                    onClick={() => handleEdit(t)}
                    className="p-2 rounded-lg bg-black  hover:bg-gray-500" 
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(t.id)
                    }
                    className="p-2 rounded-lg hover:bg-gray-100 text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {userId && (
  <TransactionModal
    open={open}
    onClose={() => {
      setOpen(false);
      setEditData(null);
    }}
    onSave={handleSave}
    editData={editData}
    userId={userId}
    categories={categories}
  />
)}
    </div>
  );
}