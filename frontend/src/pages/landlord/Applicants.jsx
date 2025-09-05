import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import ProfileModal from "../../components/ui/ProfileModal";
import ReviewModal from "../../components/ui/ReviewModal";
import Avatar from "../../components/ui/Avatar";

export default function LandlordApplicants() {
  const { profile } = useOutletContext();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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
      const updated = await apiFetch(`/applications/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });

      setApplications((prev) =>
        prev.map((a) => (a._id === updated._id ? updated : a))
      );
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // View user profile
  const viewProfile = (user) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  // Group applications by tenant
  const groupApplicationsByTenant = (applications) => {
    const grouped = {};
    
    applications.forEach(app => {
      const tenantId = app.tenant?._id;
      if (!tenantId) return;
      
      if (!grouped[tenantId]) {
        grouped[tenantId] = {
          tenant: app.tenant,
          applications: [],
          latestApplication: app,
          totalApplications: 0
        };
      }
      
      grouped[tenantId].applications.push(app);
      grouped[tenantId].totalApplications++;
      
      // Keep the most recent application as the main one
      if (new Date(app.createdAt) > new Date(grouped[tenantId].latestApplication.createdAt)) {
        grouped[tenantId].latestApplication = app;
      }
    });
    
    return Object.values(grouped);
  };

  const groupedApplications = groupApplicationsByTenant(applications);

  // Open review modal
  const openReviewModal = (user) => {
    setSelectedUser(user);
    setShowReviewModal(true);
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Applicants</h1>

      <Table
        columns={[
          "Tenant",
          "Applications",
          "View Application",
          "Profile",
        ]}
        data={groupedApplications}
        hover={false}
        renderRow={(groupedApp) => (
          <>
            <td className="border border-gray-200 dark:border-gray-700 p-1 text-center w-fit">
              <div className="flex items-center justify-center gap-2">
                <Avatar
                  name={groupedApp.tenant?.name}
                  src={groupedApp.tenant?.profileImage}
                  size="w-8 h-8"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{groupedApp.tenant?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{groupedApp.tenant?.email}</p>
                </div>
              </div>
            </td>
            <td className="border border-gray-200 dark:border-gray-700 p-1 text-center w-fit">
              <span className="text-gray-900 dark:text-white font-medium">
                {groupedApp.totalApplications}
              </span>
            </td>
            <td className="border border-gray-200 dark:border-gray-700 p-1 text-center w-fit">
              <Button
                size="xs"
                variant="secondary"
                onClick={() => setSelected(groupedApp.latestApplication)}
                className="px-2 py-1 text-xs"
              >
                View Application
              </Button>
            </td>
            <td className="border border-gray-200 dark:border-gray-700 p-1 text-center w-fit">
              <Button
                size="xs"
                variant="outline"
                onClick={() => viewProfile(groupedApp.tenant)}
                className="px-2 py-1 text-xs"
              >
                Profile
              </Button>
            </td>
          </>
        )}
      />

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
                All Applications - {selected.tenant?.name}
              </h2>

              <div className="space-y-4">
                {tenantApplications.map((app, index) => (
                  <div key={app._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Application #{index + 1} - {app.property?.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize
                        ${app.status === "approved" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" :
                          app.status === "pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200" :
                          "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"}`}>
                        {app.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong className="text-gray-700 dark:text-gray-300">Property:</strong> {app.property?.title}</p>
                        <p><strong className="text-gray-700 dark:text-gray-300">Location:</strong> {app.property?.location}</p>
                        <p><strong className="text-gray-700 dark:text-gray-300">Move-in Date:</strong> {app.moveInDate ? new Date(app.moveInDate).toLocaleDateString() : "—"}</p>
                      </div>
                      <div>
                        <p><strong className="text-gray-700 dark:text-gray-300">Employment:</strong> {app.employment?.jobTitle} @ {app.employment?.employerName}</p>
                        <p><strong className="text-gray-700 dark:text-gray-300">Income:</strong> ₦{app.employment?.monthlyIncome?.toLocaleString()}</p>
                        <p><strong className="text-gray-700 dark:text-gray-300">Applied:</strong> {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      {app.status === "pending" && (
                        <>
                          <Button
                            variant="primary"
                            onClick={() => updateStatus(app._id, "approved")}
                            className="flex-1"
                          >
                            ✓ Approve
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => updateStatus(app._id, "rejected")}
                            className="flex-1"
                          >
                            ✗ Reject
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openReviewModal(app.tenant)}
                      >
                        Review
                      </Button>
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

