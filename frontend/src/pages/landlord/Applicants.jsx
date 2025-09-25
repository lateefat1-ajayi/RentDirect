import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ProfileModal from "../../components/ui/ProfileModal";
import Avatar from "../../components/ui/Avatar";
import { FaUser, FaFileAlt, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave, FaEye, FaCheck, FaTimes, FaStar, FaHome, FaSync, FaClock } from "react-icons/fa";
import { toast } from "react-toastify";

export default function LandlordApplicants() {
  const { profile } = useOutletContext();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [approving, setApproving] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");

  // Fetch applications
  const fetchApplications = async () => {
      try {
      setLoading(true);
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
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Update status
  const updateStatus = async (id, status) => {
    try {
      // Set the appropriate loading state
      if (status === "approved") {
        setApproving(id);
      } else if (status === "rejected") {
        setRejecting(id);
      }
      
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
      // Clear the appropriate loading state
      if (status === "approved") {
        setApproving(null);
      } else if (status === "rejected") {
        setRejecting(null);
      }
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

  // Get unique properties for filter dropdown
  const uniqueProperties = [...new Set(applications.map(app => app.property?._id).filter(Boolean))]
    .map(propertyId => {
      const app = applications.find(app => app.property?._id === propertyId);
      return app?.property;
    })
    .filter(Boolean);

  // Filter applications based on search, status, and property
  const filteredApplications = groupedApplications.filter(groupedApp => {
    const matchesSearch = groupedApp.property?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         groupedApp.property?.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         groupedApp.applications.some(app => 
                           app.tenant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.tenant?.email?.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesStatus = statusFilter === "all" || 
                         groupedApp.applications.some(app => app.status === statusFilter);
    
    const matchesProperty = propertyFilter === "all" || 
                           groupedApp.property?._id === propertyFilter;
    
    return matchesSearch && matchesStatus && matchesProperty;
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
        <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <FaUser className="w-4 h-4" />
          <span>{filteredApplications.length} applicant{filteredApplications.length !== 1 ? 's' : ''}</span>
          </div>
          <Button onClick={fetchApplications} variant="outline" size="sm" className="p-2" title="Refresh Applications" aria-label="Refresh Applications">
            <FaSync className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, or property..."
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
        <select
          value={propertyFilter}
          onChange={(e) => setPropertyFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="all">All Properties</option>
          {uniqueProperties.map(property => (
            <option key={property._id} value={property._id}>
              {property.title}
            </option>
          ))}
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
          {filteredApplications.flatMap(groupedApp => 
            groupedApp.applications.map(app => (
              <Card key={app._id} className="p-6 hover:shadow-lg transition-shadow duration-200">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
                      <FaUser className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        {app.tenant?.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <FaMapMarkerAlt className="w-3 h-3" />
                      {groupedApp.property?.location}
                    </p>
                  </div>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                      <span className="capitalize">{app.status}</span>
                    </div>
                  </div>

                {/* Property Info */}
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <FaHome className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {groupedApp.property?.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <FaCalendarAlt className="w-3 h-3" />
                    <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                  {app.leaseDuration && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <FaClock className="w-3 h-3" />
                      <span>Duration: {app.leaseDuration} year{app.leaseDuration > 1 ? 's' : ''}</span>
                    </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                    onClick={() => setSelected(app)}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <FaEye className="w-4 h-4" />
                  View Details
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                    onClick={() => viewProfile(app.tenant)}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <FaUser className="w-4 h-4" />
                  View Profile
                </Button>
              </div>
            </Card>
            ))
          )}
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
                    <p className="text-gray-900 dark:text-white">
                      {selected.property?.price ? `₦${selected.property.price.toLocaleString()}/year` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selected.status === "approved" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                        selected.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}>
                        {selected.status === "approved" && <FaCheck className="mr-1" />}
                        {selected.status === "pending" && <FaCalendarAlt className="mr-1" />}
                        {selected.status === "rejected" && <FaTimes className="mr-1" />}
                        {selected.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tenant Information */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <FaUser className="text-purple-600" />
                  Tenant Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Name:</span>
                    <p className="text-gray-900 dark:text-white">{selected.tenant?.name || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                    <p className="text-gray-900 dark:text-white">{selected.tenant?.email || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Phone:</span>
                    <p className="text-gray-900 dark:text-white">{selected.applicant?.phone || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Date of Birth:</span>
                    <p className="text-gray-900 dark:text-white">{selected.applicant?.dob ? new Date(selected.applicant.dob).toLocaleDateString() : "N/A"}</p>
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
                    <FaMoneyBillWave className="text-orange-600" />
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
                    <FaCalendarAlt className="text-indigo-600" />
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
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Message from Tenant</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selected.message}</p>
                </div>
              )}

                    {/* Action Buttons */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Actions</h3>
                <div className="flex flex-wrap gap-2">
                  {selected.status === "pending" && (
                        <>
                          <Button
                            variant="primary"
                            size="md"
                        onClick={() => updateStatus(selected._id, "approved")}
                        disabled={approving === selected._id || rejecting === selected._id}
                            className="flex-1 min-w-[120px]"
                          >
                        {approving === selected._id ? "Processing..." : "✓ Approve"}
                          </Button>
                          <Button
                            variant="danger"
                            size="md"
                        onClick={() => updateStatus(selected._id, "rejected")}
                        disabled={approving === selected._id || rejecting === selected._id}
                            className="flex-1 min-w-[120px]"
                          >
                        {rejecting === selected._id ? "Processing..." : "✗ Reject"}
                          </Button>
                        </>
                      )}
                  {selected.status === "approved" && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <FaCheck className="w-4 h-4" />
                          <span className="text-sm font-medium">Application Approved</span>
                        </div>
                      )}
                  {selected.status === "rejected" && (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <FaTimes className="w-4 h-4" />
                          <span className="text-sm font-medium">Application Rejected</span>
                        </div>
                      )}
                    </div>
                  </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button variant="secondary" onClick={() => setSelected(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
      )}

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

