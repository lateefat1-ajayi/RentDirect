import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import { apiFetch } from "../../lib/api";

export default function UserPayments() {
  const { leaseId } = useParams();
  const [lease, setLease] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If no leaseId, show all user leases instead
    if (!leaseId) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await apiFetch(`/leases/${leaseId}`);
        setLease(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [leaseId]);

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
  
  // If no leaseId, show all user leases
  if (!leaseId) {
    return <AllUserLeases />;
  }
  
  if (!lease) return <p className="p-6 text-gray-500">Lease not found.</p>;

  const hasPendingPayments = lease.payments?.some(p => p.status === "pending");

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Payments for {lease.property.title}</h1>

      {/* Lease summary */}
      <Card className="flex items-center gap-3 p-3">
        <Avatar
          name={lease.tenant.name}
          src={lease.tenant.src}
          size="w-10 h-10"
        />
        <div className="flex-1">
          <p className="text-base font-semibold">{lease.property.title}</p>
          <p className="text-sm text-gray-500">
            {new Date(lease.startDate).toLocaleDateString()} →{" "}
            {new Date(lease.endDate).toLocaleDateString()} | ₦
            {lease.rentAmount.toLocaleString()}/month
          </p>
          <p
            className={`text-sm font-medium ${
              lease.status === "active" ? "text-green-600" : "text-gray-400"
            }`}
          >
            {lease.status}
          </p>
        </div>
        {/* Always show payment button for active leases */}
        {lease.status === "active" && (
          <Link to={`/user/payments/${lease._id}/pay`}>
            <Button size="sm" variant="primary">
              Pay Rent
            </Button>
          </Link>
        )}
      </Card>

      {/* Payment Action */}
      {lease.status === "active" && (
        <div className="mt-6">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Ready to Pay Rent?</h3>
              <p className="text-blue-600 mb-4">
                Click the button below to proceed with your rent payment using our secure payment gateway.
              </p>
                             <Link to={`/user/payments/${lease._id}/pay`}>
                 <Button variant="primary" className="bg-blue-600 hover:bg-blue-700">
                   💳 Pay ₦{lease.rentAmount.toLocaleString()} Now
                 </Button>
               </Link>
            </div>
          </Card>
        </div>
      )}

      {/* Payment history */}
      <h2 className="text-lg font-semibold mt-4">Payment History</h2>
      <PaymentsList payments={lease.payments || []} />
    </div>
  );
}

function PaymentsList({ payments }) {
  if (!payments.length)
    return <p className="text-sm text-gray-500">No payments yet.</p>;

  return (
    <div className="space-y-3">
      {payments.map((p) => (
        <Card key={p._id} className="flex items-center justify-between p-3">
          <div>
            <p className="text-sm font-medium">{p.type || "Rent"}</p>
            <p className="text-sm text-gray-500">₦{p.amount?.toLocaleString()}</p>
          </div>
          <p
            className={`text-sm font-medium ${
              p.status === "success"
                ? "text-green-600"
                : p.status === "pending"
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {p.status}
          </p>
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
