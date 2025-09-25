import { useParams, useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { properties } from "../../data/properties";
import { toast } from "react-toastify";
import { apiFetch } from "../../lib/api";
import ProfileModal from "../../components/ui/ProfileModal";
import ReviewModal from "../../components/ui/ReviewModal";
import { FaArrowLeft, FaHeart, FaEnvelope, FaUser, FaStar, FaHome, FaBath, FaRulerCombined } from "react-icons/fa";
import { useRef } from "react";

export default function PropertyDetails() {
  const { propertyId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { profile } = useOutletContext();

  const [property, setProperty] = useState(state?.property || null);

  // If property not passed, fetch real property by id
  useEffect(() => {
    if (state?.property) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/property/${propertyId}`);
        console.log("Fetched property data:", data);
        console.log("Landlord info:", data?.landlord);
        setProperty(data);
      } catch (err) {
        console.error("Failed to load property:", err.message);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [state?.property, propertyId]);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const sigCanvasRef = useRef(null);
  const sigIsDrawingRef = useRef(false);
  const sigFileInputRef = useRef(null);
  const [sigHasDrawn, setSigHasDrawn] = useState(false);
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


    // 6) Consent & Declaration
    agreeChecks: false,
    signature: "",

    // Other
    moveInDate: "",
    message: "",
    leaseDuration: "", // Selected lease duration in years
  });

  useEffect(() => {
    if (!property) return;
    checkFavoriteStatus();
  }, [property]);

  // Pre-fill application form with user data
  useEffect(() => {
    if (profile) {
      setApplyForm(prev => ({
        ...prev,
        fullName: profile.name || prev.fullName,
        email: profile.email || prev.email,
        phone: profile.phone || prev.phone
      }));
    }
  }, [profile]);

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
          conv.participantId === property.landlord._id
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
    console.log("Form submitted", { property, applyForm });
    if (!property) {
      console.error("No property found");
      toast.error("Property not found");
      return;
    }
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
          consent: {
            agreeChecks: applyForm.agreeChecks,
            signature: applyForm.signature,
          },
          moveInDate: applyForm.moveInDate,
          message: applyForm.message,
          leaseDuration: parseInt(applyForm.leaseDuration),
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
        agreeChecks: false,
        signature: "",
        moveInDate: "",
        message: "",
        leaseDuration: "",
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

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!property) return <p className="p-6 text-sm text-gray-500">Property not found.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          aria-label="Go back"
        >
          <FaArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{property.title}</h1>
      </div>

      {/* Single Property Card */}
      <Card className="overflow-hidden">
        {/* Property Images */}
        <div className="flex gap-2 overflow-x-auto p-3 pb-0">
          {(Array.isArray(property.images) ? property.images : []).map((img, idx) => {
            const src = typeof img === "string" ? img : img?.url;
            if (!src) return null;
            return (
              <img
                key={idx}
                src={src}
                alt={`${property.title} ${idx + 1}`}
                className="w-64 h-40 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => {
                  setSelectedImageIndex(idx);
                  setShowImageModal(true);
                }}
              />
            );
          })}
        </div>

        {/* Property Header */}
        <div className="p-4 pb-3">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <span>📍</span>
                {property.location}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-teal-600">₦{property.price?.toLocaleString()}</p>
              <p className="text-sm text-gray-500">per year</p>
              {property.availableDurations && property.availableDurations.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">Available durations:</p>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {property.availableDurations.map((year) => (
                      <span key={year} className="text-xs bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 px-2 py-1 rounded">
                        {year}Y
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Property Features */}
          <div className="flex gap-4 mb-3">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <FaHome className="w-4 h-4" />
              <span>{property.bedrooms} Bedrooms</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <FaBath className="w-4 h-4" />
              <span>{property.bathrooms} Bathrooms</span>
            </div>
            {property.size && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <FaRulerCombined className="w-4 h-4" />
                <span>{property.size} sq ft</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{property.description}</p>
          </div>

          {/* Landlord Information */}
          {property?.landlord && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <FaUser className="w-4 h-4 text-teal-600" />
                Property Owner
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-teal-600 dark:text-teal-300">
                      {property.landlord.name?.charAt(0)?.toUpperCase() || "L"}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-base text-gray-900 dark:text-white">{property.landlord.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      {property.landlord.verificationStatus === "approved" ? (
                        <>
                          <FaStar className="w-3 h-3 text-green-500" />
                          Verified Landlord
                        </>
                      ) : (
                        "Landlord"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center gap-2"
                  >
                    <FaUser className="w-3 h-3" />
                    View Profile
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setShowReviewModal(true)}
                    className="flex items-center gap-2"
                  >
                    <FaStar className="w-3 h-3" />
                    Leave Review
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="primary" 
                size="md"
                onClick={() => {
                  console.log("Apply Now clicked", { property, showApply });
                  setShowApply(true);
                }}
                className="flex items-center gap-2"
              >
                Apply Now
              </Button>
              <Button
                variant={saved ? "secondary" : "outline"}
                size="md"
                onClick={handleSaveToggle}
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? "..." : (saved ? "❤️" : "🤍")}
              </Button>
              <Button 
                variant="outline" 
                size="md"
                onClick={handleMessageLandlord}
                className="flex items-center gap-2"
              >
                <FaEnvelope className="w-4 h-4" />
                Message Landlord
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {showApply && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md p-5">
            <h2 className="text-lg font-semibold mb-3">Apply for {property?.title || 'Property'}</h2>
            <form onSubmit={handleApplySubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* 1. Applicant Information */}
              <div>
                <h3 className="font-semibold text-sm mb-2">Applicant Information</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm mb-1">Full Name</label>
                    <Input 
                      type="text" 
                      value={applyForm.fullName} 
                      onChange={(e) => setApplyForm({ ...applyForm, fullName: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Date of Birth *</label>
                      <Input 
                        type="date" 
                        value={applyForm.dob} 
                        onChange={(e) => setApplyForm({ ...applyForm, dob: e.target.value })} 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Phone Number *</label>
                      <Input 
                        type="tel" 
                        value={applyForm.phone} 
                        onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })} 
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Email Address *</label>
                    <Input 
                      type="email" 
                      value={applyForm.email} 
                      onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Current Residential Address *</label>
                    <Input 
                      type="text" 
                      value={applyForm.currentAddress} 
                      onChange={(e) => setApplyForm({ ...applyForm, currentAddress: e.target.value })} 
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* 2. Employment & Income */}
              <div>
                <h3 className="font-semibold text-sm mb-2">Employment & Income</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Employer Name *</label>
                      <Input 
                        type="text" 
                        value={applyForm.employerName} 
                        onChange={(e) => setApplyForm({ ...applyForm, employerName: e.target.value })} 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Job Title *</label>
                      <Input 
                        type="text" 
                        value={applyForm.jobTitle} 
                        onChange={(e) => setApplyForm({ ...applyForm, jobTitle: e.target.value })} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Employer Contact *</label>
                      <Input 
                        type="tel" 
                        value={applyForm.employerPhone} 
                        onChange={(e) => setApplyForm({ ...applyForm, employerPhone: e.target.value })} 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Monthly Income *</label>
                      <Input 
                        type="number" 
                        value={applyForm.monthlyIncome} 
                        onChange={(e) => setApplyForm({ ...applyForm, monthlyIncome: e.target.value })} 
                        required 
                      />
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
                    <input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" value={applyForm.previousAddress} onChange={(e) => setApplyForm({ ...applyForm, previousAddress: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Landlord/Manager Name</label>
                      <input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" value={applyForm.previousLandlord} onChange={(e) => setApplyForm({ ...applyForm, previousLandlord: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Landlord Contact</label>
                      <input type="tel" className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" value={applyForm.previousLandlordPhone} onChange={(e) => setApplyForm({ ...applyForm, previousLandlordPhone: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Duration at Residence</label>
                      <input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="e.g., 2 years" value={applyForm.previousDuration} onChange={(e) => setApplyForm({ ...applyForm, previousDuration: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Reason for Leaving</label>
                      <input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" value={applyForm.reasonForLeaving} onChange={(e) => setApplyForm({ ...applyForm, reasonForLeaving: e.target.value })} />
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
                    <input type="number" min="1" className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" value={applyForm.occupantsCount} onChange={(e) => setApplyForm({ ...applyForm, occupantsCount: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Any Pets?</label>
                    <select className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={applyForm.hasPets} onChange={(e) => setApplyForm({ ...applyForm, hasPets: e.target.value })}>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                </div>
              </div>


              {/* 5. Consent & Declaration */}
              <div>
                <h3 className="font-semibold text-sm mb-2">Consent & Declaration</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={applyForm.agreeChecks} onChange={(e) => setApplyForm({ ...applyForm, agreeChecks: e.target.checked })} />
                    I agree to background and reference checks
                  </label>
                  <div>
                    <label className="block text-sm mb-1">Signature (draw or upload)</label>
                    <div className="border rounded-md bg-white overflow-hidden">
                      <canvas
                        ref={sigCanvasRef}
                        className="w-full h-[160px] touch-none"
                        onMouseDown={(e) => { sigIsDrawingRef.current = true; const ctx = sigCanvasRef.current.getContext('2d'); const r = sigCanvasRef.current.getBoundingClientRect(); ctx.beginPath(); ctx.moveTo(e.clientX - r.left, e.clientY - r.top); e.preventDefault(); }}
                        onMouseMove={(e) => { if (!sigIsDrawingRef.current) return; const ctx = sigCanvasRef.current.getContext('2d'); const r = sigCanvasRef.current.getBoundingClientRect(); ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#111827'; ctx.lineTo(e.clientX - r.left, e.clientY - r.top); ctx.stroke(); setSigHasDrawn(true); e.preventDefault(); }}
                        onMouseUp={() => { sigIsDrawingRef.current = false; }}
                        onMouseLeave={() => { sigIsDrawingRef.current = false; }}
                        onTouchStart={(e) => { sigIsDrawingRef.current = true; const ctx = sigCanvasRef.current.getContext('2d'); const r = sigCanvasRef.current.getBoundingClientRect(); const t = e.touches[0]; ctx.beginPath(); ctx.moveTo(t.clientX - r.left, t.clientY - r.top); e.preventDefault(); }}
                        onTouchMove={(e) => { if (!sigIsDrawingRef.current) return; const ctx = sigCanvasRef.current.getContext('2d'); const r = sigCanvasRef.current.getBoundingClientRect(); const t = e.touches[0]; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#111827'; ctx.lineTo(t.clientX - r.left, t.clientY - r.top); ctx.stroke(); setSigHasDrawn(true); e.preventDefault(); }}
                        onTouchEnd={() => { sigIsDrawingRef.current = false; }}
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => { const c = sigCanvasRef.current; if (!c) return; const ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height); setSigHasDrawn(false); }}>Clear</Button>
                      <input ref={sigFileInputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(f); }); setApplyForm({ ...applyForm, signature: String(dataUrl) }); }} />
                      <Button type="button" variant="outline" size="sm" onClick={() => sigFileInputRef.current?.click()}>Upload Image</Button>
                      <Button type="button" size="sm" onClick={() => { if (!sigCanvasRef.current) return; const dataUrl = sigCanvasRef.current.toDataURL('image/png'); setApplyForm({ ...applyForm, signature: dataUrl }); }}>Use Drawing</Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Your signature image will be submitted with your application.</p>
                  </div>
                </div>
              </div>

              {/* Additional */}
              <div>
                <h3 className="font-semibold text-sm mb-2">Additional Details</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm mb-1">Lease Duration *</label>
                    <select 
                      className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                      value={applyForm.leaseDuration} 
                      onChange={(e) => setApplyForm({ ...applyForm, leaseDuration: e.target.value })}
                      required
                    >
                      <option value="">Select duration</option>
                      {property?.availableDurations?.map((year) => (
                        <option key={year} value={year}>
                          {year} Year{year > 1 ? 's' : ''} - ₦{(property?.price * year)?.toLocaleString()}
                        </option>
                      ))}
                    </select>
                    <div className="text-xs text-gray-500 mt-1">
                      💡 Total rent calculated: Yearly rent × {applyForm.leaseDuration || 'X'} years
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Desired Move-in Date</label>
                    <input type="date" className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" value={applyForm.moveInDate} onChange={(e) => setApplyForm({ ...applyForm, moveInDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Message to Landlord (optional)</label>
                    <textarea rows="3" className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" value={applyForm.message} onChange={(e) => setApplyForm({ ...applyForm, message: e.target.value })} />
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

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90" onClick={() => setShowImageModal(false)}>
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10"
            >
              ×
            </button>
            <img
              src={Array.isArray(property.images) && property.images[selectedImageIndex] 
                ? (typeof property.images[selectedImageIndex] === "string" 
                    ? property.images[selectedImageIndex] 
                    : property.images[selectedImageIndex]?.url)
                : ""
              }
              alt={`${property.title} ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            {Array.isArray(property.images) && property.images.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {property.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(idx);
                    }}
                    className={`w-3 h-3 rounded-full ${
                      idx === selectedImageIndex ? 'bg-white' : 'bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
