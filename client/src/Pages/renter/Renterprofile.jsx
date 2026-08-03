import { useEffect, useState } from "react";
import {
  GlassCard,
  PageHeader,
  Input,
  PrimaryButton,
  GhostButton,
} from "../../components/ui";

export default function RenterProfile({ user }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [editing, setEditing] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [msg, setMsg] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [error, setError] = useState("");
  const [pwError, setPwError] = useState("");

  // Populate from user prop
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        phoneNumber: user.phoneNumber ?? "",
      });
    }
  }, [user]);

  function setField(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function setPwField(field) {
    return (e) => setPwForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMsg("");

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phoneNumber: form.phoneNumber.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile.");

      setMsg("Profile updated.");
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwError("");
    setPwMsg("");

    if (pwForm.newPassword.length < 8) {
      return setPwError("Password must be at least 8 characters.");
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return setPwError("Passwords don't match.");
    }

    setSavingPw(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password.");

      setPwMsg("Password changed.");
      setChangingPw(false);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwError(err.message);
    } finally {
      setSavingPw(false);
    }
  }

  const email = user?.username || user?.email || "—";

  return (
    <div className="space-y-6 max-w-lg">
      <PageHeader title="Profile" subtitle="Manage your account details." />

      {/* Profile section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-white/60">My Profile</p>
          {!editing && (
            <button
              onClick={() => { setEditing(true); setMsg(""); setError(""); }}
              className="text-xs text-white/40 hover:text-white transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {msg && (
          <div className="mb-3 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-sm text-emerald-400">
            {msg}
          </div>
        )}
        {error && (
          <div className="mb-3 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-sm text-red-400">
            {error}
          </div>
        )}

        <GlassCard className="p-4">
          {editing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First name"
                  id="firstName"
                  value={form.firstName}
                  onChange={setField("firstName")}
                />
                <Input
                  label="Last name"
                  id="lastName"
                  value={form.lastName}
                  onChange={setField("lastName")}
                />
              </div>
              <Input
                label="Phone number"
                id="phoneNumber"
                type="tel"
                value={form.phoneNumber}
                onChange={setField("phoneNumber")}
              />
              {/* Email is always read-only */}
              <div>
                <p className="text-xs text-white/40 mb-1.5">Email</p>
                <p className="text-sm text-white/30">{email}</p>
              </div>
              <div className="flex gap-3 pt-1">
                <GhostButton type="button" onClick={() => setEditing(false)}>
                  Cancel
                </GhostButton>
                <PrimaryButton type="submit" className="flex-1" disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </PrimaryButton>
              </div>
            </form>
          ) : (
            <div className="space-y-0">
              {[
                ["First name", form.firstName || "—"],
                ["Last name", form.lastName || "—"],
                ["Email", email],
                ["Phone", form.phoneNumber || "—"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0"
                >
                  <span className="text-sm text-white/40">{label}</span>
                  <span className="text-sm text-white font-medium">{value}</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Password section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-white/60">Security</p>
          {!changingPw && (
            <button
              onClick={() => { setChangingPw(true); setPwMsg(""); setPwError(""); }}
              className="text-xs text-white/40 hover:text-white transition-colors"
            >
              Change password
            </button>
          )}
        </div>

        {pwMsg && (
          <div className="mb-3 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-sm text-emerald-400">
            {pwMsg}
          </div>
        )}
        {pwError && (
          <div className="mb-3 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-sm text-red-400">
            {pwError}
          </div>
        )}

        <GlassCard className="p-4">
          {changingPw ? (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label="Current password"
                id="currentPassword"
                type="password"
                value={pwForm.currentPassword}
                onChange={setPwField("currentPassword")}
              />
              <Input
                label="New password"
                id="newPassword"
                type="password"
                placeholder="At least 8 characters"
                value={pwForm.newPassword}
                onChange={setPwField("newPassword")}
              />
              <Input
                label="Confirm new password"
                id="confirmPassword"
                type="password"
                value={pwForm.confirmPassword}
                onChange={setPwField("confirmPassword")}
              />
              <div className="flex gap-3 pt-1">
                <GhostButton type="button" onClick={() => setChangingPw(false)}>
                  Cancel
                </GhostButton>
                <PrimaryButton type="submit" className="flex-1" disabled={savingPw}>
                  {savingPw ? "Saving..." : "Update password"}
                </PrimaryButton>
              </div>
            </form>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/40">Password</span>
              <span className="text-sm text-white/30 tracking-widest">••••••••</span>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}