"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  MailCheck,
  RefreshCw,
  UserX,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/contexts/AuthContext";

interface LoginResponse {
  user: any;
  token: string;
  message?: string;
  error?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showVerificationNotice, setShowVerificationNotice] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [showNotFoundNotice, setShowNotFoundNotice] = useState(false);
  const [notFoundEmail, setNotFoundEmail] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleResendVerification = async () => {
    if (!unverifiedEmail || isResending) return;

    setIsResending(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unverifiedEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Failed to resend email", "error");
      } else {
        showToast("Verification email sent!", "success");
      }
    } catch {
      showToast("An error occurred. Please try again.", "error");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      showToast("Please fill in all fields", "error");
      return;
    }

    setIsLoading(true);
    setShowVerificationNotice(false);
    setShowNotFoundNotice(false);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        if (data.error === "email_not_verified") {
          setUnverifiedEmail(formData.email);
          setShowVerificationNotice(true);
        } else if (data.error === "user_not_found" || response.status === 404) {
          setNotFoundEmail(formData.email);
          setShowNotFoundNotice(true);
        } else {
          showToast(data.message || "Login failed", "error");
        }
        return;
      }

      login(data.user, data.token);
      showToast("Login successful!", "success");

      const role = data.user.role;
      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch {
      showToast("An error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Back to Home Button */}
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Logo */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Email Verification Notice */}
        <AnimatePresence>
          {showVerificationNotice && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="rounded-xl border border-amber-200 bg-amber-50 p-4"
            >
              <div className="flex gap-3">
                <div className="shrink-0 mt-0.5">
                  <MailCheck className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-800">
                    Check your inbox
                  </p>
                  <p className="mt-1 text-sm text-amber-700">
                    We sent a verification link to{" "}
                    <span className="font-medium break-all">{unverifiedEmail}</span>.
                    Click the link to activate your account before signing in.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm text-amber-700">
                      Didn&apos;t get it?
                    </span>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={isResending}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-800 hover:text-amber-900 underline underline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`}
                      />
                      {isResending ? "Sending…" : "Resend email"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Account Found Notice */}
        <AnimatePresence>
          {showNotFoundNotice && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="rounded-xl border border-red-200 bg-red-50 p-4"
            >
              <div className="flex gap-3">
                <div className="shrink-0 mt-0.5">
                  <UserX className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-red-800">
                    No account found
                  </p>
                  <p className="mt-1 text-sm text-red-700">
                    We couldn&apos;t find an account for{" "}
                    <span className="font-medium break-all">{notFoundEmail}</span>.
                    Double-check the address, or create a new account.
                  </p>
                  <div className="mt-3">
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-red-800 hover:text-red-900 underline underline-offset-2 transition-colors"
                    >
                      Create an account
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (showNotFoundNotice) setShowNotFoundNotice(false);
                    if (showVerificationNotice) setShowVerificationNotice(false);
                  }}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent transition-all"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Forgot
          <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="font-medium text-sm text-[#1B3A8C] hover:text-[#3B5EA6]"
              >
                Forgot password?
              </Link>
          </div> */}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-[#1B3A8C] hover:bg-[#3B5EA6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B3A8C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Sign in
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </form>

        {/* Sign up link */}
        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-[#1B3A8C] hover:text-[#3B5EA6]"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}