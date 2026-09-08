import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-transparent text-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-neutral-400 mb-4">
          403
        </h1>

        <h2 className="text-2xl font-semibold mb-3">
          Access Denied
        </h2>

        <p className="text-gray-400 mb-8">
          You don't have permission to access this page.
        </p>

        <Link
          to="/"
          className="inline-block px-6 py-3 rounded-xl bg-neutral-500 hover:bg-neutral-400 transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}