import { useState, useEffect, useRef } from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Link } from "react-router-dom";
import Avatar from "../../components/ui/Avatar";
import { FaCamera } from "react-icons/fa";
import { toast } from "react-toastify";
import { useOutletContext } from "react-router-dom";
import { apiFetch } from "../../lib/api";

export default function LandlordProfile() {
  const { profile, setProfile } = useOutletContext(); // comes from parent
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    avatar: profile?.profileImage || "",
    company: profile?.company || "", // extra field for landlords
  });
  const [editing, setEditing] = useState(false);
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
        toast.error("Cloudinary not configured");
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
        body: JSON.stringify({
          ...formData,
          profileImage: fileData.secure_url,
        }),
      });
      setProfile(updated);
      setFormData({
        ...updated,
        avatar: updated.profileImage,
      });
      toast.success("Profile picture updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image");
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
          company: formData.company,
          profileImage: formData.avatar,
        }),
      });
      setProfile(updated);
      setFormData({
        ...updated,
        avatar: updated.profileImage,
      });
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      avatar: profile?.profileImage || "",
      company: profile?.company || "",
    });
    setEditing(false);
  };

  const handleRemoveProfilePicture = async () => {
    try {
      const updated = await apiFetch("/users/profile", {
        method: "PUT",
        body: JSON.stringify({
          profileImage: null, // Set to null to remove
        }),
      });
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

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        avatar: profile.profileImage || "",
        company: profile.company || "",
      });
    }
  }, [profile]);

  return (
    <div className="p-6 space-y-6 max-w-md">
      <h1 className="text-xl font-bold">Landlord Profile</h1>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <button
            type="button"
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
            className="hidden"
            disabled={uploading}
          />
        </div>
        {uploading && <p className="text-xs text-gray-500">Uploading...</p>}
        
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

      {/* Details */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4">
        {editing ? (
          <>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Email</label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Phone</label>
              <Input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Company</label>
              <Input
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            
            {/* Edit Mode Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleSave}
                className="flex-1"
              >
                Save Changes
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Name</div>
              <div className="font-medium">{formData.name || "-"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Email</div>
              <div className="font-medium">{formData.email || "-"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Phone</div>
              <div className="font-medium">{formData.phone || "-"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Company</div>
              <div className="font-medium">{formData.company || "-"}</div>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3">
        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => setEditing(true)}
        >
          Edit Profile
        </Button>
        <Link to="/landlord/settings">
          <Button variant="outline" size="sm">Edit Settings</Button>
        </Link>
      </div>
    </div>
  );
}
