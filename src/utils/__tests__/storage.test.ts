import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { saveState, loadState, clearState, STORAGE_KEY } from '../storage';
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
  };
};

describe('storage utility', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const createTestPanel = (overrides: Partial<Panel> = {}): Panel => ({
    id: 'test-panel-1',
    name: 'Test Panel',
    mainServiceLimit: 200,
    mainBreakerTripped: false,
    mainBreakerManualOff: false,
    breakers: [
      {
        id: 'b-1',
        name: 'Kitchen',
        rating: 20,
        slots: [1],
        thermalHeat: 45, // This should be stripped on save
        on: true,
        runs: [
          [
            {
              id: 'c-1',
              type: 'outlet',
              devices: [
                { uid: 'd-1', name: 'Lamp', watts: 60, icon: 'fa-lightbulb', isOn: true },
              ],
              grounded: true,
              temperature: 120, // This should be stripped on save
            },
          ],
        ],
      },
    ],
    ...overrides,
  });

  describe('saveState', () => {
    it('should save state to localStorage with correct key', () => {
      const panel = createTestPanel();

      saveState({
        panels: [panel],
        selectedPanelId: panel.id,
        timeSpeed: 1,
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.any(String)
      );
    });

    it('should strip thermalHeat from breakers before saving', () => {
      const panel = createTestPanel();
      panel.breakers[0].thermalHeat = 75; // Set high heat value

      saveState({
        panels: [panel],
        selectedPanelId: panel.id,
        timeSpeed: 1,
      });

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]) as PersistedState;
      expect(savedData.panels[0].breakers[0].thermalHeat).toBe(0);
    });

    it('should strip temperature from components before saving', () => {
      const panel = createTestPanel();
      panel.breakers[0].runs[0][0].temperature = 150; // Set high temp

      saveState({
        panels: [panel],
        selectedPanelId: panel.id,
        timeSpeed: 1,
      });

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]) as PersistedState;
      expect(savedData.panels[0].breakers[0].runs[0][0].temperature).toBeUndefined();
    });

    it('should include version, timeSpeed, and timestamp', () => {
      const panel = createTestPanel();
      const beforeSave = new Date().toISOString();

      saveState({
        panels: [panel],
        selectedPanelId: panel.id,
        timeSpeed: 10,
      });

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]) as PersistedState;
      expect(savedData.version).toBe(1);
      expect(savedData.timeSpeed).toBe(10);
      expect(savedData.savedAt).toBeDefined();
      expect(new Date(savedData.savedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeSave).getTime()
      );
    });

    it('should handle empty panels array', () => {
      saveState({
        panels: [],
        selectedPanelId: null,
        timeSpeed: 1,
      });

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]) as PersistedState;
      expect(savedData.panels).toEqual([]);
      expect(savedData.selectedPanelId).toBeNull();
    });

    it('should preserve all panel data except calculated values', () => {
      const panel = createTestPanel({
        name: 'Custom Panel',
        mainServiceLimit: 100,
        mainBreakerTripped: true,
        mainBreakerManualOff: true,
      });

      saveState({
        panels: [panel],
        selectedPanelId: panel.id,
        timeSpeed: 50,
      });

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]) as PersistedState;
      expect(savedData.panels[0].name).toBe('Custom Panel');
      expect(savedData.panels[0].mainServiceLimit).toBe(100);
      expect(savedData.panels[0].mainBreakerTripped).toBe(true);
      expect(savedData.panels[0].mainBreakerManualOff).toBe(true);
    });
  });

  describe('loadState', () => {
    it('should return null when no saved state exists', () => {
      const result = loadState();
      expect(result).toBeNull();
    });

    it('should return parsed state when valid data exists', () => {
      const validState: PersistedState = {
        version: 1,
        panels: [createTestPanel()],
        selectedPanelId: 'test-panel-1',
        timeSpeed: 10,
        savedAt: new Date().toISOString(),
      };
      localStorageMock._getStore()[STORAGE_KEY] = JSON.stringify(validState);

      const result = loadState();

      expect(result).not.toBeNull();
      expect(result?.panels).toHaveLength(1);
      expect(result?.selectedPanelId).toBe('test-panel-1');
      expect(result?.timeSpeed).toBe(10);
    });

    it('should return null for corrupted JSON', () => {
      localStorageMock._getStore()[STORAGE_KEY] = 'not valid json {{{';

      const result = loadState();

      expect(result).toBeNull();
    });

    it('should return null for invalid schema (missing panels)', () => {
      localStorageMock._getStore()[STORAGE_KEY] = JSON.stringify({
        version: 1,
        // panels missing
        selectedPanelId: null,
        timeSpeed: 1,
        savedAt: new Date().toISOString(),
      });

      const result = loadState();

      expect(result).toBeNull();
    });

    it('should return null for invalid schema (panels not array)', () => {
      localStorageMock._getStore()[STORAGE_KEY] = JSON.stringify({
        version: 1,
        panels: 'not an array',
        selectedPanelId: null,
        timeSpeed: 1,
        savedAt: new Date().toISOString(),
      });

      const result = loadState();

      expect(result).toBeNull();
    });

    it('should reset thermalHeat to 0 for all breakers', () => {
      const panel = createTestPanel();
      panel.breakers[0].thermalHeat = 75; // Stored with high heat (shouldn't happen, but be defensive)
      const validState: PersistedState = {
        version: 1,
        panels: [panel],
        selectedPanelId: 'test-panel-1',
        timeSpeed: 1,
        savedAt: new Date().toISOString(),
      };
      localStorageMock._getStore()[STORAGE_KEY] = JSON.stringify(validState);

      const result = loadState();

      expect(result?.panels[0].breakers[0].thermalHeat).toBe(0);
    });

    it('should reset temperature to 75 for all components', () => {
      const panel = createTestPanel();
      panel.breakers[0].runs[0][0].temperature = 200; // Stored with high temp
      const validState: PersistedState = {
        version: 1,
        panels: [panel],
        selectedPanelId: 'test-panel-1',
        timeSpeed: 1,
        savedAt: new Date().toISOString(),
      };
      localStorageMock._getStore()[STORAGE_KEY] = JSON.stringify(validState);

      const result = loadState();

      expect(result?.panels[0].breakers[0].runs[0][0].temperature).toBe(75);
    });

    it('should default timeSpeed to 1 if missing', () => {
      const validState = {
        version: 1,
        panels: [createTestPanel()],
        selectedPanelId: 'test-panel-1',
        // timeSpeed missing
        savedAt: new Date().toISOString(),
      };
      localStorageMock._getStore()[STORAGE_KEY] = JSON.stringify(validState);

      const result = loadState();

      expect(result?.timeSpeed).toBe(1);
    });

    it('should handle panels with empty breakers array', () => {
      const panel = createTestPanel({ breakers: [] });
      const validState: PersistedState = {
        version: 1,
        panels: [panel],
        selectedPanelId: 'test-panel-1',
        timeSpeed: 1,
        savedAt: new Date().toISOString(),
      };
      localStorageMock._getStore()[STORAGE_KEY] = JSON.stringify(validState);

      const result = loadState();

      expect(result?.panels[0].breakers).toEqual([]);
    });

    it('should handle breakers with empty runs array', () => {
      const panel = createTestPanel();
      panel.breakers[0].runs = [];
      const validState: PersistedState = {
        version: 1,
        panels: [panel],
        selectedPanelId: 'test-panel-1',
        timeSpeed: 1,
        savedAt: new Date().toISOString(),
      };
      localStorageMock._getStore()[STORAGE_KEY] = JSON.stringify(validState);

      const result = loadState();

      expect(result?.panels[0].breakers[0].runs).toEqual([]);
    });
  });

  describe('clearState', () => {
    it('should remove saved state from localStorage', () => {
      localStorageMock._getStore()[STORAGE_KEY] = JSON.stringify({ test: true });

      clearState();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('should not throw if no state exists', () => {
      expect(() => clearState()).not.toThrow();
    });
  });
});
