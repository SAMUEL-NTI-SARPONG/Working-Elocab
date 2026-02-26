import { useState, useEffect } from "react";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // danger, warning, info
  requireType = null, // If set, user must type this string to confirm
  loading = false,
}) => {
  const [typeConfirm, setTypeConfirm] = useState("");
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTypeConfirm("");
      setIsClosing(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const handleConfirm = () => {
    if (requireType && typeConfirm !== requireType) return;
    onConfirm();
  };

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: (
        <svg
          className="w-6 h-6 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      ),
      iconBg: "bg-red-100",
      buttonClass: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    },
    warning: {
      icon: (
        <svg
          className="w-6 h-6 text-amber-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      ),
      iconBg: "bg-amber-100",
      buttonClass: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
    },
    info: {
      icon: (
        <svg
          className="w-6 h-6 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      iconBg: "bg-blue-100",
      buttonClass: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    },
  };

  const style = variantStyles[variant] || variantStyles.danger;
  const canConfirm = !requireType || typeConfirm === requireType;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${isClosing ? "opacity-0" : "opacity-100"}`}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-200 ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ animation: isClosing ? "none" : "modalSlideUp 0.3s ease-out" }}
      >
        {/* Icon */}
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-xl ${style.iconBg} shrink-0`}>
            {style.icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
        </div>

        {/* Message */}
        <p className="text-gray-600 text-sm leading-relaxed mb-5 pl-[60px]">
          {message}
        </p>

        {/* Type to confirm */}
        {requireType && (
          <div className="mb-5 pl-[60px]">
            <p className="text-xs text-gray-500 mb-2">
              Type <span className="font-bold text-red-600">{requireType}</span>{" "}
              to confirm:
            </p>
            <input
              type="text"
              value={typeConfirm}
              onChange={(e) => setTypeConfirm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              placeholder={requireType}
              autoFocus
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-sm transition-colors"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || loading}
            className={`px-5 py-2.5 text-white rounded-xl font-semibold text-sm transition-all focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${style.buttonClass}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from { transform: translateY(20px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ConfirmModal;
