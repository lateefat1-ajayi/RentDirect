import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import TextArea from "../../components/ui/TextArea";
import { apiFetch, apiUpload } from "../../lib/api";
import { toast } from "react-toastify";
import { FaMapMarkerAlt, FaLocationArrow, FaSearch, FaSync, FaShare } from "react-icons/fa";
import ShareModal from "../../components/ui/ShareModal";

export default function LandlordListings() {
  const { profile } = useOutletContext();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("listings"); // "listings" or "add"
  const [newProperty, setNewProperty] = useState({
    title: "",
    location: "",
    price: "",
    description: "",
    bedrooms: 0,
    bathrooms: 0,
    size: "",
    availableDurations: [1, 2, 3],
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Nigeria"
    },
    coordinates: {
      latitude: null,
      longitude: null
    }
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [viewingProperty, setViewingProperty] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/property/landlord/me");
      setListings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper function to get status category
  const getStatusCategory = (status) => {
    if (!status) return 'available'; // Default to available
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'available') return 'available';
    if (statusLower === 'rented') return 'rented';
    
    return 'available'; // Default to available
  };

  // Filter listings based on status
  const filteredListings = listings.filter(property => {
    if (statusFilter === 'all') return true;
    return getStatusCategory(property.status) === statusFilter;
  });

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleInputChange = (e) => {
    setNewProperty({ ...newProperty, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewProperty({
      ...newProperty,
      address: {
        ...newProperty.address,
        [name]: value
      }
    });
  };

  // Get coordinates for the entered property address
  const getPropertyCoordinates = async () => {
    if (!newProperty.location.trim()) {
      setLocationError("Please enter the property address first");
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    try {
      // Use forward geocoding to get coordinates from address
      const response = await fetch(
        `https://api.bigdatacloud.net/data/forward-geocode-client?query=${encodeURIComponent(newProperty.location)}&localityLanguage=en`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const { latitude, longitude } = result;
        
        // Update coordinates and detailed address
        setNewProperty({
          ...newProperty,
          address: {
            street: result.streetNumber && result.streetName ? `${result.streetNumber} ${result.streetName}` : result.streetName || "",
            city: result.city || "",
            state: result.principalSubdivision || "",
            postalCode: result.postcode || "",
            country: result.countryName || "Nigeria"
          },
          coordinates: {
            latitude,
            longitude
          }
        });
        
        setShowAddressForm(true);
        toast.success("Coordinates found for the property address!");
      } else {
        setLocationError("Could not find coordinates for this address. You can still save the property without coordinates.");
      }
    } catch (error) {
      console.error("Error getting coordinates:", error);
      setLocationError("Could not get coordinates for this address. You can still save the property without coordinates.");
    } finally {
      setLocationLoading(false);
    }
  };

  // Alternative: Get user's current location (for when they are at the property)
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use reverse geocoding to get address details
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          
          // Update location with detailed address
          const fullAddress = [
            data.streetNumber && data.streetName ? `${data.streetNumber} ${data.streetName}` : data.streetName,
            data.city,
            data.principalSubdivision,
            data.postcode
          ].filter(Boolean).join(", ");

          setNewProperty({
            ...newProperty,
            location: fullAddress,
            address: {
              street: data.streetNumber && data.streetName ? `${data.streetNumber} ${data.streetName}` : data.streetName || "",
              city: data.city || "",
              state: data.principalSubdivision || "",
              postalCode: data.postcode || "",
              country: data.countryName || "Nigeria"
            },
            coordinates: {
              latitude,
              longitude
            }
          });
          
          setShowAddressForm(true);
          toast.success("Location detected! Please verify this is the correct property address.");
        } catch (error) {
          console.error("Error getting location details:", error);
          setLocationError("Could not get detailed address. Please enter manually.");
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError("Unable to get your location. Please allow location access or enter manually.");
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    console.log("Files selected:", files.length);
    setImageFiles(files.slice(0, 8));
  };

  const openImageViewer = (property, imageIndex = 0) => {
    setViewingProperty(property);
    setSelectedImageIndex(imageIndex);
    setImageLoading(true);
  };

  const closeImageViewer = () => {
    setViewingProperty(null);
    setSelectedImageIndex(null);
    setImageLoading(false);
  };

  const nextImage = () => {
    if (viewingProperty && viewingProperty.images) {
      setImageLoading(true);
      setSelectedImageIndex((prev) => 
        prev < viewingProperty.images.length - 1 ? prev + 1 : 0
      );
    }
  };

  const prevImage = () => {
    if (viewingProperty && viewingProperty.images) {
      setImageLoading(true);
      setSelectedImageIndex((prev) => 
        prev > 0 ? prev - 1 : viewingProperty.images.length - 1
      );
    }
  };

  const handleShare = (property) => {
    setSelectedProperty(property);
    setShareModalOpen(true);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!viewingProperty) return;
      
      switch (e.key) {
        case 'Escape':
          closeImageViewer();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
      }
    };

    if (viewingProperty) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [viewingProperty, selectedImageIndex]);

  const submitProperty = async () => {
    try {
      if (submitting) return;
      
      // Check verification status
      if (profile?.verificationStatus !== "approved") {
        toast.error("You must be verified to list properties");
        return;
      }
      
      // Check if at least 4 images are uploaded
      if (imageFiles.length < 4) {
        toast.error("Please upload at least 4 images of the property (different rooms/angles)");
        return;
      }
      
      setSubmitting(true);
      const formData = new FormData();
      
      // Add basic property fields
      formData.append("title", newProperty.title);
      formData.append("description", newProperty.description);
      formData.append("price", newProperty.price);
      formData.append("location", newProperty.location);
      formData.append("bedrooms", newProperty.bedrooms);
      formData.append("bathrooms", newProperty.bathrooms);
      if (newProperty.size) formData.append("size", newProperty.size);
      formData.append("availableDurations", JSON.stringify(newProperty.availableDurations));
      
      // Add address and coordinates as JSON strings
      if (newProperty.address) {
        formData.append("address", JSON.stringify(newProperty.address));
      }
      if (newProperty.coordinates) {
        formData.append("coordinates", JSON.stringify(newProperty.coordinates));
      }
      
      // Add images
      imageFiles.forEach((file) => formData.append("images", file));

      console.log("Submitting property with data:", {
        title: newProperty.title,
        location: newProperty.location,
        price: newProperty.price,
        bedrooms: newProperty.bedrooms,
        bathrooms: newProperty.bathrooms,
        imageCount: imageFiles.length
      });

      const response = await apiUpload("/property", formData, { method: "POST" });
      console.log("Property creation response:", response);
      
      await fetchListings();
      setActiveTab("listings"); // Switch back to listings tab
      
      // Reset form
      setNewProperty({
        title: "",
        location: "",
        price: "",
        description: "",
        bedrooms: 0,
        bathrooms: 0,
        size: "",
        availableDurations: [1, 2, 3],
        address: {
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "Nigeria"
        },
        coordinates: {
          latitude: null,
          longitude: null
        }
      });
      setImageFiles([]);
      setLocationError("");
      setShowAddressForm(false);
      
      toast.success("Property added successfully!");
    } catch (err) {
      console.error("Property creation error:", err);
      toast.error("Failed to add property: " + (err.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  const submitEdit = async () => {
    if (!editing) return;
    try {
      const payload = {
        title: editing.title,
        location: editing.location,
        price: editing.price,
        description: editing.description,
        bedrooms: editing.bedrooms,
        bathrooms: editing.bathrooms,
        size: editing.size,
      };
      await apiFetch(`/property/${editing._id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      toast.success("Property updated");
      setEditing(null);
      await fetchListings();
    } catch (err) {
      toast.error("Update failed: " + (err.message || ""));
    }
  };

  return (
    <div className="space-y-10">
      {/* Verification Status Banner */}
      {profile?.verificationStatus !== "approved" && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.3) 2px, transparent 0)`,
              backgroundSize: '50px 50px'
            }}></div>
          </div>
          
          <div className="relative p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  profile?.verificationStatus === "pending" 
                    ? "bg-amber-100 dark:bg-amber-900/30" 
                    : "bg-blue-100 dark:bg-blue-900/30"
                }`}>
                  {profile?.verificationStatus === "pending" ? (
                    <FaClock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <FaShieldAlt className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {profile?.verificationStatus === "pending" 
                      ? "Verification Under Review" 
                      : "Complete Your Verification"
                    }
                  </h3>
                  {profile?.verificationStatus === "pending" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                      In Progress
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  {profile?.verificationStatus === "pending" 
                    ? "Our team is reviewing your verification documents. This usually takes 1-3 business days. You'll receive an email notification once approved."
                    : "Verify your identity to start listing properties and building trust with potential tenants. The process is quick and secure."
                  }
                </p>
                <div className="flex items-center gap-3">
                  {profile?.verificationStatus !== "pending" && (
                    <a 
                      href="/landlord/verification" 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <FaShieldAlt className="w-4 h-4" />
                      Start Verification
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Property Management</h1>
          <div className="flex items-center gap-3">
            {activeTab === "listings" && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Properties</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            )}
            <Button 
              onClick={fetchListings}
              variant="outline"
              size="sm"
              className="p-2"
              title="Refresh Properties"
              aria-label="Refresh Properties"
            >
              <FaSync className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("listings")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "listings"
                  ? "border-teal-500 text-teal-600 dark:text-teal-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              My Properties ({listings.length})
            </button>
            <button
              onClick={() => {
                if (profile?.verificationStatus === "approved") {
                  setActiveTab("add");
                } else {
                  toast.error(profile?.verificationStatus === "pending" 
                    ? "Your verification is being reviewed. Please wait for approval." 
                    : "You need to verify your account before adding properties.");
                }
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "add"
                  ? "border-teal-500 text-teal-600 dark:text-teal-400"
                  : profile?.verificationStatus === "approved"
                    ? "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    : "border-transparent text-gray-400 cursor-not-allowed"
              }`}
              disabled={profile?.verificationStatus !== "approved"}
            >
              Add New Property
              {profile?.verificationStatus !== "approved" && (
                <span className="ml-1 text-xs">🔒</span>
              )}
            </button>
          </nav>
        </div>

        {/* Add Property Form */}
        {activeTab === "add" && (
          profile?.verificationStatus === "approved" ? (
          <Card className="p-3 space-y-3">
            <Input
              type="text"
              name="title"
              placeholder="Title"
              value={newProperty.title}
              onChange={handleInputChange}
            />
            {/* Location Input Section */}
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Property Location *
                </label>
            <Input
              type="text"
              name="location"
                  placeholder="Enter the property's address (e.g., 123 Main St, Lagos, Nigeria)"
              value={newProperty.location}
              onChange={handleInputChange}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  💡 Enter the actual address where the property is located, not your current location
                </div>
              </div>
              
              {/* Location Options */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={getPropertyCoordinates}
                    disabled={locationLoading || !newProperty.location.trim()}
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {locationLoading ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                    ) : (
                      <FaMapMarkerAlt className="w-4 h-4" />
                    )}
                    Get Coordinates for Address
                  </Button>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    (Recommended - gets precise location for the entered address)
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <FaLocationArrow className="w-4 h-4" />
                    I'm at the Property Now
                  </Button>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    (Only if you're physically at the property location)
                  </span>
                </div>
              </div>
              
              {locationError && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  {locationError}
                </div>
              )}
              
              {newProperty.coordinates.latitude && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                  <FaMapMarkerAlt className="w-4 h-4" />
                  <span>✅ Coordinates found: {newProperty.coordinates.latitude.toFixed(4)}, {newProperty.coordinates.longitude.toFixed(4)}</span>
                </div>
              )}
              
              {/* Toggle for detailed address form */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {showAddressForm ? "Hide" : "Add"} Detailed Address
                </button>
                {showAddressForm && (
                  <span className="text-xs text-gray-500">(Optional - helps with precise location)</span>
                )}
              </div>
              
              {/* Detailed Address Form */}
              {showAddressForm && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Input
                    type="text"
                    name="street"
                    placeholder="Street Address"
                    value={newProperty.address.street}
                    onChange={handleAddressChange}
                  />
                  <Input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={newProperty.address.city}
                    onChange={handleAddressChange}
                  />
                  <Input
                    type="text"
                    name="state"
                    placeholder="State/Province"
                    value={newProperty.address.state}
                    onChange={handleAddressChange}
                  />
                  <Input
                    type="text"
                    name="postalCode"
                    placeholder="Postal Code"
                    value={newProperty.address.postalCode}
                    onChange={handleAddressChange}
                  />
                </div>
              )}
            </div>
            <Input
              type="number"
              name="price"
              placeholder="Yearly Rent Price (₦)"
              value={newProperty.price}
              onChange={handleInputChange}
            />
            <TextArea
              name="description"
              placeholder="Description"
              value={newProperty.description}
              onChange={handleInputChange}
            />
            <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="number"
                name="bedrooms"
                placeholder="Bedrooms"
                value={newProperty.bedrooms}
                onChange={handleInputChange}
                  className="w-1/2"
              />
              <Input
                type="number"
                name="bathrooms"
                placeholder="Bathrooms"
                value={newProperty.bathrooms}
                onChange={handleInputChange}
                  className="w-1/2"
              />
              </div>
              
              {/* Optional Size Field */}
              <div className="space-y-1">
              <Input
                type="number"
                name="size"
                  placeholder="Size (sq ft) - Optional"
                value={newProperty.size}
                onChange={handleInputChange}
                  className="w-full"
              />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  💡 Helpful for tenants to understand the space, but not required
                </div>
              </div>
              
              {/* Lease Duration Options */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Available Lease Durations (Years) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5].map((year) => (
                    <label key={year} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProperty.availableDurations.includes(year)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewProperty(prev => ({
                              ...prev,
                              availableDurations: [...prev.availableDurations, year].sort()
                            }));
                          } else {
                            setNewProperty(prev => ({
                              ...prev,
                              availableDurations: prev.availableDurations.filter(d => d !== year)
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{year} Year{year > 1 ? 's' : ''}</span>
                    </label>
                  ))}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  💡 Select which lease durations tenants can choose from
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Property Images * <span className="text-red-500">(Required)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
                required
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 dark:file:bg-gray-700 dark:file:text-gray-300"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400">
                📸 Upload at least 4 images (up to 8) - Show different rooms and angles
              </div>
              
              {imageFiles.length < 4 && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  ⚠️ At least 4 images are required to list the property ({imageFiles.length}/4 uploaded)
                </div>
              )}
              
              {imageFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Image Previews ({imageFiles.length}):</p>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {imageFiles.map((f, i) => {
                      console.log("Rendering image preview:", i, f.name);
                      return (
                        <div key={i} className="relative group">
                          <div className="w-full h-16 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                            <img
                              src={URL.createObjectURL(f)}
                              alt={`Preview ${i + 1}`}
                              className="w-full h-full object-cover"
                              onLoad={() => console.log("Image loaded:", f.name)}
                              onError={() => console.log("Image error:", f.name)}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setImageFiles(prev => prev.filter((_, index) => index !== i))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-lg"
                            title="Remove image"
                          >
                            ×
                          </button>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                              Click × to remove
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <Button 
              variant="primary" 
              size="md" 
              onClick={submitProperty} 
              disabled={submitting || imageFiles.length < 4}
              isLoading={submitting}
            >
              {submitting ? "Submitting..." : imageFiles.length < 4 ? `Upload ${4 - imageFiles.length} More Images` : "Submit Property"}
            </Button>
          </Card>
          ) : (
            <Card className="p-8 text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Verification Required
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {profile?.verificationStatus === "pending" 
                  ? "Your verification request is being reviewed. You'll be able to add properties once approved."
                  : "You need to verify your account before you can add properties."
                }
              </p>
              {profile?.verificationStatus !== "pending" && (
                <a 
                  href="/landlord/verification" 
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Go to Verification
                </a>
              )}
            </Card>
          )
        )}
      </section>

        {/* Listings Tab */}
        {activeTab === "listings" && (
          <section>
        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : filteredListings.length === 0 ? (
          <p className="text-gray-500">No listings yet.</p>
        ) : (
          <>
            {/* Status Filter */}
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700">Filter by status:</span>
              {['all', 'available', 'rented'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    statusFilter === status
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All' :
                   status === 'available' ? 'Available' :
                   status === 'rented' ? 'Rented' :
                   'All'}
                  {status === 'all' ? ` (${listings.length})` : 
                   ` (${listings.filter(p => getStatusCategory(p.status) === status).length})`}
                </button>
              ))}
            </div>
            
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredListings.map((property) => (
              <Card key={property._id} className="p-3 sm:p-4 flex flex-col">
                {/* Property Images */}
                <div className="relative">
                <img
                  src={
                    Array.isArray(property.images) && property.images.length > 0
                      ? (typeof property.images[0] === "string" ? property.images[0] : property.images[0]?.url)
                      : "https://via.placeholder.com/600x400?text=Property"
                  }
                  alt={property.title}
                    className="w-full h-32 sm:h-40 object-cover rounded-md mb-2 sm:mb-3 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openImageViewer(property, 0)}
                  />
                  
                  {/* Image count indicator */}
                  {property.images && property.images.length > 1 && (
                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                      {property.images.length} photos
                    </div>
                  )}
                </div>
                
                <div className="flex items-start justify-between mb-1 sm:mb-2">
                  <h3 className="font-bold text-base sm:text-lg truncate pr-2">{property.title}</h3>
                  {/* Property Status Badge */}
                  <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                    getStatusCategory(property.status) === 'available' ? 'bg-green-100 text-green-800' :
                    getStatusCategory(property.status) === 'rented' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusCategory(property.status) === 'available' ? 'Available' :
                     getStatusCategory(property.status) === 'rented' ? 'Rented' :
                     property.status || 'Available'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{property.location}</p>
                <p className="font-semibold mt-1 sm:mt-2 text-sm sm:text-base">₦{property.price}/year</p>
                <p className="text-xs sm:text-sm mt-1">
                  {property.bedrooms} bed / {property.bathrooms} bath
                  {property.size && ` • ${property.size} sq ft`}
                </p>
                
                {/* Application/Payment Info */}
                {(property.hasApplications || property.hasPayments) && (
                  <div className="mt-1 sm:mt-2 p-1.5 sm:p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-800 dark:text-yellow-200">
                    {property.hasApplications && `Applications: ${property.applicationCount}`}
                    {property.hasApplications && property.hasPayments && " • "}
                    {property.hasPayments && `Payments: ${property.paymentCount}`}
                  </div>
                )}
                
                <div className="flex gap-1 sm:gap-2 mt-2 sm:mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setEditing(property)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button 
                    onClick={() => handleShare(property)}
                    variant="outline"
                    size="sm"
                    className="px-3"
                    title="Share Property"
                  >
                    <FaShare className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
            </div>
          </>
        )}
          </section>
        )}


      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center">
          <Card className="w-full max-w-lg p-4 space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Property</h3>
            <input 
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Property Title"
              value={editing.title} 
              onChange={(e) => setEditing({ ...editing, title: e.target.value })} 
            />
            <div className="space-y-2">
            <input 
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Property Location"
              value={editing.location} 
              onChange={(e) => setEditing({ ...editing, location: e.target.value })} 
            />
              <div className="text-xs text-gray-500 dark:text-gray-400">
                💡 Tip: Use "Use My Location" when creating new properties for precise coordinates
              </div>
            </div>
            <div className="relative">
              <input 
                type="number" 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Price (₦)"
                value={editing.price} 
                readOnly
                disabled
              />
              <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Price cannot be edited</span>
              </div>
            </div>
            <textarea 
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Description"
              value={editing.description} 
              onChange={(e) => setEditing({ ...editing, description: e.target.value })} 
            />
            <div className="space-y-3">
            <div className="flex gap-2">
              <Input 
                type="number" 
                  className="w-1/2" 
                placeholder="Bedrooms"
                value={editing.bedrooms} 
                onChange={(e) => setEditing({ ...editing, bedrooms: e.target.value })} 
              />
              <Input 
                type="number" 
                  className="w-1/2" 
                placeholder="Bathrooms"
                value={editing.bathrooms} 
                onChange={(e) => setEditing({ ...editing, bathrooms: e.target.value })} 
              />
              </div>
              <Input 
                type="number" 
                className="w-full" 
                placeholder="Size (sq ft) - Optional"
                value={editing.size} 
                onChange={(e) => setEditing({ ...editing, size: e.target.value })} 
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={submitEdit}
              >
                Save
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Image Viewer Modal */}
      {/* Custom Image Viewer Modal */}
      {viewingProperty && selectedImageIndex !== null && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-[90vw] h-[90vh] max-w-6xl max-h-[80vh] bg-black rounded-lg overflow-hidden shadow-2xl">
            {/* Close Button */}
            <button
              onClick={closeImageViewer}
              className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 bg-black/50 rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold transition-colors"
              title="Close"
            >
              ×
            </button>

            {/* Loading Spinner */}
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-40">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {/* Image Container */}
            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={
                  viewingProperty && typeof viewingProperty.images[selectedImageIndex] === "string" 
                    ? viewingProperty.images[selectedImageIndex] 
                    : viewingProperty?.images[selectedImageIndex]?.url
                }
                alt={`${viewingProperty?.title} - Image ${selectedImageIndex + 1}`}
                className={`max-w-full max-h-full w-auto h-auto object-contain transition-opacity duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
            </div>
            
            {/* Navigation arrows */}
            {viewingProperty && viewingProperty.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-2xl hover:text-gray-300 bg-black/50 rounded-full w-10 h-10 flex items-center justify-center"
                >
                  ‹
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-2xl hover:text-gray-300 bg-black/50 rounded-full w-10 h-10 flex items-center justify-center"
                >
                  ›
                </button>
              </>
            )}

            {/* Image counter */}
            {viewingProperty && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                {selectedImageIndex + 1} of {viewingProperty.images.length}
              </div>
            )}

            {/* Property title */}
            {viewingProperty && (
              <div className="absolute top-4 left-4 text-white text-lg font-semibold bg-black/50 px-3 py-1 rounded">
                {viewingProperty.title}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        property={selectedProperty}
      />
    </div>
  );
}
