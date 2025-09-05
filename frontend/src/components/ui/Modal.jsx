export default function Modal({ open, isOpen, title, children, onClose, onConfirm, confirmText = "Confirm", cancelText = "Cancel" }) {
  const isModalOpen = open || isOpen;
  if (!isModalOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md p-4">
        {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
        <div className="mb-4">{children}</div>
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700" onClick={onClose}>{cancelText}</button>
          <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}


