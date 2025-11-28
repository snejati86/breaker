import React from 'react';

interface MainBreakerProps {
  isOn: boolean;
  isTripped: boolean;
  limit: number;
  onToggle: () => void;
  onChangeLimit: (limit: number) => void;
}

const MainBreaker: React.FC<MainBreakerProps> = ({
  isOn,
  isTripped,
  limit,
  onToggle,
  onChangeLimit,
}) => {
  const powerState = isTripped ? 'tripped' : isOn ? 'on' : 'off';

  return (
    <div className={`w-full rounded-apple-xl p-4 flex flex-col items-center relative shadow-apple-lg mb-4 transition-all duration-300 ${
      powerState === 'on' ? 'bg-apple-bg-tertiary' :
      powerState === 'tripped' ? 'bg-apple-red/20 border border-apple-red' :
      'bg-apple-bg-secondary'
    }`}>
      <div className="absolute top-3 left-3 text-xs font-semibold text-apple-gray-1 uppercase tracking-wider">
        Main Service
      </div>

      {/* ON/OFF Status Badge - using dark text on green for WCAG AA contrast */}
      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
        powerState === 'on' ? 'bg-apple-green text-black' :
        powerState === 'tripped' ? 'bg-apple-red text-white animate-pulse' :
        'bg-apple-gray-3 text-apple-gray-1'
      }`}>
        {powerState === 'tripped' ? 'TRIPPED' : isOn ? 'ON' : 'OFF'}
      </div>

      {/* Service Limit Selector - Configuration (above toggle) */}
      <div className="mt-6 mb-3 flex flex-col items-center">
        <select
          value={limit}
          onChange={(e) => {
            e.stopPropagation();
            onChangeLimit(Number(e.target.value));
          }}
          className="bg-apple-bg-secondary border border-apple-separator rounded-lg px-4 py-2 text-lg font-bold text-apple-orange outline-none cursor-pointer hover:border-apple-orange/50 transition-colors min-w-[110px] text-center"
          title="Change Service Limit"
          aria-label="Change Service Limit"
        >
          <option value="100" className="bg-apple-bg-secondary text-white">100A</option>
          <option value="200" className="bg-apple-bg-secondary text-white">200A</option>
          <option value="400" className="bg-apple-bg-secondary text-white">400A</option>
        </select>
        <span className="text-xs text-white/60 mt-1.5 uppercase tracking-wide font-medium">Service Rating</span>
      </div>

      {/* Main Breaker Toggle - Operation (below config) */}
      <div className={`w-36 h-20 rounded-apple-lg relative flex items-center justify-center shadow-apple transition-all duration-300 ${
        powerState === 'on' ? 'bg-apple-bg-secondary border border-apple-green/30' :
        powerState === 'tripped' ? 'bg-apple-bg-secondary border border-apple-red' :
        'bg-apple-bg-secondary border border-apple-separator'
      }`}>
        <div className="absolute top-2 text-xs text-apple-gray-1 font-medium">MAIN</div>

        {/* iOS-style Toggle Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={isOn && !isTripped}
          aria-label={`Main breaker ${powerState === 'tripped' ? 'tripped - click to reset' : isOn ? 'on - click to turn off' : 'off - click to turn on'}`}
          className={`w-14 h-8 rounded-full relative cursor-pointer transition-all duration-300 focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2 focus-visible:ring-offset-apple-bg-secondary ${
            powerState === 'on' ? 'bg-apple-green' :
            powerState === 'tripped' ? 'bg-apple-red' :
            'bg-apple-gray-3'
          }`}
          onClick={onToggle}
          title={isTripped ? 'Click to reset' : isOn ? 'Click to turn OFF' : 'Click to turn ON'}
        >
          <div
            className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-apple-sm transition-transform duration-300 ${
              isOn && !isTripped ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
          {/* ON/OFF labels for accessibility */}
          <span className="sr-only">{isOn && !isTripped ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {isTripped && (
        <div className="text-apple-red font-medium text-xs mt-3 flex items-center gap-2">
          <i className="fas fa-exclamation-triangle" aria-hidden="true" />
          <span>Tap switch to reset</span>
        </div>
      )}
    </div>
  );
};

export default MainBreaker;
