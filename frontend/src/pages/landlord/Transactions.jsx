import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { FaMoneyBillWave, FaCalendarAlt, FaUser, FaHome, FaCheckCircle, FaClock, FaTimesCircle, FaReceipt } from "react-icons/fa";
import { apiFetch } from "../../lib/api";
import { toast } from "react-toastify";

export default function LandlordTransactions() {
  const { profile } = useOutletContext();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalTransactions: 0,
    pendingAmount: 0
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/payments/landlord");
      console.log("Fetched landlord transactions:", data);
      setTransactions(data || []);
      
      // Calculate stats
      const totalEarnings = data?.reduce((sum, t) => sum + (t.amountInNaira || 0), 0) || 0;
      const totalTransactions = data?.length || 0;
      const pendingAmount = data?.filter(t => t.status === "pending")?.reduce((sum, t) => sum + (t.amountInNaira || 0), 0) || 0;
      
      setStats({
        totalEarnings,
        totalTransactions,
        pendingAmount
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <FaCheckCircle className="mr-1" />
            Completed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <FaClock className="mr-1" />
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <FaTimesCircle className="mr-1" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            Unknown
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        <Button onClick={fetchTransactions} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <FaMoneyBillWave className="text-green-600 dark:text-green-400 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₦{stats.totalEarnings.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <FaReceipt className="text-blue-600 dark:text-blue-400 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalTransactions}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <FaClock className="text-yellow-600 dark:text-yellow-400 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Amount</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₦{stats.pendingAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {transactions.length === 0 ? (
        <Card className="p-8 text-center">
          <FaMoneyBillWave className="text-gray-400 text-6xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Transactions Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You don't have any transactions yet. Transactions will appear here once tenants make payments for your properties.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
          <div className="grid gap-4">
            {transactions.map((transaction) => (
              <Card key={transaction._id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <FaMoneyBillWave className="text-blue-600 text-xl" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {transaction.property?.title || "Property Title"}
                      </h3>
                      {getStatusBadge(transaction.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          <strong>Tenant:</strong> {transaction.tenant?.name || "N/A"}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          <strong>Date:</strong> {formatDate(transaction.createdAt)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <FaMoneyBillWave className="text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          <strong>Amount:</strong> {transaction.formattedAmount || `₦${(transaction.amount / 100).toLocaleString()}`}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <FaReceipt className="text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          <strong>Platform Fee (5%):</strong> ₦{Math.round((transaction.amount / 100) * 0.05).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <FaMoneyBillWave className="text-green-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          <strong>Your Earning:</strong> ₦{Math.round((transaction.amount / 100) * 0.95).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          <strong>Reference:</strong> {transaction.reference?.slice(-8) || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
