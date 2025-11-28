import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { DeviceType, DeviceCategory } from '../constants/devices';
import {
  ALL_DEVICES,
  DEVICE_CATEGORIES,
  getDevicesByCategory,
  getCommonDevices,
  searchDevices,
} from '../constants/devices';

interface DevicePickerProps {
  onSelect: (device: DeviceType) => void;
  filterCategory?: DeviceCategory;
  placeholder?: string;
  recentDevices?: string[];
  onRecentUpdate?: (deviceNames: string[]) => void;
}

const RECENT_DEVICES_KEY = 'circuit-app-recent-devices';
const MAX_RECENT = 5;

// Get power level indicator
const getPowerLevel = (watts: number): { color: string; label: string } => {
  if (watts >= 2000) return { color: 'bg-apple-red', label: 'Very High' };
  if (watts >= 1000) return { color: 'bg-apple-orange', label: 'High' };
  if (watts >= 100) return { color: 'bg-apple-yellow', label: 'Medium' };
  return { color: 'bg-apple-green', label: 'Low' };
};

const DevicePicker: React.FC<DevicePickerProps> = ({
  onSelect,
  filterCategory,
  placeholder = '+ Add Device...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<DeviceCategory>>(new Set());
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [recentDeviceNames, setRecentDeviceNames] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useRef(`device-listbox-${Math.random().toString(36).slice(2, 9)}`).current;

  // Load recent devices from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_DEVICES_KEY);
      if (stored) {
        setRecentDeviceNames(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save recent device
  const addToRecent = useCallback((deviceName: string) => {
    setRecentDeviceNames((prev) => {
      const updated = [deviceName, ...prev.filter((n) => n !== deviceName)].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(RECENT_DEVICES_KEY, JSON.stringify(updated));
      } catch {
        // Ignore localStorage errors
      }
      return updated;
    });
  }, []);

  // Get recent devices as DeviceType[]
  const recentDevices = useMemo(() => {
    return recentDeviceNames
      .map((name) => ALL_DEVICES.find((d) => d.name === name))
      .filter((d): d is DeviceType => d !== undefined);
  }, [recentDeviceNames]);

  // Get common devices
  const commonDevices = useMemo(() => getCommonDevices(), []);

  // Get filtered devices based on search or category filter
  const filteredDevices = useMemo(() => {
    if (searchQuery.trim()) {
      let results = searchDevices(searchQuery);
      if (filterCategory) {
        results = results.filter((d) => d.category === filterCategory);
      }
      return results;
    }
    return [];
  }, [searchQuery, filterCategory]);

  // Build flat list of all visible items for keyboard navigation
  const visibleItems = useMemo(() => {
    const items: { type: 'device' | 'category'; device?: DeviceType; category?: DeviceCategory }[] = [];

    if (searchQuery.trim()) {
      // Search results
      filteredDevices.forEach((device) => {
        items.push({ type: 'device', device });
      });
    } else {
      // Recent devices
      if (recentDevices.length > 0) {
        recentDevices.forEach((device) => {
          items.push({ type: 'device', device });
        });
      }

      // Common devices
      commonDevices.forEach((device) => {
        if (!recentDevices.find((r) => r.name === device.name)) {
          items.push({ type: 'device', device });
        }
      });

      // Categories
      const categories = filterCategory
        ? DEVICE_CATEGORIES.filter((c) => c.id === filterCategory)
        : DEVICE_CATEGORIES;

      categories.forEach((cat) => {
        items.push({ type: 'category', category: cat.id });
        if (expandedCategories.has(cat.id)) {
          const categoryDevices = getDevicesByCategory(cat.id);
          categoryDevices.forEach((device) => {
            items.push({ type: 'device', device });
          });
        }
      });
    }

    return items;
  }, [searchQuery, filteredDevices, recentDevices, commonDevices, expandedCategories, filterCategory]);

  // Handle device selection
  const handleSelectDevice = useCallback(
    (device: DeviceType) => {
      addToRecent(device.name);
      onSelect(device);
      setIsOpen(false);
      setSearchQuery('');
      setHighlightedIndex(-1);
    },
    [addToRecent, onSelect]
  );

  // Toggle category expansion
  const toggleCategory = useCallback((category: DeviceCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => Math.min(prev + 1, visibleItems.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < visibleItems.length) {
            const item = visibleItems[highlightedIndex];
            if (item.type === 'device' && item.device) {
              handleSelectDevice(item.device);
            } else if (item.type === 'category' && item.category) {
              toggleCategory(item.category);
            }
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setSearchQuery('');
          setHighlightedIndex(-1);
          break;
        case 'Tab':
          setIsOpen(false);
          setSearchQuery('');
          break;
      }
    },
    [isOpen, highlightedIndex, visibleItems, handleSelectDevice, toggleCategory]
  );

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"], [role="button"]');
      const item = items[highlightedIndex];
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Render a device item
  const renderDeviceItem = (device: DeviceType, index: number, isHighlighted: boolean) => {
    const powerLevel = getPowerLevel(device.watts);
    return (
      <li
        key={`${device.name}-${index}`}
        role="option"
        id={`device-option-${index}`}
        aria-selected={isHighlighted}
        className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
          isHighlighted
            ? 'bg-apple-blue/20 outline outline-2 outline-apple-blue -outline-offset-2'
            : 'hover:bg-white/5'
        }`}
        onClick={() => handleSelectDevice(device)}
        onMouseEnter={() => setHighlightedIndex(index)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <i className={`fas ${device.icon} w-5 text-center text-apple-gray-1 flex-shrink-0`} aria-hidden="true" />
          <span className="font-medium text-white truncate" title={device.name}>{device.name}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`w-2 h-2 rounded-full ${powerLevel.color}`}
            title={`${powerLevel.label} power consumption`}
            aria-hidden="true"
          />
          <span className="text-sm text-apple-gray-1 tabular-nums w-16 text-right">{device.watts}W</span>
        </div>
      </li>
    );
  };

  // Render section header
  const renderSectionHeader = (title: string) => (
    <li
      role="presentation"
      className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-apple-gray-1 bg-apple-bg-tertiary sticky top-0"
    >
      {title}
    </li>
  );

  // Render category item
  const renderCategoryItem = (category: DeviceCategory, index: number, isHighlighted: boolean) => {
    const categoryInfo = DEVICE_CATEGORIES.find((c) => c.id === category);
    if (!categoryInfo) return null;

    const deviceCount = getDevicesByCategory(category).length;
    const isExpanded = expandedCategories.has(category);

    return (
      <li
        key={category}
        role="button"
        aria-expanded={isExpanded}
        aria-controls={`category-${category}-items`}
        tabIndex={-1}
        className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
          isHighlighted
            ? 'bg-apple-blue/20 outline outline-2 outline-apple-blue -outline-offset-2'
            : 'hover:bg-white/5'
        }`}
        onClick={() => toggleCategory(category)}
        onMouseEnter={() => setHighlightedIndex(index)}
      >
        <div className="flex items-center gap-3">
          <i className={`fas ${categoryInfo.icon} w-5 text-center text-apple-gray-1`} aria-hidden="true" />
          <span className="font-medium text-white">{categoryInfo.name}</span>
          <span className="text-sm text-apple-gray-2">({deviceCount})</span>
        </div>
        <i
          className={`fas fa-chevron-right text-apple-gray-2 transition-transform ${
            isExpanded ? 'rotate-90' : ''
          }`}
          aria-hidden="true"
        />
      </li>
    );
  };

  let itemIndex = 0;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-apple-bg-tertiary border border-apple-separator rounded-apple-lg text-sm text-apple-gray-1 hover:border-apple-gray-2 hover:text-white transition-colors cursor-pointer min-h-[44px]"
      >
        <span>{placeholder}</span>
        <i className={`fas fa-chevron-down text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 mt-1 w-full md:w-80 bg-apple-bg-secondary border border-apple-separator rounded-apple-lg shadow-apple-lg overflow-hidden"
          style={{ maxHeight: 'min(400px, 60vh)' }}
        >
          {/* Search Input */}
          <div className="p-3 border-b border-apple-separator">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-apple-gray-2" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                role="searchbox"
                aria-label="Search devices"
                aria-autocomplete="list"
                aria-controls={listboxId}
                aria-activedescendant={highlightedIndex >= 0 ? `device-option-${highlightedIndex}` : undefined}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search devices..."
                className="w-full pl-10 pr-10 py-2.5 bg-apple-bg-tertiary border border-apple-separator rounded-lg text-white placeholder-apple-gray-2 outline-none focus:border-apple-blue focus:ring-1 focus:ring-apple-blue min-h-[44px] text-base"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearchQuery('');
                    setHighlightedIndex(-1);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-apple-gray-2 hover:text-white p-1"
                >
                  <i className="fas fa-times" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Device List */}
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label="Available devices"
            className="overflow-y-auto"
            style={{ maxHeight: 'min(340px, calc(60vh - 60px))' }}
          >
            {searchQuery.trim() ? (
              // Search Results
              <>
                {filteredDevices.length > 0 ? (
                  <>
                    {renderSectionHeader(`Results (${filteredDevices.length})`)}
                    {filteredDevices.map((device) => {
                      const currentIndex = itemIndex++;
                      return renderDeviceItem(device, currentIndex, highlightedIndex === currentIndex);
                    })}
                  </>
                ) : (
                  <li role="presentation" className="px-4 py-8 text-center text-apple-gray-1">
                    <i className="fas fa-search text-2xl mb-2 block opacity-50" aria-hidden="true" />
                    <p>No devices match "{searchQuery}"</p>
                    <p className="text-xs mt-1 text-apple-gray-2">Try a different search term</p>
                  </li>
                )}
              </>
            ) : (
              // Browse Mode
              <>
                {/* Recent Devices */}
                {recentDevices.length > 0 && (
                  <>
                    {renderSectionHeader('Recent')}
                    {recentDevices.map((device) => {
                      const currentIndex = itemIndex++;
                      return renderDeviceItem(device, currentIndex, highlightedIndex === currentIndex);
                    })}
                  </>
                )}

                {/* Common Devices */}
                {renderSectionHeader('Common')}
                {commonDevices
                  .filter((device) => !recentDevices.find((r) => r.name === device.name))
                  .map((device) => {
                    const currentIndex = itemIndex++;
                    return renderDeviceItem(device, currentIndex, highlightedIndex === currentIndex);
                  })}

                {/* Categories */}
                {renderSectionHeader('All Categories')}
                {(filterCategory
                  ? DEVICE_CATEGORIES.filter((c) => c.id === filterCategory)
                  : DEVICE_CATEGORIES
                ).map((categoryInfo) => {
                  const currentIndex = itemIndex++;
                  const isExpanded = expandedCategories.has(categoryInfo.id);

                  return (
                    <React.Fragment key={categoryInfo.id}>
                      {renderCategoryItem(categoryInfo.id, currentIndex, highlightedIndex === currentIndex)}
                      {isExpanded && (
                        <ul id={`category-${categoryInfo.id}-items`} role="group" aria-label={`${categoryInfo.name} devices`} className="pl-4">
                          {getDevicesByCategory(categoryInfo.id).map((device) => {
                            const deviceIndex = itemIndex++;
                            return renderDeviceItem(device, deviceIndex, highlightedIndex === deviceIndex);
                          })}
                        </ul>
                      )}
                    </React.Fragment>
                  );
                })}
              </>
            )}
          </ul>

          {/* Footer with hint */}
          <div className="px-4 py-2 border-t border-apple-separator bg-apple-bg-tertiary">
            <p className="text-xs text-apple-gray-1">
              <kbd className="px-1.5 py-0.5 bg-apple-bg-secondary rounded text-xs mr-1">↑↓</kbd>
              Navigate
              <kbd className="px-1.5 py-0.5 bg-apple-bg-secondary rounded text-xs mx-1">Enter</kbd>
              Select
              <kbd className="px-1.5 py-0.5 bg-apple-bg-secondary rounded text-xs mx-1">Esc</kbd>
              Close
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevicePicker;
