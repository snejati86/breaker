import React, { useState, useRef, useCallback, useMemo } from 'react';
import type { Component, Device } from '../types';
import type { DeviceType } from '../constants/devices';
import { DEVICE_TYPES, LIGHT_TYPES } from '../constants/devices';
import { fetchCustomDeviceSpecs } from '../services/deviceApi';
import { generateId } from '../utils/calculations';

interface DeviceManagerProps {
  component: Component;
  breakerId: string;
  runIndex: number;
  compIndex: number;
  onToggleDevice: (deviceId: string) => void;
  onRemoveDevice: (deviceId: string) => void;
  onAddDevice: (device: Device) => void;
  onToggleGround: () => void;
}

const DeviceManager: React.FC<DeviceManagerProps> = ({
  component,
  onToggleDevice,
  onRemoveDevice,
  onAddDevice,
  onToggleGround,
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchModal, setSearchModal] = useState({ open: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('');
  const isAddingDeviceRef = useRef(false);
  const lastDeviceAddedRef = useRef<{ type: string; time: number } | null>(null);

  const deviceLookup = useMemo(() => {
    const map = new Map<string, DeviceType>();
    [...DEVICE_TYPES, ...LIGHT_TYPES].forEach((deviceType) => {
      if (!map.has(deviceType.name)) {
        map.set(deviceType.name, deviceType);
      }
    });
    return map;
  }, []);

  const addDeviceByName = useCallback(
    (deviceName: string) => {
      const deviceType = deviceLookup.get(deviceName);
      if (!deviceType) {
        return false;
      }

      const device: Device = {
        ...deviceType,
        uid: generateId(),
        isOn: true,
      };
      onAddDevice(device);
      return true;
    },
    [deviceLookup, onAddDevice]
  );

  const handleSelectChange = useCallback((value: string) => {
    if (value === 'CUSTOM_SEARCH') {
      setSearchModal({ open: true });
      setSearchQuery('');
      setSelectedDevice('');
      return;
    }

    if (!value || isAddingDeviceRef.current) {
      return;
    }

    // Auto-add the device when selected
    const now = Date.now();
    if (
      lastDeviceAddedRef.current &&
      lastDeviceAddedRef.current.type === value &&
      now - lastDeviceAddedRef.current.time < 300
    ) {
      return;
    }

    isAddingDeviceRef.current = true;
    const added = addDeviceByName(value);
    if (added) {
      lastDeviceAddedRef.current = { type: value, time: now };
    }

    setTimeout(() => {
      isAddingDeviceRef.current = false;
    }, 200);

    // Reset the select back to placeholder
    setSelectedDevice('');
  }, [addDeviceByName]);

  const confirmSearch = useCallback(async () => {
    const now = Date.now();
    
    if (!searchQuery.trim() || 
        isAddingDeviceRef.current || 
        (lastDeviceAddedRef.current && 
         lastDeviceAddedRef.current.type === searchQuery && 
         (now - lastDeviceAddedRef.current.time) < 500)) {
      return;
    }
    
    setSearchModal({ open: false });
    setIsSearching(true);
    isAddingDeviceRef.current = true;
    
    const deviceSpec = await fetchCustomDeviceSpecs(searchQuery);
    const customDevice: Device = {
      ...deviceSpec,
      uid: generateId(),
      isOn: true,
    };

    onAddDevice(customDevice);
    lastDeviceAddedRef.current = { type: deviceSpec.name, time: now };
    setSelectedDevice('');
    setIsSearching(false);
    
    // Reset the adding flag after a longer delay
    setTimeout(() => {
      isAddingDeviceRef.current = false;
    }, 300);
  }, [searchQuery, onAddDevice]);

  const deviceOptions = useMemo(() => {
    const source = component.type === 'switch' ? LIGHT_TYPES : DEVICE_TYPES;
    const seen = new Set<string>();
    return source.filter((deviceType) => {
      if (seen.has(deviceType.name)) {
        return false;
      }
      seen.add(deviceType.name);
      return true;
    });
  }, [component.type]);

  return (
    <div data-testid="device-manager" className="relative">
      {/* Search Modal */}
      {searchModal.open && (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-600 p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Device</h3>
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirmSearch()}
              className="w-full bg-gray-900 border border-gray-600 rounded p-2 mb-4"
              placeholder="e.g. Toaster"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSearchModal({ open: false })}
                className="px-4 py-2 text-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmSearch}
                className="px-4 py-2 bg-blue-600 rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isSearching && (
        <div className="absolute inset-0 bg-black/70 z-[60] flex items-center justify-center rounded">
          <div className="bg-gray-800 p-4 rounded shadow-xl flex flex-col items-center">
            <div className="loader mb-2" />
            <span className="text-xs">Analyzing...</span>
          </div>
        </div>
      )}

      {/* Ground Wire Toggle */}
      <label className="flex items-center gap-2 mb-2 py-1 cursor-pointer">
        <input
          type="checkbox"
          checked={component.grounded}
          onChange={onToggleGround}
          className="accent-green-500 w-4 h-4 md:w-3.5 md:h-3.5"
        />
        <span className={`text-xs md:text-[10px] ${component.grounded ? 'text-green-400' : 'text-gray-500'}`}>
          Ground Wire
        </span>
      </label>


      {/* Devices List */}
      <div data-testid="device-list" className="space-y-1.5 md:space-y-1 max-h-32 md:max-h-24 overflow-y-auto">
        {component.devices.map((device) => (
          <div
            key={device.uid}
            data-testid="device-row"
            className={`flex justify-between items-center p-2 md:p-1 rounded border text-xs md:text-[10px] ${
              device.isOn
                ? 'bg-gray-700 border-gray-600'
                : 'bg-gray-800 border-gray-700 opacity-60'
            }`}
          >
            <div className="flex gap-2 items-center overflow-hidden">
              <button
                onClick={() => onToggleDevice(device.uid)}
                className="p-1.5 md:p-0 -m-1.5 md:m-0 active:opacity-70"
                aria-label={`Toggle ${device.name} ${device.isOn ? 'off' : 'on'}`}
              >
                <i
                  className={`fas fa-power-off ${
                    device.isOn ? 'text-green-400' : 'text-gray-500'
                  }`}
                />
              </button>
              <span className="truncate flex-1 md:w-20" title={device.name}>
                {device.name}
              </span>
            </div>
            <div className="flex gap-2 md:gap-2 items-center">
              <span className="text-gray-400">{device.watts}W</span>
              <button
                onClick={() => onRemoveDevice(device.uid)}
                className="p-1.5 md:p-0 -m-1.5 md:m-0 hover:text-red-500 active:text-red-400"
                aria-label={`Remove ${device.name}`}
              >
                <i className="fas fa-times" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Device Dropdown */}
      <div className="mt-2">
        <select
          className="w-full bg-gray-700 text-sm md:text-[10px] p-2.5 md:p-1.5 rounded border border-gray-600 hover:border-gray-500 active:border-gray-400 cursor-pointer"
          value={selectedDevice}
          onChange={(e) => handleSelectChange(e.target.value)}
          aria-label="Add device to this component"
        >
          <option value="">+ Plug In Device...</option>
          {deviceOptions.map((deviceType) => (
            <option key={deviceType.name} value={deviceType.name}>
              {deviceType.name} ({deviceType.watts}W)
            </option>
          ))}
          <option value="CUSTOM_SEARCH">🔍 Search for other...</option>
        </select>
      </div>
    </div>
  );
};

export default DeviceManager;