import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePanels } from '../usePanels';

describe('usePanels', () => {
  describe('initial state', () => {
    it('should have one default panel named "Main Panel"', () => {
      const { result } = renderHook(() => usePanels());
      
      expect(result.current.panels).toHaveLength(1);
      expect(result.current.panels[0].name).toBe('Main Panel');
    });

    it('should have the default panel selected', () => {
      const { result } = renderHook(() => usePanels());
      
      expect(result.current.selectedPanelId).toBe(result.current.panels[0].id);
    });

    it('should have default panel with 200A service limit', () => {
      const { result } = renderHook(() => usePanels());
      
      expect(result.current.panels[0].mainServiceLimit).toBe(200);
    });

    it('should have default panel with initial breakers', () => {
      const { result } = renderHook(() => usePanels());
      
      expect(result.current.panels[0].breakers.length).toBeGreaterThan(0);
    });
  });

  describe('addPanel', () => {
    it('should add a new panel with default name', () => {
      const { result } = renderHook(() => usePanels());
      
      act(() => {
        result.current.addPanel();
      });
      
      expect(result.current.panels).toHaveLength(2);
      expect(result.current.panels[1].name).toBe('New Panel');
    });

    it('should add panel with 200A service limit by default', () => {
      const { result } = renderHook(() => usePanels());
      
      act(() => {
        result.current.addPanel();
      });
      
      expect(result.current.panels[1].mainServiceLimit).toBe(200);
    });

    it('should add panel with empty breakers array', () => {
      const { result } = renderHook(() => usePanels());
      
      act(() => {
        result.current.addPanel();
      });
      
      expect(result.current.panels[1].breakers).toHaveLength(0);
    });

    it('should select the newly added panel', () => {
      const { result } = renderHook(() => usePanels());
      
      act(() => {
        result.current.addPanel();
      });
      
      expect(result.current.selectedPanelId).toBe(result.current.panels[1].id);
    });

    it('should add panel with main breaker not tripped and not manually off', () => {
      const { result } = renderHook(() => usePanels());
      
      act(() => {
        result.current.addPanel();
      });
      
      expect(result.current.panels[1].mainBreakerTripped).toBe(false);
      expect(result.current.panels[1].mainBreakerManualOff).toBe(false);
    });
  });

  describe('deletePanel', () => {
    it('should delete a panel by id', () => {
      const { result } = renderHook(() => usePanels());
      
      act(() => {
        result.current.addPanel();
      });
      
      const panelToDelete = result.current.panels[1].id;
      
      act(() => {
        result.current.deletePanel(panelToDelete);
      });
      
      expect(result.current.panels).toHaveLength(1);
      expect(result.current.panels.find(p => p.id === panelToDelete)).toBeUndefined();
    });

    it('should select another panel when deleting the selected panel', () => {
      const { result } = renderHook(() => usePanels());
      
      act(() => {
        result.current.addPanel();
      });
      
      const secondPanelId = result.current.panels[1].id;
      const firstPanelId = result.current.panels[0].id;
      
      // Select second panel then delete it
      act(() => {
        result.current.selectPanel(secondPanelId);
      });
      
      expect(result.current.selectedPanelId).toBe(secondPanelId);
      
      act(() => {
        result.current.deletePanel(secondPanelId);
      });
      
      expect(result.current.selectedPanelId).toBe(firstPanelId);
    });

    it('should not delete the last remaining panel', () => {
      const notify = vi.fn();
      const { result } = renderHook(() => usePanels(notify));
      
      const onlyPanelId = result.current.panels[0].id;
      
      act(() => {
        result.current.deletePanel(onlyPanelId);
      });
      
      expect(result.current.panels).toHaveLength(1);
      expect(notify).toHaveBeenCalledWith('Cannot delete the last panel.');
    });
  });

  describe('updatePanelName', () => {
    it('should update a panel name', () => {
      const { result } = renderHook(() => usePanels());
      
      const panelId = result.current.panels[0].id;
      
      act(() => {
        result.current.updatePanelName(panelId, 'Garage');
      });
      
      expect(result.current.panels[0].name).toBe('Garage');
    });

    it('should not change other panels when updating name', () => {
      const { result } = renderHook(() => usePanels());
      
      act(() => {
        result.current.addPanel();
      });
      
      const firstPanelId = result.current.panels[0].id;
      
      act(() => {
        result.current.updatePanelName(firstPanelId, 'House');
      });
      
      expect(result.current.panels[0].name).toBe('House');
      expect(result.current.panels[1].name).toBe('New Panel');
    });
  });

  describe('selectPanel', () => {
    it('should select a panel by id', () => {
      const { result } = renderHook(() => usePanels());
      
      act(() => {
        result.current.addPanel();
      });
      
      const firstPanelId = result.current.panels[0].id;
      
      act(() => {
        result.current.selectPanel(firstPanelId);
      });
      
      expect(result.current.selectedPanelId).toBe(firstPanelId);
    });
  });

  describe('updatePanelServiceLimit', () => {
    it('should update a panel service limit', () => {
      const { result } = renderHook(() => usePanels());
      
      const panelId = result.current.panels[0].id;
      
      act(() => {
        result.current.updatePanelServiceLimit(panelId, 100);
      });
      
      expect(result.current.panels[0].mainServiceLimit).toBe(100);
    });
  });

  describe('updatePanelBreakers', () => {
    it('should update a panel breakers array', () => {
      const { result } = renderHook(() => usePanels());
      
      const panelId = result.current.panels[0].id;
      const newBreakers = [
        {
          id: 'new-b-1',
          name: 'Test Breaker',
          rating: 20,
          slots: [1],
          thermalHeat: 0,
          on: true,
          runs: []
        }
      ];
      
      act(() => {
        result.current.updatePanelBreakers(panelId, newBreakers);
      });
      
      expect(result.current.panels[0].breakers).toEqual(newBreakers);
    });
  });

  describe('togglePanelMainPower', () => {
    it('should toggle main breaker manual off state', () => {
      const { result } = renderHook(() => usePanels());
      
      const panelId = result.current.panels[0].id;
      
      expect(result.current.panels[0].mainBreakerManualOff).toBe(false);
      
      act(() => {
        result.current.togglePanelMainPower(panelId);
      });
      
      expect(result.current.panels[0].mainBreakerManualOff).toBe(true);
    });

    it('should reset trip state when toggling on a tripped breaker', () => {
      const { result } = renderHook(() => usePanels());
      
      const panelId = result.current.panels[0].id;
      
      // Manually set tripped state
      act(() => {
        result.current.setPanelTripped(panelId, true);
      });
      
      expect(result.current.panels[0].mainBreakerTripped).toBe(true);
      
      act(() => {
        result.current.togglePanelMainPower(panelId);
      });
      
      expect(result.current.panels[0].mainBreakerTripped).toBe(false);
      expect(result.current.panels[0].mainBreakerManualOff).toBe(false);
    });
  });

  describe('setPanelTripped', () => {
    it('should set main breaker tripped state', () => {
      const { result } = renderHook(() => usePanels());
      
      const panelId = result.current.panels[0].id;
      
      act(() => {
        result.current.setPanelTripped(panelId, true);
      });
      
      expect(result.current.panels[0].mainBreakerTripped).toBe(true);
    });
  });

  describe('selectedPanel', () => {
    it('should return the currently selected panel', () => {
      const { result } = renderHook(() => usePanels());
      
      const selectedPanel = result.current.selectedPanel;
      
      expect(selectedPanel).toBeDefined();
      expect(selectedPanel?.id).toBe(result.current.selectedPanelId);
    });

    it('should return undefined when no panel is selected', () => {
      const { result } = renderHook(() => usePanels());
      
      // Clear selection (though this shouldn't happen in practice)
      act(() => {
        result.current.addPanel();
        result.current.addPanel();
      });
      
      // Select the first panel explicitly
      act(() => {
        result.current.selectPanel(result.current.panels[0].id);
      });
      
      expect(result.current.selectedPanel).toBeDefined();
    });
  });

  describe('setPanels', () => {
    it('should allow setting panels directly (for load functionality)', () => {
      const { result } = renderHook(() => usePanels());
      
      const newPanels = [
        {
          id: 'loaded-panel',
          name: 'Loaded Panel',
          mainServiceLimit: 100,
          mainBreakerTripped: false,
          mainBreakerManualOff: false,
          breakers: []
        }
      ];
      
      act(() => {
        result.current.setPanels(newPanels);
      });
      
      expect(result.current.panels).toEqual(newPanels);
    });

    it('should select the first panel when setting new panels', () => {
      const { result } = renderHook(() => usePanels());
      
      const newPanels = [
        {
          id: 'loaded-panel-1',
          name: 'Loaded Panel 1',
          mainServiceLimit: 100,
          mainBreakerTripped: false,
          mainBreakerManualOff: false,
          breakers: []
        },
        {
          id: 'loaded-panel-2',
          name: 'Loaded Panel 2',
          mainServiceLimit: 200,
          mainBreakerTripped: false,
          mainBreakerManualOff: false,
          breakers: []
        }
      ];
      
      act(() => {
        result.current.setPanels(newPanels);
      });
      
      expect(result.current.selectedPanelId).toBe('loaded-panel-1');
    });
  });
});
