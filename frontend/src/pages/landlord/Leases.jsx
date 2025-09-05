import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { FaFileContract, FaCalendarAlt, FaUser, FaHome, FaMoneyBillWave, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";
import { apiFetch } from "../../lib/api";
import { toast } from "react-toastify";

export default function LandlordLeases() {
  const { profile } = useOutletContext();
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeases();
  }, []);

  const fetchLeases = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/leases");
      console.log("Fetched leases:", data);
      setLeases(data || []);
    } catch (error) {
      console.error("Error fetching leases:", error);
      toast.error("Failed to fetch leases");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <FaCheckCircle className="mr-1" />
            Active
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <FaClock className="mr-1" />
            Pending
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <FaTimesCircle className="mr-1" />
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            Unknown
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leases</h1>
        <Button onClick={fetchLeases} variant="outline">
          Refresh
        </Button>
      </div>

      {leases.length === 0 ? (
        <Card className="p-8 text-center">
          <FaFileContract className="text-gray-400 text-6xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Leases Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You don't have any active leases yet. Leases will appear here once tenants apply for and are approved for your properties.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {leases.map((lease) => (
            <Card key={lease._id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <FaFileContract className="text-blue-600 text-xl" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {lease.property?.title || "Property Title"}
                    </h3>
                    {getStatusBadge(lease.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        <strong>Tenant:</strong> {lease.tenant?.name || "N/A"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        <strong>Start Date:</strong> {formatDate(lease.startDate)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        <strong>End Date:</strong> {formatDate(lease.endDate)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <FaMoneyBillWave className="text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        <strong>Rent:</strong> ₦{lease.rentAmount?.toLocaleString() || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => window.open(`/landlord/applicants`, "_blank")}
                    variant="outline"
                    size="sm"
                  >
                    View Details
                  </Button>
                  {lease.status === "pending" && (
                    <Button
                      onClick={() => window.open(`/landlord/applicants`, "_blank")}
                      size="sm"
                    >
                      Review Application
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
