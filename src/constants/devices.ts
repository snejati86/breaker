export interface DeviceType {
  name: string;
  watts: number;
  icon: string;
}

export const DEVICE_TYPES: DeviceType[] = [
  { name: 'LED Bulb', watts: 10, icon: 'fa-lightbulb' },
  { name: 'Laptop', watts: 100, icon: 'fa-laptop' },
  { name: 'TV', watts: 200, icon: 'fa-tv' },
  { name: 'Drill', watts: 600, icon: 'fa-screwdriver' },
  { name: 'Microwave', watts: 1000, icon: 'fa-square' },
  { name: 'Space Heater', watts: 1500, icon: 'fa-fire' },
  { name: 'Hair Dryer', watts: 1800, icon: 'fa-wind' },
  { name: 'EV Charger', watts: 7200, icon: 'fa-charging-station' },
];

export const LIGHT_TYPES: DeviceType[] = [
  { name: 'LED Bulb', watts: 10, icon: 'fa-lightbulb' },
  { name: 'Chandelier', watts: 300, icon: 'fa-chandelier' },
  { name: 'Flood Light', watts: 150, icon: 'fa-sun' },
];