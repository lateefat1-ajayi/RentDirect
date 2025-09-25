import { Link, useOutletContext } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { FaHome, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave, FaCheckCircle, FaClock, FaTimesCircle, FaEye, FaSync, FaFileAlt } from "react-icons/fa";

export default function UserApplications() {
  const { profile } = useOutletContext();
  const userName = profile?.name || "User";
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const apps = await apiFetch("/applications/tenant");
      setApplications(Array.isArray(apps) ? apps : []);
    } catch (err) {
      console.error("Failed to load applications", err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
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
      <div className="flex justify-end items-center">
        <Button onClick={fetchApplications} variant="outline" size="sm" className="p-2" title="Refresh Applications" aria-label="Refresh Applications">
          <FaSync className="w-4 h-4" />
        </Button>
      </div>

      {applications.length === 0 ? (
        <Card className="p-8 text-center">
          <FaFileAlt className="text-primary text-6xl mx-auto mb-4" />
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
            <Card key={app._id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex flex-col gap-3">
                {/* Header like lease cards */}
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex items-center gap-2">
                    <FaFileAlt className="text-primary" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                      {app.property?.title || "Property Title"}
                    </h3>
                  </div>
                  {getStatusBadge(app.status)}
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="space-y-0.5">
                    <p className="text-xs text-gray-500">Property</p>
                    <p className="truncate font-medium">{app.property?.title || "N/A"}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="truncate font-medium">{app.property?.location || "N/A"}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs text-gray-500">Rent</p>
                    <p className="truncate font-medium">₦{app.property?.price?.toLocaleString() || "N/A"}/year</p>
                  </div>
                </div>

                {/* Additional info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="space-y-0.5">
                    <p className="text-xs text-gray-500">Applied Date</p>
                    <p className="truncate font-medium">{new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs text-gray-500">Move-in Date</p>
                    <p className="truncate font-medium">{app.moveInDate ? new Date(app.moveInDate).toLocaleDateString() : "Not specified"}</p>
                  </div>
                </div>

                {/* Footer actions */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-xs text-gray-500">
                    Application ID: {app._id?.slice(-8)}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelected(app)}
                    className="flex items-center gap-2"
                  >
                    <FaEye className="w-4 h-4" />
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Application Details Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Application Details</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Property Information */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <FaHome className="text-blue-600" />
                  Property Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Property:</span>
                    <p className="text-gray-900 dark:text-white">{selected.property?.title || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Location:</span>
                    <p className="text-gray-900 dark:text-white">{selected.property?.location || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Rent:</span>
                    <p className="text-gray-900 dark:text-white">₦{selected.property?.price?.toLocaleString() || "N/A"}/year</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                    <div className="mt-1">
                      {getStatusBadge(selected.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Details */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <FaFileAlt className="text-green-600" />
                  Application Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Applied Date:</span>
                    <p className="text-gray-900 dark:text-white">{new Date(selected.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Move-in Date:</span>
                    <p className="text-gray-900 dark:text-white">{selected.moveInDate ? new Date(selected.moveInDate).toLocaleDateString() : "Not specified"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Lease Duration:</span>
                    <p className="text-gray-900 dark:text-white">{selected.leaseDuration ? `${selected.leaseDuration} year${selected.leaseDuration > 1 ? 's' : ''}` : "Not specified"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Application ID:</span>
                    <p className="text-gray-900 dark:text-white font-mono text-xs">{selected._id}</p>
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              {selected.employment && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <FaMoneyBillWave className="text-purple-600" />
                    Employment Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Job Title:</span>
                      <p className="text-gray-900 dark:text-white">{selected.employment.jobTitle || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Employer:</span>
                      <p className="text-gray-900 dark:text-white">{selected.employment.employerName || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Monthly Income:</span>
                      <p className="text-gray-900 dark:text-white">₦{selected.employment.monthlyIncome?.toLocaleString() || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Employer Phone:</span>
                      <p className="text-gray-900 dark:text-white">{selected.employment.employerPhone || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rental History */}
              {selected.rentalHistory && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <FaCalendarAlt className="text-orange-600" />
                    Rental History
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Previous Address:</span>
                      <p className="text-gray-900 dark:text-white">{selected.rentalHistory.previousAddress || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Previous Landlord:</span>
                      <p className="text-gray-900 dark:text-white">{selected.rentalHistory.previousLandlord || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Duration:</span>
                      <p className="text-gray-900 dark:text-white">{selected.rentalHistory.previousDuration || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Reason for Leaving:</span>
                      <p className="text-gray-900 dark:text-white">{selected.rentalHistory.reasonForLeaving || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              {selected.message && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Message to Landlord</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selected.message}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
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
