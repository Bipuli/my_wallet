
"use client";

import { CheckCircle, AlertCircle, XCircle, X } from "lucide-react";
import { useEffect } from "react";
import { colors } from "@/lib/colors";

type AlertType = "success" | "error" | "warning";

type AlertProps = {
  type: AlertType;
  message: string;
  onClose: () => void;
  duration?: number; // milliseconds
};

export default function Alert({
  type,
  message,
  onClose,
  duration = 3000,
}: AlertProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bg: "#dcfce7",
      border: "#86efac",
      text: "#166534",
    },
    error: {
      icon: XCircle,
      bg: "#fee2e2",
      border: "#fca5a5",
      text: "#991b1b",
    },
    warning: {
      icon: AlertCircle,
      bg: "#fef3c7",
      border: "#fcd34d",
      text: "#92400e",
    },
  };

  const current = config[type];
  const Icon = current.icon;

  return (
    <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top duration-300">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border min-w-[320px]"
        style={{
          backgroundColor: current.bg,
          borderColor: current.border,
          color: current.text,
        }}
      >
        <Icon size={22} />

        <p className="flex-1 font-medium">{message}</p>

        <button onClick={onClose}>
          <X size={18} />
        </button>
      </div>
    </div>
  );
}