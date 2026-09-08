export default function Button({ 
  children, 
  variant = 'primary', 
  loading = false, 
  disabled = false, 
  ...props 
}) {
  const baseClasses = 'w-full py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2';

  const variants = {
    primary: `${baseClasses} bg-gradient-to-r from-neutral-700 to-neutral-500 text-white hover:shadow-lg hover:shadow-white-500/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0`,
    secondary: `${baseClasses} bg-white text-gray-900 hover:shadow-lg hover:shadow-white/10 hover:-translate-y-0.5 font-semibold`,
  };

  return (
    <button
      className={variants[variant]}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}