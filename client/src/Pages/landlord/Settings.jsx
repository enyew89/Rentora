import { useState, useEffect } from "react";
import {
  GlassCard,
  PageHeader,
  Input,
  PrimaryButton,
  GhostButton,
} from "../../components/ui";

export default function Settings() {
  const [hasPassword, setHasPassword] = useState(false);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", phoneNumber: "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [editing, setEditing] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [msg, setMsg] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [error, setError] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setHasPassword(data.hash);
        setForm({
          firstName: data.user?.firstName ?? "",
          lastName: data.user?.lastName ?? "",
          phoneNumber: data.user?.phoneNumber ?? "",
        });
      })
      .catch(console.error);
  }, []);

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
    if (pwForm.newPassword.length < 8) return setPwError("Password must be at least 8 characters.");
    if (pwForm.newPassword !== pwForm.confirmPassword) return setPwError("Passwords don't match.");
    setSavingPw(true);
    try {
      const body = hasPassword
        ? { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }
        : { newPassword: pwForm.newPassword };
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password.");
      setPwMsg("Password changed successfully.");
      setChangingPw(false);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setHasPassword(true);
    } catch (err) {
      setPwError(err.message);
    } finally {
      setSavingPw(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  const email = user?.email || "\u2014";

  return (
    <div className="space-y-6 max-w-lg">
      <PageHeader title="Profile" subtitle="Manage your account details." />

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-base font-semibold text-white">My Profile</p>
          {!editing && (
            <button onClick={() => { setEditing(true); setMsg(""); setError(""); }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Edit</button>
          )}
        </div>
        {msg && <div className="mb-3 p-3 rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-base text-emerald-400">{msg}</div>}
        {error && <div className="mb-3 p-3 rounded-lg border border-red-500/25 bg-red-500/10 text-base text-red-400">{error}</div>}

        <GlassCard className="p-5">
          {editing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="First name" id="firstName" value={form.firstName} onChange={setField("firstName")} />
                <Input label="Last name" id="lastName" value={form.lastName} onChange={setField("lastName")} />
              </div>
              <Input label="Phone number" id="phoneNumber" type="tel" value={form.phoneNumber} onChange={setField("phoneNumber")} />
              <div>
                <p className="text-sm text-white/50 mb-2 font-medium">Email</p>
                <p className="text-base text-white/70">{email}</p>
              </div>
              <div className="flex gap-3 pt-1">
                <GhostButton type="button" onClick={() => setEditing(false)}>Cancel</GhostButton>
                <PrimaryButton type="submit" className="flex-1" disabled={saving}>{saving ? "Saving..." : "Save changes"}</PrimaryButton>
              </div>
            </form>
          ) : (
            <div>
              {[["First name", form.firstName || "\u2014"], ["Last name", form.lastName || "\u2014"], ["Email", email], ["Phone", form.phoneNumber || "\u2014"]].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                  <span className="text-base text-white/50">{label}</span>
                  <span className="text-base text-white font-medium">{value}</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-base font-semibold text-white">Security</p>
          {!changingPw && (
            <button onClick={() => { setChangingPw(true); setPwMsg(""); setPwError(""); }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              {hasPassword ? "Change password" : "Set password"}
            </button>
          )}
        </div>
        {pwMsg && <div className="mb-3 p-3 rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-base text-emerald-400">{pwMsg}</div>}
        {pwError && <div className="mb-3 p-3 rounded-lg border border-red-500/25 bg-red-500/10 text-base text-red-400">{pwError}</div>}

        <GlassCard className="p-5">
          {changingPw ? (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {hasPassword && <Input label="Current password" id="currentPassword" type="password" value={pwForm.currentPassword} onChange={setPwField("currentPassword")} />}
              <Input label="New password" id="newPassword" type="password" placeholder="At least 8 characters" value={pwForm.newPassword} onChange={setPwField("newPassword")} />
              <Input label="Confirm new password" id="confirmPassword" type="password" value={pwForm.confirmPassword} onChange={setPwField("confirmPassword")} />
              <div className="flex gap-3 pt-1">
                <GhostButton type="button" onClick={() => setChangingPw(false)}>Cancel</GhostButton>
                <PrimaryButton type="submit" className="flex-1" disabled={savingPw}>{savingPw ? "Saving..." : hasPassword ? "Update password" : "Set password"}</PrimaryButton>
              </div>
            </form>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-base text-white/50">Password</span>
              <span className="text-base text-white/50 tracking-widest">\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022</span>
            </div>
          )}
        </GlassCard>
      </div>

      <div>
        <GlassCard className="p-5" accent="red">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-white">Log out</p>
              <p className="text-sm text-white/50 mt-1">Sign out of your Rentora account.</p>
            </div>
            <PrimaryButton onClick={handleLogout} className="bg-red-500/90 hover:bg-red-500 text-white">Log out</PrimaryButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
