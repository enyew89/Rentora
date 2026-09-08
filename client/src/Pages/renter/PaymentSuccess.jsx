import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { GlassCard, PageHeader } from "../../components/ui";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking"); // "checking" | "paid" | "pending" | "error"

  const tx_ref = searchParams.get("trx_ref") || searchParams.get("tx_ref");

  useEffect(() => {
    if (!tx_ref) {
      setStatus("error");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(`/api/payments/verify/${tx_ref}`, {
          credentials: "include",
        });
        const data = await res.json();
        setStatus(data.status === "paid" ? "paid" : "pending");
      } catch {
        setStatus("error");
      }
    }

    verify();
  }, [tx_ref]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
      <div className="w-full max-w-md space-y-5">
        <PageHeader title="Payment" subtitle="Verifying your payment…" />

        <GlassCard className="p-8 text-center space-y-4">
          {status === "checking" && (
            <>
              <div className="text-4xl">⏳</div>
              <p className="text-white/60 text-sm">Confirming with Chapa…</p>
            </>
          )}

          {status === "paid" && (
            <>
              <div className="text-4xl">✅</div>
              <p className="text-white font-semibold text-lg">Payment Confirmed</p>
              <p className="text-white/40 text-sm">
                Your rent payment has been received successfully.
              </p>
            </>
          )}

          {status === "pending" && (
            <>
              <div className="text-4xl">⏳</div>
              <p className="text-white font-semibold text-lg">Payment Pending</p>
              <p className="text-white/40 text-sm">
                We haven't received confirmation yet. This can take a few minutes.
                Check your payments page shortly.
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="text-4xl">❌</div>
              <p className="text-white font-semibold text-lg">Something went wrong</p>
              <p className="text-white/40 text-sm">
                We couldn't verify your payment. Please check your payments page.
              </p>
            </>
          )}

          <button
            onClick={() => navigate("/renter/payments")}
            className="mt-2 w-full py-2.5 rounded-xl bg-white hover:bg-neutral-400 text-sm font-semibold text-black transition-all"
          >
            Go to My Payments
          </button>
        </GlassCard>
      </div>
    </div>
  );
}