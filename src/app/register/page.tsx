"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { colors } from "../../lib/colors";
import Alert from "@/components/Alert";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    type?: "success" | "error" | "info";
  } | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    //register process
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAlert({
          message: data.error || data.message || "Registration failed",
          type: "error",
        });
        setLoading(false);
        return;
      }
      setAlert({ message: "Registration successful!", type: "success" });
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error) {
      setAlert({
        message: "An error occurred during registration",
        type: "error",
      });
      setLoading(false);
    }
  };
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: colors.background }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-lg p-8"
        style={{ backgroundColor: colors.primary }}
      >
        <img
          src="/images/logo.png"
          alt="My Wallet Logo"
          className="w-20 h-20 mx-auto mb-6"
          style={{ filter: `drop-shadow(0 0 8px ${colors.accent})` }}
        />

        <h1
          className="text-3xl font-bold text-center mb-2"
          style={{
            color: colors.accent,
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Create Account
        </h1>

        <p className="text-center mb-8" style={{ color: colors.secondary }}>
          Sign up to start tracking your finances
        </p>

        {alert && (
          <Alert
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert(null)}
          />
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Name */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.accent }}
            >
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
              style={{
                borderColor: colors.secondary,
                backgroundColor: colors.background,
                color: colors.primary,
              }}
              placeholder="John Doe"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.accent }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
              style={{
                borderColor: colors.secondary,
                backgroundColor: colors.background,
                color: colors.primary,
              }}
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.accent }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
              style={{
                borderColor: colors.secondary,
                backgroundColor: colors.background,
                color: colors.primary,
              }}
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.accent }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
              style={{
                borderColor: colors.secondary,
                backgroundColor: colors.background,
                color: colors.primary,
              }}
              placeholder="Re-enter your password"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg transition disabled:opacity-50"
            style={{
              backgroundColor: colors.accent,
              color: colors.primary,
            }}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p
          className="text-center text-sm mt-6"
          style={{ color: colors.secondary }}
        >
          Already have an account?{" "}
          <a
            href="/login"
            className="hover:underline"
            style={{ color: colors.accent }}
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
