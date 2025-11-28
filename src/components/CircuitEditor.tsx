import React from 'react';
import type { Breaker, Device } from '../types';
import { calculateBreakerLoad } from '../utils/calculations';
import { BREAKER_SPECS } from '../constants/breakers';
import DeviceManager from './DeviceManager';

interface CircuitEditorProps {
  breaker: Breaker;
  mainPowerOn: boolean;
  onUpdateBreakerName: (id: string, name: string) => void;
  onUpdateBreakerRating: (id: string, rating: number) => void;
  onAddRun: (breakerId: string) => void;
  onAddComponent: (breakerId: string, runIndex: number, type: 'outlet' | 'switch') => void;
  onToggleSwitch: (breakerId: string, runIndex: number, compIndex: number) => void;
  onToggleGround: (breakerId: string, runIndex: number, compIndex: number) => void;
  onRemoveComponent: (breakerId: string, runIndex: number, compIndex: number) => void;
  onAddDevice: (breakerId: string, runIndex: number, compIndex: number, device: Device) => void;
  onToggleDevicePower: (breakerId: string, runIndex: number, compIndex: number, deviceId: string) => void;
  onRemoveDevice: (breakerId: string, runIndex: number, compIndex: number, deviceId: string) => void;
}

const getTemperatureTone = (temperature: number): string => {
  if (temperature >= 200) return 'text-apple-red';
  if (temperature >= 140) return 'text-apple-orange';
  if (temperature >= 110) return 'text-apple-yellow';
  return 'text-apple-green';
};

const getTemperatureBadgeClasses = (temperature: number): string => {
  if (temperature >= 200) return 'bg-apple-red/20 border border-apple-red/50 text-apple-red';
  if (temperature >= 140) return 'bg-apple-orange/20 border border-apple-orange/50 text-apple-orange';
  if (temperature >= 110) return 'bg-apple-yellow/20 border border-apple-yellow/50 text-apple-yellow';
  return 'bg-apple-green/20 border border-apple-green/50 text-apple-green';
};

const formatTemperature = (temperature: number): string => `${temperature.toFixed(0)}°F`;

