import React, { useState, useRef, useCallback } from 'react';
import type { Component, Device } from '../types';
import type { DeviceType } from '../constants/devices';
import { fetchCustomDeviceSpecs } from '../services/deviceApi';
import { generateId } from '../utils/calculations';
import DevicePicker from './DevicePicker';

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
  const isAddingDeviceRef = useRef(false);
  const lastDeviceAddedRef = useRef<{ type: string; time: number } | null>(null);

  const handleDeviceSelect = useCallback(
    (deviceType: DeviceType) => {
      const now = Date.now();

      // Prevent duplicate rapid adds
      if (
        isAddingDeviceRef.current ||
        (lastDeviceAddedRef.current &&
          lastDeviceAddedRef.current.type === deviceType.name &&
          now - lastDeviceAddedRef.current.time < 300)
      ) {
        return;
      }

      isAddingDeviceRef.current = true;

      const device: Device = {
        ...deviceType,
        uid: generateId(),
        isOn: true,
      };

      onAddDevice(device);
      lastDeviceAddedRef.current = { type: deviceType.name, time: now };

      setTimeout(() => {
        isAddingDeviceRef.current = false;
      }, 200);
    },
    [onAddDevice]
  );

  const confirmSearch = useCallback(async () => {
    const now = Date.now();

    if (
      !searchQuery.trim() ||
      isAddingDeviceRef.current ||
      (lastDeviceAddedRef.current &&
        lastDeviceAddedRef.current.type === searchQuery &&
        now - lastDeviceAddedRef.current.time < 500)
    ) {
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
    setIsSearching(false);

    setTimeout(() => {
      isAddingDeviceRef.current = false;
    }, 300);
  }, [searchQuery, onAddDevice]);

  return (
    <div data-testid="device-manager" className="relative">
      {/* Custom Search Modal */}
      {searchModal.open && (
        <div
          className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-modal-title"
        >
          <div className="bg-apple-bg-secondary border border-apple-separator p-6 rounded-apple-xl w-full max-w-md shadow-apple-lg">
            <h3 id="search-modal-title" className="text-xl font-bold mb-4 text-white">
              Search for Device
            </h3>
            <p className="text-sm text-apple-gray-1 mb-4">
              Enter any device name and we'll estimate its power consumption.
            </p>
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirmSearch()}
              className="w-full bg-apple-bg-tertiary border border-apple-separator rounded-apple-lg p-3 mb-4 text-white placeholder-apple-gray-2 outline-none focus:border-apple-blue min-h-[44px]"
              placeholder="e.g. Waffle Maker, Air Purifier..."
              aria-label="Device name to search"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSearchModal({ open: false })}
                className="px-4 py-2 text-apple-gray-1 hover:text-white transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={confirmSearch}
                disabled={!searchQuery.trim()}
                className="px-5 py-2 bg-apple-blue text-white rounded-apple-lg hover:bg-apple-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
              >
                Search & Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isSearching && (
        <div
          className="absolute inset-0 bg-black/70 z-[60] flex items-center justify-center rounded-apple-lg"
          role="status"
          aria-live="polite"
        >
          <div className="bg-apple-bg-secondary p-4 rounded-apple-lg shadow-apple flex flex-col items-center">
            <div className="w-6 h-6 border-2 border-apple-blue border-t-transparent rounded-full animate-spin mb-2" />
            <span className="text-xs text-white">Analyzing device...</span>
          </div>
        </div>
      )}

      {/* Ground Wire Toggle */}
      <label className="flex items-center gap-2 mb-3 py-1 cursor-pointer min-h-[44px] md:min-h-0">
        <input
          type="checkbox"
          checked={component.grounded}
          onChange={onToggleGround}
          className="w-5 h-5 md:w-4 md:h-4 accent-apple-green rounded"
          aria-describedby="ground-wire-description"
        />
        <span
          id="ground-wire-description"
          className={`text-sm md:text-xs font-medium ${
            component.grounded ? 'text-apple-green' : 'text-apple-gray-2'
          }`}
        >
          Ground Wire
        </span>
      </label>

      {/* Devices List */}
      <div
        data-testid="device-list"
        className="space-y-2 max-h-40 md:max-h-32 overflow-y-auto mb-3"
        role="list"
        aria-label="Connected devices"
      >
        {component.devices.length === 0 ? (
          <p className="text-xs text-apple-gray-2 py-2 text-center">No devices connected</p>
        ) : (
          component.devices.map((device) => (
            <div
              key={device.uid}
              data-testid="device-row"
              role="listitem"
              className={`flex justify-between items-center p-2.5 md:p-2 rounded-apple-lg border transition-colors ${
                device.isOn
                  ? 'bg-apple-bg-tertiary border-apple-separator'
                  : 'bg-apple-bg-secondary border-apple-gray-3 opacity-60'
              }`}
            >
              <div className="flex gap-3 items-center overflow-hidden min-w-0">
                <button
                  onClick={() => onToggleDevice(device.uid)}
                  className="p-2 md:p-1 -m-1 active:scale-95 transition-transform flex-shrink-0 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
                  aria-label={`Turn ${device.name} ${device.isOn ? 'off' : 'on'}`}
                  aria-pressed={device.isOn}
                >
                  <i
                    className={`fas fa-power-off text-base md:text-sm ${
                      device.isOn ? 'text-apple-green' : 'text-apple-gray-2'
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <span className="text-sm md:text-xs font-medium truncate text-white" title={device.name}>
                  {device.name}
                </span>
              </div>
              <div className="flex gap-2 md:gap-3 items-center flex-shrink-0">
                <span className="text-sm md:text-xs text-apple-gray-1 tabular-nums">{device.watts}W</span>
                <button
                  onClick={() => onRemoveDevice(device.uid)}
                  className="p-2 md:p-1 -m-1 text-apple-gray-2 hover:text-apple-red active:scale-95 transition-all min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
                  aria-label={`Remove ${device.name}`}
                >
                  <i className="fas fa-times" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Device Picker */}
      <DevicePicker
        onSelect={handleDeviceSelect}
        filterCategory={component.type === 'switch' ? 'lighting' : undefined}
        placeholder={component.type === 'switch' ? '+ Add Light...' : '+ Add Device...'}
      />

      {/* Custom Search Link */}
      <button
        type="button"
        onClick={() => {
          setSearchModal({ open: true });
          setSearchQuery('');
        }}
        className="w-full mt-2 py-2 text-xs text-apple-gray-1 hover:text-apple-blue transition-colors text-center min-h-[44px] flex items-center justify-center gap-2"
      >
        <i className="fas fa-search" aria-hidden="true" />
        <span>Can't find your device? Search for it</span>
      </button>
    </div>
  );
};

export default DeviceManager;
