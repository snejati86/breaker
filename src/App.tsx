import React, { useState, useRef, useCallback, useMemo } from 'react';
import ElectricalPanel from './components/ElectricalPanel';
import CircuitEditor from './components/CircuitEditor';
import PanelDrawer from './components/PanelDrawer';
import { useBreakers } from './hooks/useBreakers';
import { usePersistedState } from './hooks/usePersistedState';
import { useSimulation } from './hooks/useSimulation';
import type { Breaker } from './types';
import './App.css';

type MobileView = 'panel' | 'editor';

function App() {
  const [notice, setNotice] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>('panel');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const notify = useCallback((message: string) => {
    setNotice(message);
  }, []);

  // Panel management with persistence
  const {
    panels,
    setPanels,
    selectedPanelId,
    selectedPanel,
    addPanel,
    deletePanel,
    updatePanelName,
    selectPanel,
    updatePanelServiceLimit,
    updatePanelBreakers,
    togglePanelMainPower,
    setPanelTripped,
    timeSpeed,
    setTimeSpeed,
  } = usePersistedState(notify);

  // Get current panel's state
  const currentBreakers = useMemo(
    () => selectedPanel?.breakers ?? [],
    [selectedPanel?.breakers]
  );
  const mainServiceLimit = selectedPanel?.mainServiceLimit ?? 200;
  const mainBreakerTripped = selectedPanel?.mainBreakerTripped ?? false;
  const mainBreakerManualOff = selectedPanel?.mainBreakerManualOff ?? false;

  // Create a setBreakers that updates the selected panel
  const setBreakers = useCallback(
    (breakersOrUpdater: Breaker[] | ((prev: Breaker[]) => Breaker[])) => {
      if (!selectedPanelId) return;
      if (typeof breakersOrUpdater === 'function') {
        updatePanelBreakers(
          selectedPanelId,
          breakersOrUpdater(currentBreakers)
        );
      } else {
        updatePanelBreakers(selectedPanelId, breakersOrUpdater);
      }
    },
    [selectedPanelId, currentBreakers, updatePanelBreakers]
  );

  // Breaker management for the selected panel
  const {
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
  } = useBreakers({
    breakers: currentBreakers,
    setBreakers,
    mainServiceLimit,
    notify,
  });

  // Simulation for the current panel
  const setMainBreakerTripped = useCallback(
    (tripped: boolean) => {
      if (selectedPanelId) {
        setPanelTripped(selectedPanelId, tripped);
      }
    },
    [selectedPanelId, setPanelTripped]
  );

  const simState = useSimulation(
    currentBreakers,
    setBreakers,
    mainServiceLimit,
    mainBreakerTripped,
    mainBreakerManualOff,
    setMainBreakerTripped,
    timeSpeed
  );

  const handleMainLimitChange = useCallback(
    (newLimit: number) => {
      if (!selectedPanelId) return;
      const maxOccupiedSlot = currentBreakers.reduce(
        (max, b) => Math.max(max, ...b.slots),
        0
      );
      const newSlotCount = newLimit === 100 ? 20 : newLimit === 200 ? 30 : 40;

      if (maxOccupiedSlot > newSlotCount) {
        notify(
          `Cannot reduce panel to ${newLimit}A (${newSlotCount} slots). Please remove breakers from bottom slots first.`
        );
        return;
      }
      updatePanelServiceLimit(selectedPanelId, newLimit);
    },
    [selectedPanelId, currentBreakers, notify, updatePanelServiceLimit]
  );

  const toggleMainPower = useCallback(() => {
    if (selectedPanelId) {
      togglePanelMainPower(selectedPanelId);
    }
  }, [selectedPanelId, togglePanelMainPower]);

  const handleSavePanel = useCallback(() => {
    setIsSaving(true);
    setTimeout(() => {
      const blob = new Blob([JSON.stringify({ panels })], {
        type: 'application/json',
      });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'panels.json';
      a.click();
      setIsSaving(false);
    }, 300);
  }, [panels]);

  const handleLoadPanel = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.panels && Array.isArray(data.panels)) {
            setPanels(data.panels);
          } else if (data.breakers) {
            notify('Converting legacy format to new multi-panel format');
            setPanels([
              {
                id: 'imported-panel',
                name: 'Imported Panel',
                mainServiceLimit: 200,
                mainBreakerTripped: false,
                mainBreakerManualOff: false,
                breakers: data.breakers,
              },
            ]);
          } else {
            notify('Invalid panel configuration file');
          }
        } catch {
          notify('Failed to load panel configuration');
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        notify('Failed to read file');
        setIsLoading(false);
      };
      reader.readAsText(file);
      event.target.value = '';
    },
    [setPanels, notify]
  );

  const handleToggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  const activeBreaker = useMemo(
    () => currentBreakers.find((b) => b.id === selectedBreakerId),
    [currentBreakers, selectedBreakerId]
  );
  const mainPowerOn = !mainBreakerTripped && !mainBreakerManualOff;

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans bg-apple-bg text-white">
      {/* Skip Navigation Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-apple-blue focus:text-white focus:rounded-apple"
      >
        Skip to main content
      </a>

      {/* Top Bar - Apple Style */}
      <header
        role="banner"
        className="glass px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row justify-between items-center z-20 gap-3 border-b border-apple-separator"
      >
        <div className="flex gap-4 md:gap-6 items-center w-full md:w-auto justify-between md:justify-start">
          {/* Logo/Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-apple bg-gradient-to-br from-apple-blue to-apple-purple flex items-center justify-center">
              <i className="fas fa-bolt text-white text-sm" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm md:text-base font-semibold text-white leading-tight">
                {selectedPanel?.name || 'Panel Simulator'}
              </h1>
              <span className="text-xs text-apple-gray-1 uppercase tracking-wider">
                Circuit Manager
              </span>
            </div>
          </div>

          {/* Load Status Pill */}
          <div
            role="status"
            aria-live="polite"
            aria-label={`Total load: ${simState.totalLoad.toFixed(1)} amps${mainBreakerTripped ? ', TRIPPED' : ''}`}
            className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 ${
              mainBreakerTripped
                ? 'bg-apple-red/20 border border-apple-red'
                : simState.totalLoad > mainServiceLimit * 0.8
                ? 'bg-apple-orange/20 border border-apple-orange'
                : 'bg-apple-bg-tertiary border border-apple-separator'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${
              mainBreakerTripped
                ? 'bg-apple-red animate-pulse'
                : simState.totalLoad > mainServiceLimit * 0.8
                ? 'bg-apple-orange'
                : 'bg-apple-green'
            }`} />
            <span className="text-xs font-medium">
              {simState.totalLoad.toFixed(1)}A
            </span>
            <span className="text-xs text-apple-gray-1">
              / {mainServiceLimit}A
            </span>
          </div>

          {/* Action Buttons */}
          <nav aria-label="Panel actions" className="flex gap-1 md:gap-2">
            <button
              onClick={handleSavePanel}
              disabled={isSaving}
              className="p-2 md:px-4 md:py-2 bg-apple-bg-tertiary hover:bg-apple-gray-3 rounded-apple text-xs font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-apple-separator hover:border-apple-gray-2"
              aria-label="Save panel configuration"
            >
              <i
                className={`fas ${isSaving ? 'fa-spinner fa-spin' : 'fa-arrow-down-to-bracket'}`}
                aria-hidden="true"
              />
              <span className="hidden md:inline ml-2">{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="p-2 md:px-4 md:py-2 bg-apple-blue hover:bg-blue-500 rounded-apple text-xs font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={isLoading ? 'Loading panel configuration' : 'Open panel configuration file'}
            >
              <i
                className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-folder-open'}`}
                aria-hidden="true"
              />
              <span className="hidden md:inline ml-2">{isLoading ? 'Loading...' : 'Open'}</span>
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
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden w-full gap-2 flex-col">
          {/* Panel Selector & Speed - Mobile */}
          <div className="flex gap-2">
            <select
              value={selectedPanelId || ''}
              onChange={(e) => selectPanel(e.target.value)}
              className="flex-1 bg-apple-bg-tertiary border border-apple-separator rounded-apple text-xs px-3 py-2 text-white focus:border-apple-blue focus:ring-1 focus:ring-apple-blue transition-all"
              aria-label="Select panel"
            >
              {panels.map((panel) => (
                <option key={panel.id} value={panel.id}>
                  {panel.name} ({panel.mainServiceLimit}A)
                </option>
              ))}
            </select>
            <select
              value={timeSpeed}
              onChange={(e) => setTimeSpeed(Number(e.target.value) as 1 | 10 | 50)}
              className="bg-apple-bg-tertiary border border-apple-separator rounded-apple text-xs px-3 py-2 text-white focus:border-apple-blue focus:ring-1 focus:ring-apple-blue transition-all"
              aria-label="Simulation speed"
            >
              <option value="1">1x</option>
              <option value="10">10x</option>
              <option value="50">50x</option>
            </select>
            <button
              onClick={addPanel}
              className="p-2 bg-apple-green hover:brightness-110 rounded-apple text-xs font-medium transition-all active:scale-95"
              aria-label="Add new panel"
            >
              <i className="fas fa-plus" aria-hidden="true" />
            </button>
          </div>
          {/* View Tabs - Mobile */}
          <nav className="flex w-full bg-apple-bg-secondary rounded-apple p-1" aria-label="View selection">
            <button
              onClick={() => setMobileView('panel')}
              className={`flex-1 py-2.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                mobileView === 'panel'
                  ? 'bg-apple-bg-tertiary text-white shadow-apple-sm'
                  : 'text-apple-gray-1 hover:text-white'
              }`}
            >
              <i className="fas fa-th mr-2" aria-hidden="true" />
              Panel
            </button>
            <button
              onClick={() => setMobileView('editor')}
              className={`flex-1 py-2.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                mobileView === 'editor'
                  ? 'bg-apple-bg-tertiary text-white shadow-apple-sm'
                  : 'text-apple-gray-1 hover:text-white'
              }`}
            >
              <i className="fas fa-sliders mr-2" aria-hidden="true" />
              Editor {activeBreaker ? `(${activeBreaker.name})` : ''}
            </button>
          </nav>
        </div>

        {/* Desktop Speed Selector */}
        <div className="hidden md:flex items-center gap-4">
          <span className="text-xs text-apple-gray-1">Simulation speed</span>
          <select
            id="time-speed"
            value={timeSpeed}
            onChange={(e) => setTimeSpeed(Number(e.target.value) as 1 | 10 | 50)}
            className="bg-apple-bg-tertiary border border-apple-separator rounded-apple text-xs px-3 py-2 text-white focus:border-apple-blue focus:ring-1 focus:ring-apple-blue transition-all"
            aria-label="Simulation speed multiplier"
          >
            <option value="1">1x Speed</option>
            <option value="10">10x Speed</option>
            <option value="50">50x Speed</option>
          </select>
        </div>
      </header>

      {/* Main Content */}
      <main
        id="main-content"
        role="main"
        className="flex flex-col md:flex-row flex-grow overflow-hidden bg-apple-bg"
      >
        {/* Panel Drawer - hidden on mobile */}
        <div className="hidden md:flex">
          <PanelDrawer
            panels={panels}
            selectedPanelId={selectedPanelId}
            isOpen={drawerOpen}
            onSelectPanel={selectPanel}
            onAddPanel={addPanel}
            onDeletePanel={deletePanel}
            onUpdatePanelName={updatePanelName}
            onToggleDrawer={handleToggleDrawer}
          />
        </div>

        {/* Panel - hidden on mobile when editor view is active */}
        <div
          className={`${mobileView === 'editor' ? 'hidden' : 'flex'} md:flex`}
        >
          <ElectricalPanel
            breakers={currentBreakers}
            mainServiceLimit={mainServiceLimit}
            mainBreakerTripped={mainBreakerTripped}
            mainBreakerManualOff={mainBreakerManualOff}
            mainPowerOn={mainPowerOn}
            selectedBreakerId={selectedBreakerId}
            onToggleMainPower={toggleMainPower}
            onChangeMainLimit={handleMainLimitChange}
            onSelectBreaker={(id) => {
              setSelectedBreakerId(id);
              setMobileView('editor');
            }}
            onToggleBreaker={toggleBreaker}
            onDeleteBreaker={deleteBreaker}
            onAddBreaker={addBreakerAtSlot}
            onMoveBreaker={moveBreaker}
          />
        </div>

        {/* Editor - hidden on mobile when panel view is active */}
        <div
          className={`${mobileView === 'panel' ? 'hidden' : 'flex'} md:flex flex-grow flex-col bg-apple-bg-elevated`}
        >
          {activeBreaker ? (
            <>
              {/* Breadcrumb */}
              <div className="bg-apple-bg-secondary/50 border-b border-apple-separator px-4 py-3 flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-apple-gray-1">
                    {selectedPanel?.name}
                  </span>
                  <i className="fas fa-chevron-right text-apple-gray-1 text-xs" aria-hidden="true" />
                  <span className="text-white font-medium">
                    Slot {activeBreaker.slots.join(', ')}
                  </span>
                  <span className="text-apple-blue font-medium">
                    {activeBreaker.name}
                  </span>
                </div>
              </div>
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
            </>
          ) : (
            <div className="flex items-center justify-center h-full flex-col flex-grow p-8">
              <div className="w-16 h-16 rounded-full bg-apple-bg-tertiary flex items-center justify-center mb-4">
                <i
                  className="fas fa-plug text-2xl text-apple-gray-1"
                  aria-hidden="true"
                />
              </div>
              <p className="text-apple-gray-1 text-center text-sm">
                <span className="hidden md:inline">
                  Select a breaker to edit its circuit
                </span>
                <span className="md:hidden">
                  Tap a breaker in the Panel tab to edit
                </span>
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Apple-style Modal */}
      {notice && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="notice-title"
          aria-describedby="notice-message"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
        >
          <div className="bg-apple-bg-secondary rounded-apple-xl shadow-apple-xl max-w-sm w-full p-6 text-center space-y-4 animate-scale-in border border-apple-separator">
            <div className="w-12 h-12 rounded-full bg-apple-blue/20 flex items-center justify-center mx-auto">
              <i className="fas fa-info text-apple-blue text-lg" aria-hidden="true" />
            </div>
            <h3 id="notice-title" className="text-lg font-semibold text-white">
              Notice
            </h3>
            <p id="notice-message" className="text-sm text-apple-gray-1 leading-relaxed">
              {notice}
            </p>
            <button
              onClick={() => setNotice(null)}
              className="w-full py-3 rounded-apple-lg bg-apple-blue hover:bg-blue-500 transition-all duration-200 text-sm font-semibold active:scale-98"
              autoFocus
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
