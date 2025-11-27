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
    <div className={`w-full border-b-4 p-4 flex flex-col items-center relative shadow-md mb-4 transition-all duration-300 ${
      powerState === 'on' ? 'bg-gray-300 border-gray-500' :
      powerState === 'tripped' ? 'bg-red-200 border-red-500' :
      'bg-gray-400 border-gray-600'
    }`}>
      <div className="absolute top-2 left-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
        Main Service Disconnect
      </div>

      {/* ON/OFF Status Badge */}
      <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
        powerState === 'on' ? 'bg-green-500 text-white' :
        powerState === 'tripped' ? 'bg-red-600 text-white animate-pulse' :
        'bg-gray-600 text-gray-300'
      }`}>
        {powerState === 'tripped' ? 'TRIPPED' : isOn ? 'ON' : 'OFF'}
      </div>

      <div className={`w-32 h-20 breaker-black rounded mt-4 border-2 relative flex items-center justify-center shadow-lg transition-all duration-300 ${
        powerState === 'on' ? 'border-green-500' :
        powerState === 'tripped' ? 'border-red-500' :
        'border-gray-600'
      }`}>
        <div className="absolute top-1 text-[9px] text-gray-400">MAIN</div>

        {/* Toggle Switch with ON/OFF labels */}
        <div
          className={`w-10 h-16 bg-gray-800 border-2 rounded relative cursor-pointer hover:bg-gray-700 transition-colors ${
            powerState === 'on' ? 'border-green-500' :
            powerState === 'tripped' ? 'border-red-500' :
            'border-gray-600'
          }`}
          onClick={onToggle}
          title={isTripped ? 'Click to reset' : isOn ? 'Click to turn OFF' : 'Click to turn ON'}
        >
          {/* ON label */}
          <div className={`absolute top-0.5 left-0 right-0 text-center text-[7px] font-bold ${
            isOn && !isTripped ? 'text-green-400' : 'text-gray-600'
          }`}>ON</div>

          {/* Handle */}
          <div
            className={`absolute left-1.5 right-1.5 h-6 rounded shadow-lg transition-all duration-200 ${
              isOn && !isTripped ? 'top-2 bg-green-500' : 'bottom-2 bg-red-500'
            }`}
          />

          {/* OFF label */}
          <div className={`absolute bottom-0.5 left-0 right-0 text-center text-[7px] font-bold ${
            !isOn || isTripped ? 'text-red-400' : 'text-gray-600'
          }`}>OFF</div>
        </div>

        <div className="absolute bottom-1 text-xs font-bold text-white bg-gray-800 px-1 rounded border border-gray-600 cursor-pointer hover:bg-gray-700">
          <select
            value={limit}
            onChange={(e) => {
              e.stopPropagation();
              onChangeLimit(Number(e.target.value));
            }}
            className="bg-transparent text-white outline-none appearance-none text-center w-12 font-mono"
            title="Change Service Limit"
            aria-label="Change Service Limit"
          >
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="400">400</option>
          </select>
        </div>
      </div>

      {isTripped && (
        <div className="text-red-700 font-bold text-xs mt-1 flex items-center gap-1">
          <i className="fas fa-exclamation-triangle" aria-hidden="true" />
          <span>Click switch to reset</span>
        </div>
      )}
    </div>
  );
};

export default MainBreaker;