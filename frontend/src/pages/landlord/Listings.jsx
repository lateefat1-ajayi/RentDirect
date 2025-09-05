import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import { apiFetch, apiUpload } from "../../lib/api";
import { toast } from "react-toastify";

export default function LandlordListings() {
  const { profile } = useOutletContext();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newProperty, setNewProperty] = useState({
    title: "",
    location: "",
    price: "",
    description: "",
    bedrooms: 0,
    bathrooms: 0,
    size: "",
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

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
    if (statusLower === 'under_maintenance') return 'pending';
    
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

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files.slice(0, 5));
  };

  const submitProperty = async () => {
    try {
      if (submitting) return;
      
      // Check verification status
      if (profile?.verificationStatus !== "approved") {
        toast.error("You must be verified to list properties");
        return;
      }
      
      setSubmitting(true);
      const formData = new FormData();
      Object.entries(newProperty).forEach(([key, value]) => {
        formData.append(key, value);
      });
      imageFiles.forEach((file) => formData.append("images", file));

      await apiUpload("/property", formData, { method: "POST" });
      await fetchListings();
      setShowForm(false);
      setNewProperty({
        title: "",
        location: "",
        price: "",
        description: "",
        bedrooms: 0,
        bathrooms: 0,
        size: "",
      });
      setImageFiles([]);
      toast.success("Property added successfully!");
    } catch (err) {
      toast.error("Failed to add property: " + err.message);
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
        <Card className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {profile?.verificationStatus === "pending" ? (
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">⏳</span>
                </div>
              ) : (
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">⚠️</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                {profile?.verificationStatus === "pending" 
                  ? "Verification Pending" 
                  : "Verification Required"
                }
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {profile?.verificationStatus === "pending"
                  ? "Your verification request is being reviewed. You'll be able to list properties once approved."
                  : "You need to verify your account before you can list properties. Please complete the verification process."
                }
              </p>
              {profile?.verificationStatus !== "pending" && (
                <a 
                  href="/landlord/verification" 
                  className="inline-block mt-2 text-sm text-yellow-800 dark:text-yellow-200 underline hover:no-underline"
                >
                  Go to Verification →
                </a>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Add Property Form */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">My Listings</h1>
          {profile?.verificationStatus === "approved" ? (
            <button
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Cancel" : "Add Property"}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {profile?.verificationStatus === "pending" 
                  ? "Verification pending..." 
                  : "Verification required to list properties"
                }
              </span>
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed opacity-50"
                disabled
                title={profile?.verificationStatus === "pending" 
                  ? "Your verification is being reviewed" 
                  : "You need to verify your account first"
                }
              >
                Add Property
              </button>
            </div>
          )}
        </div>

        {showForm && (
          <Card className="p-4 space-y-4">
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={newProperty.title}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={newProperty.location}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={newProperty.price}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={newProperty.description}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <input
                type="number"
                name="bedrooms"
                placeholder="Bedrooms"
                value={newProperty.bedrooms}
                onChange={handleInputChange}
                className="w-1/3 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                name="bathrooms"
                placeholder="Bathrooms"
                value={newProperty.bathrooms}
                onChange={handleInputChange}
                className="w-1/3 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                name="size"
                placeholder="Size (sq ft)"
                value={newProperty.size}
                onChange={handleInputChange}
                className="w-1/3 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Images (up to 5)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300"
              />
              {imageFiles.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {imageFiles.map((f, i) => (
                    <div key={i} className="w-24 h-16 border rounded overflow-hidden relative">
                      <img
                        src={URL.createObjectURL(f)}
                        alt={`Preview ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setImageFiles(prev => prev.filter((_, index) => index !== i))}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50" onClick={submitProperty} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Property"}
            </button>
          </Card>
        )}
      </section>

      {/* Listings Grid */}
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
              {['all', 'available', 'rented', 'pending'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    statusFilter === status
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All' :
                   status === 'available' ? 'Available' :
                   status === 'rented' ? 'Rented' :
                   status === 'pending' ? 'Under Maintenance' :
                   'All'}
                  {status === 'all' ? ` (${listings.length})` : 
                   ` (${listings.filter(p => getStatusCategory(p.status) === status).length})`}
                </button>
              ))}
            </div>
            
            
            <div className="grid md:grid-cols-2 gap-4">
            {filteredListings.map((property) => (
              <Card key={property._id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg">{property.title}</h3>
                  {/* Property Status Badge */}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    getStatusCategory(property.status) === 'available' ? 'bg-green-100 text-green-800' :
                    getStatusCategory(property.status) === 'rented' ? 'bg-blue-100 text-blue-800' :
                    getStatusCategory(property.status) === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusCategory(property.status) === 'available' ? 'Available' :
                     getStatusCategory(property.status) === 'rented' ? 'Rented' :
                     getStatusCategory(property.status) === 'pending' ? 'Under Maintenance' :
                     property.status || 'Available'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{property.location}</p>
                <p className="font-semibold mt-2">₦{property.price}/year</p>
                <p className="text-sm mt-1">{property.bedrooms} bed / {property.bathrooms} bath</p>
                <div className="flex gap-2 mt-3">
                  <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={() => setEditing(property)}>
                    Edit
                  </button>
                  <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={() => setDeleteTarget(property)}>
                    Delete
                  </button>
                </div>
              </Card>
            ))}
            </div>
          </>
        )}
      </section>

      <Modal
        open={!!deleteTarget}
        title="Delete property?"
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await apiFetch(`/property/${deleteTarget._id}`, { method: "DELETE" });
            await fetchListings();
            toast.success("Property deleted");
          } catch (err) {
            toast.error("Delete failed: " + (err.message || ""));
          } finally {
            setDeleteTarget(null);
          }
        }}
        confirmText="Delete"
      >
        <p className="text-sm text-gray-600">This action cannot be undone.</p>
      </Modal>

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
            <input 
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Location"
              value={editing.location} 
              onChange={(e) => setEditing({ ...editing, location: e.target.value })} 
            />
            <input 
              type="number" 
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Price (₦)"
              value={editing.price} 
              onChange={(e) => setEditing({ ...editing, price: e.target.value })} 
            />
            <textarea 
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Description"
              value={editing.description} 
              onChange={(e) => setEditing({ ...editing, description: e.target.value })} 
            />
            <div className="flex gap-2">
              <input 
                type="number" 
                className="w-1/3 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Bedrooms"
                value={editing.bedrooms} 
                onChange={(e) => setEditing({ ...editing, bedrooms: e.target.value })} 
              />
              <input 
                type="number" 
                className="w-1/3 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Bathrooms"
                value={editing.bathrooms} 
                onChange={(e) => setEditing({ ...editing, bathrooms: e.target.value })} 
              />
              <input 
                type="number" 
                className="w-1/3 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Size (sq ft)"
                value={editing.size} 
                onChange={(e) => setEditing({ ...editing, size: e.target.value })} 
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button 
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" 
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button 
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors" 
                onClick={submitEdit}
              >
                Save
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
