import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Button from "../../components/ui/Button";
import { toast } from "react-toastify";
import { FaShieldAlt, FaHandshake, FaHome, FaUsers, FaExclamationTriangle } from "react-icons/fa";
import HeroImage from "../../assets/HeroImage.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for suspension messages only
  useEffect(() => {
    const message = searchParams.get("message");
    if (message === "suspended") {
      toast.error("Your account has been suspended. Please contact support for assistance.", {
        duration: 10000,
        position: "top-center"
      });
    }
    // Removed expired token toast since login is working correctly
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const { data } = await axios.post(`${apiBase}/auth/login`, { email, password });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      toast.success("Login successful ✅");

      if (data.role === "landlord") navigate("/landlord/dashboard");
      else if (data.role === "admin") navigate("/admin/dashboard");
      else navigate("/user/dashboard");

    } catch (err) {
      if (err.response?.status === 403) {
        // Check if it's a suspended account
        if (err.response.data.code === "ACCOUNT_SUSPENDED") {
          toast.error("Your account has been suspended. Please contact support for assistance.", {
            duration: 10000,
            position: "top-center"
          });
        } else {
          // Email not confirmed - show clear message without auto-resending
          toast.warning(err.response.data.message || "Please confirm your email first", {
            duration: 8000,
            position: "top-center"
          });
          
          // Show a button to resend confirmation instead of auto-sending
          setTimeout(() => {
            toast.info(
              <div className="flex items-center gap-2">
                <span>Need a new confirmation email?</span>
                <button
                  onClick={async () => {
                    try {
                      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
                      await axios.post(`${apiBase}/auth/resend-confirmation`, { email });
                      toast.success("Confirmation email sent!");
                    } catch (error) {
                      toast.error("Failed to send confirmation email");
                    }
                  }}
                  className="px-3 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700"
                >
                  Resend Email
                </button>
              </div>,
              {
                duration: 10000,
                position: "top-center"
              }
            );
          }, 2000);
        }
      } else if (err.response?.status === 401) {
        toast.error("Invalid email or password");
      } else {
        toast.error(err.response?.data?.message || "Login failed ❌");
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <FaShieldAlt className="w-6 h-6" />,
      title: "Secure Platform",
      description: "Your data and transactions are protected with industry-standard security"
    },
    {
      icon: <FaHandshake className="w-6 h-6" />,
      title: "Direct Connection",
      description: "Connect directly with landlords and tenants without middlemen"
    },
    {
      icon: <FaHome className="w-6 h-6" />,
      title: "Verified Properties",
      description: "All properties are verified and vetted for your peace of mind"
    }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-teal-500 to-teal-400 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
            <p className="text-xl text-white/90">Continue your journey with RentDirect</p>
          </div>
          
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-white/90">{feature.icon}</div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-white/80">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sign In</h2>
            <p className="text-gray-600 dark:text-gray-400">Welcome back! Please sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg space-y-6">
            <Input 
              label="Email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <PasswordInput 
              label="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />

            <Button type="submit" className="w-full" isLoading={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            {/* Links */}
            <div className="text-sm text-center text-gray-600 dark:text-gray-400 space-y-3">
              <p>
                Don't have an account?{" "}
                <Link to="/auth/register" className="text-teal-600 dark:text-teal-400 font-medium hover:underline">
                  Create one here
                </Link>
              </p>
              <p>
                <Link to="/forgot-password" className="text-teal-600 dark:text-teal-400 font-medium hover:underline">
                  Forgot your password?
                </Link>
              </p>
              <p>
                <Link to="/" className="text-gray-500 dark:text-gray-400 text-xs hover:underline">
                  ← Back to Home
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
