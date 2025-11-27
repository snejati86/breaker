import { useState, useCallback } from 'react';
import type { Breaker, Device } from '../types';
import { BREAKER_SPECS, SLOTS_MAP } from '../constants/breakers';
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

export const useBreakers = (
  mainServiceLimit: number,
  notify?: (message: string) => void
) => {
  const [breakers, setBreakers] = useState<Breaker[]>(initialBreakers);
  const [selectedBreakerId, setSelectedBreakerId] = useState<string | null>('b-1');

  const addBreakerAtSlot = useCallback((slotNum: number, type: 'single' | 'double') => {
    const totalSlots = SLOTS_MAP[mainServiceLimit];
    const defaultRating = type === 'double' ? 30 : 15;
    const requiredSlots = BREAKER_SPECS[defaultRating].slots;
    const slotsNeeded = requiredSlots === 2 ? [slotNum, slotNum + 2] : [slotNum];

    const isFree = slotsNeeded.every(
      s => s <= totalSlots && !breakers.find(b => b.slots.includes(s))
    );

    if (!isFree) {
      notify?.('Cannot install here. Slot occupied or out of bounds.');
      return;
    }

    const newId = generateId();
    setBreakers(prev => [...prev, {
      id: newId,
      name: type === 'double' ? 'New 240V Circuit' : 'New Circuit',
      rating: defaultRating,
      slots: slotsNeeded,
      thermalHeat: 0,
      on: true,
      runs: [[{ id: generateId(), type: 'outlet', devices: [], grounded: true, temperature: 75 }]]
    }]);
    setSelectedBreakerId(newId);
  }, [breakers, mainServiceLimit, notify]);

  const updateBreakerRating = useCallback((id: string, newRating: number) => {
    const totalSlots = SLOTS_MAP[mainServiceLimit];
    const requiredSlotsCount = BREAKER_SPECS[newRating].slots;

    setBreakers(prev => {
      const breaker = prev.find(b => b.id === id);
      if (!breaker) return prev;

      const currentSlotsCount = breaker.slots.length;

      if (currentSlotsCount === requiredSlotsCount) {
        return prev.map(b => b.id === id ? { ...b, rating: newRating } : b);
      }

      if (requiredSlotsCount > currentSlotsCount) {
        const startSlot = breaker.slots[0];
        const nextSlot = startSlot + 2;

        if (nextSlot > totalSlots) {
          notify?.('Cannot expand: No space at bottom of panel.');
          return prev;
        }

        const occupied = prev.some(b => b.id !== id && b.slots.includes(nextSlot));
        if (occupied) {
          notify?.(`Cannot upgrade to ${newRating}A: Slot ${nextSlot} is occupied.`);
          return prev;
        }

        return prev.map(b =>
          b.id === id ? { ...b, rating: newRating, slots: [startSlot, nextSlot] } : b
        );
      } else {
        return prev.map(b =>
          b.id === id ? { ...b, rating: newRating, slots: [breaker.slots[0]] } : b
        );
      }
    });
  }, [mainServiceLimit, notify]);

  const deleteBreaker = useCallback((id: string) => {
    setBreakers(prev => {
      const filtered = prev.filter(b => b.id !== id);
      if (selectedBreakerId === id) {
        setTimeout(() => setSelectedBreakerId(null), 0);
      }
      return filtered;
    });
  }, [selectedBreakerId]);

  const toggleBreaker = useCallback((id: string) => {
    setBreakers(prev =>
      prev.map(b =>
        b.id === id ? { ...b, on: !b.on, thermalHeat: 0 } : b
      )
    );
  }, []);

  const updateBreakerName = useCallback((id: string, name: string) => {
    setBreakers(prev =>
      prev.map(b =>
        b.id === id ? { ...b, name } : b
      )
    );
  }, []);

  const addRun = useCallback((breakerId: string) => {
    setBreakers(prev =>
      prev.map(b =>
        b.id === breakerId
          ? {
              ...b,
              runs: [
                ...b.runs,
                [{ id: generateId(), type: 'outlet', devices: [], grounded: true, temperature: 75 }]
              ]
            }
          : b
      )
    );
  }, []);

  const addComponent = useCallback((
    breakerId: string,
    runIndex: number,
    type: 'outlet' | 'switch'
  ) => {
    setBreakers(prev =>
      prev.map(b => {
        if (b.id !== breakerId) return b;
        const newRuns = [...b.runs];
        newRuns[runIndex] = [
          ...newRuns[runIndex],
          { id: generateId(), type, devices: [], isOn: false, grounded: true, temperature: 75 }
        ];
        return { ...b, runs: newRuns };
      })
    );
  }, []);

  const toggleSwitch = useCallback((
    breakerId: string,
    runIndex: number,
    compIndex: number
  ) => {
    setBreakers(prev =>
      prev.map(b => {
        if (b.id !== breakerId) return b;
        const newRuns = [...b.runs];
        const component = newRuns[runIndex][compIndex];
        if (component.type === 'switch') {
          newRuns[runIndex][compIndex] = { ...component, isOn: !component.isOn };
        }
        return { ...b, runs: newRuns };
      })
    );
  }, []);

  const toggleGround = useCallback((
    breakerId: string,
    runIndex: number,
    compIndex: number
  ) => {
    setBreakers(prev =>
      prev.map(b => {
        if (b.id !== breakerId) return b;
        const newRuns = [...b.runs];
        const component = newRuns[runIndex][compIndex];
        newRuns[runIndex][compIndex] = { ...component, grounded: !component.grounded };
        return { ...b, runs: newRuns };
      })
    );
  }, []);

  const removeComponent = useCallback((
    breakerId: string,
    runIndex: number,
    compIndex: number
  ) => {
    setBreakers(prev =>
      prev.map(b => {
        if (b.id !== breakerId) return b;
        const newRuns = [...b.runs];
        if (newRuns[runIndex].length > 1) {
          newRuns[runIndex].splice(compIndex, 1);
        } else if (b.runs.length > 1) {
          newRuns.splice(runIndex, 1);
        }
        return { ...b, runs: newRuns };
      })
    );
  }, []);

  const addDevice = useCallback((
    breakerId: string,
    runIndex: number,
    compIndex: number,
    device: Device
  ) => {
    setBreakers(prev =>
      prev.map(b => {
        if (b.id !== breakerId) return b;
        const newRuns = b.runs.map((run, rIdx) => {
          if (rIdx !== runIndex) {
            return run;
          }

          return run.map((component, cIdx) => {
            if (cIdx !== compIndex) {
              return component;
            }

            return {
              ...component,
              devices: [...component.devices, device],
            };
          });
        });
        return { ...b, runs: newRuns };
      })
    );
  }, []);

  const toggleDevicePower = useCallback((
    breakerId: string,
    runIndex: number,
    compIndex: number,
    deviceId: string
  ) => {
    setBreakers(prev =>
      prev.map(b => {
        if (b.id !== breakerId) return b;
        const newRuns = [...b.runs];
        const devices = newRuns[runIndex][compIndex].devices;
        const deviceIndex = devices.findIndex(d => d.uid === deviceId);
        if (deviceIndex !== -1) {
          const newDevices = [...devices];
          newDevices[deviceIndex] = { ...newDevices[deviceIndex], isOn: !newDevices[deviceIndex].isOn };
          newRuns[runIndex][compIndex] = { ...newRuns[runIndex][compIndex], devices: newDevices };
        }
        return { ...b, runs: newRuns };
      })
    );
  }, []);

  const removeDevice = useCallback((
    breakerId: string,
    runIndex: number,
    compIndex: number,
    deviceId: string
  ) => {
    setBreakers(prev =>
      prev.map(b => {
        if (b.id !== breakerId) return b;
        const newRuns = [...b.runs];
        newRuns[runIndex][compIndex] = {
          ...newRuns[runIndex][compIndex],
          devices: newRuns[runIndex][compIndex].devices.filter(d => d.uid !== deviceId)
        };
        return { ...b, runs: newRuns };
      })
    );
  }, []);

  const moveBreaker = useCallback((breakerId: string, targetSlot: number) => {
    const totalSlots = SLOTS_MAP[mainServiceLimit];

    setBreakers(prev => {
      const breaker = prev.find(b => b.id === breakerId);
      if (!breaker) return prev;

      const isDoublePole = breaker.slots.length === 2;
      const originalSlot = breaker.slots[0];

      // No-op if moving to same slot
      if (originalSlot === targetSlot) return prev;

      // Calculate target slots for this breaker
      const targetSlots = isDoublePole ? [targetSlot, targetSlot + 2] : [targetSlot];

      // Check bounds
      if (targetSlots.some(s => s < 1 || s > totalSlots)) {
        notify?.('Cannot move breaker: Out of bounds.');
        return prev;
      }

      // Find breaker(s) currently occupying the target slot(s)
      const occupyingBreakers = prev.filter(b =>
        b.id !== breakerId && targetSlots.some(ts => b.slots.includes(ts))
      );

      // If more than one breaker is in the way, it's too complex - abort
      if (occupyingBreakers.length > 1) {
        notify?.('Cannot move breaker: Multiple breakers in the way.');
        return prev;
      }

      const occupyingBreaker = occupyingBreakers[0];

      // If there's a breaker in the way, we need to swap
      if (occupyingBreaker) {
        const occIsDoublePole = occupyingBreaker.slots.length === 2;

        // Calculate where the occupying breaker will go
        let newOccSlots: number[];

        if (occIsDoublePole) {
          // Double-pole breaker needs to fit in the original position
          // It will take the original slot and use the next consecutive slot in the same column
          const occSecondSlot = originalSlot + 2;

          // Check if the second slot is available (not out of bounds and not occupied by another breaker)
          if (occSecondSlot > totalSlots) {
            notify?.('Cannot swap: Not enough space for double-pole breaker.');
            return prev;
          }

          // Check if second slot is occupied by someone other than the moving breaker
          const secondSlotOccupied = prev.some(
            b => b.id !== breakerId && b.id !== occupyingBreaker.id && b.slots.includes(occSecondSlot)
          );

          if (secondSlotOccupied) {
            // Use the original second slot if it's still free
            newOccSlots = [originalSlot, occupyingBreaker.slots[1]];
          } else {
            newOccSlots = [originalSlot, occSecondSlot];
          }
        } else {
          // Single-pole just takes the original slot
          newOccSlots = [originalSlot];
        }

        return prev.map(b => {
          if (b.id === breakerId) {
            return { ...b, slots: targetSlots };
          }
          if (b.id === occupyingBreaker.id) {
            return { ...b, slots: newOccSlots };
          }
          return b;
        });
      }

      // No breaker in the way, just move
      return prev.map(b =>
        b.id === breakerId ? { ...b, slots: targetSlots } : b
      );
    });
  }, [mainServiceLimit, notify]);

  return {
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
  };
};