import { useParams, useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { properties } from "../../data/properties";
import { toast } from "react-toastify";
import { apiFetch } from "../../lib/api";
import ProfileModal from "../../components/ui/ProfileModal";
import ReviewModal from "../../components/ui/ReviewModal";

export default function PropertyDetails() {
  const { propertyId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { profile } = useOutletContext();

  const [property, setProperty] = useState(state?.property || null);

  // If property not passed, fetch real property by id
  useEffect(() => {
    if (state?.property) return;
    (async () => {
      try {
        const data = await apiFetch(`/property/${propertyId}`);
        console.log("Fetched property data:", data);
        console.log("Landlord info:", data?.landlord);
        setProperty(data);
      } catch (err) {
        console.error("Failed to load property:", err.message);
      }
    })();
  }, [state?.property, propertyId]);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    // 1) Applicant Information
    fullName: "",
    dob: "",
    phone: "",
    email: "",
    currentAddress: "",

    // 2) Employment & Income
    employerName: "",
    jobTitle: "",
    employerPhone: "",
    monthlyIncome: "",

    // 3) Rental History
    previousAddress: "",
    previousLandlord: "",
    previousLandlordPhone: "",
    previousDuration: "",
    reasonForLeaving: "",

    // 4) Occupants
    occupantsCount: "",
    hasPets: "no",

    // 5) References
    referenceName: "",
    referenceRelationship: "",
    referencePhone: "",
    referenceEmail: "",

    // 6) Consent & Declaration
    agreeChecks: false,
    signature: "",

    // Other
    moveInDate: "",
    message: "",
  });

  useEffect(() => {
    if (!property) return;
    checkFavoriteStatus();
  }, [property]);

  const checkFavoriteStatus = async () => {
    try {
      const { favorited } = await apiFetch(`/favorites/check/${property._id || property.id}`);
      setSaved(favorited);
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const handleSaveToggle = async () => {
    if (!property || saving) return;
    setSaving(true);
    
    try {
      if (saved) {
        await apiFetch(`/favorites/${property._id || property.id}`, { method: "DELETE" });
        toast.success("Property removed from favorites!");
      } else {
        await apiFetch(`/favorites/${property._id || property.id}`, { method: "POST" });
        toast.success("Property added to favorites!");
      }
      setSaved(!saved);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorites");
    } finally {
      setSaving(false);
    }
  };

  const handleMessageLandlord = async () => {
    try {
      console.log("Property data when messaging:", property);
      console.log("Landlord info:", property?.landlord);
      
      if (!property || !property.landlord?._id) {
        console.error("Missing property or landlord info:", { property, landlord: property?.landlord });
        toast.error("Missing landlord information for this property.");
        return;
      }
      
      // First, try to find an existing conversation with this landlord
      try {
        const conversations = await apiFetch("/conversations");
        const existingConv = conversations.find(conv => 
          conv.counterpartId === property.landlord._id
        );
        
        if (existingConv) {
          // Navigate to existing conversation
          navigate(`/user/messages`, { 
            replace: false, 
            state: { conversationId: String(existingConv.id) } 
          });
          return;
        }
      } catch (findError) {
        console.error("Error finding existing conversation:", findError);
      }
      
      // If no existing conversation, create a new one
      const conversation = await apiFetch("/conversations", {
        method: "POST",
        body: JSON.stringify({ participantIds: [property.landlord._id] })
      });
      
      navigate(`/user/messages`, { 
        replace: false, 
        state: { conversationId: String(conversation.id) } 
      });
    } catch (err) {
      console.error("Error in handleMessageLandlord:", err);
      const msg = err.message || "Failed to start conversation";
      if (msg.toLowerCase().includes("unauthorized") || msg.toLowerCase().includes("token")) {
        toast.error("Please log in to message the landlord.");
      } else {
        toast.error("Failed to start conversation with landlord");
      }
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!property) return;
    setApplying(true);
    try {
      // Require a real database property (_id) to apply
      if (!property._id) {
        toast.error("This sample property isn't in the database. Please apply to a real listing.");
        setShowApply(false);
        return;
      }
      await apiFetch("/applications", {
        method: "POST",
        body: JSON.stringify({
          propertyId: property._id,
          applicant: {
            fullName: applyForm.fullName,
            dob: applyForm.dob,
            phone: applyForm.phone,
            email: applyForm.email,
            currentAddress: applyForm.currentAddress,
          },
          employment: {
            employerName: applyForm.employerName,
            jobTitle: applyForm.jobTitle,
            employerPhone: applyForm.employerPhone,
            monthlyIncome: applyForm.monthlyIncome,
          },
          rentalHistory: {
            previousAddress: applyForm.previousAddress,
            previousLandlord: applyForm.previousLandlord,
            previousLandlordPhone: applyForm.previousLandlordPhone,
            previousDuration: applyForm.previousDuration,
            reasonForLeaving: applyForm.reasonForLeaving,
          },
          occupants: {
            count: applyForm.occupantsCount,
            hasPets: applyForm.hasPets === "yes",
          },
          reference: {
            name: applyForm.referenceName,
            relationship: applyForm.referenceRelationship,
            phone: applyForm.referencePhone,
            email: applyForm.referenceEmail,
          },
          consent: {
            agreeChecks: applyForm.agreeChecks,
            signature: applyForm.signature,
          },
          moveInDate: applyForm.moveInDate,
          message: applyForm.message,
        }),
      });
      toast.success("Application submitted!");
      setShowApply(false);
      setApplyForm({
        fullName: "",
        dob: "",
        phone: "",
        email: "",
        currentAddress: "",
        employerName: "",
        jobTitle: "",
        employerPhone: "",
        monthlyIncome: "",
        previousAddress: "",
        previousLandlord: "",
        previousLandlordPhone: "",
        previousDuration: "",
        reasonForLeaving: "",
        occupantsCount: "",
        hasPets: "no",
        referenceName: "",
        referenceRelationship: "",
        referencePhone: "",
        referenceEmail: "",
        agreeChecks: false,
        signature: "",
        moveInDate: "",
        message: "",
      });
    } catch (err) {
      const msg = err.message || "Failed to submit application";
      if (msg.toLowerCase().includes("unauthorized") || msg.toLowerCase().includes("token")) {
        toast.error("Please log in to apply for a property");
      } else {
        toast.error(msg);
      }
    } finally {
      setApplying(false);
    }
  };

  if (!property) return <p className="p-6 text-sm text-gray-500">Property not found.</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">{property.title}</h1>
      <p className="text-sm text-gray-500">{property.location}</p>
      <p className="text-lg font-semibold mt-1">₦{property.price?.toLocaleString()}/year</p>

      <div className="flex gap-2 overflow-x-auto">
        {(Array.isArray(property.images) ? property.images : []).map((img, idx) => {
          const src = typeof img === "string" ? img : img?.url;
          if (!src) return null;
          return (
            <img
              key={idx}
              src={src}
              alt={`${property.title} ${idx + 1}`}
              className="w-80 h-40 object-cover rounded-md"
            />
          );
        })}
      </div>

      <Card className="p-4">
        <p className="text-sm">{property.description}</p>
        <div className="mt-2 text-sm text-gray-600 flex gap-4">
          <span>Bedrooms: {property.bedrooms}</span>
          <span>Bathrooms: {property.bathrooms}</span>
          <span>Area: {property.area}</span>
        </div>
      </Card>

      {/* Landlord Information */}
      {property?.landlord && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Property Owner</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                  {property.landlord.name?.charAt(0)?.toUpperCase() || "L"}
                </span>
              </div>
              <div>
                <p className="font-medium">{property.landlord.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {property.landlord.verificationStatus === "approved" ? "✓ Verified Landlord" : "Landlord"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowProfileModal(true)}
                className="px-3 py-1 text-xs"
              >
                View Profile
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowReviewModal(true)}
                className="px-3 py-1 text-xs"
              >
                Leave Review
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="primary" onClick={() => setShowApply(true)}>Apply Now</Button>
        <Button variant={saved ? "secondary" : "outline"} onClick={handleSaveToggle} disabled={saving}>
          {saving ? "Updating..." : (saved ? "Remove from Favorites" : "Add to Favorites")}
        </Button>
        <Button variant="outline" onClick={handleMessageLandlord}>Message Landlord</Button>
      </div>

      {showApply && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md p-5">
            <h2 className="text-lg font-semibold mb-3">Apply for {property.title}</h2>
            <form onSubmit={handleApplySubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* 1. Applicant Information */}
              <div>
                <h3 className="font-semibold text-sm mb-2">Applicant Information</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm mb-1">Full Name</label>
                    <input type="text" className="w-full rounded border px-3 py-2 bg-transparent" value={applyForm.fullName} onChange={(e) => setApplyForm({ ...applyForm, fullName: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Date of Birth</label>
                      <input type="date" className="w-full rounded border px-3 py-2 bg-transparent" value={applyForm.dob} onChange={(e) => setApplyForm({ ...applyForm, dob: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Phone Number</label>
                      <input type="tel" className="w-full rounded border px-3 py-2 bg-transparent" value={applyForm.phone} onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Email Address</label>
                    <input type="email" className="w-full rounded border px-3 py-2 bg-transparent" value={applyForm.email} onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Current Residential Address</label>
                    <input type="text" className="w-full rounded border px-3 py-2 bg-transparent" value={applyForm.currentAddress} onChange={(e) => setApplyForm({ ...applyForm, currentAddress: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* 2. Employment & Income */}
              <div>
                <h3 className="font-semibold text-sm mb-2">Employment & Income</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Employer Name</label>
                      <input type="text" className="w-full rounded border px-3 py-2 bg-transparent" value={applyForm.employerName} onChange={(e) => setApplyForm({ ...applyForm, employerName: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Job Title</label>
                      <input type="text" className="w-full rounded border px-3 py-2 bg-transparent" value={applyForm.jobTitle} onChange={(e) => setApplyForm({ ...applyForm, jobTitle: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Employer Contact</label>
                      <input type="tel" className="w-full rounded border px-3 py-2 bg-transparent" value={applyForm.employerPhone} onChange={(e) => setApplyForm({ ...applyForm, employerPhone: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Monthly Income</label>
                      <input type="number" className="w-full rounded border px-3 py-2 bg-transparent" value={applyForm.monthlyIncome} onChange={(e) => setApplyForm({ ...applyForm, monthlyIncome: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Rental History */}
              <div>
                <h3 className="font-semibold text-sm mb-2">Rental History</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm mb-1">Current/Previous Address</label>
                    <input type="text" className="w-full rounded border px-3 py-2 bg-transparent" value={applyForm.previousAddress} onChange={(e) => setApplyForm({ ...applyForm, previousAddress: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Landlord/Manager Name</label>
                      <input type="text" className="w-full rounded border px-3 py-2 bg-transparent" value={applyForm.previousLandlord} onChange={(e) => setApplyForm({ ...applyForm, previousLandlord: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Landlord Contact</label>
                      <input type="tel" className="w-full rounded border px-3 py-2 bg-transparent" value={applyForm.previousLandlordPhone} onChange={(e) => setApplyForm({ ...applyForm, previousLandlordPhone: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Duration at Residence</label>
                      <input type="text" className="w-full rounded border px-3 py-2 bg-transparent" placeholder="e.g., 2 years" value={applyForm.previousDuration} onChange={(e) => setApplyForm({ ...applyForm, previousDuration: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Reason for Leaving</label>
                      <input type="text" className="w-full rounded border px-3 py-2 bg-transparent" value={applyForm.reasonForLeaving} onChange={(e) => setApplyForm({ ...applyForm, reasonForLeaving: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Occupants */}
              <div>
                <h3 className="font-semibold text-sm mb-2">Occupants</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1">Number of Occupants</label>
                    <input type="number" min="1" className="w-full rounded border px-3 py-2 bg-transparent" value={applyForm.occupantsCount} onChange={(e) => setApplyForm({ ...applyForm, occupantsCount: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Any Pets?</label>
                    <select className="w-full rounded border px-3 py-2 bg-transparent" value={applyForm.hasPets} onChange={(e) => setApplyForm({ ...applyForm, hasPets: e.target.value })}>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 5. References */}
              <div>
                <h3 className="font-semibold text-sm mb-2">References</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Reference Name</label>
                      <input type="text" className="w-full rounded border px-3 py-2 bg-transparent" value={applyForm.referenceName} onChange={(e) => setApplyForm({ ...applyForm, referenceName: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Relationship</label>
                      <input type="text" className="w-full rounded border px-3 py-2 bg-transparent" value={applyForm.referenceRelationship} onChange={(e) => setApplyForm({ ...applyForm, referenceRelationship: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Reference Phone</label>
                      <input type="tel" className="w-full rounded border px-3 py-2 bg-transparent" value={applyForm.referencePhone} onChange={(e) => setApplyForm({ ...applyForm, referencePhone: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Reference Email</label>
                      <input type="email" className="w-full rounded border px-3 py-2 bg-transparent" value={applyForm.referenceEmail} onChange={(e) => setApplyForm({ ...applyForm, referenceEmail: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Consent & Declaration */}
              <div>
                <h3 className="font-semibold text-sm mb-2">Consent & Declaration</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={applyForm.agreeChecks} onChange={(e) => setApplyForm({ ...applyForm, agreeChecks: e.target.checked })} />
                    I agree to background and reference checks
                  </label>
                  <div>
                    <label className="block text-sm mb-1">Signature / Digital acceptance</label>
                    <input type="text" className="w-full rounded border px-3 py-2 bg-transparent" placeholder="Type your full name" value={applyForm.signature} onChange={(e) => setApplyForm({ ...applyForm, signature: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Additional */}
              <div>
                <h3 className="font-semibold text-sm mb-2">Additional Details</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm mb-1">Desired Move-in Date</label>
                    <input type="date" className="w-full rounded border px-3 py-2 bg-transparent" value={applyForm.moveInDate} onChange={(e) => setApplyForm({ ...applyForm, moveInDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Message to Landlord (optional)</label>
                    <textarea rows="3" className="w-full rounded border px-3 py-2 bg-transparent" value={applyForm.message} onChange={(e) => setApplyForm({ ...applyForm, message: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowApply(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" isLoading={applying}>
                  {applying ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userId={property?.landlord?._id}
        userRole={property?.landlord?.role}
        currentUserRole={profile?.role}
        currentUserId={profile?._id}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        targetUser={property?.landlord}
        type="landlord"
        onSubmit={() => {
          setShowReviewModal(false);
        }}
      />
    </div>
  );
}
