import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { login, signup } from "../services/auth";

export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        await signup({ name, email, password });
        toast.success("Account created!");
      } else {
        await login({ email, password });
        toast.success("Welcome back!");
      }
      onAuthSuccess?.();
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-950 p-6">
      <div className="w-full max-w-md bg-white/90 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {mode === "signup" ? "Create account" : "Log in"}
          </h1>
          <Link
            to="/"
            className="text-sm text-blue-600 dark:text-blue-300 hover:underline"
          >
            Back to app
          </Link>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            className={`flex-1 py-2 rounded-lg font-medium border ${
              mode === "login"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-transparent text-blue-600 border-blue-300"
            }`}
            onClick={() => setMode("login")}
            disabled={loading}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 rounded-lg font-medium border ${
              mode === "signup"
                ? "bg-green-600 text-white border-green-600"
                : "bg-transparent text-green-600 border-green-300"
            }`}
            onClick={() => setMode("signup")}
            disabled={loading}
          >
            Signup
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-semibold ${
              mode === "signup" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
            } disabled:opacity-60`}
          >
            {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <button
                className="text-blue-600 dark:text-blue-300 hover:underline"
                onClick={() => setMode("login")}
              >
                Log in
              </button>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <button
                className="text-green-600 dark:text-green-300 hover:underline"
                onClick={() => setMode("signup")}
              >
                Sign up
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
