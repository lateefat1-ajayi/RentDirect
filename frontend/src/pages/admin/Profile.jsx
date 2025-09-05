import { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Avatar from "../../components/ui/Avatar";
import { apiFetch } from "../../lib/api";
import { toast } from "react-toastify";
import { FaUser, FaEnvelope, FaPhone, FaShieldAlt, FaMoon, FaSun, FaPalette } from "react-icons/fa";
import useDarkMode from "../../hooks/useDarkMode";

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const { isDark, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    // Clear any old profile data when component mounts
    setProfile(null);
    setFormData({
      name: "",
      email: "",
      phone: ""
    });
    
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      // Debug: Check current user data in localStorage
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      console.log("Current user in localStorage:", currentUser);
      console.log("Current token:", token.substring(0, 20) + "...");

      // Clear any old profile data first
      setProfile(null);
      setFormData({
        name: "",
        email: "",
        phone: ""
      });

      // Fetch admin profile from backend using admin-specific endpoint
      const userData = await apiFetch("/admin/profile");
      console.log("Fetched admin profile:", userData);
      
      setProfile(userData);
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || ""
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (error.message.includes("Access denied. Admins only")) {
        toast.error("Authentication error. Please log out and log back in as admin.");
        // Clear invalid data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Redirect to login
        window.location.href = "/login";
      } else {
        toast.error("Failed to load profile");
      }
      
      // Don't fallback to localStorage - this could be old tenant data
      setProfile(null);
      setFormData({
        name: "",
        email: "",
        phone: ""
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      console.log("Attempting to update profile with data:", formData);
      
      // Update profile on backend using admin-specific endpoint
      const updatedUser = await apiFetch("/admin/profile", {
        method: "PUT",
        body: JSON.stringify(formData)
      });
      
      console.log("Profile update response:", updatedUser);
      
      // Update localStorage with new data
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedLocalUser = { ...currentUser, ...updatedUser };
      localStorage.setItem("user", JSON.stringify(updatedLocalUser));
      
      toast.success("Profile updated successfully");
      setEditing(false);
      setProfile(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.message.includes("Access denied. Admins only")) {
        toast.error("Authentication error. Please log out and log back in as admin.");
        // Clear invalid data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Redirect to login
        window.location.href = "/login";
      } else {
        toast.error("Failed to update profile");
      }
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Profile</h1>
        <div className="flex items-center space-x-2">
          <FaShieldAlt className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-blue-600 font-medium">Administrator</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="p-6">
                         <div className="text-center space-y-4">
               <div className="w-24 h-24 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                 <FaShieldAlt className="w-12 h-12 text-blue-600 dark:text-blue-400" />
               </div>
               <div>
                 <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                   {profile?.name}
                 </h2>
                 <p className="text-gray-500">Administrator</p>
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

              <div className="pt-4">
                <Button
                  onClick={() => setEditing(!editing)}
                  variant="secondary"
                  className="w-full"
                >
                  {editing ? "Cancel Edit" : "Edit Profile"}
                </Button>
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
                    {new Date(profile?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Theme Settings */}
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FaPalette className="w-5 h-5 text-purple-600" />
              Theme Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  {isDark ? (
                    <FaMoon className="w-5 h-5 text-blue-600" />
                  ) : (
                    <FaSun className="w-5 h-5 text-yellow-600" />
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Dark Mode</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isDark ? "Currently using dark theme" : "Currently using light theme"}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={toggleDarkMode}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  {isDark ? (
                    <>
                      <FaSun className="w-4 h-4" />
                      Switch to Light
                    </>
                  ) : (
                    <>
                      <FaMoon className="w-4 h-4" />
                      Switch to Dark
                    </>
                  )}
                </Button>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>• Theme preference is saved automatically</p>
                <p>• Changes apply immediately across the admin panel</p>
                <p>• Your preference will be remembered for future sessions</p>
              </div>
            </div>
          </Card>

          {/* Admin Statistics */}
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Admin Activity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {profile?.adminStats?.verificationsCompleted || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Verifications Completed
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {profile?.adminStats?.propertiesApproved || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Properties Approved
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {profile?.adminStats?.usersManaged || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Users Managed
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
