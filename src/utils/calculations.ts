import type { Breaker, Component } from '../types';

export const generateId = (): string => Math.random().toString(36).substr(2, 9);
const LINE_VOLTAGE = 120;
const BASE_TICK_SECONDS = 0.5;
const AMBIENT_TEMP = 75;
const OUTLET_HEAT_CAPACITY = 45; // Higher mass slows swing
const SWITCH_HEAT_CAPACITY = 30;
const OUTLET_CONTACT_RESISTANCE = 0.035;
const SWITCH_CONTACT_RESISTANCE = 0.05;
const COOLING_TIME_CONSTANT = 90; // seconds needed to shed ~63% of excess heat
const MAX_COMPONENT_TEMP = 260; // Components should never exceed insulation rating

export const calculateComponentLoad = (component: Component): number => {
  if (component.type === 'switch' && !component.isOn) {
    return 0;
  }
  
  return component.devices.reduce((total, device) => {
    if (!device.isOn) {
      return total;
    }
    const watts = Number(device.watts);
    if (!Number.isFinite(watts)) {
      return total;
    }
    return total + watts;
  }, 0);
};

export const calculateBreakerLoad = (breaker: Breaker, mainPowerOn: boolean): number => {
  if (!breaker.on || !mainPowerOn) {
    return 0;
  }
  
  let totalWatts = 0;
  breaker.runs.forEach(run => {
    run.forEach(component => {
      totalWatts += calculateComponentLoad(component);
    });
  });
  
  return totalWatts / LINE_VOLTAGE; // Convert watts to amps (assuming 120V)
};

export const calculateTotalLoad = (breakers: Breaker[], mainPowerOn: boolean): number => {
  return breakers.reduce((total, breaker) => {
    return total + calculateBreakerLoad(breaker, mainPowerOn);
  }, 0);
};

export const calculateThermalHeat = (
  currentHeat: number,
  loadRatio: number,
  timeSpeed: number,
  isOn: boolean,
  mainPowerOn: boolean
): number => {
  let heatChange = -1.0 * timeSpeed;
  
  if (isOn && mainPowerOn) {
    if (loadRatio > 1.0) {
      heatChange = (Math.pow(loadRatio, 2) - 1) * 0.5 * timeSpeed;
    } else {
      heatChange = -0.5 * timeSpeed;
    }
  }
  
  return Math.max(0, Math.min(100, currentHeat + heatChange));
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const updateComponentTemperature = (
  component: Component,
  loadWatts: number,
  timeSpeed: number,
  ambientTemp: number = AMBIENT_TEMP
): number => {
  const previous = component.temperature ?? ambientTemp;
  const amps = loadWatts / LINE_VOLTAGE;
  const contactResistance =
    component.type === 'switch' ? SWITCH_CONTACT_RESISTANCE : OUTLET_CONTACT_RESISTANCE;
  const heatCapacity =
    component.type === 'switch' ? SWITCH_HEAT_CAPACITY : OUTLET_HEAT_CAPACITY;

  const powerDissipation = amps * amps * contactResistance; // Watts dissipated as heat
  const deltaSeconds = BASE_TICK_SECONDS * Math.max(1, timeSpeed);

  // Heating follows Q = P * t, converted to temperature rise using heat capacity
  const heatingDelta = (powerDissipation * deltaSeconds) / heatCapacity;

  // Cooling modeled as exponential decay toward ambient: -(T - Ta)/tau
  const coolingDelta = ((previous - ambientTemp) * deltaSeconds) / COOLING_TIME_CONSTANT;

  const nextTemperature = previous + heatingDelta - coolingDelta;

  return clamp(nextTemperature, ambientTemp, MAX_COMPONENT_TEMP);
};