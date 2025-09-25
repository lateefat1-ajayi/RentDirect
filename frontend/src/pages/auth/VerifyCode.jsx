import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { toast } from "react-toastify";
import { FaShieldAlt, FaHandshake, FaHome, FaArrowLeft, FaClock } from "react-icons/fa";
import { Link } from "react-router-dom";
import { apiFetch } from "../../lib/api";

export default function VerifyCode() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from location state or localStorage
    const userEmail = location.state?.email || localStorage.getItem("pendingEmail");
    if (!userEmail) {
      navigate("/auth/register");
      return;
    }
    setEmail(userEmail);
    localStorage.setItem("pendingEmail", userEmail);
  }, [location.state, navigate]);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 6) {
      setCode(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      setLoading(true);
      const response = await apiFetch("/auth/verify-code", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });

      // Store user data and token
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.removeItem("pendingEmail");

      toast.success("Email verified successfully! Welcome to RentDirect!");

      // Redirect based on role
      if (response.user.role === "landlord") {
        navigate("/landlord/dashboard");
      } else if (response.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (err) {
      toast.error(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setResendLoading(true);
      await apiFetch("/auth/resend-verification-code", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      
      toast.success("New verification code sent to your email");
      setCountdown(600); // Reset countdown
    } catch (err) {
      toast.error(err.message || "Failed to resend verification code");
    } finally {
      setResendLoading(false);
    }
  };

  const features = [
    {
      icon: <FaShieldAlt className="w-6 h-6" />,
      title: "Secure Verification",
      description: "Your account is protected with industry-standard security measures"
    },
    {
      icon: <FaHandshake className="w-6 h-6" />,
      title: "Quick Setup",
      description: "Get started in minutes with our streamlined verification process"
    },
    {
      icon: <FaHome className="w-6 h-6" />,
      title: "Verified Properties",
      description: "Access to verified and vetted rental properties"
    }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-teal-500 to-teal-400 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Almost There!</h1>
            <p className="text-xl text-white/90">Verify your email to complete registration</p>
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

      {/* Right Side - Verification Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Verify Your Email</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We've sent a 6-digit code to <br />
              <span className="font-semibold text-teal-600 dark:text-teal-400">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg space-y-6">
            <div className="text-xs mb-3 text-teal-600 dark:text-teal-400">
              <button
                type="button"
                onClick={() => navigate("/auth/register")}
                className="flex items-center gap-2 hover:underline"
              >
                <FaArrowLeft className="w-3 h-3" />
                Back to Registration
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter the 6-digit code from your email
                </p>
              </div>

              {/* Countdown Timer */}
              {countdown > 0 && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <FaClock className="w-4 h-4" />
                  <span>Code expires in {formatTime(countdown)}</span>
                </div>
              )}

              {/* Resend Code Button */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendLoading || countdown > 0}
                  className={`text-sm ${
                    countdown > 0
                      ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : "text-teal-600 dark:text-teal-400 hover:underline"
                  }`}
                >
                  {resendLoading ? "Sending..." : "Didn't receive the code? Resend"}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" isLoading={loading}>
              {loading ? "Verifying..." : "Verify Email"}
            </Button>

            <div className="text-sm text-center text-gray-600 dark:text-gray-400">
              <p>
                <Link to="/auth/login" className="text-teal-600 dark:text-teal-400 font-medium hover:underline">
                  Already have an account? Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
