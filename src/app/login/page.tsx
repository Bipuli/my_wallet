"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { colors } from "../../lib/colors";
import Alert from "@/components/Alert";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    type?: "success" | "error" | "info";
  } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    //login process

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAlert({ message: data.error || "Login failed", type: "error" });
        return;
      }

      //store user in localStorage
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setAlert({
        message: "Something went wrong. Please try again.",
        type: "error",
      });
    } finally {
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
          style={{ color: colors.accent, fontFamily: "'Poppins', sans-serif" }}
        >
          My Wallet
        </h1>
        <p className="text-center mb-8" style={{ color: colors.secondary }}>
          Sign in to your My Wallet account
        </p>

        {alert && (
          <Alert
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert(null)}
          />
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg transition disabled:opacity-50"
            style={{
              backgroundColor: colors.accent,
              color: colors.primary,
            }}
          >
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>

        <p
          className="text-center text-sm mt-6"
          style={{ color: colors.secondary }}
        >
          Don't have an account?{" "}
          <a
            href="/register"
            className="hover:underline"
            style={{ color: colors.accent }}
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
