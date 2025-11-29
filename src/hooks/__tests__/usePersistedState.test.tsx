import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePersistedState } from '../usePersistedState';
import { STORAGE_KEY } from '../../utils/storage';
import type { Panel, PersistedState } from '../../types';

// Mock localStorage
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    _getStore: () => store,
    _setStore: (key: string, value: string) => {
      store[key] = value;
    },
  };
};

describe('usePersistedState', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    vi.stubGlobal('localStorage', localStorageMock);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  const createTestPanel = (overrides: Partial<Panel> = {}): Panel => ({
    id: 'test-panel-1',
    name: 'Test Panel',
    mainServiceLimit: 200,
    mainBreakerTripped: false,
    mainBreakerManualOff: false,
    breakers: [],
    ...overrides,
  });

  const createPersistedState = (overrides: Partial<PersistedState> = {}): PersistedState => ({
    version: 1,
    panels: [createTestPanel()],
    selectedPanelId: 'test-panel-1',
    timeSpeed: 1,
    savedAt: new Date().toISOString(),
    ...overrides,
  });

  describe('initialization', () => {
    it('should load state from localStorage on mount', () => {
      const savedState = createPersistedState({
        panels: [createTestPanel({ name: 'Saved Panel' })],
        selectedPanelId: 'test-panel-1',
        timeSpeed: 10,
      });
      localStorageMock._setStore(STORAGE_KEY, JSON.stringify(savedState));

      const { result } = renderHook(() => usePersistedState());

      expect(result.current.panels).toHaveLength(1);
      expect(result.current.panels[0].name).toBe('Saved Panel');
      expect(result.current.selectedPanelId).toBe('test-panel-1');
      expect(result.current.timeSpeed).toBe(10);
    });

    it('should use default state when localStorage is empty', () => {
      const { result } = renderHook(() => usePersistedState());

      expect(result.current.panels).toHaveLength(1);
      expect(result.current.panels[0].name).toBe('Main Panel');
      expect(result.current.timeSpeed).toBe(1);
    });

    it('should use default state when localStorage data is corrupted', () => {
      localStorageMock._setStore(STORAGE_KEY, 'not valid json');

      const { result } = renderHook(() => usePersistedState());

      expect(result.current.panels).toHaveLength(1);
      expect(result.current.panels[0].name).toBe('Main Panel');
    });

    it('should load timeSpeed from localStorage', () => {
      const savedState = createPersistedState({ timeSpeed: 50 });
      localStorageMock._setStore(STORAGE_KEY, JSON.stringify(savedState));

      const { result } = renderHook(() => usePersistedState());

      expect(result.current.timeSpeed).toBe(50);
    });
  });

  describe('auto-save', () => {
    it('should save to localStorage when panels change', async () => {
      const { result } = renderHook(() => usePersistedState());

      act(() => {
        result.current.addPanel();
      });

      // Fast-forward past debounce
      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.any(String)
      );

      const savedData = JSON.parse(
        localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1][1]
      ) as PersistedState;
      expect(savedData.panels).toHaveLength(2);
    });

    it('should save to localStorage when selectedPanelId changes', async () => {
      const savedState = createPersistedState({
        panels: [
          createTestPanel({ id: 'panel-1', name: 'Panel 1' }),
          createTestPanel({ id: 'panel-2', name: 'Panel 2' }),
        ],
        selectedPanelId: 'panel-1',
      });
      localStorageMock._setStore(STORAGE_KEY, JSON.stringify(savedState));

      const { result } = renderHook(() => usePersistedState());

      act(() => {
        result.current.selectPanel('panel-2');
      });

      // Fast-forward past debounce
      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      const lastCall = localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1];
      const savedData = JSON.parse(lastCall[1]) as PersistedState;
      expect(savedData.selectedPanelId).toBe('panel-2');
    });

    it('should save to localStorage when timeSpeed changes', async () => {
      const { result } = renderHook(() => usePersistedState());

      act(() => {
        result.current.setTimeSpeed(50);
      });

      // Fast-forward past debounce
      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      const lastCall = localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1];
      const savedData = JSON.parse(lastCall[1]) as PersistedState;
      expect(savedData.timeSpeed).toBe(50);
    });

    it('should debounce rapid saves (500ms)', async () => {
      const { result } = renderHook(() => usePersistedState());

      // Make multiple rapid changes
      act(() => {
        result.current.addPanel();
      });
      act(() => {
        result.current.setTimeSpeed(10);
      });
      act(() => {
        result.current.setTimeSpeed(50);
      });

      // Advance just before debounce completes
      await act(async () => {
        vi.advanceTimersByTime(400);
      });

      // No save should have happened yet
      const callsBeforeDebounce = localStorageMock.setItem.mock.calls.length;

      // Advance past debounce
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      // Now exactly one save should have happened
      expect(localStorageMock.setItem.mock.calls.length).toBe(callsBeforeDebounce + 1);

      // Verify final state is saved
      const lastCall = localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1];
      const savedData = JSON.parse(lastCall[1]) as PersistedState;
      expect(savedData.panels).toHaveLength(2);
      expect(savedData.timeSpeed).toBe(50);
    });
  });

  describe('error handling', () => {
    it('should continue working when localStorage is unavailable', () => {
      // Make localStorage throw
      localStorageMock.getItem = vi.fn(() => {
        throw new Error('localStorage unavailable');
      });

      // Should not throw
      expect(() => {
        renderHook(() => usePersistedState());
      }).not.toThrow();
    });

    it('should notify user when quota exceeded', async () => {
      const notify = vi.fn();
      const { result } = renderHook(() => usePersistedState(notify));

      // Make setItem throw quota error
      const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
      localStorageMock.setItem = vi.fn(() => {
        throw quotaError;
      });

      act(() => {
        result.current.addPanel();
      });

      // Fast-forward past debounce
      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(notify).toHaveBeenCalledWith(
        expect.stringContaining('storage quota exceeded')
      );
    });
  });

  // Include all existing usePanels functionality tests
  describe('panel management', () => {
    it('should have one default panel named "Main Panel" when starting fresh', () => {
      const { result } = renderHook(() => usePersistedState());

      expect(result.current.panels).toHaveLength(1);
      expect(result.current.panels[0].name).toBe('Main Panel');
    });

    it('should have the default panel selected', () => {
      const { result } = renderHook(() => usePersistedState());

      expect(result.current.selectedPanelId).toBe(result.current.panels[0].id);
    });

    it('should add a new panel', () => {
      const { result } = renderHook(() => usePersistedState());

      act(() => {
        result.current.addPanel();
      });

      expect(result.current.panels).toHaveLength(2);
      expect(result.current.panels[1].name).toBe('New Panel');
    });

    it('should select the newly added panel', () => {
      const { result } = renderHook(() => usePersistedState());

      act(() => {
        result.current.addPanel();
      });

      expect(result.current.selectedPanelId).toBe(result.current.panels[1].id);
    });

    it('should delete a panel', () => {
      const { result } = renderHook(() => usePersistedState());

      act(() => {
        result.current.addPanel();
      });

      const panelToDelete = result.current.panels[1].id;

      act(() => {
        result.current.deletePanel(panelToDelete);
      });

      expect(result.current.panels).toHaveLength(1);
    });

    it('should not delete the last panel', () => {
      const notify = vi.fn();
      const { result } = renderHook(() => usePersistedState(notify));

      const onlyPanelId = result.current.panels[0].id;

      act(() => {
        result.current.deletePanel(onlyPanelId);
      });

      expect(result.current.panels).toHaveLength(1);
      expect(notify).toHaveBeenCalledWith('Cannot delete the last panel.');
    });

    it('should update panel name', () => {
      const { result } = renderHook(() => usePersistedState());

      const panelId = result.current.panels[0].id;

      act(() => {
        result.current.updatePanelName(panelId, 'Garage');
      });

      expect(result.current.panels[0].name).toBe('Garage');
    });

    it('should select a panel', () => {
      const { result } = renderHook(() => usePersistedState());

      act(() => {
        result.current.addPanel();
      });

      const firstPanelId = result.current.panels[0].id;

      act(() => {
        result.current.selectPanel(firstPanelId);
      });

      expect(result.current.selectedPanelId).toBe(firstPanelId);
    });

    it('should update panel service limit', () => {
      const { result } = renderHook(() => usePersistedState());

      const panelId = result.current.panels[0].id;

      act(() => {
        result.current.updatePanelServiceLimit(panelId, 100);
      });

      expect(result.current.panels[0].mainServiceLimit).toBe(100);
    });

    it('should toggle panel main power', () => {
      const { result } = renderHook(() => usePersistedState());

      const panelId = result.current.panels[0].id;

      expect(result.current.panels[0].mainBreakerManualOff).toBe(false);

      act(() => {
        result.current.togglePanelMainPower(panelId);
      });

      expect(result.current.panels[0].mainBreakerManualOff).toBe(true);
    });

    it('should set panel tripped state', () => {
      const { result } = renderHook(() => usePersistedState());

      const panelId = result.current.panels[0].id;

      act(() => {
        result.current.setPanelTripped(panelId, true);
      });

      expect(result.current.panels[0].mainBreakerTripped).toBe(true);
    });

    it('should return the selected panel', () => {
      const { result } = renderHook(() => usePersistedState());

      expect(result.current.selectedPanel).toBeDefined();
      expect(result.current.selectedPanel?.id).toBe(result.current.selectedPanelId);
    });

    it('should allow setting panels directly', () => {
      const { result } = renderHook(() => usePersistedState());

      const newPanels = [createTestPanel({ name: 'Loaded Panel' })];

      act(() => {
        result.current.setPanels(newPanels);
      });

      expect(result.current.panels).toEqual(newPanels);
      expect(result.current.selectedPanelId).toBe('test-panel-1');
    });
  });

  describe('timeSpeed management', () => {
    it('should default timeSpeed to 1', () => {
      const { result } = renderHook(() => usePersistedState());

      expect(result.current.timeSpeed).toBe(1);
    });

    it('should allow setting timeSpeed', () => {
      const { result } = renderHook(() => usePersistedState());

      act(() => {
        result.current.setTimeSpeed(10);
      });

      expect(result.current.timeSpeed).toBe(10);

      act(() => {
        result.current.setTimeSpeed(50);
      });

      expect(result.current.timeSpeed).toBe(50);
    });
  });
});
