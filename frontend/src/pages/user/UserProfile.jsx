import { useState, useEffect, useRef } from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Link } from "react-router-dom";
import Avatar from "../../components/ui/Avatar";
import { FaCamera } from "react-icons/fa";
import { toast } from "react-toastify";
import { useOutletContext } from "react-router-dom";
import { apiFetch } from "../../lib/api";

export default function UserProfile() {
  const { profile, setProfile } = useOutletContext(); // profile from context or parent
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    avatar: profile?.profileImage || "",
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
        toast.error("Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET, then restart.");
        return;
      }
      data.append("upload_preset", preset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
        method: "POST",
        body: data,
      });
      const fileData = await res.json();
      if (!res.ok || !fileData.secure_url) {
        const msg = fileData?.error?.message || "Upload failed";
        toast.error(msg);
        return;
      }
      // Optimistically update local state
      setFormData((prev) => ({ ...prev, avatar: fileData.secure_url }));

      // Persist to backend and update shared profile so navbar reflects immediately
      try {
        const updated = await apiFetch("/users/profile", {
          method: "PUT",
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            profileImage: fileData.secure_url,
          }),
        });
        
        // Update localStorage with the new profile data
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedLocalUser = { ...currentUser, ...updated };
        localStorage.setItem("user", JSON.stringify(updatedLocalUser));
        
        setProfile(updated);
        setFormData({
          name: updated.name || "",
          email: updated.email || "",
          phone: updated.phone || "",
          avatar: updated.profileImage || null,
        });
        toast.success("Profile picture updated!");
      } catch (saveErr) {
        console.error(saveErr);
        toast.error("Uploaded, but failed to save profile. Try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const updated = await apiFetch("/users/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          profileImage: formData.avatar,
        }),
      });
      
      // Update localStorage with the new profile data
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedLocalUser = { ...currentUser, ...updated };
      localStorage.setItem("user", JSON.stringify(updatedLocalUser));
      
      setProfile(updated);
      setFormData({
        name: updated.name || "",
        email: updated.email || "",
        phone: updated.phone || "",
        avatar: updated.profileImage || null,
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      const updated = await apiFetch("/users/profile", {
        method: "PUT",
        body: JSON.stringify({
          profileImage: null, // Set to null to remove
        }),
      });
      
      // Update localStorage with the new profile data
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedLocalUser = { ...currentUser, ...updated };
      localStorage.setItem("user", JSON.stringify(updatedLocalUser));
      
      setProfile(updated);
      setFormData(prev => ({
        ...prev,
        avatar: null,
      }));
      toast.success("Profile picture removed successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to remove profile picture");
    }
  };

  // Keep form in sync if parent profile changes (e.g., after refresh)
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        avatar: profile.profileImage || null,
      });
    }
  }, [profile]);

  return (
    <div className="p-6 space-y-6 max-w-md">
      <h1 className="text-xl font-bold">Your Profile</h1>

      {/* Avatar upload */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <button
            type="button"
            aria-label="Change profile picture"
            className="group relative"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Avatar name={formData.name} src={formData.avatar} size="w-24 h-24" />
            <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-2 shadow group-hover:scale-105 transition">
              <FaCamera size={14} />
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </div>
        {uploading && <div className="text-xs text-gray-500">Uploading...</div>}
        
        {/* Remove Profile Picture Button */}
        {formData.avatar && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRemoveProfilePicture}
            className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
          >
            Remove Picture
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-2">
        <div className="text-sm text-gray-600 dark:text-gray-400">Name</div>
        <div className="font-medium">{formData.name || "-"}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Email</div>
        <div className="font-medium">{formData.email || "-"}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Phone</div>
        <div className="font-medium">{formData.phone || "-"}</div>
      </div>

      <div className="flex gap-3">
        <Link to="/user/settings">
          <Button variant="outline" size="sm">Edit Profile</Button>
        </Link>
      </div>
    </div>
  );
}
