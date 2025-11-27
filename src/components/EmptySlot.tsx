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
      className="w-full h-12 border border-dashed border-gray-500 bg-gray-700/50 flex items-center justify-center cursor-pointer hover:bg-gray-600/70 hover:border-blue-400 hover:border-solid relative group transition-all duration-200"
      role="button"
      aria-label={`Add breaker to slot ${slotNum}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Slot number */}
      <div className="absolute left-2 text-[10px] text-gray-500 font-mono group-hover:text-gray-400">
        {slotNum}
      </div>

      {/* Plus icon - shown on hover, number shown by default */}
      <div className="flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center group-hover:border-blue-400 group-hover:bg-blue-500/20 transition-all duration-200">
          <i className="fas fa-plus text-gray-500 group-hover:text-blue-400 text-xs transition-colors" aria-hidden="true" />
        </div>
      </div>

      {/* Hover tooltip */}
      <div className="absolute right-2 text-[9px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
        Click to add
      </div>
    </div>
  );
};

export default EmptySlot;