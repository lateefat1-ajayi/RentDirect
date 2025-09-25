import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { apiFetch, apiUpload } from "../../lib/api";
import { toast } from "react-toastify";
import { FaUpload, FaFileAlt, FaCheckCircle, FaClock, FaTimesCircle, FaSync } from "react-icons/fa";

export default function LandlordVerification() {
  const navigate = useNavigate();
  const [verificationData, setVerificationData] = useState({
    businessName: "",
    businessAddress: "",
    phoneNumber: "",
    identificationType: "national_id",
    identificationNumber: "",
    bankName: "",
    accountNumber: "",
    accountName: ""
  });
  const [documents, setDocuments] = useState({
    identification: null,
    utilityBill: null,
    bankStatement: null,
    propertyDocuments: null
  });
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Load saved form data after user profile is loaded
  useEffect(() => {
    if (userProfile) {
      loadSavedFormData();
    }
  }, [userProfile]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (verificationData.businessName || Object.values(documents).some(doc => doc)) {
      localStorage.setItem('landlordVerificationForm', JSON.stringify({
        verificationData,
        documents: Object.keys(documents).reduce((acc, key) => {
          if (documents[key]) {
            acc[key] = {
              name: documents[key].name,
              size: documents[key].size,
              type: documents[key].type
            };
          }
          return acc;
        }, {})
      }));
    }
  }, [verificationData, documents]);

  // Store object URLs for image previews
  const [imageUrls, setImageUrls] = useState({});

  // Create object URLs when documents change
  useEffect(() => {
    const newUrls = {};
    Object.keys(documents).forEach(key => {
      if (documents[key] && documents[key].type.startsWith('image/')) {
        newUrls[key] = URL.createObjectURL(documents[key]);
      }
    });
    
    // Cleanup old URLs before setting new ones
    setImageUrls(prevUrls => {
      Object.values(prevUrls).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
      return newUrls;
    });

    // Cleanup function for component unmount
    return () => {
      Object.values(newUrls).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [documents]);

  const fetchUserProfile = async (showLoading = true, forceRefresh = false) => {
    try {
      if (showLoading) setLoading(true);
      
      // First try to get from localStorage for immediate display
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const storedVerificationStatus = localStorage.getItem("verificationStatus");
      
      if (userData && Object.keys(userData).length > 0) {
        setUserProfile(userData);
        
        // Use stored verification status if available
        if (storedVerificationStatus) {
          setVerificationStatus(storedVerificationStatus);
        }
        
        // If we have verification status and not forcing refresh, don't fetch from backend
        if (storedVerificationStatus && !forceRefresh) {
          if (showLoading) setLoading(false);
          return;
        }
      }
      
      // Only fetch fresh data from backend if needed
      try {
        const freshProfile = await apiFetch("/users/profile");
        
        // Only update verification status if it has actually changed
        if (!storedVerificationStatus || storedVerificationStatus !== freshProfile.verificationStatus) {
          setUserProfile(freshProfile);
          setVerificationStatus(freshProfile.verificationStatus);
          localStorage.setItem("user", JSON.stringify(freshProfile));
          localStorage.setItem("verificationStatus", freshProfile.verificationStatus);
          
          // Show toast if status changed
          if (storedVerificationStatus && storedVerificationStatus !== freshProfile.verificationStatus) {
            if (freshProfile.verificationStatus === "approved") {
              toast.success("Your verification has been approved!");
            } else if (freshProfile.verificationStatus === "rejected") {
              toast.error("Your verification was rejected. Please check the requirements and resubmit.");
            }
          }
        } else {
          // Just update the profile without changing verification status
          setUserProfile(freshProfile);
          localStorage.setItem("user", JSON.stringify(freshProfile));
        }
      } catch (error) {
        console.error("Error fetching fresh profile:", error);
        // If backend fetch fails, keep using localStorage data
        if (!userData || Object.keys(userData).length === 0) {
          toast.error("Failed to load profile data. Please refresh the page.");
        }
      }
    } catch (error) {
      console.error("Error parsing user profile:", error);
      toast.error("Error loading profile data");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const loadSavedFormData = () => {
    try {
      const savedForm = localStorage.getItem('landlordVerificationForm');
      if (savedForm) {
        const parsed = JSON.parse(savedForm);
        setVerificationData(parsed.verificationData || verificationData);
        // Note: We can't restore actual files from localStorage, only metadata
        // Users will need to re-upload files, but form data is preserved
      }
    } catch (error) {
      console.error("Error loading saved form data:", error);
    }
    
    // Pre-fill user information from profile
    if (userProfile) {
      setVerificationData(prev => ({
        ...prev,
        phoneNumber: userProfile.phone || prev.phoneNumber,
        businessName: userProfile.name || prev.businessName
      }));
    }
  };

  const handleInputChange = (e) => {
    setVerificationData({
      ...verificationData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e, documentType) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File size must be less than 5MB");
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload only JPG, PNG, or PDF files");
        return;
      }
      
      setDocuments({
        ...documents,
        [documentType]: file
      });
    }
  };

  const handleRemoveFile = (documentType) => {
    // Cleanup the object URL if it exists
    if (imageUrls[documentType]) {
      URL.revokeObjectURL(imageUrls[documentType]);
      setImageUrls(prev => {
        const newUrls = { ...prev };
        delete newUrls[documentType];
        return newUrls;
      });
    }
    
    setDocuments(prev => ({
      ...prev,
      [documentType]: null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!verificationData.businessName || !verificationData.businessAddress || !verificationData.phoneNumber) {
      toast.error("Please fill in all required business information fields");
      return;
    }
    
    if (!verificationData.identificationNumber) {
      toast.error("Please enter your identification number");
      return;
    }
    
    if (!documents.identification || !documents.utilityBill) {
      toast.error("Please upload required documents (ID and Utility Bill)");
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      
      // Add verification data
      Object.keys(verificationData).forEach(key => {
        if (verificationData[key]) {
          formData.append(key, verificationData[key]);
          console.log(`Added to formData: ${key} = ${verificationData[key]}`);
        }
      });
      
      // Add documents
      Object.keys(documents).forEach(key => {
        if (documents[key]) {
          formData.append(key, documents[key]);
          console.log(`Added document to formData: ${key} = ${documents[key].name} (${documents[key].size} bytes)`);
        }
      });

      console.log("Submitting verification with data:", {
        businessName: verificationData.businessName,
        businessAddress: verificationData.businessAddress,
        phoneNumber: verificationData.phoneNumber,
        identificationType: verificationData.identificationType,
        identificationNumber: verificationData.identificationNumber,
        documentCount: Object.keys(documents).filter(key => documents[key]).length
      });

      const response = await apiUpload("/landlord/verification", formData, { method: "POST" });
      
      console.log("Verification submission response:", response);
      
      toast.success("Verification request submitted successfully! Please wait for admin approval.");
      
      // Update user profile with new verification status
      const updatedProfile = { ...userProfile, verificationStatus: "pending" };
      localStorage.setItem("user", JSON.stringify(updatedProfile));
      setUserProfile(updatedProfile);
      
      // Clear saved form data from localStorage
      localStorage.removeItem('landlordVerificationForm');
      
      // Cleanup object URLs
      Object.values(imageUrls).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
      setImageUrls({});
      
      // Reset form
      setVerificationData({
        businessName: "",
        businessAddress: "",
        phoneNumber: "",
        identificationType: "national_id",
        identificationNumber: "",
        bankName: "",
        accountNumber: "",
        accountName: ""
      });
      setDocuments({
        identification: null,
        utilityBill: null,
        bankStatement: null,
        propertyDocuments: null
      });
      
    } catch (error) {
      console.error("Error submitting verification:", error);
      if (error.message) {
        toast.error(`Failed to submit verification request: ${error.message}`);
      } else {
        toast.error("Failed to submit verification request. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!userProfile) return null;
    
    switch (userProfile.verificationStatus) {
      case "approved":
        return (
          <div className="flex items-center gap-2 text-green-600">
            <FaCheckCircle />
            <span>Verified</span>
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center gap-2 text-yellow-600">
            <FaClock />
            <span>Pending Review</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-2 text-red-600">
            <FaTimesCircle />
            <span>Rejected</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <FaFileAlt />
            <span>Not Submitted</span>
          </div>
        );
    }
  };

  if (verificationStatus === "approved") {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
                <FaCheckCircle className="text-green-600 dark:text-green-400 text-4xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Verification Complete!
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Your account has been verified. You can now list properties on our platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate("/landlord/listings")}
                  className="px-8 py-3 text-lg"
                >
                  Start Listing Properties
                </Button>
                <Button 
                  onClick={() => fetchUserProfile(false, true)}
                  variant="outline"
                  className="px-4 py-3 flex items-center gap-2"
                  title="Refresh Status"
                  aria-label="Refresh Status"
                >
                  <FaSync className="w-4 h-4" />
                  Refresh Status
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (verificationStatus === "pending") {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-6">
                <FaClock className="text-yellow-600 dark:text-yellow-400 text-4xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Verification Pending
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Your verification request is being reviewed by our admin team. 
                You'll be notified once the review is complete.
              </p>
              {userProfile?.verificationNote && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> {userProfile.verificationNote}
                  </p>
                </div>
              )}
              <div className="flex justify-center">
                <Button 
                  onClick={() => fetchUserProfile(false, true)}
                  variant="outline"
                  className="px-6 py-3 flex items-center gap-2"
                  title="Refresh Status"
                  aria-label="Refresh Status"
                >
                  <FaSync className="w-4 h-4" />
                  Refresh Status
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (verificationStatus === "rejected") {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
                <FaTimesCircle className="text-red-600 dark:text-red-400 text-4xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Verification Rejected
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Your verification request was not approved. Please review the feedback below and resubmit with corrected information.
              </p>
              {userProfile?.verificationNote && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-6">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    <strong>Rejection Reason:</strong> {userProfile.verificationNote}
                  </p>
                </div>
              )}
              <div className="space-y-4">
                <Button 
                  onClick={() => {
                    // Clear the rejected status to allow resubmission
                    const updatedProfile = { ...userProfile, verificationStatus: null };
                    localStorage.setItem("user", JSON.stringify(updatedProfile));
                    setUserProfile(updatedProfile);
                    // Clear any saved form data to start fresh
                    localStorage.removeItem('landlordVerificationForm');
                    // Cleanup any existing object URLs
                    Object.values(imageUrls).forEach(url => {
                      if (url) URL.revokeObjectURL(url);
                    });
                    setImageUrls({});
                    toast.success("You can now resubmit your verification request");
                  }}
                  variant="primary"
                  className="px-8 py-3 text-lg"
                >
                  Resubmit Verification
                </Button>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click the button above to start a new verification request
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Get Verified</h1>
        {getStatusBadge()}
      </div>

      <Card className="p-6">
                 <div className="mb-6">
           <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
             {userProfile?.verificationStatus === "rejected" ? "Verification Resubmission" : "Verification Required"}
           </h2>
           <p className="text-gray-600 dark:text-gray-400">
             {userProfile?.verificationStatus === "rejected" 
               ? "Please review the previous feedback and submit corrected verification information."
               : "To list properties on our platform, you need to verify your identity and ownership. This helps ensure the safety and trust of our community."
             }
           </p>
           {userProfile?.verificationStatus === "rejected" && (
             <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
               <p className="text-sm text-yellow-700 dark:text-yellow-300">
               ⚠️ <strong>Resubmission:</strong> This is a new verification request. Please ensure all information is correct.
               </p>
             </div>
           )}
           <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
             <p className="text-sm text-green-700 dark:text-green-300">
               💾 <strong>Auto-save enabled:</strong> Your progress is automatically saved. You can leave and return anytime to continue where you left off.
             </p>
           </div>
         </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Business Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Business Name
                </label>
                <Input
                  name="businessName"
                  value={verificationData.businessName}
                  onChange={handleInputChange}
                  placeholder="Enter your business name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Business Address
                </label>
                <Input
                  name="businessAddress"
                  value={verificationData.businessAddress}
                  onChange={handleInputChange}
                  placeholder="Enter your business address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <Input
                  name="phoneNumber"
                  value={verificationData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  type="tel"
                  required
                />
              </div>
            </div>
          </div>

          {/* Identification */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Identification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ID Type
                </label>
                <select
                  name="identificationType"
                  value={verificationData.identificationType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                >
                  <option value="national_id">National ID</option>
                  <option value="passport">Passport</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="voters_card">Voter's Card</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ID Number
                </label>
                <Input
                  name="identificationNumber"
                  value={verificationData.identificationNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your ID number"
                  required
                />
              </div>
            </div>
          </div>

          {/* Bank Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Bank Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bank Name
                </label>
                <Input
                  name="bankName"
                  value={verificationData.bankName}
                  onChange={handleInputChange}
                  placeholder="Enter bank name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Number
                </label>
                <Input
                  name="accountNumber"
                  value={verificationData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Enter account number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Name
                </label>
                <Input
                  name="accountName"
                  value={verificationData.accountName}
                  onChange={handleInputChange}
                  placeholder="Enter account name"
                  required
                />
              </div>
            </div>
          </div>

          {/* Documents Upload */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Required Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Identification Document *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, "identification")}
                    className="hidden"
                    id="identification"
                    required
                  />
                  {documents.identification ? (
                    <div className="space-y-3">
                                             {documents.identification.type.startsWith('image/') ? (
                         <img
                           src={imageUrls.identification}
                           alt="ID Document Preview"
                           className="max-w-full h-32 object-contain mx-auto rounded border"
                         />
                       ) : (
                        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                          <FaFileAlt className="mx-auto text-gray-400 text-2xl mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            PDF Document: {documents.identification.name}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {documents.identification.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile("identification")}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="identification" className="cursor-pointer">
                      <FaUpload className="mx-auto text-gray-400 text-2xl mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Click to upload ID document
                      </p>
                    </label>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Utility Bill (NEPA, Water, etc.) *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, "utilityBill")}
                    className="hidden"
                    id="utilityBill"
                    required
                  />
                  {documents.utilityBill ? (
                    <div className="space-y-3">
                                             {documents.utilityBill.type.startsWith('image/') ? (
                         <img
                           src={imageUrls.utilityBill}
                           alt="Utility Bill Preview"
                           className="max-w-full h-32 object-contain mx-auto rounded border"
                         />
                       ) : (
                        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                          <FaFileAlt className="mx-auto text-gray-400 text-2xl mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            PDF Document: {documents.utilityBill.name}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {documents.utilityBill.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile("utilityBill")}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="utilityBill" className="cursor-pointer">
                      <FaUpload className="mx-auto text-gray-400 text-2xl mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Click to upload utility bill
                      </p>
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bank Statement (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, "bankStatement")}
                    className="hidden"
                    id="bankStatement"
                  />
                  {documents.bankStatement ? (
                    <div className="space-y-3">
                                             {documents.bankStatement.type.startsWith('image/') ? (
                         <img
                           src={imageUrls.bankStatement}
                           alt="Bank Statement Preview"
                           className="max-w-full h-32 object-contain mx-auto rounded border"
                         />
                       ) : (
                        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                          <FaFileAlt className="mx-auto text-gray-400 text-2xl mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            PDF Document: {documents.bankStatement.name}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {documents.bankStatement.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile("bankStatement")}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="bankStatement" className="cursor-pointer">
                      <FaUpload className="mx-auto text-gray-400 text-2xl mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Click to upload bank statement
                      </p>
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Property Documents (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, "propertyDocuments")}
                    className="hidden"
                    id="propertyDocuments"
                  />
                  {documents.propertyDocuments ? (
                    <div className="space-y-3">
                                             {documents.propertyDocuments.type.startsWith('image/') ? (
                         <img
                           src={imageUrls.propertyDocuments}
                           alt="Property Documents Preview"
                           className="max-w-full h-32 object-contain mx-auto rounded border"
                         />
                       ) : (
                        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                          <FaFileAlt className="mx-auto text-gray-400 text-2xl mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            PDF Document: {documents.propertyDocuments.name}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {documents.propertyDocuments.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile("propertyDocuments")}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="propertyDocuments" className="cursor-pointer">
                      <FaUpload className="mx-auto text-gray-400 text-2xl mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Click to upload property docs
                      </p>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Important Notes:</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• All documents must be clear and legible</li>
              <li>• File size must be less than 5MB per document</li>
              <li>• Accepted formats: JPG, PNG, PDF</li>
              <li>• Verification typically takes 1-3 business days</li>
              <li>• You'll be notified via email once verified</li>
            </ul>
          </div>

          {/* Platform Fee Consent */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Platform Fee Agreement
            </h3>
            <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
              By submitting this verification request, you agree to RentDirect's platform fee structure:
            </p>
            <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1 mb-3">
              <li>• 5% platform fee on successful rent transactions</li>
              <li>• Fee is deducted from the total rent amount</li>
              <li>• Landlord receives 95% of the rent payment</li>
              <li>• No fees for listing properties or other platform features</li>
            </ul>
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="platformFeeConsent"
                required
                className="mt-1"
              />
              <label htmlFor="platformFeeConsent" className="text-blue-800 dark:text-blue-200 text-sm">
                I understand and agree to the 5% platform fee on successful transactions
              </label>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (window.confirm("Are you sure you want to clear the form? All entered data will be lost.")) {
                  setVerificationData({
                    businessName: "",
                    businessAddress: "",
                    phoneNumber: "",
                    identificationType: "national_id",
                    identificationNumber: "",
                    bankName: "",
                    accountNumber: "",
                    accountName: ""
                  });
                  setDocuments({
                    identification: null,
                    utilityBill: null,
                    bankStatement: null,
                    propertyDocuments: null
                  });
                  localStorage.removeItem('landlordVerificationForm');
                  toast.success("Form cleared successfully");
                }
              }}
              className="px-6"
            >
              Clear Form
            </Button>
            <Button
              type="submit"
              disabled={loading}
              isLoading={loading}
              className="px-8"
            >
              {loading ? "Submitting..." : "Submit Verification Request"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
