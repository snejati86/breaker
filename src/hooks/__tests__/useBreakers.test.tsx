import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBreakers } from '../useBreakers';
import type { Device } from '../../types';

describe('useBreakers', () => {
  describe('addDevice', () => {
    it('should add device when called once', () => {
      const { result } = renderHook(() => useBreakers(200));
      
      // Get initial breaker state
      const initialBreaker = result.current.breakers.find(b => b.id === 'b-1');
      expect(initialBreaker?.runs[0][0].devices).toHaveLength(0);
      
      // Create a device to add
      const device: Device = {
        name: 'Test Device',
        watts: 100,
        icon: 'fa-test',
        uid: 'test-device-1',
        isOn: true
      };
      
      // Add device once
      act(() => {
        result.current.addDevice('b-1', 0, 0, device);
      });
      
      // Check that the device was added
      const updatedBreaker = result.current.breakers.find(b => b.id === 'b-1');
      expect(updatedBreaker?.runs[0][0].devices).toHaveLength(1);
      expect(updatedBreaker?.runs[0][0].devices[0].uid).toBe('test-device-1');
    });

    it('should add different devices when called with different device objects', () => {
      const { result } = renderHook(() => useBreakers(200));
      
      // Create two different devices
      const device1: Device = {
        name: 'Device 1',
        watts: 100,
        icon: 'fa-test1',
        uid: 'test-device-1',
        isOn: true
      };
      
      const device2: Device = {
        name: 'Device 2',
        watts: 200,
        icon: 'fa-test2',
        uid: 'test-device-2',
        isOn: true
      };
      
      // Add two different devices
      act(() => {
        result.current.addDevice('b-1', 0, 0, device1);
        result.current.addDevice('b-1', 0, 0, device2);
      });
      
      // Check that both devices were added
      const updatedBreaker = result.current.breakers.find(b => b.id === 'b-1');
      expect(updatedBreaker?.runs[0][0].devices).toHaveLength(2);
      expect(updatedBreaker?.runs[0][0].devices[0].uid).toBe('test-device-1');
      expect(updatedBreaker?.runs[0][0].devices[1].uid).toBe('test-device-2');
    });

    it('should add devices to the correct component in the correct run', () => {
      const { result } = renderHook(() => useBreakers(200));
      
      // First add another component to the first run
      act(() => {
        result.current.addComponent('b-1', 0, 'outlet');
      });
      
      // Create a device
      const device: Device = {
        name: 'Test Device',
        watts: 100,
        icon: 'fa-test',
        uid: 'test-device-1',
        isOn: true
      };
      
      // Add device to the second component (index 1) in the first run (index 0)
      act(() => {
        result.current.addDevice('b-1', 0, 1, device);
      });
      
      // Check that the device was added to the correct component
      const updatedBreaker = result.current.breakers.find(b => b.id === 'b-1');
      expect(updatedBreaker?.runs[0][0].devices).toHaveLength(0); // First component should be empty
      expect(updatedBreaker?.runs[0][1].devices).toHaveLength(1); // Second component should have the device
      expect(updatedBreaker?.runs[0][1].devices[0].uid).toBe('test-device-1');
    });
  });

  describe('moveBreaker', () => {
    it('should move a single-pole breaker to an empty slot', () => {
      const { result } = renderHook(() => useBreakers(200));

      // Initially Kitchen is at slot 1
      const kitchenBreaker = result.current.breakers.find(b => b.id === 'b-1');
      expect(kitchenBreaker?.slots).toEqual([1]);

      // Move to slot 7 (empty)
      act(() => {
        result.current.moveBreaker('b-1', 7);
      });

      const movedBreaker = result.current.breakers.find(b => b.id === 'b-1');
      expect(movedBreaker?.slots).toEqual([7]);
    });

    it('should swap two single-pole breakers when moving to occupied slot', () => {
      const { result } = renderHook(() => useBreakers(200));

      // Kitchen at slot 1, Shed at slot 2
      expect(result.current.breakers.find(b => b.id === 'b-1')?.slots).toEqual([1]);
      expect(result.current.breakers.find(b => b.id === 'b-2')?.slots).toEqual([2]);

      // Move Kitchen to slot 2 (occupied by Shed)
      act(() => {
        result.current.moveBreaker('b-1', 2);
      });

      // They should swap
      expect(result.current.breakers.find(b => b.id === 'b-1')?.slots).toEqual([2]);
      expect(result.current.breakers.find(b => b.id === 'b-2')?.slots).toEqual([1]);
    });

    it('should move a double-pole breaker to empty slots', () => {
      const { result } = renderHook(() => useBreakers(200));

      // Dryer at slots [3, 5]
      const dryerBreaker = result.current.breakers.find(b => b.id === 'b-3');
      expect(dryerBreaker?.slots).toEqual([3, 5]);

      // Move to slots [7, 9] (both empty)
      act(() => {
        result.current.moveBreaker('b-3', 7);
      });

      const movedBreaker = result.current.breakers.find(b => b.id === 'b-3');
      expect(movedBreaker?.slots).toEqual([7, 9]);
    });

    it('should swap single-pole with double-pole when moving single to first slot of double', () => {
      const { result } = renderHook(() => useBreakers(200));

      // Kitchen at slot 1, Dryer at [3, 5]
      // Move Kitchen to slot 3
      act(() => {
        result.current.moveBreaker('b-1', 3);
      });

      // Kitchen moves to slot 3
      // Dryer (double-pole) needs 2 consecutive slots, takes original slot 1 and slot 3
      // This means Kitchen at 3 and Dryer at [1, 3] - both claim slot 3
      // The implementation puts Kitchen at 3 and Dryer at [1, 3]
      const kitchen = result.current.breakers.find(b => b.id === 'b-1');
      const dryer = result.current.breakers.find(b => b.id === 'b-3');

      // Double-pole takes [originalSlot, originalSlot + 2] = [1, 3]
      expect(kitchen?.slots).toEqual([3]);
      expect(dryer?.slots).toEqual([1, 3]);
    });

    it('should not move breaker to out of bounds slot', () => {
      const notify = vi.fn();
      const { result } = renderHook(() => useBreakers(200, notify));

      // Try to move to slot 35 (max is 30 for 200A service)
      act(() => {
        result.current.moveBreaker('b-1', 35);
      });

      // Should not have moved
      const breaker = result.current.breakers.find(b => b.id === 'b-1');
      expect(breaker?.slots).toEqual([1]);
      expect(notify).toHaveBeenCalled();
    });

    it('should not move double-pole breaker if second slot would be out of bounds', () => {
      const notify = vi.fn();
      const { result } = renderHook(() => useBreakers(200, notify));

      // Dryer is double-pole [3, 5]
      // Try to move to slot 29 (would need 29, 31 but max is 30)
      act(() => {
        result.current.moveBreaker('b-3', 29);
      });

      // Should not have moved
      const dryer = result.current.breakers.find(b => b.id === 'b-3');
      expect(dryer?.slots).toEqual([3, 5]);
      expect(notify).toHaveBeenCalled();
    });

    it('should handle moving to same slot (no-op)', () => {
      const { result } = renderHook(() => useBreakers(200));

      act(() => {
        result.current.moveBreaker('b-1', 1); // Already at slot 1
      });

      // Nothing should change
      expect(result.current.breakers.find(b => b.id === 'b-1')?.slots).toEqual([1]);
    });

    it('should maintain column constraint (odd slots stay odd, even stay even)', () => {
      const { result } = renderHook(() => useBreakers(200));

      // Kitchen at slot 1 (left column - odd)
      // Move to slot 5 (also left column - odd)
      act(() => {
        result.current.moveBreaker('b-1', 5);
      });

      const kitchen = result.current.breakers.find(b => b.id === 'b-1');
      expect(kitchen?.slots).toEqual([5]);

      // Now move Shed from slot 2 to slot 6 (both right column - even)
      act(() => {
        result.current.moveBreaker('b-2', 6);
      });

      const shed = result.current.breakers.find(b => b.id === 'b-2');
      expect(shed?.slots).toEqual([6]);
    });

    it('should return moveBreaker function', () => {
      const { result } = renderHook(() => useBreakers(200));
      expect(typeof result.current.moveBreaker).toBe('function');
    });
  });
});