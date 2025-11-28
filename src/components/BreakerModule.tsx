import React from 'react';
import type { Breaker } from '../types';

interface BreakerModuleProps {
  breaker: Breaker;
  slotNumber: number;
  isRightSide: boolean;
  isSelected: boolean;
  currentLoad?: number; // Current load in amps
  onSelect: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

const BreakerModule: React.FC<BreakerModuleProps> = ({
  breaker,
  slotNumber,
  isRightSide,
  isSelected,
  currentLoad = 0,
  onSelect,
  onToggle,
  onDelete,
}) => {
  const isDoublePole = breaker.slots.length > 1;
  const heightClass = isDoublePole ? "h-[6.25rem]" : "h-12";
  const label = breaker.name || `Circuit ${slotNumber}`;
  const loadPercentage = (currentLoad / breaker.rating) * 100;
  const isOverloaded = loadPercentage > 100;
  const isWarning = loadPercentage > 80;

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
      aria-label={`${label} ${breaker.rating}A`}
      aria-describedby={`breaker-desc-${breaker.id}`}
      className={`absolute w-full ${heightClass} p-0.5 z-10 cursor-pointer group transition-all focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2 focus-visible:ring-offset-apple-gray-4 rounded-apple ${
        isSelected ? 'z-20' : ''
      }`}
      style={{ top: 0 }}
    >
      <span id={`breaker-desc-${breaker.id}`} className="sr-only">
        Breaker is {breaker.on ? 'on' : 'off'}. Press Enter to select.
      </span>
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
            isRightSide ? 'right-1 md:right-2 text-right' : 'left-1 md:left-2 text-left'
          } top-1 bottom-1 w-14 md:w-20 flex flex-col justify-center`}
        >
          <div className="text-[10px] md:text-xs text-apple-gray-1 leading-tight truncate w-full" title={label}>
            {label}
          </div>
          <div className="flex items-baseline gap-0.5 md:gap-1">
            <span className={`text-[10px] md:text-xs font-bold ${
              isOverloaded ? 'text-apple-red' : isWarning ? 'text-apple-orange' : 'text-apple-green'
            }`}>
              {currentLoad > 0 ? currentLoad.toFixed(0) : '0'}
            </span>
            <span className="text-[10px] md:text-xs text-apple-gray-1">
              /{breaker.rating}A
            </span>
          </div>
        </div>

        {/* iOS-style toggle - fully responsive */}
        <div
          className={`absolute ${
            isRightSide ? 'left-0.5 md:left-1' : 'right-0.5 md:right-1'
          } w-12 md:w-14 h-full flex items-center justify-center`}
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
            className={`w-10 h-6 md:w-12 md:h-7 rounded-full relative cursor-pointer transition-all duration-300 focus-visible:ring-2 focus-visible:ring-apple-blue ${
              breaker.on ? 'bg-apple-green' : 'bg-apple-gray-3'
            }`}
          >
            <div
              className={`absolute top-1 md:top-1 w-4 h-4 md:w-5 md:h-5 bg-white rounded-full shadow-apple-sm transition-transform duration-300 ${
                breaker.on ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-1.5 -right-1.5 bg-apple-red text-white w-6 h-6 rounded-full text-xs items-center justify-center hidden group-hover:flex shadow-apple-sm hover:brightness-110 transition-all"
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
