import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, LogOut, User, Shield, Eye, EyeOff } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();

  const [hasPassword, setHasPassword] = useState(false);
  const [user, setUser] = useState(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ text: "", type: "" });

  // Fetch user on mount to check if they have a local password
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched user data:", data);
        setUser(data.user);
        console.log(data.hash);
        setHasPassword(data.hash);
      })
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage({ text: "", type: "" });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ text: "New passwords do not match.", type: "error" });
      return;
    }

    setIsChangingPassword(true);

    try {
      const body = hasPassword
        ? { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword }
        : { newPassword: passwordData.newPassword };

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setPasswordMessage({ text: data.message || "Failed to change password.", type: "error" });
        return;
      }

      setPasswordMessage({ text: data.message || "Password changed successfully.", type: "success" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });

      // They now have a password, so show the current password field going forward
      setHasPassword(true);

    } catch (error) {
      console.error(error);
      setPasswordMessage({ text: "Something went wrong.", type: "error" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-400 mt-2">
            Manage your account and security settings.
          </p>
        </div>

        {/* Account Section */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gray-800 rounded-xl">
              <User size={22} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Account</h2>
              <p className="text-sm text-gray-400">Your account information</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Email</label>
              <input
                type="email"
                disabled
                value={user?.email || "user@example.com"}
                className="w-full mt-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-400"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Account Type</label>
              <input
                type="text"
                disabled
                value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Landlord"}
                className="w-full mt-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gray-800 rounded-xl">
              <Lock size={22} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {hasPassword ? "Change Password" : "Set a Password"}
              </h2>
              <p className="text-sm text-gray-400">
                {hasPassword
                  ? "Keep your account secure by using a strong password."
                  : "You signed up with Google. You can set a password to also log in with email."}
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-5">

            {/* Current Password — only for users who already have one */}
            {hasPassword && (
              <div>
                <label className="text-sm text-gray-300">Current Password</label>
                <div className="relative mt-2">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-neutral-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="text-sm text-gray-300">New Password</label>
              <div className="relative mt-2">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-neutral-400"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm text-gray-300">Confirm New Password</label>
              <div className="relative mt-2">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-neutral-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Feedback */}
            {passwordMessage.text && (
              <p className={`text-sm ${passwordMessage.type === "error" ? "text-red-400" : "text-neutral-300"}`}>
                {passwordMessage.text}
              </p>
            )}

            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-6 py-3 bg-neutral-400 hover:bg-neutral-500 rounded-xl font-semibold transition disabled:opacity-50"
            >
              {isChangingPassword ? "Saving..." : hasPassword ? "Change Password" : "Set Password"}
            </button>
          </form>
        </div>

        {/* Security */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-800 rounded-xl">
              <Shield size={22} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Security</h2>
              <p className="text-sm text-gray-400">
                Your account is protected with secure authentication.
              </p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="bg-gray-900/60 border border-neutral-700/40 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <h2 className="text-xl font-semibold">Log out</h2>
              <p className="text-sm text-gray-400 mt-1">
                Log out of your Rentora account on this device.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-neutral-500 hover:bg-neutral-600 rounded-xl font-semibold transition"
            >
              <LogOut size={18} />
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}