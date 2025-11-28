import { useState, useCallback, useMemo } from 'react';
import type { Panel, Breaker } from '../types';
import { generateId } from '../utils/calculations';

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

export const usePanels = (notify?: (message: string) => void) => {
  const [panels, setPanels] = useState<Panel[]>(() => [createDefaultPanel()]);
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(() => panels[0]?.id ?? null);

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
    setPanels(prev => [...prev, newPanel]);
    setSelectedPanelId(newPanel.id);
  }, []);

  const deletePanel = useCallback((id: string) => {
    setPanels(prev => {
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
    setPanels(prev =>
      prev.map(p => p.id === id ? { ...p, name } : p)
    );
  }, []);

  const selectPanel = useCallback((id: string) => {
    setSelectedPanelId(id);
  }, []);

  const updatePanelServiceLimit = useCallback((id: string, mainServiceLimit: number) => {
    setPanels(prev =>
      prev.map(p => p.id === id ? { ...p, mainServiceLimit } : p)
    );
  }, []);

  const updatePanelBreakers = useCallback((id: string, breakers: Breaker[]) => {
    setPanels(prev =>
      prev.map(p => p.id === id ? { ...p, breakers } : p)
    );
  }, []);

  const togglePanelMainPower = useCallback((id: string) => {
    setPanels(prev =>
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
    setPanels(prev =>
      prev.map(p => p.id === id ? { ...p, mainBreakerTripped: tripped } : p)
    );
  }, []);

  // Custom setPanels that also updates selection
  const setPanelsWithSelection = useCallback((newPanels: Panel[]) => {
    setPanels(newPanels);
    if (newPanels.length > 0) {
      setSelectedPanelId(newPanels[0].id);
    }
  }, []);

  return {
    panels,
    setPanels: setPanelsWithSelection,
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
  };
};
