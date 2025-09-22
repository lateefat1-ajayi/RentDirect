import { Link, useOutletContext } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { FaHome, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave, FaCheckCircle, FaClock, FaTimesCircle, FaEye } from "react-icons/fa";

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

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <FaCheckCircle className="mr-1" />
            Approved
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <FaClock className="mr-1" />
            Pending
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <FaTimesCircle className="mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            {status}
          </span>
        );
    }
  };

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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Applications</h1>
      </div>

      {applications.length === 0 ? (
        <Card className="p-8 text-center">
          <FaHome className="text-gray-400 text-6xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Applications Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You haven't applied to any properties yet. Start browsing properties to find your perfect home!
          </p>
          <Link to="/user/properties">
            <Button>Browse Properties</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <Card key={app._id} className="p-4 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <FaHome className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {app.property?.title || "Property Title"}
                      </h3>
                      {getStatusBadge(app.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt className="w-3 h-3" />
                        {app.property?.location || "N/A"}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaMoneyBillWave className="w-3 h-3" />
                        ₦{app.property?.price?.toLocaleString() || "N/A"}/Year
                      </span>
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="w-3 h-3" />
                        Applied {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelected(app)}
                  className="flex items-center gap-2"
                >
                  <FaEye className="w-4 h-4" />
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Application Details</h2>

            <div className="space-y-2 text-sm">
              <p className="text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Property:</strong> {selected.property?.title}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Applied on:</strong>{" "}
                {new Date(selected.createdAt).toLocaleDateString()}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded text-xs ${selected.status === "approved"
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200"
                    : selected.status === "pending"
                      ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200"
                      : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200"
                    }`}
                >
                  {selected.status}
                </span>
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Move-in date:</strong>{" "}
                {selected.moveInDate
                  ? new Date(selected.moveInDate).toLocaleDateString()
                  : "—"}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Employment:</strong>{" "}
                {selected.employment?.jobTitle} @{" "}
                {selected.employment?.employerName}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Income:</strong>{" "}
                ₦
                {selected.employment?.monthlyIncome?.toLocaleString() ||
                  "Not provided"}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Rental History:</strong>{" "}
                {selected.rentalHistory?.previousAddress || "—"}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Reason for Leaving:</strong>{" "}
                {selected.rentalHistory?.reasonForLeaving || "—"}
              </p>
            </div>

            <div className="mt-4 flex gap-2">
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
