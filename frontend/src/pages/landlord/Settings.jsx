import { useEffect, useState } from "react";
import { Switch } from "@headlessui/react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useOutletContext, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useDarkMode from "../../hooks/useDarkMode";
import { apiFetch } from "../../lib/api";
import { FaMoon, FaSun, FaPalette } from "react-icons/fa";

export default function LandlordSettings() {
  const { profile, setProfile } = useOutletContext();
  const { isDark, setIsDark } = useDarkMode();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [form, setForm] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    businessName: profile?.businessName || "",
    bankName: profile?.bankName || "",
    accountNumber: profile?.accountNumber || "",
  });

  useEffect(() => {
    if (profile) {
      setForm((f) => ({
        ...f,
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        businessName: profile.businessName || "",
        bankName: profile.bankName || "",
        accountNumber: profile.accountNumber || "",
      }));
    }
  }, [profile]);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        businessName: form.businessName,
        bankName: form.bankName,
        accountNumber: form.accountNumber,
      };

      const updated = await apiFetch("/users/profile", {
        method: "PUT",
        body: JSON.stringify(body),
      });
      setProfile(updated);
      toast.success("Settings updated");
    } catch (err) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setProfile(null);
    toast.info("Logged out");
    navigate("/auth/login", { replace: true });
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold">Landlord Settings</h1>

      {/* Account */}
      <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <h2 className="font-semibold">Account</h2>
        <Input
          label="Full Name"
          name="name"
          value={form.name}
          onChange={onChange}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
        />
        <Input
          label="Phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={onChange}
        />
      </div>

      {/* Business */}
      <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <h2 className="font-semibold">Business Information</h2>
        <Input
          label="Business Name"
          name="businessName"
          value={form.businessName}
          onChange={onChange}
        />
        <Input
          label="Bank Name"
          name="bankName"
          value={form.bankName}
          onChange={onChange}
        />
        <Input
          label="Account Number"
          name="accountNumber"
          value={form.accountNumber}
          onChange={onChange}
        />
      </div>

      {/* Password Management */}
      <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg border">
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
        <span>Notifications</span>
        <Switch
          checked={notificationsEnabled}
          onChange={setNotificationsEnabled}
          className={`${
            notificationsEnabled ? "bg-primary" : "bg-gray-300"
          } relative inline-flex h-6 w-11 items-center rounded-full`}
        >
          <span
            className={`${
              notificationsEnabled ? "translate-x-6" : "translate-x-1"
            } inline-block h-4 w-4 bg-white rounded-full`}
          />
        </Switch>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleSave} isLoading={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
        <Button variant="danger" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </div>
  );
}
