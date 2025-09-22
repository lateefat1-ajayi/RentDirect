import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import PaymentModal from "../../components/modals/PaymentModal";
import { apiFetch } from "../../lib/api";
import { toast } from "react-toastify";

export default function PaymentForm() {
  const { leaseId } = useParams();
  const navigate = useNavigate();
  const [lease, setLease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch(`/leases/${leaseId}`);
        setLease(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load lease information");
      } finally {
        setLoading(false);
      }
    })();

    // Check current payment status
    checkPaymentStatus();
  }, [leaseId]);

  const checkPaymentStatus = async () => {
    try {
      const response = await apiFetch(`/payments/lease/${leaseId}`);
      console.log("Payment status response:", response);
      if (response.payments && response.payments.length > 0) {
        const latestPayment = response.payments[0];
        console.log("Latest payment:", latestPayment);
        setPaymentStatus(latestPayment.status);
      } else {
        console.log("No payments found, setting status to null");
        setPaymentStatus(null);
      }
    } catch (err) {
      console.error("Error checking payment status:", err);
      setPaymentStatus(null);
    }
  };

  const handlePaymentSuccess = async (paymentResponse) => {
    try {
      setPaymentLoading(true);
      // Verify the payment with the backend
      const response = await apiFetch(`/payments/verify/${paymentResponse.reference}`);
      
      if (response.payment && response.payment.status === "success") {
        toast.success("Payment completed successfully!");
        setPaymentStatus("success");
        // Refresh payment status
        await checkPaymentStatus();
        // Navigate to success page or refresh the page
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error("Payment verification failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Payment verification failed");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) return <p className="p-6 text-gray-500">Loading payment form...</p>;
  if (!lease) return <p className="p-6 text-gray-500">Lease not found.</p>;

  console.log("PaymentForm render - paymentStatus:", paymentStatus, "lease:", lease);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Pay Rent</h1>
      
      {/* Lease Summary */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Lease Summary</h2>
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
            <span className="text-gray-600">Rent Amount:</span>
            <span className="font-medium text-lg">₦{lease.rentAmount.toLocaleString()}/month</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Lease Period:</span>
            <span className="font-medium">
              {new Date(lease.startDate).toLocaleDateString()} → {new Date(lease.endDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className={`font-medium ${lease.status === "active" ? "text-green-600" : "text-gray-400"}`}>
              {lease.status}
            </span>
          </div>
        </div>
      </Card>

      {/* Payment Options */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
        <p className="text-gray-600 mb-4">
          We use Paystack for secure payment processing. Your payment will be processed securely within our app.
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Paystack</p>
              <p className="text-sm text-gray-500">Secure payment gateway</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment Button */}
      <div className="flex gap-3">
        {paymentStatus === "success" ? (
          <div className="flex-1 text-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">✅ Payment Completed Successfully!</p>
            <p className="text-green-600 text-sm mt-1">Your rent payment has been processed.</p>
          </div>
        ) : paymentStatus === "pending" ? (
          <div className="flex-1 text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-medium">⏳ Payment in Progress</p>
            <p className="text-yellow-600 text-sm mt-1">Please wait for payment confirmation.</p>
          </div>
        ) : (
          <>
            <Button
              onClick={() => {
                console.log("Pay button clicked, opening modal");
                setShowPaymentModal(true);
              }}
              disabled={paymentLoading}
              size="md"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg"
            >
              {paymentLoading ? "Processing..." : `Pay ₦${lease.rentAmount.toLocaleString()}`}
            </Button>
            
            <Button
              onClick={() => navigate(`/user/payments/${leaseId}`)}
              variant="secondary"
              size="md"
              className="flex-1 py-2 px-4"
            >
              Cancel
            </Button>
          </>
        )}
      </div>
      
      {paymentStatus !== "success" && paymentStatus !== "pending" && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Click to open payment modal
        </p>
      )}

      {/* Security Notice */}
      <div className="text-center text-sm text-gray-500">
        <p>🔒 Your payment information is secure and encrypted</p>
        <p>💳 We accept all major credit/debit cards and bank transfers</p>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        lease={lease}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
