import { Link, useOutletContext } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function UserApplications() {
  const { profile } = useOutletContext();
  const userName = profile?.name || "User";
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const apps = await apiFetch("/applications/tenant");
        setApplications(Array.isArray(apps) ? apps : []);
      } catch (err) {
        console.error("Failed to load applications", err);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Applications</h2>
      <p className="text-gray-500">
        Here are your rental applications, {userName}.
      </p>

      {applications.length === 0 ? (
        <div className="text-gray-500">You have no applications yet.</div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card
              key={app._id}
              className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center"
            >
              <div>
                <h3 className="text-lg font-semibold">
                  {app.property?.title || "Property"}
                </h3>
                <p className="text-sm text-gray-500">
                  Applied on {new Date(app.createdAt).toLocaleDateString()}
                </p>
                <span
                  className={`inline-block mt-1 px-2 py-1 text-xs rounded ${app.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : app.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                    }`}
                >
                  {app.status}
                </span>
              </div>

              <div className="mt-3 sm:mt-0 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelected(app)}
                >
                  View
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-4">Application Details</h2>

            <div className="space-y-2 text-sm">
              <p>
                <strong>Property:</strong> {selected.property?.title}
              </p>
              <p>
                <strong>Applied on:</strong>{" "}
                {new Date(selected.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded text-xs ${selected.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : selected.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                    }`}
                >
                  {selected.status}
                </span>
              </p>
              <p>
                <strong>Move-in date:</strong>{" "}
                {selected.moveInDate
                  ? new Date(selected.moveInDate).toLocaleDateString()
                  : "—"}
              </p>
              <p>
                <strong>Employment:</strong>{" "}
                {selected.employment?.jobTitle} @{" "}
                {selected.employment?.employerName}
              </p>
              <p>
                <strong>Income:</strong>{" "}
                ₦
                {selected.employment?.monthlyIncome?.toLocaleString() ||
                  "Not provided"}
              </p>
              <p>
                <strong>Rental History:</strong>{" "}
                {selected.rentalHistory?.previousAddress || "—"}
              </p>
              <p>
                <strong>Reason for Leaving:</strong>{" "}
                {selected.rentalHistory?.reasonForLeaving || "—"}
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              {selected.status === "approved" && selected.lease && (
                <Link to={`/user/payments/${selected.lease._id}`}>
                  <Button size="sm" variant="primary">Proceed to Payment</Button>
                </Link>
              )}
              <Button variant="secondary" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
