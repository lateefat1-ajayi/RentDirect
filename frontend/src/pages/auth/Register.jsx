import { useState } from "react";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Button from "../../components/ui/Button";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaShieldAlt, FaHandshake, FaHome, FaUsers, FaCheckCircle } from "react-icons/fa";
import HeroImage from "../../assets/HeroImage.jpg";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "", 
    password: "",
    confirmPassword: "",
  });
  const [role, setRole] = useState("tenant");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: "none", color: "text-gray-400", text: "" };
    if (password.length < 6) return { strength: "weak", color: "text-red-500", text: "Too short" };
    if (password.length >= 6) return { strength: "good", color: "text-green-500", text: "Good length" };
    return { strength: "strong", color: "text-green-600", text: "Strong password" };
  };

  const passwordStrength = getPasswordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password validation
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match ");
      return;
    }

    try {
      setLoading(true);

      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const { data } = await axios.post(
        `${apiBase}/auth/register`,
        { ...form, role }
      );

      // Inform user to confirm email
      toast.success("Registration successful! Please check your email to confirm ");

      console.log("Registered user:", data);

      // Optional: redirect to login page instead of auto-login
      navigate("/auth/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed ");
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: <FaUsers className="w-6 h-6" />,
      title: "Join 25,000+ Users",
      description: "Be part of Nigeria's largest rental community"
    },
    {
      icon: <FaShieldAlt className="w-6 h-6" />,
      title: "Secure & Verified",
      description: "All users and properties are verified for safety"
    },
    {
      icon: <FaHandshake className="w-6 h-6" />,
      title: "Direct Communication",
      description: "Connect directly without middlemen or agents"
    },
    {
      icon: <FaCheckCircle className="w-6 h-6" />,
      title: "Easy Management",
      description: "Manage your rentals with our intuitive dashboard"
    }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-teal-500 to-teal-400 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Join RentDirect</h1>
            <p className="text-xl text-white/90">Start your rental journey today</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-white/90 mb-2 flex justify-center">{benefit.icon}</div>
                <h3 className="font-semibold text-sm mb-1">{benefit.title}</h3>
                <p className="text-xs text-white/80">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h2>
            <p className="text-gray-600 dark:text-gray-400">Join thousands of users on RentDirect</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-h-[60vh] overflow-y-auto">
            <div className="text-sm mb-6 text-teal-600 dark:text-teal-400">
              <Link to="/" className="hover:underline">← Back to Home</Link>
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <button
                type="button"
                onClick={() => setRole("tenant")}
                className={`px-6 py-3 rounded-full text-sm font-medium border transition-all ${
                  role === "tenant"
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-gray-200 dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                }`}
              >
                Tenant
              </button>
              <button
                type="button"
                onClick={() => setRole("landlord")}
                className={`px-6 py-3 rounded-full text-sm font-medium border transition-all ${
                  role === "landlord"
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-gray-200 dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                }`}
              >
                Landlord
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Full Name" name="name" value={form.name} onChange={handleChange} required />
              <Input label="Email" name="email" value={form.email} onChange={handleChange} type="email" required />
              <Input label="Phone Number" name="phone" value={form.phone} onChange={handleChange} type="tel" placeholder="+2348012345678" />
              <PasswordInput label="Password" name="password" value={form.password} onChange={handleChange} required />
              {form.password && (
                <div className={`text-sm ${passwordStrength.color}`}>
                  {passwordStrength.text}
                </div>
              )}
              <PasswordInput label="Confirm Password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />

              <Button type="submit" className="w-full" isLoading={loading}>
                {loading ? "Creating Account..." : `Create ${role.charAt(0).toUpperCase() + role.slice(1)} Account`}
              </Button>

              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link to="/auth/login" className="text-teal-600 dark:text-teal-400 font-medium hover:underline">
                  Sign in here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
