import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Panel, Breaker } from '../types';
import { generateId } from '../utils/calculations';
import { saveState, loadState } from '../utils/storage';

const initialBreakers: Breaker[] = [
  {
    id: 'b-1',
    name: 'Kitchen',
    rating: 20,
    slots: [1],
    thermalHeat: 0,
    on: true,
    runs: [[{ id: 'c-1', type: 'outlet', devices: [], grounded: true, temperature: 75 }]]
  },
  {
    id: 'b-2',
    name: 'Shed',
    rating: 15,
    slots: [2],
    thermalHeat: 0,
    on: true,
    runs: [[{ id: 'c-2', type: 'switch', isOn: false, devices: [], grounded: true, temperature: 75 }]]
  },
  {
    id: 'b-3',
    name: 'Dryer (240V)',
    rating: 30,
    slots: [3, 5],
    thermalHeat: 0,
    on: true,
    runs: [[{ id: 'c-3', type: 'outlet', devices: [], grounded: true, temperature: 75 }]]
  }
];

const createDefaultPanel = (): Panel => ({
  id: generateId(),
  name: 'Main Panel',
  mainServiceLimit: 200,
  mainBreakerTripped: false,
  mainBreakerManualOff: false,
  breakers: initialBreakers,
});

/**
 * Loads initial state from localStorage, with fallback to defaults
 */
const getInitialState = () => {
  try {
    const saved = loadState();
    if (saved) {
      return {
        panels: saved.panels,
        selectedPanelId: saved.selectedPanelId,
        timeSpeed: saved.timeSpeed,
      };
    }
  } catch {
    // Ignore errors, use defaults
  }

  const defaultPanel = createDefaultPanel();
  return {
    panels: [defaultPanel],
    selectedPanelId: defaultPanel.id,
    timeSpeed: 1 as 1 | 10 | 50,
  };
};

export const usePersistedState = (notify?: (message: string) => void) => {
  // Get initial state once
  const initialState = useMemo(() => getInitialState(), []);

  const [panels, setPanelsState] = useState<Panel[]>(initialState.panels);
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(initialState.selectedPanelId);
  const [timeSpeed, setTimeSpeed] = useState<1 | 10 | 50>(initialState.timeSpeed);

  // Auto-save with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        saveState({ panels, selectedPanelId, timeSpeed });
      } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          notify?.('Warning: Could not save - storage quota exceeded');
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [panels, selectedPanelId, timeSpeed, notify]);

  const selectedPanel = useMemo(
    () => panels.find(p => p.id === selectedPanelId),
    [panels, selectedPanelId]
  );

  const addPanel = useCallback(() => {
    const newPanel: Panel = {
      id: generateId(),
      name: 'New Panel',
      mainServiceLimit: 200,
      mainBreakerTripped: false,
      mainBreakerManualOff: false,
      breakers: [],
    };
    setPanelsState(prev => [...prev, newPanel]);
    setSelectedPanelId(newPanel.id);
  }, []);

  const deletePanel = useCallback((id: string) => {
    setPanelsState(prev => {
      if (prev.length <= 1) {
        notify?.('Cannot delete the last panel.');
        return prev;
      }
      const filtered = prev.filter(p => p.id !== id);
      // If deleting the selected panel, select another one
      if (selectedPanelId === id && filtered.length > 0) {
        setSelectedPanelId(filtered[0].id);
      }
      return filtered;
    });
  }, [selectedPanelId, notify]);

  const updatePanelName = useCallback((id: string, name: string) => {
    setPanelsState(prev =>
      prev.map(p => p.id === id ? { ...p, name } : p)
    );
  }, []);

  const selectPanel = useCallback((id: string) => {
    setSelectedPanelId(id);
  }, []);

  const updatePanelServiceLimit = useCallback((id: string, mainServiceLimit: number) => {
    setPanelsState(prev =>
      prev.map(p => p.id === id ? { ...p, mainServiceLimit } : p)
    );
  }, []);

  const updatePanelBreakers = useCallback((id: string, breakers: Breaker[]) => {
    setPanelsState(prev =>
      prev.map(p => p.id === id ? { ...p, breakers } : p)
    );
  }, []);

  const togglePanelMainPower = useCallback((id: string) => {
    setPanelsState(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        // If tripped, reset both flags
        if (p.mainBreakerTripped) {
          return { ...p, mainBreakerTripped: false, mainBreakerManualOff: false };
        }
        // Otherwise toggle manual off
        return { ...p, mainBreakerManualOff: !p.mainBreakerManualOff };
      })
    );
  }, []);

  const setPanelTripped = useCallback((id: string, tripped: boolean) => {
    setPanelsState(prev =>
      prev.map(p => p.id === id ? { ...p, mainBreakerTripped: tripped } : p)
    );
  }, []);

  // Custom setPanels that also updates selection
  const setPanels = useCallback((newPanels: Panel[]) => {
    setPanelsState(newPanels);
    if (newPanels.length > 0) {
      setSelectedPanelId(newPanels[0].id);
    }
  }, []);

  return {
    // Panel state & methods
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
    // TimeSpeed state
    timeSpeed,
    setTimeSpeed,
  };
};
