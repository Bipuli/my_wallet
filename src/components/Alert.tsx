import React from "react";
import { colors } from "@/lib/colors";

interface AlertProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose?: () => void;
}

const typeColors = {
  success: colors.accent,
  error: "#e53e3e",
  info: colors.secondary,
};

export default function Alert({ message, type = "info", onClose }: AlertProps) {
  return (
    <div
      style={{
        background: typeColors[type],
        color: colors.primary,
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        padding: "1rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        margin: "1rem 0",
      }}
      role="alert"
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: colors.primary,
            fontWeight: "bold",
            fontSize: "1.2rem",
            cursor: "pointer",
            marginLeft: "1rem",
          }}
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  );
}
