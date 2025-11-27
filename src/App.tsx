import React, { useState, useRef, useCallback } from 'react';
import ElectricalPanel from './components/ElectricalPanel';
import CircuitEditor from './components/CircuitEditor';
import { useBreakers } from './hooks/useBreakers';
import { useSimulation } from './hooks/useSimulation';
import './App.css';

function App() {
  const [mainServiceLimit, setMainServiceLimit] = useState(200);
  const [mainBreakerTripped, setMainBreakerTripped] = useState(false);
  const [mainBreakerManualOff, setMainBreakerManualOff] = useState(false);
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const notify = useCallback((message: string) => {
    setNotice(message);
  }, []);

  const {
    breakers,
    setBreakers,
    selectedBreakerId,
    setSelectedBreakerId,
    addBreakerAtSlot,
    updateBreakerRating,
    deleteBreaker,
    toggleBreaker,
    updateBreakerName,
    addRun,
    addComponent,
    toggleSwitch,
    toggleGround,
    removeComponent,
    addDevice,
    toggleDevicePower,
    removeDevice,
    moveBreaker,
  } = useBreakers(mainServiceLimit, notify);

  const simState = useSimulation(
    breakers,
    setBreakers,
    mainServiceLimit,
    mainBreakerTripped,
    mainBreakerManualOff,
    setMainBreakerTripped,
    timeSpeed
  );

  const handleMainLimitChange = (newLimit: number) => {
    const maxOccupiedSlot = breakers.reduce((max, b) => Math.max(max, ...b.slots), 0);
    const newSlotCount = newLimit === 100 ? 20 : newLimit === 200 ? 30 : 40;
    
    if (maxOccupiedSlot > newSlotCount) {
      notify(`Cannot reduce panel to ${newLimit}A (${newSlotCount} slots). Please remove breakers from bottom slots first.`);
      return;
    }
    setMainServiceLimit(newLimit);
  };

  const toggleMainPower = () => {
    if (mainBreakerTripped) {
      setMainBreakerTripped(false);
      setMainBreakerManualOff(false);
    } else {
      setMainBreakerManualOff(!mainBreakerManualOff);
    }
  };

  const handleSavePanel = () => {
    const blob = new Blob([JSON.stringify({ breakers })], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'panel.json';
    a.click();
  };

  const handleLoadPanel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setBreakers(data.breakers);
      } catch {
        notify('Failed to load panel configuration');
      }
    };
    reader.readAsText(file);
  };

  const activeBreaker = breakers.find(b => b.id === selectedBreakerId);
  const mainPowerOn = !mainBreakerTripped && !mainBreakerManualOff;

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans bg-gray-900 text-white">
      {/* Skip Navigation Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
      >
        Skip to main content
      </a>

      {/* Top Bar */}
      <header
        role="banner"
        className="bg-gray-800 p-3 shadow border-b border-gray-700 flex justify-between items-center z-20"
      >
        <div className="flex gap-4 items-center">
          <h1 className="text-sm font-bold text-gray-400">PANEL SIM V19</h1>
          <div
            role="status"
            aria-live="polite"
            aria-label={`Total load: ${simState.totalLoad.toFixed(1)} amps${mainBreakerTripped ? ', TRIPPED' : ''}`}
            className={`px-3 py-1 rounded border flex flex-col items-center ${
              mainBreakerTripped
                ? 'bg-red-900 border-red-500 animate-pulse'
                : 'bg-gray-700 border-gray-600'
            }`}
          >
            <span className="text-[8px] uppercase">Total Load</span>
            <span className="text-xs font-mono">{simState.totalLoad.toFixed(1)}A</span>
          </div>
          <label htmlFor="time-speed" className="sr-only">
            Simulation speed
          </label>
          <select
            id="time-speed"
            value={timeSpeed}
            onChange={(e) => setTimeSpeed(Number(e.target.value))}
            className="bg-gray-700 border border-gray-600 rounded text-xs p-1"
            aria-label="Simulation speed multiplier"
          >
            <option value="1">1x Speed</option>
            <option value="10">10x Speed</option>
            <option value="50">50x Speed</option>
          </select>
        </div>

        <nav aria-label="Panel actions" className="flex gap-2">
          <button
            onClick={handleSavePanel}
            className="px-3 py-1 bg-blue-900 border border-blue-700 rounded text-xs hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            aria-label="Save panel configuration"
          >
            Save
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 bg-green-900 border border-green-700 rounded text-xs hover:bg-green-800 focus:ring-2 focus:ring-green-500 focus:outline-none"
            aria-label="Load panel configuration from file"
          >
            Load
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleLoadPanel}
            accept=".json"
            aria-label="Select panel configuration file"
          />
        </nav>
      </header>

      {/* Main Content */}
      <main
        id="main-content"
        role="main"
        className="flex flex-grow overflow-hidden"
      >
        <ElectricalPanel
          breakers={breakers}
          mainServiceLimit={mainServiceLimit}
          mainBreakerTripped={mainBreakerTripped}
          mainBreakerManualOff={mainBreakerManualOff}
          selectedBreakerId={selectedBreakerId}
          onToggleMainPower={toggleMainPower}
          onChangeMainLimit={handleMainLimitChange}
          onSelectBreaker={setSelectedBreakerId}
          onToggleBreaker={toggleBreaker}
          onDeleteBreaker={deleteBreaker}
          onAddBreaker={addBreakerAtSlot}
          onMoveBreaker={moveBreaker}
        />

        {activeBreaker ? (
          <CircuitEditor
            breaker={activeBreaker}
            mainPowerOn={mainPowerOn}
            onUpdateBreakerName={updateBreakerName}
            onUpdateBreakerRating={updateBreakerRating}
            onAddRun={addRun}
            onAddComponent={addComponent}
            onToggleSwitch={toggleSwitch}
            onToggleGround={toggleGround}
            onRemoveComponent={removeComponent}
            onAddDevice={addDevice}
            onToggleDevicePower={toggleDevicePower}
            onRemoveDevice={removeDevice}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 flex-col flex-grow">
            <i className="fas fa-arrow-left text-4xl mb-4 opacity-50" aria-hidden="true" />
            <p>Select a breaker on the left to edit wiring</p>
          </div>
        )}
      </main>
      {notice && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="notice-title"
          aria-describedby="notice-message"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
        >
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <h3 id="notice-title" className="text-lg font-semibold text-white">Heads up</h3>
            <p id="notice-message" className="text-sm text-gray-300">{notice}</p>
            <button
              onClick={() => setNotice(null)}
              className="w-full py-2 rounded bg-blue-600 hover:bg-blue-500 transition text-sm font-semibold focus:ring-2 focus:ring-blue-400 focus:outline-none"
              autoFocus
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;