import { useState } from "react";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Button from "../../components/ui/Button";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Login successful ✅");
    // redirect user
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
        <div className="text-sm mb-4 text-primary dark:text-yellow-400">
          <Link to="/">← Back to Home</Link>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">
          Login to Your Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button type="submit" className="w-full">
            Login
          </Button>
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            Don’t have an account? <Link to="/auth/register" className="text-primary dark:text-yellow-400 font-medium">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
