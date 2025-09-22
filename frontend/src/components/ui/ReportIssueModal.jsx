import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { apiFetch } from "../../lib/api";
import { FaFlag, FaTimes } from "react-icons/fa";

export default function ReportIssueModal({ isOpen, onClose, leaseId, againstUser, againstRole, reporterRole }) {
  const [category, setCategory] = useState("payment");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await apiFetch("/reports", {
        method: "POST",
        body: JSON.stringify({
          leaseId,
          targetUserId: againstUser?._id,
          targetRole: againstRole,
          reporterRole,
          category,
          message,
        }),
      });
      onClose(true);
    } catch (e) {
      setError("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => onClose(false)} size="sm">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FaFlag className="text-red-600" />
            Report an Issue
          </h3>
          <Button variant="ghost" size="sm" onClick={() => onClose(false)}>
            <FaTimes />
          </Button>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          Reporting: <span className="font-medium">{againstUser?.name || "User"}</span> ({againstRole})
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Category</label>
            <select
              className="w-full rounded border px-3 py-2 bg-transparent"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="payment">Payment Issue</option>
              <option value="harassment">Harassment / Misconduct</option>
              <option value="fraud">Fraud / Scam</option>
              <option value="maintenance">Maintenance / Property Issue</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Describe the issue</label>
            <textarea
              rows="5"
              className="w-full rounded border px-3 py-2 bg-transparent"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide details so the admin can review and take action"
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="secondary" size="sm" onClick={() => onClose(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} isLoading={submitting} disabled={!message.trim()}>
            Submit Report
          </Button>
        </div>
      </div>
    </Modal>
  );
}


