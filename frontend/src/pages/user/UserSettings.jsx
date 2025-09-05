import { useEffect, useState } from "react";
import { Switch } from "@headlessui/react";
import Button from "../../components/ui/Button";
import { toast } from "react-toastify";
import useDarkMode from "../../hooks/useDarkMode";
import { useOutletContext, useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import { apiFetch } from "../../lib/api";
import { FaMoon, FaSun, FaPalette } from "react-icons/fa";

export default function UserSettings() {
  const { profile, setProfile, refreshProfile } = useOutletContext();
  const { isDark, setIsDark } = useDarkMode();
  const navigate = useNavigate();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    email: profile?.email || "",
    phone: profile?.phone || "",
    name: profile?.name || "",
  });

  useEffect(() => {
    if (profile) {
      setForm((f) => ({
        ...f,
        email: profile.email || "",
        phone: profile.phone || "",
        name: profile.name || "",
      }));
    }
  }, [profile]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        name: form.name,
        email: form.email,
        phone: form.phone,
      };

      const updated = await apiFetch("/users/profile", {
        method: "PUT",
        body: JSON.stringify(body),
      });
      setProfile(updated);
      // Also refresh the profile to ensure consistency across all components
      if (refreshProfile) {
        refreshProfile();
      }
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setProfile(null);
    } finally {
      toast.info("Logged out");
      navigate("/auth/login", { replace: true });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold">Settings</h1>

      {/* Account Information */}
      <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
        <h2 className="font-semibold">Account</h2>
        <Input label="Full Name" name="name" value={form.name} onChange={onChange} />
        <Input label="Email" name="email" type="email" value={form.email} onChange={onChange} />
        <Input label="Phone" name="phone" type="tel" value={form.phone} onChange={onChange} />
      </div>

      {/* Password Change */}
      <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
        <h2 className="font-semibold">Password Management</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Need to change your password? Use the forgot password feature to reset it securely.
        </p>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => navigate("/auth/forgot-password")}
          className="w-full sm:w-auto"
        >
          Forgot Password
        </Button>
      </div>

      {/* Theme Settings */}
      <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
        <h2 className="font-semibold flex items-center gap-2">
          <FaPalette className="w-5 h-5 text-purple-600" />
          Theme Settings
        </h2>
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
              onClick={() => setIsDark(!isDark)}
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
            <p>• Changes apply immediately across the interface</p>
            <p>• Your preference will be remembered for future sessions</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span>Email / Push Notifications</span>
        <Switch
          checked={notificationsEnabled}
          onChange={setNotificationsEnabled}
          className={`${
            notificationsEnabled ? "bg-primary" : "bg-gray-300"
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
        >
          <span
            className={`${
              notificationsEnabled ? "translate-x-6" : "translate-x-1"
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </Switch>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="primary" size="sm" onClick={handleSave} isLoading={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
        <Button variant="danger" size="sm" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </div>
  );
}
