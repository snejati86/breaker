export interface BreakerSpec {
  slots: number;
}

export const BREAKER_SPECS: Record<number, BreakerSpec> = {
  15: { slots: 1 },
  20: { slots: 1 },
  30: { slots: 2 },
  40: { slots: 2 },
  50: { slots: 2 },
  60: { slots: 2 },
  100: { slots: 2 }
};

export const SLOTS_MAP: Record<number, number> = {
  100: 20,
  200: 30,
  400: 40
};