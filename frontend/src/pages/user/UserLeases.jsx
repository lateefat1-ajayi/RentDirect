import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { apiFetch } from "../../lib/api";
import { FaFileContract, FaCalendarAlt, FaHome, FaMoneyBillWave, FaCheckCircle, FaClock, FaTimesCircle, FaFlag, FaDownload } from "react-icons/fa";
import ReportIssueModal from "../../components/ui/ReportIssueModal";
import { useRef } from "react";

export default function UserLeases() {
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentStatuses, setPaymentStatuses] = useState({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportContext, setReportContext] = useState(null);
  const [selectedLease, setSelectedLease] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const fileInputRef = useRef(null);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchLeases();
  }, []);

  const fetchLeases = async () => {
    try {
      const data = await apiFetch("/leases");
      const leasesArray = Array.isArray(data) ? data : [];
      setLeases(leasesArray);
      
      // Check payment status for each lease
      const statusPromises = leasesArray.map(async (lease) => {
        try {
          const response = await apiFetch(`/payments/lease/${lease._id}`);
          console.log(`Payment status for lease ${lease._id}:`, response);
          // Check if there's any successful payment
          const successfulPayment = Array.isArray(response) ? response.find(p => p.status === "success") : null;
          return {
            leaseId: lease._id,
            status: successfulPayment ? "success" : (Array.isArray(response) && response.length > 0 ? response[0].status : null)
          };
        } catch (err) {
          console.error(`Error fetching payments for lease ${lease._id}:`, err);
          return { leaseId: lease._id, status: null };
        }
      });
      
      const statuses = await Promise.all(statusPromises);
      const statusMap = {};
      statuses.forEach(({ leaseId, status }) => {
        statusMap[leaseId] = status;
      });
      setPaymentStatuses(statusMap);
    } catch (err) {
      console.error("Failed to fetch leases:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <FaCheckCircle className="mr-1" />
            Active
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <FaClock className="mr-1" />
            Pending
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <FaTimesCircle className="mr-1" />
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return "Invalid Date";
    }
  };

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1;
    const width = 500;
    const height = 200;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111827";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    setHasDrawn(false);
  };

  const openSignatureModal = (lease) => {
    setSelectedLease(lease);
    setShowSignatureModal(true);
    setTimeout(() => initCanvas(), 0);
  };

  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };
  const handlePointerDown = (e) => {
    if (!canvasRef.current) return;
    isDrawingRef.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    e.preventDefault();
  };
  const handlePointerMove = (e) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getCanvasPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
    e.preventDefault();
  };
  const handlePointerUp = (e) => { isDrawingRef.current = false; e.preventDefault(); };
  const clearSignature = () => initCanvas();

  const saveSignature = async (dataUrl) => {
    if (!selectedLease) return;
    try {
      await apiFetch(`/leases/${selectedLease._id}/signature`, {
        method: "POST",
        body: JSON.stringify({ role: "tenant", signature: dataUrl })
      });
      setShowSignatureModal(false);
      await fetchLeases();
    } catch (err) {}
  };
  const saveCanvasSignature = async () => {
    if (!canvasRef.current) return;
    if (!hasDrawn) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    await saveSignature(dataUrl);
  };
  const uploadSignatureFile = async (file) => {
    if (!file) return;
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    await saveSignature(dataUrl);
  };
  const downloadLease = async (leaseId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/leases/${leaseId}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lease-${leaseId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Leases</h1>
      </div>

      {leases.length === 0 ? (
        <Card className="p-8 text-center">
          <FaFileContract className="text-gray-400 text-6xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Leases Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You don't have any active leases yet. Leases will appear here once your applications are approved.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {leases.map((lease) => {
            const paymentStatus = paymentStatuses[lease._id];
            const isPaid = paymentStatus === "success";
            
            return (
              <Card
                key={lease._id}
                className="p-4 rounded-none border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div className="flex flex-col gap-3">
                  {/* Header like applicants card */}
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex items-center gap-2">
                      <FaFileContract className="text-blue-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate max-w-[260px]">
                        {lease.property?.title || "Property Title"}
                      </h3>
                    </div>
                    {getStatusBadge(lease.status)}
                  </div>

                  {/* Meta grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <div className="space-y-0.5">
                      <p className="text-xs text-gray-500">Property</p>
                      <p className="truncate">{lease.property?.title || "N/A"}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="truncate">{formatDate(lease.startDate)} → {formatDate(lease.endDate)}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs text-gray-500">Rent</p>
                      <p className="truncate">₦{lease.rentAmount?.toLocaleString() || "N/A"}</p>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                    <button
                      type="button"
                      className="text-sm text-teal-600 hover:underline bg-transparent p-0"
                      onClick={() => {
                        setReportContext({ leaseId: lease._id, againstUser: lease.landlord, againstRole: 'landlord' });
                        setShowReportModal(true);
                      }}
                    >
                      Report issue
                    </button>
                    <div className="flex items-center gap-2">
                      {isPaid ? (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-xs text-green-800 dark:text-green-300 whitespace-nowrap"><FaCheckCircle className="w-3 h-3" /> Paid</div>
                      ) : (
                        <Link to={`/user/payments/${lease._id}/pay`}>
                          <Button size="sm" className="whitespace-nowrap">Pay Rent</Button>
                        </Link>
                      )}
                      {lease.tenantSignatureUrl && lease.landlordSignatureUrl && (
                        <Button variant="outline" size="sm" className="p-2" onClick={() => downloadLease(lease._id)} title="Download Lease" aria-label="Download Lease">
                          <FaDownload className="w-4 h-4" />
                        </Button>
                      )}
                      {!lease.tenantSignatureUrl && (
                        <Button size="sm" className="whitespace-nowrap" onClick={() => openSignatureModal(lease)}>Sign</Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {showReportModal && (
        <ReportIssueModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          leaseId={reportContext?.leaseId}
          againstUser={reportContext?.againstUser}
          againstRole={reportContext?.againstRole}
          reporterRole="tenant"
        />
      )}

      {showSignatureModal && selectedLease && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tenant Signature</h3>
              <button onClick={() => setShowSignatureModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Draw your signature below or upload a signature image (PNG/JPG).</p>
            <div className="border rounded-md bg-white overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-full h-[200px] touch-none"
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" onClick={clearSignature}>Clear</Button>
              <Button onClick={saveCanvasSignature}>Save Signature</Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => uploadSignatureFile(e.target.files?.[0])}
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Upload Image</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Render ReportIssueModal outside cards
// We rely on reportContext to know the lease and target
// Add below component to render modal


// Report modal at component root
// Note: rendering at bottom-level return for simplicity

