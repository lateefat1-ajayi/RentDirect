import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { apiFetch } from "../../lib/api";

export default function UserLeases() {
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/leases");
        setLeases(Array.isArray(data) ? data : []);
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
      <h2 className="text-2xl font-bold">My Leases</h2>
      <div className="space-y-3">
        {leases.map((lease) => (
          <Card key={lease._id} className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium">{lease.property.title}</p>
              <p className="text-sm text-gray-500">
                {new Date(lease.startDate).toLocaleDateString()} → {new Date(lease.endDate).toLocaleDateString()} | ₦{lease.rentAmount.toLocaleString()}/month
              </p>
              <p className={`text-sm font-medium ${lease.status === "active" ? "text-green-600" : "text-gray-400"}`}>
                {lease.status}
              </p>
            </div>
            <Link to={`/user/payments/${lease._id}`}>
              <Button size="sm" variant="primary">View / Pay</Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
