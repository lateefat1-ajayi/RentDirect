import { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import Avatar from "../../components/ui/Avatar";
import { apiFetch } from "../../lib/api";
import { toast } from "react-toastify";
import { FaCheck, FaTimes, FaEye, FaDownload, FaSearch, FaFilter } from "react-icons/fa";

export default function AdminLandlords() {
  const [landlords, setLandlords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedLandlord, setSelectedLandlord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [verificationNote, setVerificationNote] = useState("");

  useEffect(() => {
    fetchLandlords();
  }, []);

  const fetchLandlords = async () => {
    try {
      setLoading(true);
      console.log("Fetching landlords...");
      const data = await apiFetch("/admin/landlords");
      console.log("Landlords data:", data);
      setLandlords(data);
    } catch (error) {
      console.error("Error fetching landlords:", error);
      console.error("Error details:", error.message);
      toast.error(`Failed to load landlords: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (landlordId, action) => {
    try {
      // Check if landlord has verification documents before approval
      if (action === "approve") {
        const landlord = landlords.find(l => l._id === landlordId);
        if (!landlord?.verificationDocuments) {
          toast.error("Cannot approve landlord without verification documents. Please review their submission first.");
          return;
        }
      }

      await apiFetch(`/admin/landlords/${landlordId}/verify`, {
        method: "PUT",
        body: JSON.stringify({
          action,
          note: verificationNote
        })
      });

      toast.success(`Landlord ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      setShowModal(false);
      setSelectedLandlord(null);
      setVerificationNote("");
      fetchLandlords();
    } catch (error) {
      console.error("Error updating verification:", error);
      if (error.message?.includes("Cannot approve landlord")) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update verification status");
      }
    }
  };

  const openVerificationModal = (landlord) => {
    setSelectedLandlord(landlord);
    setShowModal(true);
  };

  const filteredLandlords = landlords.filter(landlord => {
    const matchesSearch = landlord.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         landlord.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || landlord.verificationStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
      case "approved":
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Approved</span>;
      case "rejected":
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Unknown</span>;
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Landlord Verification</h1>
        <div className="text-sm text-gray-500">
          {landlords.filter(l => l.verificationStatus === "pending").length} pending verifications
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search landlords..."
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Landlords List */}
      <div className="space-y-4">
        {filteredLandlords.length > 0 ? (
          filteredLandlords.map((landlord) => (
            <Card key={landlord._id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar
                    name={landlord.name}
                    src={landlord.profileImage}
                    size="w-12 h-12"
                    className="rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{landlord.name}</h3>
                    <p className="text-sm text-gray-500">{landlord.email}</p>
                    <p className="text-xs text-gray-400">Joined: {new Date(landlord.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="mb-1">{getStatusBadge(landlord.verificationStatus)}</div>
                    <p className="text-xs text-gray-500">
                      {landlord.properties?.length || 0} properties
                    </p>
                    {landlord.verificationDocuments && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        ✓ Documents submitted
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openVerificationModal(landlord)}
                      className="flex items-center gap-1"
                    >
                      <FaEye className="w-3 h-3" />
                      Review
                    </Button>
                    
                    {landlord.verificationStatus === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleVerification(landlord._id, "approve")}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                        >
                          <FaCheck className="w-3 h-3" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleVerification(landlord._id, "reject")}
                          className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                          <FaTimes className="w-3 h-3" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No landlords found matching your criteria</p>
          </Card>
        )}
      </div>

      {/* Verification Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        {selectedLandlord && (
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center space-x-4">
              <Avatar
                name={selectedLandlord.name}
                src={selectedLandlord.profileImage}
                size="w-16 h-16"
                className="rounded-full"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedLandlord.name}
                </h2>
                <p className="text-gray-500">{selectedLandlord.email}</p>
                <p className="text-sm text-gray-400">
                  Joined: {new Date(selectedLandlord.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Warning if no verification documents */}
            {!selectedLandlord.verificationData && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <FaTimes className="text-red-500 mr-2" />
                  <div>
                    <p className="text-red-800 dark:text-red-200 font-medium">
                      ⚠️ Verification Documents Missing
                    </p>
                    <p className="text-red-700 dark:text-red-300 text-sm">
                      This landlord has not submitted verification documents. They cannot be approved until they complete the verification process.
                    </p>
                  </div>
                </div>
              </div>
            )}

                        {/* Verification Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Verification Information</h3>
              
              
              {selectedLandlord.verificationData ? (
                <div className="space-y-4">
                  {/* Verification Summary */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Verification Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-blue-700 dark:text-blue-300">Status:</span>
                        <p className="font-medium text-blue-900 dark:text-blue-100 capitalize">
                          {selectedLandlord.verificationStatus || "Not Submitted"}
                        </p>
                      </div>
                      <div>
                        <span className="text-blue-700 dark:text-blue-300">Documents:</span>
                        <p className="font-medium text-blue-900 dark:text-blue-100">
                          {Object.values(selectedLandlord.verificationData.documents).filter(Boolean).length}/4 uploaded
                        </p>
                      </div>
                      <div>
                        <span className="text-blue-700 dark:text-blue-300">Business Info:</span>
                        <p className="font-medium text-blue-900 dark:text-blue-100">
                          {selectedLandlord.verificationData.businessInfo.businessName ? "Complete" : "Incomplete"}
                        </p>
                      </div>
                      <div>
                        <span className="text-blue-700 dark:text-blue-300">Submitted:</span>
                        <p className="font-medium text-blue-900 dark:text-blue-100">
                          {selectedLandlord.verificationData.submittedAt ? new Date(selectedLandlord.verificationData.submittedAt).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Business Information */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Business Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Business Name:</span>
                        <p className="font-medium">
                          {selectedLandlord.verificationData.businessInfo?.businessName || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Business Address:</span>
                        <p className="font-medium">
                          {selectedLandlord.verificationData.businessInfo?.businessAddress || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Phone Number:</span>
                        <p className="font-medium">
                          {selectedLandlord.verificationData.businessInfo?.phoneNumber || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Identification Information */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Identification</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">ID Type:</span>
                        <p className="font-medium capitalize">
                          {selectedLandlord.verificationData.identification?.type 
                            ? selectedLandlord.verificationData.identification.type.replace('_', ' ')
                            : 'Not provided'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">ID Number:</span>
                        <p className="font-medium">
                          {selectedLandlord.verificationData.identification?.number || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bank Information */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Bank Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Bank Name:</span>
                        <p className="font-medium">
                          {selectedLandlord.verificationData.bankInfo?.bankName || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Account Number:</span>
                        <p className="font-medium">
                          {selectedLandlord.verificationData.bankInfo?.accountNumber || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Account Name:</span>
                        <p className="font-medium">
                          {selectedLandlord.verificationData.bankInfo?.accountName || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Documents */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Uploaded Documents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedLandlord.verificationData.documents.identification && (
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">Identification Document</span>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => window.open(selectedLandlord.verificationData.documents.identification, '_blank')}
                              className="flex items-center gap-1 text-xs px-2 py-1"
                            >
                              <FaDownload className="w-2 h-2" />
                              View
                            </Button>
                          </div>
                          {/* Image Preview */}
                          <div className="mb-2">
                            <img
                              src={selectedLandlord.verificationData.documents.identification}
                              alt="Identification Document"
                              className="max-w-full h-32 object-contain rounded border"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <div className="hidden text-xs text-gray-500 text-center p-2 bg-gray-100 rounded">
                              Image preview not available
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">Click View to open document in new tab</p>
                        </div>
                      )}
                      
                      {selectedLandlord.verificationData.documents.utilityBill && (
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">Utility Bill</span>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => window.open(selectedLandlord.verificationData.documents.utilityBill, '_blank')}
                              className="flex items-center gap-1 text-xs px-2 py-1"
                            >
                              <FaDownload className="w-2 h-2" />
                              View
                            </Button>
                          </div>
                          {/* Image Preview */}
                          <div className="mb-2">
                            <img
                              src={selectedLandlord.verificationData.documents.utilityBill}
                              alt="Utility Bill"
                              className="max-w-full h-32 object-contain rounded border"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <div className="hidden text-xs text-gray-500 text-center p-2 bg-gray-100 rounded">
                              Image preview not available
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">Click View to open document in new tab</p>
                        </div>
                      )}

                      {selectedLandlord.verificationData.documents.bankStatement && (
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">Bank Statement</span>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => window.open(selectedLandlord.verificationData.documents.bankStatement, '_blank')}
                              className="flex items-center gap-1 text-xs px-2 py-1"
                            >
                              <FaDownload className="w-2 h-2" />
                              View
                            </Button>
                          </div>
                          {/* Image Preview */}
                          <div className="mb-2">
                            <img
                              src={selectedLandlord.verificationData.documents.bankStatement}
                              alt="Bank Statement"
                              className="max-w-full h-32 object-contain rounded border"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <div className="hidden text-xs text-gray-500 text-center p-2 bg-gray-100 rounded">
                              Image preview not available
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">Click View to open document in new tab</p>
                        </div>
                      )}

                      {selectedLandlord.verificationData.documents.propertyDocuments && (
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">Property Documents</span>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => window.open(selectedLandlord.verificationData.documents.propertyDocuments, '_blank')}
                              className="flex items-center gap-1 text-xs px-2 py-1"
                            >
                              <FaDownload className="w-2 h-2" />
                              View
                            </Button>
                          </div>
                          {/* Image Preview */}
                          <div className="mb-2">
                            <img
                              src={selectedLandlord.verificationData.documents.propertyDocuments}
                              alt="Property Documents"
                              className="max-w-full h-32 object-contain rounded border"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <div className="hidden text-xs text-gray-500 text-center p-2 bg-gray-100 rounded">
                              Image preview not available
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">Click View to open document in new tab</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      Submitted: {selectedLandlord.verificationData.submittedAt ? new Date(selectedLandlord.verificationData.submittedAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No verification information submitted</p>
              )}
            </div>

            {/* Properties */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 dark:text-white">Properties</h3>
                {selectedLandlord.properties && selectedLandlord.properties.length > 3 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      // This would open a modal or navigate to show all properties
                      toast.info("Feature coming soon: View all properties");
                    }}
                    className="text-xs"
                  >
                    View All ({selectedLandlord.properties.length})
                  </Button>
                )}
              </div>
              {selectedLandlord.properties && selectedLandlord.properties.length > 0 ? (
                <div className="space-y-2">
                  {selectedLandlord.properties.slice(0, 3).map((property) => (
                    <div key={property._id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{property.title}</p>
                          <p className="text-sm text-gray-500">₦{property.price.toLocaleString()}/year</p>
                          <p className="text-xs text-gray-400">{property.address}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          property.status === 'active' ? 'bg-green-100 text-green-800' :
                          property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          property.status === 'rented' ? 'bg-blue-100 text-blue-800' :
                          property.status === 'available' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {property.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {selectedLandlord.properties.length > 3 && (
                    <div className="text-center py-2">
                      <p className="text-sm text-gray-500">
                        ... and {selectedLandlord.properties.length - 3} more properties
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No properties listed</p>
              )}
            </div>

            {/* Verification Note */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Verification Note (Optional)
              </label>
              <textarea
                value={verificationNote}
                onChange={(e) => setVerificationNote(e.target.value)}
                placeholder="Add a note about this verification decision..."
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows="3"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleVerification(selectedLandlord._id, "reject")}
                className="bg-red-600 hover:bg-red-700"
              >
                Reject
              </Button>
              <Button
                onClick={() => handleVerification(selectedLandlord._id, "approve")}
                disabled={!selectedLandlord.verificationData}
                className={`${
                  selectedLandlord.verificationData 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                title={!selectedLandlord.verificationData ? "Cannot approve without verification documents" : ""}
              >
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
