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
  if (temperature >= 200) return 'text-red-400';
  if (temperature >= 140) return 'text-orange-300';
  if (temperature >= 110) return 'text-amber-300';
  return 'text-green-300';
};

const getTemperatureBadgeClasses = (temperature: number): string => {
  if (temperature >= 200) return 'bg-red-900/40 border border-red-700 text-red-100';
  if (temperature >= 140) return 'bg-orange-900/30 border border-orange-700 text-orange-100';
  if (temperature >= 110) return 'bg-amber-900/30 border border-amber-700 text-amber-100';
  return 'bg-emerald-900/30 border border-emerald-700 text-emerald-100';
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

  return (
    <div className="flex-grow bg-gray-900 relative overflow-hidden flex flex-col">
      {/* Breaker Info Header */}
      <div className="absolute top-4 left-6 z-10 p-4 bg-gray-800/80 rounded border border-gray-600 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
          <span className="bg-gray-700 px-2 py-1 rounded text-sm border border-gray-500 text-gray-300">
            Slot {breaker.slots.join('+')}
          </span>
          <input
            className="bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none w-48"
            value={breaker.name}
            onChange={(e) => onUpdateBreakerName(breaker.id, e.target.value)}
          />
        </h2>
        
        <div className="flex items-center gap-4 text-sm text-gray-300">
          <div className="flex items-center gap-2 bg-gray-900 px-2 py-1 rounded border border-gray-600">
            <span className="text-xs uppercase text-gray-500">Breaker Rating</span>
            <select
              className="bg-transparent font-bold text-amber-400 outline-none cursor-pointer"
              value={breaker.rating}
              onChange={(e) => onUpdateBreakerRating(breaker.id, Number(e.target.value))}
            >
              {Object.keys(BREAKER_SPECS).map(rating => (
                <option key={rating} value={rating}>{rating}A</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase text-gray-500">Active Load</span>
            <span className="font-mono font-bold">{activeAmps.toFixed(1)}A</span>
          </div>

          <div
            className="flex items-center gap-2"
            title="Maximum temperature across all components on this circuit"
          >
            <span className="text-xs uppercase text-gray-500">Circuit Temp</span>
            <span
              data-testid="breaker-temp"
              data-temp-value={breakerTemperature.toFixed(2)}
              className={`font-mono font-bold ${getTemperatureTone(breakerTemperature)}`}
            >
              {formatTemperature(breakerTemperature)}
            </span>
          </div>
        </div>
        
        {breaker.thermalHeat > 0 && (
          <div className="mt-2 w-full bg-gray-700 h-1 rounded overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-300"
              style={{ width: `${breaker.thermalHeat}%` }}
            />
          </div>
        )}
      </div>

      {/* Circuit Visualization */}
      <div className="flex-grow overflow-auto p-10 pt-32">
        <div className="flex flex-col gap-12">
          {breaker.runs.map((run, runIndex) => (
            <div key={runIndex} className="flex items-center">
              <div className="w-16 h-1 bg-gray-600 relative" />
              
              {run.map((component, compIndex) => (
                <div key={component.id} className="flex items-center">
                  <div className="relative w-48 bg-gray-800 border border-gray-600 rounded p-3 shadow-lg group">
                    <div className="flex justify-between text-xs text-gray-500 font-bold mb-2">
                      <span>{component.type.toUpperCase()}</span>
                      <button
                        onClick={() => onRemoveComponent(breaker.id, runIndex, compIndex)}
                        className="hover:text-red-500 opacity-0 group-hover:opacity-100"
                      >
                        <i className="fas fa-times" />
                      </button>
                    </div>
                    
                    {/* Component Visualization */}
                    <div className="bg-gray-300 rounded h-24 mb-2 flex items-center justify-center relative">
                      {/* Only show component temp when multiple components exist */}
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
                          className="cursor-pointer w-8 h-14 bg-white border border-gray-400 rounded shadow flex items-center justify-center"
                        >
                          <div
                            className={`w-2 h-6 rounded ${
                              component.isOn ? 'bg-green-500 mb-4' : 'bg-gray-400 mt-4'
                            }`}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1 scale-75">
                          <div className="w-6 h-8 bg-white border border-gray-400 rounded-sm relative">
                            <div className="absolute top-1 left-1.5 w-0.5 h-2 bg-black" />
                            <div className="absolute top-1 right-1.5 w-0.5 h-2 bg-black" />
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-black rounded-full" />
                          </div>
                          <div className="w-6 h-8 bg-white border border-gray-400 rounded-sm relative">
                            <div className="absolute top-1 left-1.5 w-0.5 h-2 bg-black" />
                            <div className="absolute top-1 right-1.5 w-0.5 h-2 bg-black" />
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-black rounded-full" />
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
                  
                  <div className="w-12 h-1 bg-gray-600" />
                </div>
              ))}
              
              {/* Add Component Buttons */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => onAddComponent(breaker.id, runIndex, 'outlet')}
                  className="w-8 h-8 rounded-full bg-gray-700 border border-gray-500 flex items-center justify-center hover:bg-gray-600 text-xs"
                >
                  <i className="fas fa-plug" />
                </button>
                <button
                  onClick={() => onAddComponent(breaker.id, runIndex, 'switch')}
                  className="w-8 h-8 rounded-full bg-purple-900 border border-purple-700 flex items-center justify-center hover:bg-purple-800 text-xs"
                >
                  <i className="fas fa-toggle-on" />
                </button>
              </div>
            </div>
          ))}
          
          {/* Add New Branch Button */}
          <button
            onClick={() => onAddRun(breaker.id)}
            className="w-32 py-2 border border-dashed border-gray-600 text-gray-500 text-xs hover:bg-gray-800 hover:text-white rounded"
          >
            + New Branch
          </button>
        </div>
      </div>
    </div>
  );
};

export default CircuitEditor;