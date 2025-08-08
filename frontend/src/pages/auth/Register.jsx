import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Button from "../../components/ui/Button";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [role, setRole] = useState("tenant");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match ❌");
      return;
    }
    toast.success(`Registered as ${role} ✅`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
        <div className="text-sm mb-4 text-primary dark:text-yellow-400">
          <Link to="/">← Back to Home</Link>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">
          Create an Account
        </h2>
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setRole("tenant")}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${role === "tenant" ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-700 dark:text-gray-200"}`}
          >
            Tenant
          </button>
          <button
            onClick={() => setRole("landlord")}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${role === "landlord" ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-700 dark:text-gray-200"}`}
          >
            Landlord
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            required
          />
          <PasswordInput
            label="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          <Button type="submit" className="w-full">
            Register as {role.charAt(0).toUpperCase() + role.slice(1)}
          </Button>
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            Already have an account? <Link to="/auth/login" className="text-primary dark:text-yellow-400 font-medium">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
