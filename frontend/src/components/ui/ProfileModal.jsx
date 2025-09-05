import { useState, useEffect } from "react";
import Modal from "./Modal";
import Avatar from "./Avatar";
import Button from "./Button";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaShieldAlt, FaTimes, FaStar, FaHome, FaFileContract } from "react-icons/fa";
import { apiFetch } from "../../lib/api";
import ReviewModal from "./ReviewModal";

export default function ProfileModal({ isOpen, onClose, userId, userRole = "user", currentUserRole = "user", currentUserId = null }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Get current user role from props or localStorage as fallback
  const actualCurrentUserRole = currentUserRole || localStorage.getItem('userRole') || 'user';
  const actualCurrentUserId = currentUserId || localStorage.getItem('userId');

  // Calculate isOwnProfile based on the userId prop passed to the modal
  const isOwnProfile = actualCurrentUserId === userId;

  useEffect(() => {
    if (isOpen && userId) {
      fetchProfile();
    }
  }, [isOpen, userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user profile
      const userData = await apiFetch(`/users/${userId}`);
      
      // Fetch additional data based on user role
      let additionalData = {};
      
      if (userData.role === "landlord") {
        // Fetch landlord properties
        const properties = await apiFetch(`/property/landlord/${userId}`).catch(() => []);
        additionalData.properties = properties;
        
        // Fetch landlord verification status if available
        if (userData.verificationStatus) {
          additionalData.verificationStatus = userData.verificationStatus;
        }
      } else if (userData.role === "tenant") {
        // Fetch tenant applications
        const applications = await apiFetch(`/applications/tenant/${userId}`).catch(() => []);
        additionalData.applications = applications;
      }
      
      setProfile({ ...userData, ...additionalData });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to fetch profile information");
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <FaShieldAlt className="text-red-600" />;
      case "landlord":
        return <FaHome className="text-blue-600" />;
      case "tenant":
        return <FaUser className="text-green-600" />;
      default:
        return <FaUser className="text-gray-600" />;
    }
  };

  const getRoleBadge = (role) => {
    const roleNames = {
      admin: "Administrator",
      landlord: "Property Owner",
      tenant: "Property Seeker"
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        role === "admin" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :
        role === "landlord" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      }`}>
        {getRoleIcon(role)}
        <span className="ml-1">{roleNames[role] || role}</span>
      </span>
    );
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

  // Determine if we should show action buttons
  const shouldShowActions = () => {
    console.log("ProfileModal - shouldShowActions check:", {
      actualCurrentUserRole,
      profileRole: profile?.role,
      isOwnProfile,
      actualCurrentUserId,
      profileId: profile?._id,
      userId: userId
    });
    
    // Don't show actions for admin viewing profiles
    if (actualCurrentUserRole === 'admin') return false;
    
    // Show actions if:
    // 1. Viewing own profile, OR
    // 2. Landlord viewing tenant profile (for messaging and reviewing), OR
    // 3. Tenant viewing landlord profile (for messaging and reviewing)
    const shouldShow = isOwnProfile || 
           (actualCurrentUserRole === 'landlord' && profile?.role === 'tenant') ||
           (actualCurrentUserRole === 'tenant' && profile?.role === 'landlord');
    
    console.log("ProfileModal - shouldShowActions result:", shouldShow);
    return shouldShow;
  };

  // Determine if we should show view listings button
  const shouldShowViewListings = () => {
    // Only show if viewing own landlord profile
    return isOwnProfile && profile?.role === 'landlord' && profile?.properties?.length > 0;
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-4 max-h-[70vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            User Profile
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </Button>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <div className="text-red-500 text-lg mb-2">⚠️</div>
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            <Button onClick={fetchProfile} size="sm" className="mt-3">
              Try Again
            </Button>
          </div>
        ) : profile ? (
          <div className="space-y-4">
            {/* Profile Header */}
            <div className="flex items-center space-x-3 mb-3">
              <Avatar
                name={profile.name}
                src={profile.role === "admin" ? null : profile.profileImage}
                size="w-14 h-14"
                className="text-base"
              />
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  {profile.name}
                </h3>
                <div className="flex items-center gap-2 mb-1">
                  {getRoleBadge(profile.role)}
                  {profile.verificationStatus === "approved" && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <FaShieldAlt className="mr-1 w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Member since {formatDate(profile.createdAt)}
                </p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-gray-500 w-3 h-3" />
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>Email:</strong> {profile.email}
                </span>
              </div>
              
              {profile.phone && (
                <div className="flex items-center gap-2">
                  <FaPhone className="text-gray-500 w-3 h-3" />
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    <strong>Phone:</strong> {profile.phone}
                  </span>
                </div>
              )}
              
              {profile.address && (
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-gray-500 w-3 h-3" />
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    <strong>Address:</strong> {profile.address}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-500 w-3 h-3" />
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>Joined:</strong> {formatDate(profile.createdAt)}
                </span>
              </div>
            </div>

            {/* Role-Specific Information */}
            {profile.role === "landlord" && (
              <div className="border-t pt-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <FaHome className="w-3 h-3" />
                  Property Information
                </h4>
                
                {profile.verificationStatus && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <strong>Verification Status:</strong> {profile.verificationStatus}
                    </p>
                  </div>
                )}
                
                {profile.properties && profile.properties.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>Properties Listed:</strong> {profile.properties.length}
                    </p>
                    <div className="grid gap-2">
                      {profile.properties.slice(0, 2).map((property) => (
                        <div key={property._id} className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {property.title}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            ₦{property.price?.toLocaleString()} • {property.location}
                          </p>
                        </div>
                      ))}
                      {profile.properties.length > 2 && (
                        <p className="text-xs text-gray-500">
                          +{profile.properties.length - 2} more properties
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    No properties listed yet
                  </p>
                )}
              </div>
            )}

            {profile.role === "tenant" && (
              <div className="border-t pt-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <FaFileContract className="w-3 h-3" />
                  Application History
                </h4>
                
                {profile.applications && profile.applications.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>Applications Submitted:</strong> {profile.applications.length}
                    </p>
                    <div className="grid gap-2">
                      {profile.applications.slice(0, 2).map((app) => (
                        <div key={app._id} className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {app.property?.title || "Property"}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            Status: {app.status} • {formatDate(app.createdAt)}
                          </p>
                        </div>
                      ))}
                      {profile.applications.length > 2 && (
                        <p className="text-xs text-gray-500">
                          +{profile.applications.length - 2} more applications
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    No applications submitted yet
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons - Only show when appropriate */}
            {shouldShowActions() && (
              <div className="flex gap-2 pt-3 border-t">
                {/* View Listings Button - Only for own landlord profile */}
                {shouldShowViewListings() && (
                  <Button
                    onClick={() => {
                      // Navigate to browse properties with landlord filter
                      window.open(`/user/properties?landlord=${profile._id}`, "_blank");
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    View My Listings
                  </Button>
                )}

                {/* Send Message Button */}
                <Button
                  onClick={() => {
                    // Open messaging with this user - use role-based routing
                    const baseRoute = currentUserRole === 'landlord' ? '/landlord' : '/user';
                    window.open(`${baseRoute}/messages?user=${profile._id}`, "_blank");
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  Send Message
                </Button>

                {/* Leave Review Button - Only if not own profile */}
                {!isOwnProfile && (
                  <Button
                    onClick={() => setShowReviewModal(true)}
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    Leave Review
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400 text-sm">No profile information available</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        targetUser={profile}
        type={profile?.role === "landlord" ? "landlord" : "tenant"}
        onSubmit={() => {
          setShowReviewModal(false);
        }}
      />
    </Modal>
  );
}
