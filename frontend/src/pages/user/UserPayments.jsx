import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import { apiFetch } from "../../lib/api";
import { FaCreditCard, FaCheckCircle, FaClock, FaTimesCircle, FaMoneyBillWave, FaCalendarAlt, FaHome } from "react-icons/fa";

export default function UserPayments() {
  const [allPayments, setAllPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchAllPayments();
  }, []);

  const fetchAllPayments = async () => {
    try {
      setLoading(true);
      // Fetch all payments for the user across all leases
      const response = await apiFetch("/payments/history");
      console.log("Payments response:", response);
      setAllPayments(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
      setAllPayments([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment History</h1>
        <Button onClick={fetchAllPayments} variant="outline">
          Refresh
        </Button>
      </div>

      {allPayments.length === 0 ? (
        <Card className="p-8 text-center">
          <FaCreditCard className="text-gray-400 text-6xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Payments Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You haven't made any payments yet. Payments will appear here once you pay for your leases.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {allPayments.map((payment) => (
                <Card key={payment._id} className="p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
                    <FaMoneyBillWave className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {payment.type || "Rent Payment"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <FaHome className="w-3 h-3" />
                      {payment.property?.title || "Property"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <FaCalendarAlt className="w-3 h-3" />
                      {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : "Date not available"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {payment.formattedAmount || `₦${(payment.amountInNaira || payment.amount || 0).toLocaleString()}`}
                  </p>
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    payment.status === "success" ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" :
                    payment.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300" :
                    "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                  }`}>
                    {payment.status === "success" ? <FaCheckCircle className="w-3 h-3" /> :
                     payment.status === "pending" ? <FaClock className="w-3 h-3" /> :
                     <FaTimesCircle className="w-3 h-3" />}
                    <span className="capitalize">{payment.status}</span>
                  </div>
                  {payment.status === 'success' && (
                    <div className="mt-2">
                      <Button size="sm" variant="outline" onClick={async () => {
                        try {
                          const token = localStorage.getItem('token');
                          const res = await fetch(`${API_BASE}/payments/${payment._id}/receipt`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
                          if (!res.ok) throw new Error('Download failed');
                          const blob = await res.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `receipt-${payment.reference || payment._id}.pdf`;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          window.URL.revokeObjectURL(url);
                        } catch (e) {
                          // swallow here; UI already shows error state above
                        }
                      }}>
                        Download Receipt
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function PaymentsList({ payments }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case "success": return <FaCheckCircle className="w-4 h-4 text-green-500" />;
      case "pending": return <FaClock className="w-4 h-4 text-yellow-500" />;
      case "failed": return <FaTimesCircle className="w-4 h-4 text-red-500" />;
      default: return <FaCreditCard className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "failed": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  if (!payments.length) {
    return (
      <Card className="p-8 text-center">
        <FaCreditCard className="text-gray-400 text-4xl mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Payments Yet</h3>
        <p className="text-gray-500 dark:text-gray-400">Payment history will appear here once you make your first payment.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {payments.map((p) => (
        <Card key={p._id} className="p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaMoneyBillWave className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                    {p.type || "Rent Payment"}
                  </h3>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(p.status)}`}>
                    {getStatusIcon(p.status)}
                    <span className="capitalize">{p.status}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <FaCalendarAlt className="w-3 h-3 flex-shrink-0" />
                    <span>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "Date not available"}</span>
                  </p>
                  {p.reference && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Ref: {p.reference}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-right flex-shrink-0 ml-4">
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ₦{p.amount?.toLocaleString() || "0"}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function AllUserLeases() {
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch('/leases');
        setLeases(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (!leases.length) return <p className="p-6 text-gray-500">No leases found.</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Your Leases</h1>
      <div className="space-y-3">
        {leases.map((lease) => (
          <Card key={lease._id} className="flex items-center gap-3 p-3">
            <Avatar
              name={lease.tenant?.name || 'Tenant'}
              src={lease.tenant?.profileImage}
              size="w-10 h-10"
            />
            <div className="flex-1">
              <p className="text-base font-semibold">{lease.property?.title || 'Property'}</p>
              <p className="text-sm text-gray-500">
                {new Date(lease.startDate).toLocaleDateString()} →{" "}
                {new Date(lease.endDate).toLocaleDateString()} | ₦
                {lease.rentAmount?.toLocaleString()}/month
              </p>
              <p
                className={`text-sm font-medium ${
                  lease.status === "active" ? "text-green-600" : "text-gray-400"
                }`}
              >
                {lease.status}
              </p>
            </div>
            <Link to={`/user/payments/${lease._id}`}>
              <Button size="sm" variant="outline">
                View Payments
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
