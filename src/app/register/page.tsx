"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/Toast";

export default function SignupPage() {
  const { showToast } = useToast();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [registeredName, setRegisteredName] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    agreeTerms: false,
  });

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail, name: registeredName }),
      });
      const data = await response.json();
      if (data.success) {
        showToast('Verification email resent! Please check your inbox.', 'success');
      } else {
        showToast(data.message || 'Failed to resend verification email.', 'error');
      }
    } catch {
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (formData.password !== formData.password_confirmation) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return;
    }

    if (!formData.agreeTerms) {
      showToast('Please agree to the Terms of Service and Privacy Policy', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showToast("Registration successful!", "success");

        setRegisteredEmail(formData.email);
        setRegisteredName(formData.name);
        setRegistrationSuccess(true);

        let seconds = 60;

        const timer = setInterval(() => {
          seconds--;

          setCountdown(seconds);

          if (seconds <= 0) {
            clearInterval(timer);
            window.location.href = "/login";
          }
        }, 1000);

        return;
      } else {
        // Show detailed error message
        if (data.errors && Object.keys(data.errors).length > 0) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, messages]) => {
              const messageArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${messageArray.join(', ')}`;
            })
            .join('\n');
          showToast(errorMessages, 'error');
        } else {
          showToast(data.message || 'Registration failed', 'error');
        }
      }
    } catch (error) {
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F3] px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[460px] overflow-hidden rounded-2xl border border-gray-200 bg-white"
        >
          {/* Top accent bar */}
          <div className="h-[3px] bg-gradient-to-r from-[#0A1E3F] to-[#1565C0]" />

          <div className="px-8 pb-8 pt-10 text-center">
            {/* Icon */}
            <div className="mx-auto mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full border border-green-200 bg-green-50">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>

            {/* Heading */}
            <h1 className="text-[22px] font-medium text-gray-900">
              Account created
            </h1>
            <p className="mt-1.5 text-[15px] leading-relaxed text-gray-500">
              One last step — verify your email to start using your account.
            </p>

            {/* Notice card */}
            <div className="mt-7 rounded-xl border border-gray-100 bg-gray-50 px-5 py-4 text-left">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#1B3A8C]" />
                <div>
                  <p className="text-[13px] font-medium text-gray-900">
                    Verification link sent
                  </p>
                  <p className="mt-1 break-all text-[13px] font-medium text-[#1B3A8C]">
                    {registeredEmail}
                  </p>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-gray-400">
                    Check your inbox and click the link to activate your
                    account. If you don't see it, check your spam folder.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={() => (window.location.href = "/login")}
                className="flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-[#1B3A8C] py-[11px] text-[14px] font-medium text-white transition-colors hover:bg-[#2a4fa8]"
              >
                Go to login
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className="flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-gray-200 py-[10px] text-[14px] text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-[15px] w-[15px] ${isResending ? "animate-spin" : ""}`}
                />
                {isResending ? "Sending…" : "Resend verification email"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

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
          <h2 className="text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-gray-600">
            Start your journey with HERO Serviced Office
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6 text-gray-900" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent transition-all"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent transition-all"
                  placeholder="09123456789"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent transition-all"
                  placeholder="Create a password"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password_confirmation}
                  onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                  className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent transition-all"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start">
            <input
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
              className="h-4 w-4 mt-1 text-[#1B3A8C] focus:ring-[#1B3A8C] border-gray-300 rounded"
            />
            <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-700">
              I agree to the{" "}
              <Link href="/terms" className="text-[#1B3A8C] hover:text-[#3B5EA6]">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#1B3A8C] hover:text-[#3B5EA6]">
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !formData.agreeTerms}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-[#1B3A8C] hover:bg-[#3B5EA6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B3A8C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Create Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#1B3A8C] hover:text-[#3B5EA6]">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}