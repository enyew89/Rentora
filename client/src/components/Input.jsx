import { Eye, EyeOff } from 'lucide-react';

export default function Input({ 
  label, 
  type = 'text', 
  placeholder, 
  error, 
  passwordVisible, 
  togglePasswordVisibility, 
  ...props 
}) {
  const isPassword = type === 'password';

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-200">
        {label}
      </label>
      <div className="relative">
        <input
          type={isPassword && passwordVisible ? 'text' : type}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 bg-gray-900/50 border rounded-lg text-gray-100 placeholder-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm ${
            error ? 'border-neutral-500/50' : 'border-gray-700/50'
          }`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
            tabIndex="-1"
          >
            {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}