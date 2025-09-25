import { useState } from "react";
import { FaShare, FaWhatsapp, FaEnvelope, FaCopy, FaTimes } from "react-icons/fa";
import { apiFetch } from "../../lib/api.js";
import Modal from "./Modal.jsx";
import Button from "./Button.jsx";

const ShareModal = ({ isOpen, onClose, property }) => {
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateShareLink = async () => {
    if (!property?._id) return;
    
    try {
      setLoading(true);
      const response = await apiFetch(`/share/property/${property._id}`, {
        method: "POST"
      });
      
      if (response.success) {
        setShareUrl(response.shareUrl);
      }
    } catch (error) {
      console.error("Error generating share link:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const shareToWhatsApp = () => {
    const message = `Check out this property on RentDirect: ${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareToEmail = () => {
    const subject = `Property Recommendation - ${property?.title}`;
    const body = `Hi! I found this property on RentDirect that might interest you:\n\n${shareUrl}\n\nCheck it out!`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  const handleClose = () => {
    setShareUrl("");
    setCopied(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Share Property">
      <div className="space-y-4">
        {/* Property Preview */}
        {property && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {property.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {property.location}
            </p>
            <p className="text-lg font-bold text-primary">
              ₦{property.price?.toLocaleString()}/year
            </p>
          </div>
        )}

        {/* Generate Share Link */}
        {!shareUrl ? (
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Generate a shareable link for this property. Friends will need to sign up to view it.
            </p>
            <Button
              onClick={generateShareLink}
              loading={loading}
              className="w-full"
            >
              <FaShare className="w-4 h-4 mr-2" />
              Generate Share Link
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Share URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Share Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="px-3"
                >
                  <FaCopy className="w-4 h-4" />
                </Button>
              </div>
              {copied && (
                <p className="text-sm text-green-600 mt-1">Copied to clipboard!</p>
              )}
            </div>

            {/* Share Options */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Share via:
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={shareToWhatsApp}
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                >
                  <FaWhatsapp className="w-4 h-4 text-green-500" />
                  WhatsApp
                </Button>
                
                <Button
                  onClick={shareToEmail}
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                >
                  <FaEnvelope className="w-4 h-4 text-blue-500" />
                  Email
                </Button>
              </div>
            </div>

            {/* Info */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> When someone clicks your share link, they'll need to create an account before they can view the property details.
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ShareModal;
