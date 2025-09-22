import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import { apiFetch } from "../../lib/api";
import { toast } from "react-toastify";
import { FaMoneyBillWave, FaChartLine, FaCalendar, FaFilter, FaFlag } from "react-icons/fa";

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState("financial"); // 'financial' | 'userReports'
  const [payments, setPayments] = useState([]);
  const [allPayments, setAllPayments] = useState([]); // Store all payments for filtering
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalTransactions: 0,
    averageTransaction: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    period: "all",
    status: "all"
  });
  const [userReports, setUserReports] = useState([]);
  const [savingReportId, setSavingReportId] = useState(null);

  useEffect(() => {
    fetchReportData();
    fetchUserReports();
  }, []);

  // Apply filters to payments
  useEffect(() => {
    let filtered = [...allPayments];

    // Filter by status
    if (filter.status !== 'all') {
      filtered = filtered.filter(payment => payment.status === filter.status);
    }

    // Filter by period
    if (filter.period !== 'all') {
      const now = new Date();
      let startDate;

      switch (filter.period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filtered = filtered.filter(payment => new Date(payment.createdAt) >= startDate);
      }
    }

    setPayments(filtered);
  }, [allPayments, filter]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch payments and revenue stats
      const [paymentsData, statsData] = await Promise.all([
        apiFetch("/admin/payments"),
        apiFetch("/admin/revenue")
      ]);
      
      setAllPayments(paymentsData || []);
      setPayments(paymentsData || []);
      setStats(statsData || {
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalTransactions: 0,
        averageTransaction: 0
      });
      
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error("Failed to load report data");
      // Set empty state on error
      setStats({
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalTransactions: 0,
        averageTransaction: 0
      });
      setAllPayments([]);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReports = async () => {
    try {
      const reports = await apiFetch("/reports/admin");
      setUserReports(Array.isArray(reports) ? reports : []);
    } catch (error) {
      console.error("Error fetching user reports:", error);
      toast.error("Failed to load user reports");
      setUserReports([]);
    }
  };

  const updateReport = async (id, updates) => {
    try {
      setSavingReportId(id);
      const updated = await apiFetch(`/reports/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates)
      });
      setUserReports((prev) => prev.map((r) => (r._id === id ? updated : r)));
      toast.success("Report updated");
    } catch (error) {
      console.error("Failed to update report:", error);
      toast.error("Failed to update report");
    } finally {
      setSavingReportId(null);
    }
  };

  const formatCurrency = (amount) => {
    // Convert from kobo to naira (divide by 100)
    const amountInNaira = Number(amount) / 100;
    return `₦${amountInNaira.toLocaleString()}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
      case "completed":
        return "text-green-600 bg-green-100 dark:bg-green-900/20";
      case "pending":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
      case "failed":
        return "text-red-600 bg-red-100 dark:bg-red-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Platform Reports</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("financial")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "financial"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Financial
          </button>
          <button
            onClick={() => setActiveTab("userReports")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "userReports"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            User Reports
          </button>
        </nav>
      </div>

      {/* Financial Reports */}
      {activeTab === "financial" && (
      <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Rev</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
              <FaMoneyBillWave className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Rev</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.monthlyRevenue)}
              </p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <FaChartLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Transactions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalTransactions}
              </p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
              <FaCalendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Amount</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.averageTransaction)}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <FaMoneyBillWave className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <FaFilter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Period
            </label>
            <select
              value={filter.period}
              onChange={(e) => setFilter(prev => ({ ...prev, period: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Status
            </label>
            <select
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Payment History */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Payment History</h2>
        
        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Platform Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {payment.transactionId || payment._id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {payment.tenant?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {payment.property?.title || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(payment.platformFee || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status === 'success' ? 'Success' : 
                         payment.status === 'pending' ? 'Pending' :
                         payment.status === 'failed' ? 'Failed' :
                         payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(payment.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No payment records found</p>
          </div>
        )}
      </Card>
      </>
      )}

      {/* User Reports */}
      {activeTab === "userReports" && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaFlag className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Reports</h2>
          </div>
          {userReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No reports found</div>
          ) : (
            <div className="space-y-3">
              {userReports.map((r) => (
                <div key={r._id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{r.category || 'Report'}</span>
                        <span className="text-xs text-gray-500">• {new Date(r.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>From:</strong> {r.reporter?._id ? (
                          <Link to={`/admin/users?user=${r.reporter._id}`} className="text-primary hover:underline">
                            {r.reporter?.name || 'User'}
                          </Link>
                        ) : (r.reporter?.name || 'User')} ({r.reporterRole})
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Against:</strong> {r.targetUserId?._id ? (
                          <Link to={`/admin/users?user=${r.targetUserId._id}`} className="text-primary hover:underline">
                            {r.targetUserId?.name || 'User'}
                          </Link>
                        ) : (r.targetUserId?.name || 'User')} ({r.targetRole})
                      </div>
                      {r.leaseId && (
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <strong>Lease:</strong> {r.leaseId}
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      r.status === 'open' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                      r.status === 'in_review' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      r.status === 'resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {r.message}
                  </div>
                  <div className="mt-3 space-y-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Status</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={r.status}
                        onChange={(e) => updateReport(r._id, { status: e.target.value })}
                        disabled={savingReportId === r._id}
                      >
                        <option value="open">Open</option>
                        <option value="in_review">In Review</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => updateReport(r._id, { status: r.status })}
                        disabled={savingReportId === r._id}
                        className="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90"
                      >
                        {savingReportId === r._id ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
