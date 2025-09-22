export default function Modal({ open, isOpen, title, children, onClose, onConfirm, confirmText = "Confirm", cancelText = "Cancel", size = "md" }) {
  const isModalOpen = open || isOpen;
  if (!isModalOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "w-[calc(100%-2rem)] max-w-none h-[calc(100vh-2rem)]"
  };

  const isFull = size === "full";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4">
      <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg ${isFull ? sizeClasses.full : `w-full ${sizeClasses[size]} max-h-[90vh]`} overflow-hidden flex flex-col`}>
        {title && <h3 className="text-lg font-semibold mb-3 p-4 pb-0 text-gray-900 dark:text-white">{title}</h3>}
        <div className={`flex-1 overflow-y-auto p-4 ${isFull ? "" : ""}`}>{children}</div>
        {(onConfirm || onClose) && (
          <div className="flex justify-end gap-2 p-4 pt-0">
            {onClose && <button className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200" onClick={onClose}>{cancelText}</button>}
            {onConfirm && <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={onConfirm}>{confirmText}</button>}
          </div>
        )}
      </div>
    </div>
  );
}