const CircuitEditor: React.FC<CircuitEditorProps> = ({
  breaker,
  mainPowerOn,
  onUpdateBreakerName,
  onUpdateBreakerRating,
  onAddRun,
  onAddComponent,
  onToggleSwitch,
  onToggleGround,
  onRemoveComponent,
  onAddDevice,
  onToggleDevicePower,
  onRemoveDevice,
}) => {
  const activeAmps = calculateBreakerLoad(breaker, mainPowerOn);
  const components = breaker.runs.flatMap(run => run);
  const breakerTemperature = components.reduce(
    (max, component) => Math.max(max, component.temperature ?? 75),
    75
  );
  const totalComponents = components.length;
  const showComponentTemp = totalComponents > 1;

  const loadPercentage = (activeAmps / breaker.rating) * 100;
  const getLoadColor = () => {
    if (loadPercentage >= 100) return 'bg-apple-red';
    if (loadPercentage >= 80) return 'bg-apple-orange';
    if (loadPercentage >= 50) return 'bg-apple-yellow';
    return 'bg-apple-blue';
  };

  return (
    <div className="flex-grow bg-apple-bg-elevated relative overflow-hidden flex flex-col w-full">
      {/* Breaker Info Header - Fixed Header Bar */}
      <header className="sticky top-0 z-10 px-4 md:px-6 py-3 bg-apple-bg-elevated border-b border-apple-separator/50">
        {/* Title row */}
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-sm text-white/50 font-medium">
            Slot {breaker.slots.join('+')}
          </span>
          <div className="relative group flex-1 max-w-xs">
            <input
              className="bg-transparent text-xl font-semibold text-white outline-none w-full border-b border-transparent hover:border-apple-separator focus:border-apple-blue transition-colors pr-6"
              value={breaker.name}
              onChange={(e) => onUpdateBreakerName(breaker.id, e.target.value)}
              aria-label="Circuit name"
            />
            <i className="fas fa-pencil absolute right-0 top-1/2 -translate-y-1/2 text-xs text-apple-gray-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" aria-hidden="true" />
          </div>
        </div>

        {/* Metrics row */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          {/* Rating - Interactive */}
          <div className="flex items-center gap-2">
            <label htmlFor={`breaker-rating-${breaker.id}`} className="text-xs uppercase tracking-wide text-white/60 font-medium">
              Rating
            </label>
            <select
              id={`breaker-rating-${breaker.id}`}
              className="bg-apple-bg-secondary border border-apple-separator rounded-lg px-2 py-1 font-semibold text-apple-orange outline-none cursor-pointer text-base tabular-nums hover:border-apple-orange/50 transition-colors"
              value={breaker.rating}
              onChange={(e) => onUpdateBreakerRating(breaker.id, Number(e.target.value))}
              aria-label={`Change breaker rating for ${breaker.name}`}
            >
              {Object.keys(BREAKER_SPECS).map(rating => (
                <option key={rating} value={rating} className="bg-apple-bg-secondary text-white">{rating}A</option>
              ))}
            </select>
          </div>

          {/* Load - Status */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-white/60 font-medium">Load</span>
            <span className="font-mono font-semibold text-white tabular-nums">
              {activeAmps.toFixed(1)}
              <span className="text-white/40 text-sm ml-0.5">/ {breaker.rating}A</span>
            </span>
            {/* Inline load bar */}
            <div className="h-1.5 w-16 bg-apple-bg-tertiary rounded-full overflow-hidden">
              <div
                className={`h-full ${getLoadColor()} transition-all duration-300 rounded-full`}
                style={{ width: `${Math.min(loadPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Temp - Status */}
          <div
            className="flex items-center gap-2"
            title="Maximum temperature across all components on this circuit"
          >
            <span className="text-xs uppercase tracking-wide text-white/60 font-medium">Temp</span>
            <span
              data-testid="breaker-temp"
              data-temp-value={breakerTemperature.toFixed(2)}
              className={`font-mono font-semibold tabular-nums ${getTemperatureTone(breakerTemperature)} ${
                breakerTemperature >= 140 ? 'animate-pulse' : ''
              }`}
            >
              {formatTemperature(breakerTemperature)}
            </span>
          </div>

          {/* Thermal heat indicator (only when active) */}
          {breaker.thermalHeat > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-apple-orange font-medium">Heat</span>
              <div className="h-1.5 w-16 bg-apple-bg-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-apple-orange transition-all duration-300 rounded-full"
                  style={{ width: `${breaker.thermalHeat}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Circuit Visualization */}
      <div className="flex-grow overflow-auto p-4 md:p-8">
        <div className="flex flex-col gap-6 md:gap-10">
          {breaker.runs.map((run, runIndex) => (
            <div key={runIndex} className="flex flex-wrap md:flex-nowrap items-start md:items-center gap-3 md:gap-0">
              <div className="hidden md:block w-12 h-0.5 bg-apple-gray-3 rounded-full" />

              {run.map((component, compIndex) => (
                <div key={component.id} className="flex items-center w-full md:w-auto">
                  <div className="relative w-full md:w-52 bg-apple-bg-secondary border border-apple-separator rounded-apple-xl p-4 shadow-apple group">
                    <div className="flex justify-between text-xs text-apple-gray-1 font-semibold mb-3">
                      <span>{component.type.toUpperCase()}</span>
                      <button
                        onClick={() => onRemoveComponent(breaker.id, runIndex, compIndex)}
                        className="hover:text-apple-red opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <i className="fas fa-times" />
                      </button>
                    </div>

                    {/* Component Visualization */}
                    <div className="bg-apple-bg-tertiary rounded-apple-lg h-24 mb-3 flex items-center justify-center relative border border-apple-separator">
                      {showComponentTemp && (
                        <div
                          data-testid="component-temp"
                          data-temp-value={(component.temperature ?? 75).toFixed(2)}
                          className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${getTemperatureBadgeClasses(
                            component.temperature ?? 75
                          )}`}
                          title="Component temperature"
                        >
                          {formatTemperature(component.temperature ?? 75)}
                        </div>
                      )}
                      {component.type === 'switch' ? (
                        <div
                          onClick={() => onToggleSwitch(breaker.id, runIndex, compIndex)}
                          className="cursor-pointer w-10 h-16 bg-white border border-apple-separator rounded-apple shadow-apple-sm flex items-center justify-center hover:shadow-apple transition-shadow"
                        >
                          <div
                            className={`w-2.5 h-7 rounded transition-all duration-200 ${
                              component.isOn ? 'bg-apple-green -translate-y-1' : 'bg-apple-gray-2 translate-y-1'
                            }`}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1.5 scale-90">
                          <div className="w-7 h-9 bg-white border border-apple-separator rounded shadow-apple-sm relative">
                            <div className="absolute top-1.5 left-2 w-0.5 h-2.5 bg-apple-bg rounded-full" />
                            <div className="absolute top-1.5 right-2 w-0.5 h-2.5 bg-apple-bg rounded-full" />
                            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-apple-bg rounded-full" />
                          </div>
                          <div className="w-7 h-9 bg-white border border-apple-separator rounded shadow-apple-sm relative">
                            <div className="absolute top-1.5 left-2 w-0.5 h-2.5 bg-apple-bg rounded-full" />
                            <div className="absolute top-1.5 right-2 w-0.5 h-2.5 bg-apple-bg rounded-full" />
                            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-apple-bg rounded-full" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Device Manager */}
                    <DeviceManager
                      component={component}
                      breakerId={breaker.id}
                      runIndex={runIndex}
                      compIndex={compIndex}
                      onToggleDevice={(deviceId) => onToggleDevicePower(breaker.id, runIndex, compIndex, deviceId)}
                      onRemoveDevice={(deviceId) => onRemoveDevice(breaker.id, runIndex, compIndex, deviceId)}
                      onAddDevice={(device) => onAddDevice(breaker.id, runIndex, compIndex, device)}
                      onToggleGround={() => onToggleGround(breaker.id, runIndex, compIndex)}
                    />
                  </div>

                  <div className="hidden md:block w-8 h-0.5 bg-apple-gray-3 rounded-full" />
                </div>
              ))}

              {/* Add Component Buttons */}
              <div className="flex flex-row md:flex-col gap-2">
                <button
                  onClick={() => onAddComponent(breaker.id, runIndex, 'outlet')}
                  className="w-11 h-11 md:w-9 md:h-9 rounded-full bg-apple-bg-tertiary border border-apple-separator flex items-center justify-center hover:bg-apple-gray-3 active:scale-95 text-apple-gray-1 hover:text-white transition-all"
                  aria-label="Add outlet"
                >
                  <i className="fas fa-plug text-sm" />
                </button>
                <button
                  onClick={() => onAddComponent(breaker.id, runIndex, 'switch')}
                  className="w-11 h-11 md:w-9 md:h-9 rounded-full bg-apple-purple/20 border border-apple-purple/30 flex items-center justify-center hover:bg-apple-purple/30 active:scale-95 text-apple-purple transition-all"
                  aria-label="Add switch"
                >
                  <i className="fas fa-toggle-on text-sm" />
                </button>
              </div>
            </div>
          ))}

          {/* Add New Branch Button */}
          <button
            onClick={() => onAddRun(breaker.id)}
            className="w-full md:w-40 py-3 md:py-2.5 border border-dashed border-apple-separator text-apple-gray-1 text-sm font-medium hover:bg-apple-bg-tertiary active:scale-98 hover:text-white hover:border-apple-gray-2 rounded-apple-lg transition-all"
          >
            <i className="fas fa-plus mr-2" />
            New Branch
          </button>
        </div>
      </div>
    </div>
  );
};

export default CircuitEditor;
