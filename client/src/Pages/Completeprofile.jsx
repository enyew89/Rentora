import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import * as z from "zod";
import { Button, Input } from "../components";

const completeProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters"),

  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters"),

  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\d{10,}$/, "Phone number must be at least 10 digits"),
});

export default function CompleteProfile({ onProfileComplete }) {  // <-- accepts prop
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(completeProfileSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
        }),
      });

      const result = await response.json();

      console.log("Complete profile response:", result);

      if (!response.ok) {
        setErrorMessage(
          result.message || "Failed to complete your profile"
        );
        return;
      }

      // Update shared auth state in App.jsx BEFORE navigating
      // so ProtectedRoute already sees profileComplete: true
      onProfileComplete(result.user);  // <-- added

      navigate("/dashboard", { replace: true });

    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Unable to connect to the server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 overflow-hidden flex flex-col justify-center items-center px-4">
      {/* Animated background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Logo and brand */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-500 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-orange-500/20">
              R
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Rentora</h1>
          <p className="text-sm text-gray-500">Manage your rental business</p>
        </div>

        {/* Premium Card */}
        <div className="group relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-orange-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Card */}
          <div className="relative bg-gray-900/60 backdrop-blur-2xl border border-gray-800/60 rounded-3xl p-8 shadow-2xl overflow-hidden">
            {/* Subtle inner gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-3xl" />

            {/* Card content */}
            <div className="relative space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Complete Your Profile
                </h2>
                <p className="text-sm text-gray-500">
                  Let's get your Rentora account ready.
                </p>
              </div>

              {/* Form */}
              {errorMessage && (
                <p className="text-sm text-red-400">{errorMessage}</p>
              )}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="First Name"
                    placeholder="John"
                    error={errors.firstName?.message}
                    {...register("firstName")}
                  />
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    error={errors.lastName?.message}
                    {...register("lastName")}
                  />
                </div>

                {/* Phone */}
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  error={errors.phoneNumber?.message}
                  {...register("phoneNumber")}
                />

                {/* Submit button */}
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Complete Profile
                  <ArrowRight size={18} />
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-gray-600 mt-8">
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