import { useState, useEffect } from "react";
import { useInstallPrompt } from "../hooks/useInstallPrompt";
import toast from "react-hot-toast";

/**
 * Install prompt component - shows after login/registration
 * @param {boolean} show - Whether to show the prompt
 * @param {function} onClose - Callback when prompt is closed
 */
const InstallPrompt = ({ show, onClose }) => {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the prompt before
    const hasSeenPrompt = localStorage.getItem("elocab_install_prompt_seen");
    if (hasSeenPrompt === "true") {
      setDismissed(true);
    }
  }, []);

  // Don't show if:
  // - Not supposed to show
  // - Already installed
  // - Not installable
  // - User dismissed it
  if (!show || isInstalled || !isInstallable || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      toast.success("App installed successfully! 🎉");
    }
    handleClose();
  };

  const handleClose = () => {
    // Mark as seen so we don't show it again
    localStorage.setItem("elocab_install_prompt_seen", "true");
    setDismissed(true);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-full p-4">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Install ELOCAB App
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-center mb-6">
          Add ELOCAB to your home screen for quick access and a better
          experience!
        </p>

        {/* Benefits */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-gray-700">
            <svg
              className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Launch directly from your home screen</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <svg
              className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Works offline with cached data</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <svg
              className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Receive push notifications</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
          >
            Maybe Later
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all font-semibold shadow-lg"
          >
            Install Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
