import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../components/ui/Button";

export default function ConfirmEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const confirm = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || "https://rentdirect-uxsb.onrender.com";
        const res = await fetch(`${apiBase}/auth/confirm-email/${token}`);
        const data = await res.json();
        if (res.ok) {
          toast.success(data.message || "Email confirmed!");
          navigate("/auth/login"); // redirect to login
        } else {
          toast.error(data.message || "Invalid or expired token");
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (token) confirm();
  }, [token, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <div className="text-sm mb-4 text-primary dark:text-yellow-400 text-left">
          <Link to="/">← Back to Home</Link>
        </div>
        {loading ? (
          <p className="text-gray-700 dark:text-gray-200">Confirming your email...</p>
        ) : (
          <>
            <p className="text-gray-700 dark:text-gray-200">Email confirmation complete!</p>
            <Button onClick={() => navigate("/auth/login")} className="mt-4">
              Go to Login
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
