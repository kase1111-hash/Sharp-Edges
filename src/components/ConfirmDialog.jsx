import { useEffect, useRef, useId } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  const cancelButtonRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  // Focus the cancel button when dialog opens, handle Escape key
  useEffect(() => {
    if (isOpen) {
      cancelButtonRef.current?.focus();

      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onCancel();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-fadeIn"
        style={{ animation: 'fadeIn 0.2s ease-out' }}
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="relative bg-white rounded-xl shadow-xl max-w-md mx-4 p-6 animate-fadeIn"
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2 bg-amber-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-amber-600" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 id={titleId} className="text-lg font-semibold text-gray-900">{title}</h3>
            <p id={descriptionId} className="mt-2 text-sm text-gray-600">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button
            ref={cancelButtonRef}
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
          >
            Discard & Start New
          </button>
        </div>
      </div>
    </div>
  );
}
