import type { Panel, PersistedState } from '../types';

export const STORAGE_KEY = 'circuit-panel-simulator:v1:state';

const CURRENT_VERSION = 1;
const DEFAULT_TEMPERATURE = 75;

export interface SaveStateInput {
  panels: Panel[];
  selectedPanelId: string | null;
  timeSpeed: number;
}

/**
 * Strips calculated/transient values from panels before saving
 */
const sanitizePanelsForStorage = (panels: Panel[]): Panel[] => {
  return panels.map(panel => ({
    ...panel,
    breakers: panel.breakers.map(breaker => ({
      ...breaker,
      thermalHeat: 0, // Reset calculated value
      runs: breaker.runs.map(run =>
        run.map(component => {
          // Create new component without temperature
          const { temperature: _, ...rest } = component;
          return rest;
        })
      ),
    })),
  }));
};

/**
 * Restores default values for calculated fields when loading
 */
const restoreCalculatedValues = (panels: Panel[]): Panel[] => {
  return panels.map(panel => ({
    ...panel,
    breakers: panel.breakers.map(breaker => ({
      ...breaker,
      thermalHeat: 0, // Reset to safe default
      runs: breaker.runs.map(run =>
        run.map(component => ({
          ...component,
          temperature: DEFAULT_TEMPERATURE, // Reset to ambient temperature
        }))
      ),
    })),
  }));
};

/**
 * Validates that the loaded data matches the expected schema
 */
const isValidPersistedState = (data: unknown): data is PersistedState => {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;

  // Check required fields
  if (typeof obj.version !== 'number') return false;
  if (!Array.isArray(obj.panels)) return false;
  if (obj.selectedPanelId !== null && typeof obj.selectedPanelId !== 'string') return false;

  return true;
};

/**
 * Saves state to localStorage
 */
export const saveState = (state: SaveStateInput): void => {
  const sanitizedPanels = sanitizePanelsForStorage(state.panels);

  const persistedState: PersistedState = {
    version: CURRENT_VERSION,
    panels: sanitizedPanels,
    selectedPanelId: state.selectedPanelId,
    timeSpeed: state.timeSpeed as 1 | 10 | 50,
    savedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
};

/**
 * Loads state from localStorage
 * Returns null if no state exists or if the data is invalid
 */
export const loadState = (): PersistedState | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    if (!isValidPersistedState(parsed)) return null;

    // Restore calculated values to safe defaults
    const restoredPanels = restoreCalculatedValues(parsed.panels);

    return {
      ...parsed,
      panels: restoredPanels,
      // Default timeSpeed to 1 if not present (backward compatibility)
      timeSpeed: (parsed.timeSpeed as 1 | 10 | 50) ?? 1,
    };
  } catch {
    // Corrupted JSON or other error
    return null;
  }
};

/**
 * Clears saved state from localStorage
 */
export const clearState = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
