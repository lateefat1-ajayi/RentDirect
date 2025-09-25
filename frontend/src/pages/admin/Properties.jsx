import { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import { apiFetch } from "../../lib/api";
import { toast } from "react-toastify";
import { FaSearch, FaFilter, FaEye, FaCheck, FaTimes, FaHome, FaUser, FaStar, FaCalendarAlt, FaChevronDown, FaChevronRight } from "react-icons/fa";

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [expandedLandlords, setExpandedLandlords] = useState(new Set());

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/admin/properties");
      setProperties(data);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyAction = async (propertyId, action) => {
    try {
      await apiFetch(`/admin/properties/${propertyId}/${action}`, { method: "PUT" });
      toast.success(`Property ${action}d successfully`);
      fetchProperties();
    } catch (error) {
      console.error("Error performing property action:", error);
      toast.error(`Failed to ${action} property`);
    }
  };

  const openPropertyModal = (property) => {
    setSelectedProperty(property);
    setShowModal(true);
  };

  // Toggle landlord accordion
  const toggleLandlord = (landlordId) => {
    const newExpanded = new Set(expandedLandlords);
    if (newExpanded.has(landlordId)) {
      newExpanded.delete(landlordId);
    } else {
      newExpanded.add(landlordId);
    }
    setExpandedLandlords(newExpanded);
  };

  const filteredProperties = properties.filter(property => {
    const addressString = property.address ? 
      `${property.address.street || ''} ${property.address.city || ''} ${property.address.state || ''}`.trim() : 
      property.location || '';
    
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         addressString.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.landlord.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || property.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Group properties by landlord
  const groupedProperties = filteredProperties.reduce((groups, property) => {
    const landlordId = property.landlord._id;
    if (!groups[landlordId]) {
      groups[landlordId] = {
        landlord: property.landlord,
        properties: []
      };
    }
    groups[landlordId].properties.push(property);
    return groups;
  }, {});

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>;
      case "pending":
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
      case "rejected":
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Rejected</span>;
      case "inactive":
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Inactive</span>;
      case "available":
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Available</span>;
      case "rented":
        return <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Rented</span>;
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
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
        {properties.filter(p => p.status === "pending").length} pending approvals
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search properties..."
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
              <option value="active">Active</option>
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="rejected">Rejected</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Properties List - Accordion by Landlord */}
      <div className="space-y-4">
        {Object.keys(groupedProperties).length > 0 ? (
          Object.values(groupedProperties).map((group) => {
            const isExpanded = expandedLandlords.has(group.landlord._id);
            
            return (
              <Card key={group.landlord._id} className="overflow-hidden">
                {/* Landlord Header - Clickable */}
                <button
                  onClick={() => toggleLandlord(group.landlord._id)}
                  className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <FaUser className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {group.landlord.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {group.landlord.email}
                        </p>
                        {group.landlord.verificationStatus === "approved" && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Verified</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {group.properties.length} Properties
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {group.properties.filter(p => p.status === "pending").length} pending
                        </p>
                      </div>
                      <div className="flex items-center">
                        {isExpanded ? (
                          <FaChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <FaChevronDown className="w-4 h-4 text-gray-500 rotate-[-90deg]" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Properties Content - Collapsible */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-700">
                    <div className="p-6 space-y-3">
                      {group.properties.map((property) => (
                        <div key={property._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <FaHome className="w-6 h-6 text-gray-400" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">{property.title}</h4>
                              <p className="text-sm text-gray-500">
                                {property.address ? 
                                  `${property.address.street || ''} ${property.address.city || ''} ${property.address.state || ''}`.trim() || property.location :
                                  property.location
                                }
                              </p>
                              <p className="text-xs text-gray-400">
                                Listed: {new Date(property.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="mb-1">{getStatusBadge(property.status)}</div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                ₦{property.price.toLocaleString()}/year
                              </p>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => openPropertyModal(property)}
                                className="flex items-center gap-1"
                              >
                                <FaEye className="w-3 h-3" />
                                Review
                              </Button>
                              
                              {property.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handlePropertyAction(property._id, "approve")}
                                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                                  >
                                    <FaCheck className="w-3 h-3" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handlePropertyAction(property._id, "reject")}
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
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No properties found matching your criteria</p>
          </Card>
        )}
      </div>


      {/* Property Details Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        {selectedProperty && (
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <FaHome className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedProperty.title}
                </h2>
                <p className="text-gray-500">
                  {selectedProperty.address ? 
                    `${selectedProperty.address.street || ''} ${selectedProperty.address.city || ''} ${selectedProperty.address.state || ''}`.trim() || selectedProperty.location :
                    selectedProperty.location
                  }
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <FaUser className="w-3 h-3 text-gray-400" />
                  <span className="text-sm text-gray-500">{selectedProperty.landlord.name}</span>
                  {selectedProperty.landlord.verificationStatus === "approved" && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Verified Landlord</span>
                  )}
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Property Information</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Price</label>
                    <p className="text-gray-900 dark:text-white">₦{selectedProperty.price.toLocaleString()}/year</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Bedrooms</label>
                    <p className="text-gray-900 dark:text-white">{selectedProperty.bedrooms}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Bathrooms</label>
                    <p className="text-gray-900 dark:text-white">{selectedProperty.bathrooms}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Property Type</label>
                    <p className="text-gray-900 dark:text-white">{selectedProperty.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedProperty.status)}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Listing Details</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Listed Date</label>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(selectedProperty.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(selectedProperty.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {selectedProperty.approvedAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Approved Date</label>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(selectedProperty.approvedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {selectedProperty.rejectedAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Rejected Date</label>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(selectedProperty.rejectedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">Description</h3>
              <p className="text-gray-700 dark:text-gray-300">{selectedProperty.description}</p>
            </div>

            {/* Amenities */}
            {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProperty.amenities.map((amenity, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
              >
                Close
              </Button>
              {selectedProperty.status === "pending" && (
                <>
                  <Button
                    onClick={() => {
                      handlePropertyAction(selectedProperty._id, "reject");
                      setShowModal(false);
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Reject Property
                  </Button>
                  <Button
                    onClick={() => {
                      handlePropertyAction(selectedProperty._id, "approve");
                      setShowModal(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve Property
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
