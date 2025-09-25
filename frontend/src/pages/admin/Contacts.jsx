import { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { apiFetch } from "../../lib/api";
import { toast } from "react-toastify";
import { FaSearch, FaFilter, FaEye, FaTrash, FaReply, FaEnvelope, FaUser, FaCalendar } from "react-icons/fa";

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminResponse, setAdminResponse] = useState("");

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/admin/contacts");
      setContacts(data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleContactAction = async (contactId, action, data = {}) => {
    try {
      if (action === "update") {
        await apiFetch(`/admin/contacts/${contactId}`, {
          method: "PUT",
          body: JSON.stringify(data)
        });
        toast.success("Contact updated successfully");
      } else if (action === "delete") {
        await apiFetch(`/admin/contacts/${contactId}`, { method: "DELETE" });
        toast.success("Contact deleted successfully");
      }
      fetchContacts();
      setShowModal(false);
      setSelectedContact(null);
      setAdminResponse("");
    } catch (error) {
      console.error("Error performing contact action:", error);
      toast.error(`Failed to ${action} contact`);
    }
  };

  const openContactModal = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
    setAdminResponse(contact.adminResponse || "");
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || contact.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "new":
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">New</span>;
      case "in_progress":
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">In Progress</span>;
      case "resolved":
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Resolved</span>;
      case "closed":
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Closed</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Unknown</span>;
    }
  };

  const getCategoryBadge = (category) => {
    switch (category) {
      case "general":
        return <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">General</span>;
      case "support":
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Support</span>;
      case "complaint":
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Complaint</span>;
      case "feedback":
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Feedback</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Other</span>;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="text-sm text-gray-500">
        {contacts.length} total contacts
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Contacts List */}
      <div className="space-y-4">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <Card key={contact._id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <FaEnvelope className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{contact.subject}</h3>
                    <p className="text-sm text-gray-500">{contact.name} ({contact.email})</p>
                    <p className="text-xs text-gray-400">
                      {new Date(contact.createdAt).toLocaleDateString()} • {contact.message.substring(0, 100)}...
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="mb-1">{getCategoryBadge(contact.category)}</div>
                    <div>{getStatusBadge(contact.status)}</div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openContactModal(contact)}
                      className="flex items-center gap-1"
                    >
                      <FaEye className="w-3 h-3" />
                      View
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleContactAction(contact._id, "delete")}
                      className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <FaTrash className="w-3 h-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No contacts found matching your criteria</p>
          </Card>
        )}
      </div>

      {/* Contact Detail Modal */}
      {showModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contact Details</h2>
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FaUser className="inline w-4 h-4 mr-2" />
                    Name
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedContact.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FaEnvelope className="inline w-4 h-4 mr-2" />
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedContact.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  {getCategoryBadge(selectedContact.category)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FaCalendar className="inline w-4 h-4 mr-2" />
                    Submitted
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedContact.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <p className="text-gray-900 dark:text-white font-medium">{selectedContact.subject}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  {selectedContact.message}
                </p>
              </div>

              {selectedContact.adminResponse && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Admin Response
                  </label>
                  <p className="text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                    {selectedContact.adminResponse}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Admin Response
                </label>
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Type your response..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="4"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleContactAction(selectedContact._id, "update", {
                    status: "resolved",
                    adminResponse
                  })}
                  className="flex items-center gap-2"
                >
                  <FaReply className="w-4 h-4" />
                  Respond & Resolve
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
