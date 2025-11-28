import React from 'react';

interface EmptySlotProps {
  slotNum: number;
  onClick: () => void;
}

const EmptySlot: React.FC<EmptySlotProps> = ({ slotNum, onClick }) => {
  return (
    <div
      data-testid={`empty-slot-${slotNum}`}
      onClick={onClick}
      className="w-full h-12 min-h-[44px] border border-dashed border-apple-gray-3 bg-apple-bg-tertiary/30 rounded-apple flex items-center justify-center cursor-pointer hover:bg-apple-blue/10 hover:border-apple-blue/50 hover:border-solid relative group transition-all duration-200 focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2 focus-visible:ring-offset-apple-gray-4 focus-visible:border-apple-blue"
      role="button"
      aria-label={`${slotNum} Add`}
      aria-describedby={`empty-slot-desc-${slotNum}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <span id={`empty-slot-desc-${slotNum}`} className="sr-only">
        Add breaker to this slot
      </span>
      {/* Slot number */}
      <div className="absolute left-2 text-xs text-apple-gray-1 font-mono group-hover:text-white transition-colors">
        {slotNum}
      </div>

      {/* Plus icon */}
      <div className="flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border border-dashed border-apple-gray-3 flex items-center justify-center group-hover:border-apple-blue group-hover:bg-apple-blue/20 transition-all duration-200">
          <i className="fas fa-plus text-apple-gray-1 group-hover:text-apple-blue text-xs transition-colors" aria-hidden="true" />
        </div>
      </div>

      {/* Hover tooltip */}
      <div className="absolute right-2 text-xs text-apple-gray-1 opacity-0 group-hover:opacity-100 transition-opacity">
        Add
      </div>
    </div>
  );
};

export default EmptySlot;
