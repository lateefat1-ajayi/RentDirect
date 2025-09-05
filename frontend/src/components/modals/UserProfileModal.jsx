import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Avatar from "../ui/Avatar";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaPhone, FaCalendar, FaHome, FaStar, FaComment, FaEye } from "react-icons/fa";

export default function UserProfileModal({ isOpen, onClose, user, currentUser }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Debug logging
  console.log("UserProfileModal props:", { isOpen, user, currentUser });

  if (!user) {
    console.log("UserProfileModal: No user provided");
    return null;
  }

  const handleMessage = () => {
    // Navigate to messages with this user
    navigate(`/${currentUser.role === 'admin' ? 'admin' : currentUser.role}/messages?user=${user._id}`);
    onClose();
  };

  const handleViewListings = () => {
    // Navigate to user's listings
    navigate(`/user/properties?landlord=${user._id}`);
    onClose();
  };

  const handleLeaveReview = () => {
    // Navigate to review form
    navigate(`/${currentUser.role}/reviews/new?for=${user._id}`);
    onClose();
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Admin</span>;
      case "landlord":
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Landlord</span>;
      case "tenant":
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Tenant</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Unknown</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>;
      case "suspended":
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Suspended</span>;
      case "pending":
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Unknown</span>;
    }
  };

  // Determine what actions are allowed
  const canMessage = currentUser && currentUser._id !== user._id && currentUser.role !== "admin";
  const canReview = currentUser && currentUser._id !== user._id && user.role !== "admin" && currentUser.role !== "admin";
  const canViewListings = user.role === "landlord" && currentUser.role !== "admin";
  const isOwnProfile = currentUser && currentUser._id === user._id;
  const isAdminViewingOwnProfile = currentUser?.role === "admin" && isOwnProfile;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Avatar
            name={user.name}
            src={user.role === "admin" ? null : user.profileImage} // Don't show profile image for admins
            size="w-12 h-12"
            className="rounded-full"
          />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {user.name}
            </h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="flex space-x-2 mt-1">
              {getRoleBadge(user.role)}
              {getStatusBadge(user.status)}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Contact Information</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <FaEnvelope className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-700 dark:text-gray-300">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center space-x-2">
                <FaPhone className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-700 dark:text-gray-300">{user.phone}</span>
              </div>
            )}
            {user.role === "landlord" && user.businessName && (
              <div className="flex items-center space-x-2">
                <FaHome className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-700 dark:text-gray-300">{user.businessName}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <FaCalendar className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-700 dark:text-gray-300">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Activity Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            {user.role === "landlord" && (
              <div className="flex items-center space-x-2">
                <FaHome className="w-3 h-3 text-blue-500" />
                <div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
                    {user.properties?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500">Properties</p>
                </div>
              </div>
            )}
            {user.role === "tenant" && (
              <div className="flex items-center space-x-2">
                <FaEye className="w-3 h-3 text-green-500" />
                <div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
                    {user.applications?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500">Applications</p>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <FaStar className="w-3 h-3 text-yellow-500" />
              <div>
                <p className="text-xs font-medium text-gray-900 dark:text-white">
                  {user.reviews?.length || 0}
                </p>
                <p className="text-xs text-gray-500">Given</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FaStar className="w-3 h-3 text-purple-500" />
              <div>
                <p className="text-xs font-medium text-gray-900 dark:text-white">
                  {user.receivedReviews?.length || 0}
                </p>
                <p className="text-xs text-gray-500">Received</p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Status (for landlords) */}
        {user.role === "landlord" && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Verification Status</h3>
            <div className="flex items-center space-x-2 mb-2">
              {user.verificationStatus === "approved" ? (
                <span className="px-3 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full font-medium">
                  ✓ Verified Landlord
                </span>
              ) : user.verificationStatus === "pending" ? (
                <span className="px-3 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full font-medium">
                  ⏳ Verification Pending
                </span>
              ) : user.verificationStatus === "rejected" ? (
                <span className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full font-medium">
                  ✗ Verification Rejected
                </span>
              ) : (
                <span className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full font-medium">
                  ⚠️ Not Verified
                </span>
              )}
            </div>
            {user.verificationStatus === "approved" && (
              <p className="text-xs text-green-700 dark:text-green-300">
                This landlord has been verified and can list properties
              </p>
            )}
            {user.verificationStatus === "pending" && (
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Verification is being reviewed by our team
              </p>
            )}
            {user.verificationStatus === "rejected" && (
              <p className="text-xs text-red-700 dark:text-red-300">
                Verification was rejected. Contact support for details
              </p>
            )}
            {!user.verificationStatus && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                This landlord has not completed verification yet
              </p>
            )}
            {user.verificationNote && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">
                Note: {user.verificationNote}
              </p>
            )}
          </div>
        )}

        {/* Recent Reviews (if any) - Limited to 2 for space */}
        {user.receivedReviews && user.receivedReviews.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Recent Reviews</h3>
            <div className="space-y-2">
              {user.receivedReviews.slice(0, 2).map((review, index) => (
                <div key={index} className="border-l-2 border-primary pl-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`w-2 h-2 ${
                            i < review.rating ? "text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      by {review.reviewer?.name || "Anonymous"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">{review.comment}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-3 border-t">
          {canMessage && (
            <Button
              onClick={handleMessage}
              size="sm"
              className="flex items-center gap-1 text-xs"
            >
              <FaComment className="w-3 h-3" />
              Message
            </Button>
          )}

          {canViewListings && (
            <Button
              variant="secondary"
              onClick={handleViewListings}
              size="sm"
              className="flex items-center gap-1 text-xs"
            >
              <FaHome className="w-3 h-3" />
              Listings
            </Button>
          )}

          {canReview && (
            <Button
              variant="secondary"
              onClick={handleLeaveReview}
              size="sm"
              className="flex items-center gap-1 text-xs"
            >
              <FaStar className="w-3 h-3" />
              Review
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={onClose}
            size="sm"
            className="ml-auto text-xs"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
