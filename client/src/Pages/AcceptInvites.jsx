import { useEffect, useState } from "react";

/**
 * AcceptInvite — public standalone page (no dashboard layout)
 *
 * Mount at:  /accept-invite/:token
 *
 * Flow:
 *  1. On load → GET /api/invitations/:token  (validate, get unit/property/email)
 *  2. Show registration form with email locked (read-only)
 *  3. On submit → POST /api/invitations/accept
 *  4. On success → redirect to /renter (renter dashboard)
 */

function getToken() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] || "";
}

const STEPS = {
  VALIDATING: "validating",
  FORM: "form",
  SUBMITTING: "submitting",
  SUCCESS: "success",
  ERROR: "error",
};

export default function AcceptInvite() {
  const token = getToken();

  const [step, setStep] = useState(STEPS.VALIDATING);
  const [invitation, setInvitation] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldError, setFieldError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  // ── Step 1: validate token ──────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setErrorMsg("This invitation link is missing a token.");
      setStep(STEPS.ERROR);
      return;
    }

    async function validate() {
      try {
        const res = await fetch(`/api/invitations/${token}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Invalid invitation.");

        setInvitation(data.invitation);
        setStep(STEPS.FORM);
      } catch (err) {
        setErrorMsg(err.message);
        setStep(STEPS.ERROR);
      }
    }

    validate();
  }, [token]);

  // ── Step 2: submit ──────────────────────────────────────────────────────────
  function set(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setFieldError("");
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFieldError("");

    if (!form.firstName.trim() || !form.lastName.trim()) {
      return setFieldError("Please enter your full name.");
    }
    if (!form.phoneNumber.trim()) {
      return setFieldError("Please enter your phone number.");
    }
    if (form.password.length < 8) {
      return setFieldError("Password must be at least 8 characters.");
    }
    if (form.password !== form.confirmPassword) {
      return setFieldError("Passwords don't match.");
    }

    setStep(STEPS.SUBMITTING);

    try {
      const res = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          token,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phoneNumber: form.phoneNumber.trim(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStep(STEPS.FORM);
        return setFieldError(data.message || "Failed to create your account.");
      }

      if (data.autoLogin) {
        // Logged in via session — go straight to renter dashboard
        window.location.href = "/renter";
      } else {
        // Fallback: account created but session didn't attach
        setStep(STEPS.SUCCESS);
      }
    } catch (err) {
      setStep(STEPS.FORM);
      setFieldError(err.message || "Something went wrong.");
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      {/* Ambient orb */}
      <div style={styles.orb} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>
          Rentora<span style={{ color: "#60a5fa" }}>.</span>
        </div>

        {/* ── Validating ── */}
        {step === STEPS.VALIDATING && (
          <p style={styles.muted}>Validating your invitation...</p>
        )}

        {/* ── Error ── */}
        {step === STEPS.ERROR && (
          <div style={{ textAlign: "center" }}>
            <div style={{ ...styles.iconBox, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
              ⚠️
            </div>
            <p style={styles.heading}>Invitation invalid</p>
            <p style={styles.muted}>{errorMsg}</p>
            <p style={{ ...styles.muted, marginTop: 16, fontSize: 12, opacity: 0.5 }}>
              Ask your landlord to send a new invitation link.
            </p>
          </div>
        )}

        {/* ── Registration form ── */}
        {(step === STEPS.FORM || step === STEPS.SUBMITTING) && invitation && (
          <div>
            {/* Unit banner */}
            <div style={styles.banner}>
              <p style={{ ...styles.muted, fontSize: 12, marginBottom: 4 }}>
                You've been invited to
              </p>
              <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
                {invitation.property?.name} — Unit {invitation.unit?.unitNumber}
              </p>
              <p style={{ ...styles.muted, fontSize: 12, marginTop: 2 }}>
                {invitation.property?.address}
                {invitation.unit?.rentAmount
                  ? ` · ${Number(invitation.unit.rentAmount).toLocaleString()} ETB / month`
                  : ""}
              </p>
            </div>

            <p style={styles.heading}>Create your account</p>
            <p style={{ ...styles.muted, marginBottom: 24 }}>
              Set up your renter account to manage payments and communicate with
              your landlord.
            </p>

            {fieldError && (
              <div style={styles.errorBox}>{fieldError}</div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email — locked, read-only */}
              <div style={{ marginBottom: 12 }}>
                <Field
                  label="Email address"
                  id="email"
                  type="email"
                  value={invitation.email}
                  readOnly
                />
              </div>

              {/* Name row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <Field
                  label="First name"
                  id="firstName"
                  placeholder="Abebe"
                  value={form.firstName}
                  onChange={set("firstName")}
                />
                <Field
                  label="Last name"
                  id="lastName"
                  placeholder="Kebede"
                  value={form.lastName}
                  onChange={set("lastName")}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <Field
                  label="Phone number"
                  id="phoneNumber"
                  type="tel"
                  placeholder="0912 345 678"
                  value={form.phoneNumber}
                  onChange={set("phoneNumber")}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <Field
                  label="Password"
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={set("password")}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <Field
                  label="Confirm password"
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                />
              </div>

              <button
                type="submit"
                disabled={step === STEPS.SUBMITTING}
                style={{
                  ...styles.btn,
                  opacity: step === STEPS.SUBMITTING ? 0.6 : 1,
                  cursor: step === STEPS.SUBMITTING ? "not-allowed" : "pointer",
                }}
              >
                {step === STEPS.SUBMITTING ? "Creating account..." : "Accept invitation"}
              </button>
            </form>
          </div>
        )}

        {/* ── Success fallback (if auto-login failed) ── */}
        {step === STEPS.SUCCESS && (
          <div style={{ textAlign: "center" }}>
            <div style={{ ...styles.iconBox, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}>
              ✓
            </div>
            <p style={styles.heading}>You're all set!</p>
            <p style={{ ...styles.muted, marginBottom: 24 }}>
              Your account has been created and linked to your unit. Log in to
              view your lease and pay rent.
            </p>
            <a href="/login" style={styles.btn}>
              Go to login
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Reusable field ─────────────────────────────────────────────────────────────
function Field({ label, id, type = "text", placeholder, value, onChange, readOnly }) {
  return (
    <div>
      <label htmlFor={id} style={styles.label}>{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        style={{
          ...styles.input,
          ...(readOnly ? styles.inputReadOnly : {}),
        }}
        onFocus={(e) => {
          if (!readOnly) e.target.style.borderColor = "rgba(96,165,250,0.5)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(255,255,255,0.08)";
        }}
      />
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a0a0f",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#fff",
  },
  orb: {
    position: "fixed",
    top: -150,
    left: "50%",
    transform: "translateX(-50%)",
    width: 700,
    height: 500,
    background: "rgba(59,130,246,0.06)",
    borderRadius: "50%",
    filter: "blur(120px)",
    pointerEvents: "none",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    backdropFilter: "blur(20px)",
    padding: 32,
    position: "relative",
  },
  logo: {
    marginBottom: 28,
    fontSize: 18,
    fontWeight: 600,
  },
  heading: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 6,
    marginTop: 0,
  },
  muted: {
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
    lineHeight: 1.6,
    margin: 0,
  },
  banner: {
    background: "rgba(59,130,246,0.08)",
    border: "1px solid rgba(59,130,246,0.15)",
    borderRadius: 12,
    padding: "12px 16px",
    marginBottom: 24,
  },
  errorBox: {
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: 10,
    padding: "10px 14px",
    marginBottom: 16,
    fontSize: 13,
    color: "#f87171",
  },
  label: {
    display: "block",
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 6,
    fontWeight: 500,
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  inputReadOnly: {
    background: "rgba(255,255,255,0.03)",
    color: "rgba(255,255,255,0.35)",
    cursor: "not-allowed",
  },
  btn: {
    display: "block",
    width: "100%",
    padding: "12px 0",
    borderRadius: 12,
    background: "rgba(59,130,246,0.85)",
    border: "none",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    textAlign: "center",
    textDecoration: "none",
    cursor: "pointer",
    transition: "opacity 0.2s",
    boxSizing: "border-box",
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    margin: "0 auto 20px",
  },
};