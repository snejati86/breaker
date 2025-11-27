import { describe, it, expect } from 'vitest';
import {
  generateId,
  calculateComponentLoad,
  calculateBreakerLoad,
  calculateThermalHeat,
  updateComponentTemperature,
} from '../calculations';
import type { Component, Breaker } from '../../types';

describe('calculations', () => {
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(id1).toHaveLength(9);
    });
  });

  describe('calculateComponentLoad', () => {
    it('should calculate load for outlet with devices', () => {
      const component: Component = {
        id: 'c1',
        type: 'outlet',
        devices: [
          { uid: 'd1', name: 'Lamp', watts: 60, icon: 'fa-lightbulb', isOn: true },
          { uid: 'd2', name: 'TV', watts: 200, icon: 'fa-tv', isOn: true },
        ],
        grounded: true,
      };
      
      expect(calculateComponentLoad(component)).toBe(260);
    });

    it('should return 0 for switch that is off', () => {
      const component: Component = {
        id: 'c1',
        type: 'switch',
        devices: [
          { uid: 'd1', name: 'Lamp', watts: 60, icon: 'fa-lightbulb', isOn: true },
        ],
        grounded: true,
        isOn: false,
      };
      
      expect(calculateComponentLoad(component)).toBe(0);
    });

    it('should calculate load for switch that is on', () => {
      const component: Component = {
        id: 'c1',
        type: 'switch',
        devices: [
          { uid: 'd1', name: 'Lamp', watts: 60, icon: 'fa-lightbulb', isOn: true },
        ],
        grounded: true,
        isOn: true,
      };
      
      expect(calculateComponentLoad(component)).toBe(60);
    });
  });

  describe('calculateBreakerLoad', () => {
    it('should calculate breaker load in amps', () => {
      const breaker: Breaker = {
        id: 'b1',
        name: 'Kitchen',
        rating: 20,
        slots: [1],
        thermalHeat: 0,
        on: true,
        runs: [[
          {
            id: 'c1',
            type: 'outlet',
            devices: [
              { uid: 'd1', name: 'Microwave', watts: 1200, icon: 'fa-square', isOn: true },
            ],
            grounded: true,
          },
        ]],
      };

      const load = calculateBreakerLoad(breaker, true);
      expect(load).toBe(10); // 1200W / 120V = 10A
    });

    it('should return 0 when breaker is off', () => {
      const breaker: Breaker = {
        id: 'b1',
        name: 'Kitchen',
        rating: 20,
        slots: [1],
        thermalHeat: 0,
        on: false,
        runs: [[
          {
            id: 'c1',
            type: 'outlet',
            devices: [
              { uid: 'd1', name: 'Microwave', watts: 1200, icon: 'fa-square', isOn: true },
            ],
            grounded: true,
          },
        ]],
      };

      const load = calculateBreakerLoad(breaker, true);
      expect(load).toBe(0);
    });
  });

  describe('calculateThermalHeat', () => {
    it('should increase heat when overloaded', () => {
      const newHeat = calculateThermalHeat(50, 1.5, 1, true, true);
      expect(newHeat).toBeGreaterThan(50);
    });

    it('should decrease heat when underloaded', () => {
      const newHeat = calculateThermalHeat(50, 0.5, 1, true, true);
      expect(newHeat).toBeLessThan(50);
    });

    it('should not go below 0', () => {
      const newHeat = calculateThermalHeat(1, 0, 10, true, true);
      expect(newHeat).toBe(0);
    });

    it('should not exceed 100', () => {
      const newHeat = calculateThermalHeat(95, 5, 10, true, true);
      expect(newHeat).toBe(100);
    });
  });

  describe('updateComponentTemperature', () => {
    it('should raise temperature when load is applied', () => {
      const component: Component = {
        id: 'c1',
        type: 'outlet',
        devices: [],
        grounded: true,
        temperature: 75,
      };

      const nextTemp = updateComponentTemperature(component, 1200, 1);
      expect(nextTemp).toBeGreaterThan(75);
    });

    it('should cool toward ambient with no load', () => {
      const component: Component = {
        id: 'c1',
        type: 'outlet',
        devices: [],
        grounded: true,
        temperature: 150,
      };

      const nextTemp = updateComponentTemperature(component, 0, 1);
      expect(nextTemp).toBeLessThan(150);
      expect(nextTemp).toBeGreaterThanOrEqual(75);
    });

    it('should heat switches faster than outlets under same load', () => {
      const baseComponent: Component = {
        id: 'c1',
        type: 'outlet',
        devices: [],
        grounded: true,
        temperature: 75,
      };

      const outletTemp = updateComponentTemperature(baseComponent, 600, 1);
      const switchTemp = updateComponentTemperature(
        { ...baseComponent, id: 'c2', type: 'switch', isOn: true },
        600,
        1
      );

      expect(switchTemp).toBeGreaterThan(outletTemp);
    });
  });
});