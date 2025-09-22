import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Avatar from "../../components/ui/Avatar";
import { FaCamera, FaHome, FaEnvelope, FaPhone, FaShieldAlt, FaMoon, FaSun, FaPalette, FaKey } from "react-icons/fa";
import { toast } from "react-toastify";
import { useOutletContext } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import useDarkMode from "../../hooks/useDarkMode";

export default function LandlordProfile() {
  const navigate = useNavigate();
  const { profile, setProfile } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: ""
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { isDark, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        businessName: profile.businessName || ""
      });
      setLoading(false);
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    try {
      const updated = await apiFetch("/users/profile", {
        method: "PUT",
        body: JSON.stringify(formData)
      });
      
      setProfile(updated);
      
      // Update localStorage
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedLocalUser = { ...currentUser, ...updated };
      localStorage.setItem("user", JSON.stringify(updatedLocalUser));
      
      toast.success("Profile updated successfully");
      setEditing(false);
    } catch (err) {
      toast.error("Failed to update profile: " + err.message);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    try {
      const data = new FormData();
      data.append("file", file);
      const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";
      const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
      if (!preset || !cloud) {
        toast.error("Cloudinary is not configured");
        return;
      }
      data.append("upload_preset", preset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
        method: "POST",
        body: data,
      });
      const fileData = await res.json();
      if (!res.ok || !fileData.secure_url) {
        toast.error(fileData?.error?.message || "Upload failed");
        return;
      }

      const updated = await apiFetch("/users/profile", {
        method: "PUT",
        body: JSON.stringify({ profileImage: fileData.secure_url })
      });
      
      setProfile(updated);
      
      // Update localStorage
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedLocalUser = { ...currentUser, ...updated };
      localStorage.setItem("user", JSON.stringify(updatedLocalUser));
      
      toast.success("Profile picture updated");
    } catch (err) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      const updated = await apiFetch("/users/profile", {
        method: "PUT",
        body: JSON.stringify({ profileImage: null })
      });
      
      setProfile(updated);
      
      // Update localStorage
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedLocalUser = { ...currentUser, ...updated };
      localStorage.setItem("user", JSON.stringify(updatedLocalUser));
      
      toast.success("Profile picture removed");
    } catch (err) {
      toast.error("Failed to remove profile picture");
    }
  };

  const handleResetPassword = () => {
    // Navigate to forgot password page
    navigate("/forgot-password");
  };

  const getVerificationStatus = () => {
    if (!profile?.verificationStatus) return { text: "Not Verified", color: "bg-red-100 text-red-800" };
    
    switch (profile.verificationStatus) {
      case "approved":
        return { text: "Verified", color: "bg-green-100 text-green-800" };
      case "pending":
        return { text: "Pending Review", color: "bg-yellow-100 text-yellow-800" };
      case "rejected":
        return { text: "Rejected", color: "bg-red-100 text-red-800" };
      default:
        return { text: "Not Verified", color: "bg-gray-100 text-gray-800" };
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const verificationStatus = getVerificationStatus();

  return (
    <div className="p-6 space-y-6">
      {/* Role Indicator */}
      <div className="flex justify-end">
        <div className="flex items-center space-x-2">
          <FaHome className="w-5 h-5 text-teal-600" />
          <span className="text-sm text-teal-600 font-medium">Landlord</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="text-center space-y-4">
              <div className="relative">
                <Avatar
                  src={profile?.profileImage}
                  name={profile?.name}
                  size="w-24 h-24"
                  className="mx-auto"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors"
                  title="Change profile picture"
                >
                  <FaCamera className="w-3 h-3" />
                </button>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {profile?.name}
                </h2>
                <p className="text-gray-500">Landlord</p>
                {profile?.businessName && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {profile.businessName}
                  </p>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <FaEnvelope className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{profile?.email}</span>
                </div>
                {profile?.phone && (
                  <div className="flex items-center justify-center space-x-2">
                    <FaPhone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{profile?.phone}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 space-y-2">
                <Button
                  onClick={() => setEditing(!editing)}
                  variant="secondary"
                  className="w-full"
                >
                  {editing ? "Cancel Edit" : "Edit Profile"}
                </Button>
                {profile?.profileImage && (
                  <Button
                    onClick={handleRemoveProfilePicture}
                    variant="outline"
                    className="w-full"
                  >
                    Remove Picture
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Profile Information
            </h3>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                    type="email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Business Name
                  </label>
                  <Input
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="Enter your business name (optional)"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleUpdateProfile}
                    className="flex-1"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => setEditing(false)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <p className="text-gray-900 dark:text-white">{profile?.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <p className="text-gray-900 dark:text-white">{profile?.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <p className="text-gray-900 dark:text-white">{profile?.phone || "Not provided"}</p>
                </div>

                {profile?.businessName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Business Name
                    </label>
                    <p className="text-gray-900 dark:text-white">{profile.businessName}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Verification Status
                  </label>
                  <span className={`px-2 py-1 text-xs rounded-full ${verificationStatus.color}`}>
                    {verificationStatus.text}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Status
                  </label>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Active
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Member Since
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {(() => {
                      if (!profile?.createdAt) return 'N/A';
                      try {
                        const date = new Date(profile.createdAt);
                        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
                      } catch (error) {
                        console.error('Date formatting error:', error);
                        return 'N/A';
                      }
                    })()}
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Security Settings */}
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FaKey className="w-5 h-5 text-teal-600" />
              Security Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Password</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Update your password to keep your account secure</p>
                </div>
                <Button
                  onClick={handleResetPassword}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FaKey className="w-4 h-4" />
                  Reset Password
                </Button>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}