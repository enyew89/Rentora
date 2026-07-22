function calculatePasswordStrength(password) {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  if (strength <= 2) return { level: 'Weak', color: 'bg-red-500', width: '33%' };
  if (strength <= 3) return { level: 'Medium', color: 'bg-yellow-500', width: '66%' };
  return { level: 'Strong', color: 'bg-green-500', width: '100%' };
}

export default function PasswordStrengthIndicator({ password }) {
  if (!password) return null;
  const strength = calculatePasswordStrength(password);

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-400">Password strength</span>
        <span className="text-xs font-semibold text-gray-300">{strength.level}</span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${strength.color} transition-all duration-300`}
          style={{ width: strength.width }}
        />
      </div>
    </div>
  );
}