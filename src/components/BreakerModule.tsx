import React from 'react';
import type { Breaker } from '../types';

interface BreakerModuleProps {
  breaker: Breaker;
  slotNumber: number;
  isRightSide: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

const BreakerModule: React.FC<BreakerModuleProps> = ({
  breaker,
  slotNumber,
  isRightSide,
  isSelected,
  onSelect,
  onToggle,
  onDelete,
}) => {
  const isDoublePole = breaker.slots.length > 1;
  const heightClass = isDoublePole ? "h-[6.25rem]" : "h-12";
  const label = breaker.name || `Circuit ${slotNumber}`;

  const handleClass = isRightSide
    ? (breaker.on ? "-translate-x-3 bg-green-500" : "translate-x-2 bg-red-500")
    : (breaker.on ? "translate-x-3 bg-green-500" : "-translate-x-2 bg-red-500");

  return (
    <div
      data-testid={`breaker-module-${breaker.id}`}
      onClick={onSelect}
      className={`absolute w-full ${heightClass} p-0.5 z-10 cursor-pointer group transition-all ${
        isSelected ? 'z-20' : ''
      }`}
      style={{ top: 0 }}
    >
      {/* Selection glow effect */}
      {isSelected && (
        <div className="absolute -inset-1 bg-blue-500/30 rounded-lg blur-sm animate-pulse" />
      )}
      <div
        className={`w-full h-full breaker-black rounded flex items-center relative border-2 transition-all duration-200 ${
          isSelected
            ? 'border-blue-400 ring-2 ring-blue-400/50 shadow-lg shadow-blue-500/25'
            : 'border-black hover:border-gray-500'
        }`}
      >
        <div
          className={`absolute ${
            isRightSide ? 'right-1 text-right' : 'left-1 text-left'
          } top-1 bottom-1 w-16 flex flex-col justify-center px-1`}
        >
          <div className="text-[8px] text-white leading-tight opacity-70 truncate w-full">
            {label}
          </div>
          <div className="text-[10px] font-bold text-white">
            {breaker.rating}A
          </div>
        </div>

        <div
          className={`absolute ${
            isRightSide ? 'left-0' : 'right-0'
          } w-12 h-full flex items-center justify-center`}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="w-8 h-10 bg-gray-800 rounded border border-gray-600 relative overflow-hidden shadow-inner cursor-pointer"
          >
            <div
              className={`absolute top-1/2 left-1/2 w-4 h-6 -mt-3 -ml-2 rounded shadow transition-transform duration-200 ${handleClass}`}
            />
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-1 -right-1 bg-red-600 text-white w-4 h-4 rounded-full text-[8px] items-center justify-center hidden group-hover:flex z-20"
          aria-label={`Delete ${label} breaker`}
        >
          <i className="fas fa-times" aria-hidden="true" />
        </button>

        {/* Selection indicator */}
        {isSelected && (
          <div className={`absolute ${isRightSide ? '-left-1' : '-right-1'} top-1/2 -translate-y-1/2 w-2 h-6 bg-blue-500 rounded-full`} />
        )}
      </div>
    </div>
  );
};

export default BreakerModule;