import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ProfileModal from "../../components/ui/ProfileModal";
import Avatar from "../../components/ui/Avatar";
import { FaUser, FaFileAlt, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave, FaEye, FaCheck, FaTimes, FaStar } from "react-icons/fa";
import { toast } from "react-toastify";

export default function LandlordApplicants() {
  const { profile } = useOutletContext();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch applications
  useEffect(() => {
    (async () => {
      try {
        console.log("Fetching landlord applications...");
        const apps = await apiFetch("/applications/landlord");
        console.log("Raw applications response:", apps);
        console.log("Applications array length:", Array.isArray(apps) ? apps.length : "Not an array");

        setApplications(Array.isArray(apps) ? apps : []);
      } catch (err) {
        console.error("Failed to load landlord applications", err);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Update status
  const updateStatus = async (id, status) => {
    try {
      setUpdating(id);
      console.log(`Updating application ${id} to status: ${status}`);
      
      const updated = await apiFetch(`/applications/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });

      console.log("Application updated successfully:", updated);

      setApplications((prev) =>
        prev.map((a) => (a._id === updated._id ? updated : a))
      );

      // Show success message
      if (status === "approved") {
        toast.success("Application approved successfully! A lease has been created.");
      } else if (status === "rejected") {
        toast.success("Application rejected.");
      }
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error(err.message || "Failed to update application status");
    } finally {
      setUpdating(null);
    }
  };

  // View user profile
  const viewProfile = (user) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  // Group applications by property
  const groupApplicationsByProperty = (applications) => {
    const grouped = {};
    
    applications.forEach(app => {
      const propertyId = app.property?._id;
      if (!propertyId) return;
      
      if (!grouped[propertyId]) {
        grouped[propertyId] = {
          property: app.property,
          applications: [],
          latestApplication: app,
          totalApplications: 0
        };
      }
      
      grouped[propertyId].applications.push(app);
      grouped[propertyId].totalApplications++;
      
      // Keep the most recent application as the main one
      if (new Date(app.createdAt) > new Date(grouped[propertyId].latestApplication.createdAt)) {
        grouped[propertyId].latestApplication = app;
      }
    });
    
    return Object.values(grouped);
  };

  const groupedApplications = groupApplicationsByProperty(applications);

  // Filter applications based on search and status
  const filteredApplications = groupedApplications.filter(groupedApp => {
    const matchesSearch = groupedApp.property?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         groupedApp.property?.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         groupedApp.applications.some(app => 
                           app.tenant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.tenant?.email?.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    if (statusFilter === "all") return matchesSearch;
    
    const hasMatchingStatus = groupedApp.applications.some(app => app.status === statusFilter);
    return matchesSearch && hasMatchingStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "approved": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <FaCalendarAlt className="w-3 h-3" />;
      case "approved": return <FaCheck className="w-3 h-3" />;
      case "rejected": return <FaTimes className="w-3 h-3" />;
      default: return <FaFileAlt className="w-3 h-3" />;
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Applicants</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and review tenant applications
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <FaUser className="w-4 h-4" />
          <span>{filteredApplications.length} applicant{filteredApplications.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <FaUser className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Applications Grid */}
      {filteredApplications.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <FaUser className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm || statusFilter !== "all" ? "No matching applicants" : "No applicants yet"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || statusFilter !== "all" 
              ? "Try adjusting your search or filter criteria" 
              : "Applications will appear here when tenants apply to your properties"
            }
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((groupedApp) => (
            <Card key={groupedApp.property?._id} className="p-6 hover:shadow-lg transition-shadow duration-200">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
                    <FaFileAlt className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {groupedApp.property?.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <FaMapMarkerAlt className="w-3 h-3" />
                      {groupedApp.property?.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {groupedApp.totalApplications}
                  </span>
                  <FaUser className="w-3 h-3 text-gray-400" />
                </div>
              </div>

              {/* Application Details */}
              <div className="space-y-3 mb-4">
                {groupedApp.applications.slice(0, 2).map((app, index) => (
                  <div key={app._id || index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FaUser className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {app.tenant?.name}
              </span>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                      <span className="capitalize">{app.status}</span>
                    </div>
                  </div>
                ))}
                {groupedApp.applications.length > 2 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    +{groupedApp.applications.length - 2} more application{groupedApp.applications.length - 2 !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelected(groupedApp.latestApplication)}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <FaEye className="w-4 h-4" />
                  View Details
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => viewProfile(groupedApp.applications[0]?.tenant)}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <FaUser className="w-4 h-4" />
                  View Profile
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal for Details */}
      {selected && (() => {
        const tenantApplications = applications.filter(app => app.tenant?._id === selected.tenant?._id);
        return (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
              >
                ✕
              </button>

              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                All Applications - {selected.property?.title}
              </h2>

              <div className="space-y-4">
                {applications.filter(app => app.property?._id === selected.property?._id).map((app, index) => (
                  <div key={app._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Application #{index + 1} - {app.tenant?.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize
                        ${app.status === "approved" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" :
                          app.status === "pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200" :
                          "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"}`}>
                        {app.status}
                      </span>
                    </div>
                    
                    {/* Application Details */}
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                        <p><strong className="text-gray-700 dark:text-gray-300">Property:</strong> {app.property?.title}</p>
                        <p><strong className="text-gray-700 dark:text-gray-300">Location:</strong> {app.property?.location}</p>
                        <p><strong className="text-gray-700 dark:text-gray-300">Move-in Date:</strong> {app.moveInDate ? new Date(app.moveInDate).toLocaleDateString() : "—"}</p>
                      </div>
                        <div className="space-y-2">
                        <p><strong className="text-gray-700 dark:text-gray-300">Employment:</strong> {app.employment?.jobTitle} @ {app.employment?.employerName}</p>
                        <p><strong className="text-gray-700 dark:text-gray-300">Income:</strong> ₦{app.employment?.monthlyIncome?.toLocaleString()}</p>
                        <p><strong className="text-gray-700 dark:text-gray-300">Applied:</strong> {new Date(app.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      {app.status === "pending" && (
                        <>
                          <Button
                            variant="primary"
                            size="md"
                            onClick={() => updateStatus(app._id, "approved")}
                            disabled={updating === app._id}
                            className="flex-1 min-w-[120px]"
                          >
                            {updating === app._id ? "Processing..." : "✓ Approve"}
                          </Button>
                          <Button
                            variant="danger"
                            size="md"
                            onClick={() => updateStatus(app._id, "rejected")}
                            disabled={updating === app._id}
                            className="flex-1 min-w-[120px]"
                          >
                            {updating === app._id ? "Processing..." : "✗ Reject"}
                          </Button>
                        </>
                      )}
                      {app.status === "approved" && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <FaCheck className="w-4 h-4" />
                          <span className="text-sm font-medium">Application Approved</span>
                        </div>
                      )}
                      {app.status === "rejected" && (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <FaTimes className="w-4 h-4" />
                          <span className="text-sm font-medium">Application Rejected</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <Button variant="secondary" onClick={() => setSelected(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userId={selectedUser?._id}
        userRole={selectedUser?.role}
        currentUserRole={profile?.role}
        currentUserId={profile?._id}
      />

    </div>
  );
}

