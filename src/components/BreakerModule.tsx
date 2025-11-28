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

  return (
    <div
      data-testid={`breaker-module-${breaker.id}`}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-label={`${label} breaker, ${breaker.rating} amps, ${breaker.on ? 'on' : 'off'}. Press Enter to select.`}
      className={`absolute w-full ${heightClass} p-0.5 z-10 cursor-pointer group transition-all focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2 focus-visible:ring-offset-apple-gray-4 rounded-apple ${
        isSelected ? 'z-20' : ''
      }`}
      style={{ top: 0 }}
    >
      {/* Selection glow effect */}
      {isSelected && (
        <div className="absolute -inset-1 bg-apple-blue/20 rounded-apple-lg blur-sm" />
      )}
      <div
        className={`w-full h-full rounded-apple-lg flex items-center relative transition-all duration-200 breaker-surface ${
          isSelected
            ? 'ring-2 ring-apple-blue shadow-apple-glow'
            : 'hover:ring-1 hover:ring-apple-gray-2'
        }`}
      >
        <div
          className={`absolute ${
            isRightSide ? 'right-2 text-right' : 'left-2 text-left'
          } top-1 bottom-1 w-16 flex flex-col justify-center px-1`}
        >
          <div className="text-[9px] text-apple-gray-1 leading-tight truncate w-full">
            {label}
          </div>
          <div className="text-[11px] font-bold text-white">
            {breaker.rating}A
          </div>
        </div>

        {/* iOS-style toggle */}
        <div
          className={`absolute ${
            isRightSide ? 'left-1' : 'right-1'
          } w-12 h-full flex items-center justify-center`}
        >
          <button
            type="button"
            role="switch"
            aria-checked={breaker.on}
            aria-label={`Toggle ${label} breaker ${breaker.on ? 'off' : 'on'}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className={`w-10 h-6 md:w-9 md:h-5 rounded-full relative cursor-pointer transition-all duration-300 focus-visible:ring-2 focus-visible:ring-apple-blue ${
              breaker.on ? 'bg-apple-green' : 'bg-apple-gray-3'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 md:w-4 md:h-4 bg-white rounded-full shadow-apple-sm transition-transform duration-300 ${
                breaker.on ? 'translate-x-4 md:translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-1.5 -right-1.5 bg-apple-red text-white w-5 h-5 rounded-full text-[9px] items-center justify-center hidden group-hover:flex shadow-apple-sm hover:brightness-110 transition-all"
          aria-label={`Delete ${label} breaker`}
        >
          <i className="fas fa-times" aria-hidden="true" />
        </button>

        {/* Selection indicator */}
        {isSelected && (
          <div className={`absolute ${isRightSide ? '-left-1' : '-right-1'} top-1/2 -translate-y-1/2 w-1 h-6 bg-apple-blue rounded-full`} />
        )}
      </div>
    </div>
  );
};

export default BreakerModule;
