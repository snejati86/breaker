import type { DeviceCategory } from '../constants/devices';

export interface Device {
  uid: string;
  name: string;
  watts: number;
  icon: string;
  isOn: boolean;
  category?: DeviceCategory;
}

export interface Component {
  id: string;
  type: 'outlet' | 'switch';
  devices: Device[];
  grounded: boolean;
  isOn?: boolean;
  temperature?: number;
}

export interface Breaker {
  id: string;
  name: string;
  rating: number;
  slots: number[];
  thermalHeat: number;
  on: boolean;
  runs: Component[][];
}

export interface Panel {
  id: string;
  name: string;
  mainServiceLimit: number;
  mainBreakerTripped: boolean;
  mainBreakerManualOff: boolean;
  breakers: Breaker[];
}

export interface SimulationState {
  totalLoad: number;
}

export interface SearchModal {
  open: boolean;
  breakerId: string | null;
  runIndex: number | null;
  compIndex: number | null;
}