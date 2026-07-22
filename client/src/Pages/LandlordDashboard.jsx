export default function LandlordDashboard() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">

      <h1 className="text-3xl font-bold mb-2">
        Welcome back, Landlord 👋
      </h1>

      <p className="text-gray-400 mb-8">
        Manage your properties, tenants, and rent payments.
      </p>


      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h2 className="text-gray-400">
            Properties
          </h2>
          <p className="text-4xl font-bold mt-3">
            12
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Active properties
          </p>
        </div>


        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h2 className="text-gray-400">
            Monthly Income
          </h2>

          <p className="text-4xl font-bold mt-3">
            $4,500
          </p>

          <p className="text-sm text-gray-500 mt-2">
            From rent payments
          </p>
        </div>


        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h2 className="text-gray-400">
            Pending Requests
          </h2>

          <p className="text-4xl font-bold mt-3">
            3
          </p>

          <p className="text-sm text-gray-500 mt-2">
            Maintenance issues
          </p>
        </div>

      </div>


      <div className="mt-8 bg-gray-900 rounded-2xl p-6 border border-gray-800">

        <h2 className="text-xl font-semibold mb-4">
          Recent Activity
        </h2>

        <ul className="space-y-3 text-gray-300">

          <li>
            ✅ Tenant John paid this month's rent
          </li>

          <li>
            🔧 New maintenance request submitted
          </li>

          <li>
            🏠 New property added
          </li>

        </ul>

      </div>

    </div>
  );
}