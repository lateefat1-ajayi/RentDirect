import { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import { apiFetch } from "../../lib/api";
import { toast } from "react-toastify";

export default function ContactHistory() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContactHistory();
  }, []);

  const fetchContactHistory = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/contact/user");
      setContacts(data || []);
    } catch (error) {
      console.error("Error fetching contact history:", error);
      toast.error("Failed to load contact history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "text-green-600 bg-green-100 dark:bg-green-900/20";
      case "responded":
        return "text-green-600 bg-green-100 dark:bg-green-900/20";
      case "pending":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
      case "in-progress":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
      case "closed":
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
      default:
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contact History</h1>
      </div>

      {contacts.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            <p className="text-lg mb-2">No contact submissions found</p>
            <p className="text-sm">You haven't submitted any contact forms yet.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {contacts.map((contact) => (
            <Card key={contact._id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {contact.subject}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {contact.category} • {formatDate(contact.createdAt)}
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(contact.status)}`}>
                  {contact.status}
                </span>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Message:</h4>
                <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  {contact.message}
                </p>
              </div>

              {contact.adminResponse && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Admin Response:</h4>
                  <p className="text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                    {contact.adminResponse}
                  </p>
                  {contact.respondedAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Responded on {formatDate(contact.respondedAt)}
                    </p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
