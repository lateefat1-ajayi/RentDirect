import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { apiFetch } from "../../lib/api";
import { toast } from "react-toastify";

export default function PaymentSuccess() {
  const { leaseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [lease, setLease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const reference = searchParams.get("reference");
  const trxref = searchParams.get("trxref");

  useEffect(() => {
    if (reference && trxref) {
      verifyPayment();
    } else {
      loadLease();
    }
  }, [reference, trxref]);

  const verifyPayment = async () => {
    setVerifying(true);
    try {
      const response = await apiFetch(`/payments/verify/${reference}`);
      
      if (response.payment && response.payment.status === "success") {
        toast.success("Payment verified successfully!");
        loadLease();
      } else {
        toast.error("Payment verification failed");
        navigate(`/user/payments/${leaseId}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Payment verification failed");
      navigate(`/user/payments/${leaseId}`);
    } finally {
      setVerifying(false);
    }
  };

  const loadLease = async () => {
    try {
      const data = await apiFetch(`/leases/${leaseId}`);
      setLease(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load lease information");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Verifying your payment...</p>
      </div>
    );
  }

  if (loading) {
    return <p className="p-6 text-gray-500">Loading...</p>;
  }

  if (!lease) {
    return <p className="p-6 text-gray-500">Lease not found.</p>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Success Header */}
      <div className="text-center">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
        <p className="text-gray-600">Your rent payment has been processed successfully.</p>
      </div>

      {/* Payment Details */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Property:</span>
            <span className="font-medium">{lease.property.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Location:</span>
            <span className="font-medium">{lease.property.location}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount Paid:</span>
            <span className="font-medium text-lg text-green-600">₦{lease.rentAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Date:</span>
            <span className="font-medium">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="font-medium text-green-600">✅ Confirmed</span>
          </div>
        </div>
      </Card>

      {/* Next Steps */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">What's Next?</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm font-bold">1</span>
            </div>
            <div>
              <p className="font-medium">Payment Confirmation</p>
              <p className="text-sm text-gray-600">You'll receive a confirmation email shortly</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm font-bold">2</span>
            </div>
            <div>
              <p className="font-medium">Landlord Notification</p>
              <p className="text-sm text-gray-600">Your landlord will be notified of the payment</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm font-bold">3</span>
            </div>
            <div>
              <p className="font-medium">Move-in Process</p>
              <p className="text-sm text-gray-600">Contact your landlord to arrange move-in details</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => navigate(`/user/payments/${leaseId}`)}
          className="flex-1"
          size="lg"
        >
          View Payment History
        </Button>
        <Button
          onClick={() => navigate("/user/dashboard")}
          variant="secondary"
          size="lg"
        >
          Go to Dashboard
        </Button>
      </div>

      {/* Support Info */}
      <div className="text-center text-sm text-gray-500">
        <p>Need help? Contact our support team</p>
        <p>📧 support@rentdirect.com | 📞 +234 123 456 7890</p>
      </div>
    </div>
  );
}
