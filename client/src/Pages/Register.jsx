import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { Button, Input } from '../components';
import { authSchema } from '../schemas/authSchema';

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(authSchema),
    mode: 'onBlur',
  });

  const password = watch('password');
  const agreeToTerms = watch('agreeToTerms');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (response.ok) {
        // Store email for profile completion
        navigate('/complete-profile');
      } else {
        console.error('Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = () => {
  window.location.href = "auth/auth/google";
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
                  Create your account
                </h2>
                <p className="text-sm text-gray-500">Start managing your rental properties.</p>
              </div>

              {/* Google button */}
              <Button variant="secondary" type="button" onClick={handleGoogleSignup}>
                <FcGoogle size={18} />
                Continue with Google
              </Button>

              {/* Divider */}
              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700/50" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 bg-gray-900/60 text-xs text-gray-500 uppercase tracking-wider">Or</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email */}
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />

                {/* Password */}
                <div>
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    error={errors.password?.message}
                    passwordVisible={showPassword}
                    togglePasswordVisibility={() => setShowPassword(!showPassword)}
                    {...register('password')}
                  />
                </div>

                {/* Confirm Password */}
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  passwordVisible={showConfirmPassword}
                  togglePasswordVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
                  {...register('confirmPassword')}
                />

                {/* Terms checkbox */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      className="w-5 h-5 mt-0.5 accent-orange-500 cursor-pointer rounded border-gray-700 bg-gray-800 transition-all hover:border-orange-500/50"
                      {...register('agreeToTerms')}
                    />
                    <label htmlFor="terms" className="text-xs text-gray-400 cursor-pointer leading-relaxed">
                      I agree to the{' '}
                      <a href="#" className="text-orange-500 hover:text-orange-400 transition-colors font-medium">
                        Terms of Service
                      </a>
                      {' '}and{' '}
                      <a href="#" className="text-orange-500 hover:text-orange-400 transition-colors font-medium">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="text-xs text-red-400">{errors.agreeToTerms.message}</p>
                  )}
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={!agreeToTerms || isSubmitting}
                >
                  Create Account
                  <ArrowRight size={18} />
                </Button>
              </form>

              {/* Login link */}
              <p className="text-center text-xs text-gray-500 pt-2">
                Already have an account?{' '}
                <Link to="/login" className="text-orange-500 hover:text-orange-400 font-semibold transition-colors">
                  Log in
                </Link>
              </p>
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