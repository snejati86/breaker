import React, { useEffect, useCallback } from 'react';

interface BreakerTypeModalProps {
  isOpen: boolean;
  slotNumber: number;
  onSelect: (type: 'single' | 'double') => void;
  onClose: () => void;
}

const BreakerTypeModal: React.FC<BreakerTypeModalProps> = ({
  isOpen,
  slotNumber,
  onSelect,
  onClose,
}) => {
  const handleSelect = useCallback(
    (type: 'single' | 'double') => {
      onSelect(type);
      onClose();
    },
    [onSelect, onClose]
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      data-testid="modal-overlay"
      className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div
        data-testid="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
          <h2 id="modal-title" className="text-xl font-bold text-white">
            Install Breaker in Slot {slotNumber}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Select the breaker type for this slot
          </p>
        </div>

        {/* Options */}
        <div className="p-6 space-y-4">
          {/* Single Pole Option */}
          <button
            data-testid="single-pole-option"
            onClick={() => handleSelect('single')}
            className="w-full p-4 bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-blue-500 rounded-lg transition-all duration-200 text-left group"
          >
            <div className="flex items-start gap-4">
              <div
                data-testid="single-pole-icon"
                className="w-12 h-16 bg-gray-900 rounded border border-gray-500 flex items-center justify-center flex-shrink-0"
              >
                <div className="w-6 h-10 bg-gray-700 rounded border border-gray-500 relative">
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-green-500 rounded-sm" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                    Single Pole
                  </span>
                  <span className="px-2 py-0.5 bg-blue-900/50 text-blue-300 text-xs font-mono rounded">
                    120V
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  Standard circuits for outlets, lights, and small appliances
                </p>
              </div>
            </div>
          </button>

          {/* Double Pole Option */}
          <button
            data-testid="double-pole-option"
            onClick={() => handleSelect('double')}
            className="w-full p-4 bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-orange-500 rounded-lg transition-all duration-200 text-left group"
          >
            <div className="flex items-start gap-4">
              <div
                data-testid="double-pole-icon"
                className="w-12 h-16 bg-gray-900 rounded border border-gray-500 flex items-center justify-center flex-shrink-0"
              >
                <div className="flex gap-0.5">
                  <div className="w-5 h-12 bg-gray-700 rounded border border-gray-500 relative">
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-3 bg-orange-500 rounded-sm" />
                  </div>
                  <div className="w-5 h-12 bg-gray-700 rounded border border-gray-500 relative">
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-3 bg-orange-500 rounded-sm" />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors">
                    Double Pole
                  </span>
                  <span className="px-2 py-0.5 bg-orange-900/50 text-orange-300 text-xs font-mono rounded">
                    240V
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  Large appliances like dryers, ovens, and EV chargers
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-900 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BreakerTypeModal;
