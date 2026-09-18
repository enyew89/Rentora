import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { Button, Input } from "../components";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
      <path d="M5.3 14.7l7.4 5.4C14.5 16.2 18.9 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 6.1 29.6 4 24 4 15.4 4 8.1 8.6 5.3 14.7z" fill="#FF3D00"/>
      <path d="M24 44c5.4 0 10.3-1.8 14.1-5l-6.5-5.5C29.6 35.1 27 36 24 36c-6 0-11.1-4-12.8-9.5l-7.3 5.6C6.8 38.4 14.7 44 24 44z" fill="#4CAF50"/>
      <path d="M44.5 20H24v8.5h11.8c-1 3.2-3 5.8-5.6 7.5l6.5 5.5c4.6-4.2 7.3-10.4 7.3-17.5 0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
    </svg>
  );
}
import { loginSchema } from "../schemas/loginSchema";

function dashboardPathFor(user) {
  
  return "/landlord/dashboard";
}

export default function Login({ onAuthenticated }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        onAuthenticated?.(result.user);

        if (result.user?.profileComplete) {
          navigate(dashboardPathFor(result.user));
        } else {
          navigate("/complete-profile");
        }
      } else {
        const result = await response.json().catch(() => ({}));
        setErrorMessage(result.message || "Login failed");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Unable to connect to the server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-100 overflow-hidden flex flex-col justify-center items-center px-4">
      {/* Animated background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Logo and brand */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-neutral-700 to-neutral-500 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-orange-500/20">
              R
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Rentora</h1>
          <p className="text-sm text-white/50">Manage your rental business</p>
        </div>

        {/* Premium Card */}
        <div className="group relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Card */}
          <div className="relative bg-gray-900/60 backdrop-blur-2xl border border-gray-800/60 rounded-3xl p-8 shadow-2xl overflow-hidden">
            {/* Subtle inner gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-3xl" />

            {/* Card content */}
            <div className="relative space-y-6">
              {/* Header */}
              <div className="space-y-1">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Welcome Back
                </h2>
                <p className="text-sm text-white/50">
                  Log in to manage your properties
                </p>
              </div>

              {/* Form */}
              {errorMessage && (
                <p className="text-sm text-red-400">{errorMessage}</p>
              )}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email */}
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register("email")}
                />

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-200">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-neutral-300 hover:text-neutral-400 transition-colors"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <Input
                    label=""
                    type="password"
                    placeholder="••••••••"
                    error={errors.password?.message}
                    passwordVisible={showPassword}
                    togglePasswordVisibility={() =>
                      setShowPassword(!showPassword)
                    }
                    {...register("password")}
                  />
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Log In
                  <ArrowRight size={18} />
                </Button>

                {/* Divider */}
                <div className="relative py-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700/50" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 bg-gray-900/60 text-xs text-white/50 uppercase tracking-wider">
                      Or
                    </span>
                  </div>
                </div>

                {/* Google button */}
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    window.location.href = "/auth/google";
                  }}
                >
                  <GoogleIcon />
                  Google
                </Button>
              </form>

              {/* Sign up link */}
              <p className="text-center text-xs text-white/50 pt-2">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-neutral-400 hover:text-neutral-400 font-semibold transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-white/40 mt-8">
          By continuing, you agree to our Terms and Privacy Policy
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.7s cubic-bezier(0.23, 0.86, 0.39, 0.96);
        }
      `}</style>
    </div>
  );
}
