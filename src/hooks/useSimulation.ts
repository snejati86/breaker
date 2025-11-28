import { useEffect, useState } from 'react';
import type { Breaker, SimulationState } from '../types';
import {
  calculateBreakerLoad,
  calculateComponentLoad,
  calculateThermalHeat,
  updateComponentTemperature,
} from '../utils/calculations';

export const useSimulation = (
  _breakers: Breaker[],
  setBreakers: React.Dispatch<React.SetStateAction<Breaker[]>>,
  mainServiceLimit: number,
  mainBreakerTripped: boolean,
  mainBreakerManualOff: boolean,
  setMainBreakerTripped: (value: boolean) => void,
  timeSpeed: number = 1
) => {
  const [simState, setSimState] = useState<SimulationState>({ totalLoad: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setBreakers(prev => {
        let changed = false;
        let grandTotal = 0;
        const mainOff = mainBreakerTripped || mainBreakerManualOff;

        const next = prev.map(b => {
          const amps = calculateBreakerLoad(b, !mainOff);
          const effective = (b.on && !mainOff) ? amps : 0;
          
          if (b.on && !mainOff) {
            grandTotal += amps;
          }

          const loadRatio = effective / b.rating;

          // Instant trip on extreme overload
          if (b.on && !mainOff && loadRatio > 10) {
            changed = true;
            return { ...b, on: false, thermalHeat: 100 };
          }

          // Calculate thermal heat change
          const newHeat = calculateThermalHeat(
            b.thermalHeat || 0,
            loadRatio,
            timeSpeed,
            b.on,
            !mainOff
          );

          // Trip on thermal overload
          if (newHeat >= 100 && b.on) {
            changed = true;
            return { ...b, on: false, thermalHeat: 100 };
          }

          let localChange = Math.abs(newHeat - (b.thermalHeat || 0)) > 0.1;

          const updatedRuns = b.runs.map(run =>
            run.map(component => {
              const loadWatts =
                b.on && !mainOff ? calculateComponentLoad(component) : 0;
              const nextTemp = updateComponentTemperature(component, loadWatts, timeSpeed);
              if (Math.abs(nextTemp - (component.temperature ?? 75)) > 0.05) {
                localChange = true;
                return { ...component, temperature: nextTemp };
              }
              if (component.temperature === undefined) {
                localChange = true;
                return { ...component, temperature: nextTemp };
              }
              return component;
            })
          );

          if (localChange) {
            changed = true;
          }

          return { ...b, thermalHeat: newHeat, runs: updatedRuns };
        });

        // Check main breaker overload
        if (!mainOff && grandTotal > mainServiceLimit) {
          setMainBreakerTripped(true);
          changed = true;
        }

        setSimState({ totalLoad: grandTotal });
        return changed ? next : prev;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [
    timeSpeed,
    mainServiceLimit,
    mainBreakerTripped,
    mainBreakerManualOff,
    setBreakers,
    setMainBreakerTripped
  ]);

  return simState;
};