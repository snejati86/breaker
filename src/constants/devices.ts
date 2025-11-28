export interface DeviceType {
  name: string;
  watts: number;
  icon: string;
  category: DeviceCategory;
}

export type DeviceCategory =
  | 'lighting'
  | 'kitchen'
  | 'laundry'
  | 'hvac'
  | 'electronics'
  | 'tools'
  | 'personal'
  | 'plumbing'
  | 'outdoor'
  | 'other';

export interface CategoryInfo {
  id: DeviceCategory;
  name: string;
  icon: string;
}

export const DEVICE_CATEGORIES: CategoryInfo[] = [
  { id: 'lighting', name: 'Lighting', icon: 'fa-lightbulb' },
  { id: 'kitchen', name: 'Kitchen', icon: 'fa-utensils' },
  { id: 'laundry', name: 'Laundry', icon: 'fa-shirt' },
  { id: 'hvac', name: 'HVAC & Climate', icon: 'fa-temperature-half' },
  { id: 'plumbing', name: 'Plumbing & Water', icon: 'fa-faucet' },
  { id: 'electronics', name: 'Electronics', icon: 'fa-tv' },
  { id: 'tools', name: 'Tools & Workshop', icon: 'fa-screwdriver-wrench' },
  { id: 'outdoor', name: 'Outdoor & Yard', icon: 'fa-tree' },
  { id: 'personal', name: 'Personal Care', icon: 'fa-spray-can-sparkles' },
  { id: 'other', name: 'Other', icon: 'fa-box' },
];

// Comprehensive device list organized by category
// Wattages based on research from Department of Energy, Energy Star, manufacturer specs, and electrical code references

export const ALL_DEVICES: DeviceType[] = [
  // ===== LIGHTING (20 items) =====
  { name: 'LED Bulb (9W)', watts: 9, icon: 'fa-lightbulb', category: 'lighting' },
  { name: 'LED Bulb (15W)', watts: 15, icon: 'fa-lightbulb', category: 'lighting' },
  { name: 'LED Bulb (20W)', watts: 20, icon: 'fa-lightbulb', category: 'lighting' },
  { name: 'CFL Bulb (13W)', watts: 13, icon: 'fa-lightbulb', category: 'lighting' },
  { name: 'CFL Bulb (23W)', watts: 23, icon: 'fa-lightbulb', category: 'lighting' },
  { name: 'Incandescent (40W)', watts: 40, icon: 'fa-lightbulb', category: 'lighting' },
  { name: 'Incandescent (60W)', watts: 60, icon: 'fa-lightbulb', category: 'lighting' },
  { name: 'Incandescent (100W)', watts: 100, icon: 'fa-lightbulb', category: 'lighting' },
  { name: 'Halogen Bulb (50W)', watts: 50, icon: 'fa-lightbulb', category: 'lighting' },
  { name: 'Halogen Bulb (100W)', watts: 100, icon: 'fa-lightbulb', category: 'lighting' },
  { name: 'LED Flood Light', watts: 15, icon: 'fa-sun', category: 'lighting' },
  { name: 'LED Strip (5m)', watts: 30, icon: 'fa-tape', category: 'lighting' },
  { name: 'LED Strip (10m)', watts: 60, icon: 'fa-tape', category: 'lighting' },
  { name: 'Chandelier (LED)', watts: 60, icon: 'fa-stroopwafel', category: 'lighting' },
  { name: 'Chandelier (Incandescent)', watts: 300, icon: 'fa-stroopwafel', category: 'lighting' },
  { name: 'Ceiling Fan Light', watts: 75, icon: 'fa-fan', category: 'lighting' },
  { name: 'Desk Lamp (LED)', watts: 10, icon: 'fa-lightbulb', category: 'lighting' },
  { name: 'Floor Lamp (LED)', watts: 18, icon: 'fa-lightbulb', category: 'lighting' },
  { name: 'Night Light (LED)', watts: 1, icon: 'fa-moon', category: 'lighting' },
  { name: 'Outdoor Floodlight (LED)', watts: 50, icon: 'fa-sun', category: 'lighting' },
  { name: 'Outdoor Floodlight (Halogen)', watts: 300, icon: 'fa-sun', category: 'lighting' },
  { name: 'Recessed Light (LED)', watts: 12, icon: 'fa-lightbulb', category: 'lighting' },
  { name: 'Track Lighting (per head)', watts: 50, icon: 'fa-lightbulb', category: 'lighting' },
  { name: 'Under Cabinet Light', watts: 20, icon: 'fa-lightbulb', category: 'lighting' },
  { name: 'Vanity Light Bar', watts: 100, icon: 'fa-lightbulb', category: 'lighting' },
  { name: 'Pendant Light (LED)', watts: 15, icon: 'fa-lightbulb', category: 'lighting' },

  // ===== KITCHEN (35 items) =====
  { name: 'Electric Range', watts: 12000, icon: 'fa-fire-burner', category: 'kitchen' },
  { name: 'Electric Range (Small)', watts: 8000, icon: 'fa-fire-burner', category: 'kitchen' },
  { name: 'Gas Range (Igniter/Controls)', watts: 400, icon: 'fa-fire-burner', category: 'kitchen' },
  { name: 'Induction Cooktop (per element)', watts: 1800, icon: 'fa-fire-burner', category: 'kitchen' },
  { name: 'Electric Cooktop (per burner)', watts: 1500, icon: 'fa-fire-burner', category: 'kitchen' },
  { name: 'Electric Oven', watts: 2500, icon: 'fa-fire-burner', category: 'kitchen' },
  { name: 'Double Wall Oven', watts: 5000, icon: 'fa-fire-burner', category: 'kitchen' },
  { name: 'Convection Oven', watts: 1800, icon: 'fa-fire-burner', category: 'kitchen' },
  { name: 'Microwave', watts: 1000, icon: 'fa-square', category: 'kitchen' },
  { name: 'Microwave (Large)', watts: 1500, icon: 'fa-square', category: 'kitchen' },
  { name: 'Over-the-Range Microwave', watts: 1200, icon: 'fa-square', category: 'kitchen' },
  { name: 'Range Hood', watts: 200, icon: 'fa-wind', category: 'kitchen' },
  { name: 'Range Hood (Commercial)', watts: 400, icon: 'fa-wind', category: 'kitchen' },
  { name: 'Toaster (2-slice)', watts: 850, icon: 'fa-bread-slice', category: 'kitchen' },
  { name: 'Toaster (4-slice)', watts: 1400, icon: 'fa-bread-slice', category: 'kitchen' },
  { name: 'Toaster Oven', watts: 1200, icon: 'fa-fire-burner', category: 'kitchen' },
  { name: 'Coffee Maker (Drip)', watts: 1000, icon: 'fa-mug-hot', category: 'kitchen' },
  { name: 'Coffee Maker (Single Serve)', watts: 1500, icon: 'fa-mug-hot', category: 'kitchen' },
  { name: 'Espresso Machine', watts: 1500, icon: 'fa-mug-hot', category: 'kitchen' },
  { name: 'Electric Kettle', watts: 1500, icon: 'fa-mug-hot', category: 'kitchen' },
  { name: 'Hot Water Dispenser', watts: 1500, icon: 'fa-mug-hot', category: 'kitchen' },
  { name: 'Blender', watts: 400, icon: 'fa-blender', category: 'kitchen' },
  { name: 'Blender (High Power)', watts: 1500, icon: 'fa-blender', category: 'kitchen' },
  { name: 'Food Processor', watts: 500, icon: 'fa-blender', category: 'kitchen' },
  { name: 'Stand Mixer', watts: 300, icon: 'fa-blender', category: 'kitchen' },
  { name: 'Hand Mixer', watts: 200, icon: 'fa-blender', category: 'kitchen' },
  { name: 'Instant Pot', watts: 1000, icon: 'fa-bowl-food', category: 'kitchen' },
  { name: 'Slow Cooker', watts: 250, icon: 'fa-bowl-food', category: 'kitchen' },
  { name: 'Air Fryer', watts: 1500, icon: 'fa-fire-burner', category: 'kitchen' },
  { name: 'Deep Fryer', watts: 1800, icon: 'fa-fire-burner', category: 'kitchen' },
  { name: 'Electric Griddle', watts: 1500, icon: 'fa-fire-burner', category: 'kitchen' },
  { name: 'Electric Skillet', watts: 1500, icon: 'fa-fire-burner', category: 'kitchen' },
  { name: 'Rice Cooker', watts: 500, icon: 'fa-bowl-food', category: 'kitchen' },
  { name: 'Bread Maker', watts: 600, icon: 'fa-bread-slice', category: 'kitchen' },
  { name: 'Refrigerator (Top Freezer)', watts: 150, icon: 'fa-box', category: 'kitchen' },
  { name: 'Refrigerator (Side-by-Side)', watts: 200, icon: 'fa-box', category: 'kitchen' },
  { name: 'Refrigerator (French Door)', watts: 250, icon: 'fa-box', category: 'kitchen' },
  { name: 'Freezer (Upright)', watts: 150, icon: 'fa-snowflake', category: 'kitchen' },
  { name: 'Freezer (Chest)', watts: 100, icon: 'fa-snowflake', category: 'kitchen' },
  { name: 'Wine Cooler', watts: 100, icon: 'fa-wine-bottle', category: 'kitchen' },
  { name: 'Beverage Refrigerator', watts: 85, icon: 'fa-box', category: 'kitchen' },
  { name: 'Dishwasher', watts: 1800, icon: 'fa-sink', category: 'kitchen' },
  { name: 'Garbage Disposal (1/2 HP)', watts: 500, icon: 'fa-recycle', category: 'kitchen' },
  { name: 'Garbage Disposal (3/4 HP)', watts: 750, icon: 'fa-recycle', category: 'kitchen' },
  { name: 'Garbage Disposal (1 HP)', watts: 1000, icon: 'fa-recycle', category: 'kitchen' },
  { name: 'Ice Maker (Standalone)', watts: 350, icon: 'fa-snowflake', category: 'kitchen' },
  { name: 'Ice Maker (Built-in)', watts: 100, icon: 'fa-snowflake', category: 'kitchen' },
  { name: 'Trash Compactor', watts: 400, icon: 'fa-trash', category: 'kitchen' },
  { name: 'Electric Can Opener', watts: 150, icon: 'fa-box', category: 'kitchen' },
  { name: 'Juicer', watts: 400, icon: 'fa-lemon', category: 'kitchen' },
  { name: 'Dehydrator', watts: 500, icon: 'fa-wind', category: 'kitchen' },

  // ===== LAUNDRY (12 items) =====
  { name: 'Washing Machine (Top Load)', watts: 500, icon: 'fa-shirt', category: 'laundry' },
  { name: 'Washing Machine (Front Load)', watts: 500, icon: 'fa-shirt', category: 'laundry' },
  { name: 'Washing Machine (HE)', watts: 350, icon: 'fa-shirt', category: 'laundry' },
  { name: 'Dryer (Electric)', watts: 5000, icon: 'fa-wind', category: 'laundry' },
  { name: 'Dryer (Electric - Large)', watts: 5400, icon: 'fa-wind', category: 'laundry' },
  { name: 'Dryer (Gas - Motor Only)', watts: 300, icon: 'fa-wind', category: 'laundry' },
  { name: 'Washer/Dryer Combo', watts: 2400, icon: 'fa-shirt', category: 'laundry' },
  { name: 'Iron', watts: 1100, icon: 'fa-shirt', category: 'laundry' },
  { name: 'Steam Iron', watts: 1800, icon: 'fa-shirt', category: 'laundry' },
  { name: 'Clothes Steamer', watts: 1500, icon: 'fa-cloud', category: 'laundry' },
  { name: 'Garment Steamer (Handheld)', watts: 1000, icon: 'fa-cloud', category: 'laundry' },
  { name: 'Sewing Machine', watts: 100, icon: 'fa-scissors', category: 'laundry' },

  // ===== HVAC & CLIMATE (35 items) =====
  { name: 'Central AC (2 ton)', watts: 3500, icon: 'fa-snowflake', category: 'hvac' },
  { name: 'Central AC (3 ton)', watts: 5250, icon: 'fa-snowflake', category: 'hvac' },
  { name: 'Central AC (4 ton)', watts: 7000, icon: 'fa-snowflake', category: 'hvac' },
  { name: 'Central AC (5 ton)', watts: 8750, icon: 'fa-snowflake', category: 'hvac' },
  { name: 'Window AC (5,000 BTU)', watts: 500, icon: 'fa-snowflake', category: 'hvac' },
  { name: 'Window AC (8,000 BTU)', watts: 800, icon: 'fa-snowflake', category: 'hvac' },
  { name: 'Window AC (12,000 BTU)', watts: 1200, icon: 'fa-snowflake', category: 'hvac' },
  { name: 'Window AC (15,000 BTU)', watts: 1500, icon: 'fa-snowflake', category: 'hvac' },
  { name: 'Portable AC (8,000 BTU)', watts: 900, icon: 'fa-snowflake', category: 'hvac' },
  { name: 'Portable AC (12,000 BTU)', watts: 1200, icon: 'fa-snowflake', category: 'hvac' },
  { name: 'Mini Split AC (9,000 BTU)', watts: 900, icon: 'fa-snowflake', category: 'hvac' },
  { name: 'Mini Split AC (12,000 BTU)', watts: 1200, icon: 'fa-snowflake', category: 'hvac' },
  { name: 'Mini Split AC (18,000 BTU)', watts: 1800, icon: 'fa-snowflake', category: 'hvac' },
  { name: 'Heat Pump (2 ton)', watts: 3500, icon: 'fa-temperature-half', category: 'hvac' },
  { name: 'Heat Pump (3 ton)', watts: 5250, icon: 'fa-temperature-half', category: 'hvac' },
  { name: 'Heat Pump (4 ton)', watts: 7000, icon: 'fa-temperature-half', category: 'hvac' },
  { name: 'Electric Furnace (10 kW)', watts: 10000, icon: 'fa-fire', category: 'hvac' },
  { name: 'Electric Furnace (15 kW)', watts: 15000, icon: 'fa-fire', category: 'hvac' },
  { name: 'Electric Furnace (20 kW)', watts: 20000, icon: 'fa-fire', category: 'hvac' },
  { name: 'Gas Furnace (Blower Motor)', watts: 600, icon: 'fa-fire', category: 'hvac' },
  { name: 'Oil Furnace (Blower Motor)', watts: 800, icon: 'fa-fire', category: 'hvac' },
  { name: 'Baseboard Heater (4 ft)', watts: 1000, icon: 'fa-fire', category: 'hvac' },
  { name: 'Baseboard Heater (6 ft)', watts: 1500, icon: 'fa-fire', category: 'hvac' },
  { name: 'Baseboard Heater (8 ft)', watts: 2000, icon: 'fa-fire', category: 'hvac' },
  { name: 'Wall Heater (1500W)', watts: 1500, icon: 'fa-fire', category: 'hvac' },
  { name: 'Wall Heater (2000W)', watts: 2000, icon: 'fa-fire', category: 'hvac' },
  { name: 'Space Heater (Small)', watts: 750, icon: 'fa-fire', category: 'hvac' },
  { name: 'Space Heater', watts: 1500, icon: 'fa-fire', category: 'hvac' },
  { name: 'Radiant Floor Heating (per sqft)', watts: 12, icon: 'fa-fire', category: 'hvac' },
  { name: 'Electric Fireplace', watts: 1500, icon: 'fa-fire', category: 'hvac' },
  { name: 'Pellet Stove', watts: 100, icon: 'fa-fire', category: 'hvac' },
  { name: 'Ceiling Fan', watts: 75, icon: 'fa-fan', category: 'hvac' },
  { name: 'Ceiling Fan (Large)', watts: 100, icon: 'fa-fan', category: 'hvac' },
  { name: 'Box Fan', watts: 100, icon: 'fa-fan', category: 'hvac' },
  { name: 'Tower Fan', watts: 50, icon: 'fa-fan', category: 'hvac' },
  { name: 'Pedestal Fan', watts: 60, icon: 'fa-fan', category: 'hvac' },
  { name: 'Whole House Fan', watts: 500, icon: 'fa-fan', category: 'hvac' },
  { name: 'Attic Fan', watts: 400, icon: 'fa-fan', category: 'hvac' },
  { name: 'Bathroom Exhaust Fan', watts: 30, icon: 'fa-fan', category: 'hvac' },
  { name: 'Kitchen Exhaust Fan', watts: 150, icon: 'fa-fan', category: 'hvac' },
  { name: 'Dehumidifier (30 pint)', watts: 500, icon: 'fa-droplet', category: 'hvac' },
  { name: 'Dehumidifier (50 pint)', watts: 700, icon: 'fa-droplet', category: 'hvac' },
  { name: 'Dehumidifier (70 pint)', watts: 800, icon: 'fa-droplet', category: 'hvac' },
  { name: 'Humidifier (Console)', watts: 175, icon: 'fa-droplet', category: 'hvac' },
  { name: 'Humidifier (Whole House)', watts: 100, icon: 'fa-droplet', category: 'hvac' },
  { name: 'Air Purifier (Small)', watts: 30, icon: 'fa-wind', category: 'hvac' },
  { name: 'Air Purifier (Large)', watts: 100, icon: 'fa-wind', category: 'hvac' },
  { name: 'Evaporative Cooler', watts: 200, icon: 'fa-snowflake', category: 'hvac' },

  // ===== PLUMBING & WATER (25 items) =====
  { name: 'Sump Pump (1/3 HP)', watts: 800, icon: 'fa-faucet', category: 'plumbing' },
  { name: 'Sump Pump (1/2 HP)', watts: 1050, icon: 'fa-faucet', category: 'plumbing' },
  { name: 'Sump Pump (3/4 HP)', watts: 1500, icon: 'fa-faucet', category: 'plumbing' },
  { name: 'Sump Pump (1 HP)', watts: 2000, icon: 'fa-faucet', category: 'plumbing' },
  { name: 'Sewage Pump (1/2 HP)', watts: 1050, icon: 'fa-faucet', category: 'plumbing' },
  { name: 'Sewage Pump (3/4 HP)', watts: 1500, icon: 'fa-faucet', category: 'plumbing' },
  { name: 'Effluent Pump', watts: 800, icon: 'fa-faucet', category: 'plumbing' },
  { name: 'Well Pump (1/2 HP)', watts: 750, icon: 'fa-faucet', category: 'plumbing' },
  { name: 'Well Pump (3/4 HP)', watts: 1100, icon: 'fa-faucet', category: 'plumbing' },
  { name: 'Well Pump (1 HP)', watts: 1500, icon: 'fa-faucet', category: 'plumbing' },
  { name: 'Well Pump (1.5 HP)', watts: 2200, icon: 'fa-faucet', category: 'plumbing' },
  { name: 'Well Pump (2 HP)', watts: 3000, icon: 'fa-faucet', category: 'plumbing' },
  { name: 'Booster Pump', watts: 800, icon: 'fa-faucet', category: 'plumbing' },
  { name: 'Jet Pump (1/2 HP)', watts: 750, icon: 'fa-faucet', category: 'plumbing' },
  { name: 'Jet Pump (1 HP)', watts: 1500, icon: 'fa-faucet', category: 'plumbing' },
  { name: 'Circulator Pump', watts: 100, icon: 'fa-faucet', category: 'plumbing' },
  { name: 'Electric Water Heater (40 gal)', watts: 4500, icon: 'fa-fire', category: 'plumbing' },
  { name: 'Electric Water Heater (50 gal)', watts: 4500, icon: 'fa-fire', category: 'plumbing' },
  { name: 'Electric Water Heater (80 gal)', watts: 5500, icon: 'fa-fire', category: 'plumbing' },
  { name: 'Tankless Water Heater (Small)', watts: 12000, icon: 'fa-fire', category: 'plumbing' },
  { name: 'Tankless Water Heater (Medium)', watts: 18000, icon: 'fa-fire', category: 'plumbing' },
  { name: 'Tankless Water Heater (Large)', watts: 27000, icon: 'fa-fire', category: 'plumbing' },
  { name: 'Tankless Water Heater (Whole House)', watts: 36000, icon: 'fa-fire', category: 'plumbing' },
  { name: 'Heat Pump Water Heater', watts: 500, icon: 'fa-fire', category: 'plumbing' },
  { name: 'Point-of-Use Water Heater', watts: 3000, icon: 'fa-fire', category: 'plumbing' },
  { name: 'Recirculation Pump', watts: 65, icon: 'fa-faucet', category: 'plumbing' },
  { name: 'Water Softener', watts: 70, icon: 'fa-droplet', category: 'plumbing' },
  { name: 'Reverse Osmosis System', watts: 50, icon: 'fa-droplet', category: 'plumbing' },
  { name: 'UV Water Purifier', watts: 40, icon: 'fa-droplet', category: 'plumbing' },

  // ===== ELECTRONICS (25 items) =====
  { name: 'TV (32" LED)', watts: 50, icon: 'fa-tv', category: 'electronics' },
  { name: 'TV (43" LED)', watts: 70, icon: 'fa-tv', category: 'electronics' },
  { name: 'TV (55" LED)', watts: 100, icon: 'fa-tv', category: 'electronics' },
  { name: 'TV (65" LED)', watts: 120, icon: 'fa-tv', category: 'electronics' },
  { name: 'TV (65" OLED)', watts: 150, icon: 'fa-tv', category: 'electronics' },
  { name: 'TV (75" LED)', watts: 200, icon: 'fa-tv', category: 'electronics' },
  { name: 'TV (85" LED)', watts: 250, icon: 'fa-tv', category: 'electronics' },
  { name: 'Projector', watts: 300, icon: 'fa-film', category: 'electronics' },
  { name: 'Projector (4K Laser)', watts: 500, icon: 'fa-film', category: 'electronics' },
  { name: 'Laptop', watts: 65, icon: 'fa-laptop', category: 'electronics' },
  { name: 'Laptop (Gaming)', watts: 180, icon: 'fa-laptop', category: 'electronics' },
  { name: 'Desktop PC', watts: 200, icon: 'fa-desktop', category: 'electronics' },
  { name: 'Gaming PC', watts: 500, icon: 'fa-desktop', category: 'electronics' },
  { name: 'Gaming PC (High-End)', watts: 800, icon: 'fa-desktop', category: 'electronics' },
  { name: 'Monitor (24")', watts: 30, icon: 'fa-desktop', category: 'electronics' },
  { name: 'Monitor (27" 1440p)', watts: 40, icon: 'fa-desktop', category: 'electronics' },
  { name: 'Monitor (32" 4K)', watts: 50, icon: 'fa-desktop', category: 'electronics' },
  { name: 'Gaming Console (PS5/Xbox)', watts: 200, icon: 'fa-gamepad', category: 'electronics' },
  { name: 'Nintendo Switch', watts: 40, icon: 'fa-gamepad', category: 'electronics' },
  { name: 'Router', watts: 10, icon: 'fa-wifi', category: 'electronics' },
  { name: 'Modem', watts: 10, icon: 'fa-ethernet', category: 'electronics' },
  { name: 'Network Switch', watts: 15, icon: 'fa-ethernet', category: 'electronics' },
  { name: 'NAS (2-bay)', watts: 30, icon: 'fa-server', category: 'electronics' },
  { name: 'NAS (4-bay)', watts: 60, icon: 'fa-server', category: 'electronics' },
  { name: 'Home Server', watts: 150, icon: 'fa-server', category: 'electronics' },
  { name: 'Smart Speaker', watts: 5, icon: 'fa-volume-high', category: 'electronics' },
  { name: 'Smart Display', watts: 15, icon: 'fa-tablet', category: 'electronics' },
  { name: 'Soundbar', watts: 30, icon: 'fa-volume-high', category: 'electronics' },
  { name: 'AV Receiver', watts: 450, icon: 'fa-volume-high', category: 'electronics' },
  { name: 'Subwoofer', watts: 150, icon: 'fa-volume-high', category: 'electronics' },
  { name: 'Phone Charger', watts: 20, icon: 'fa-mobile', category: 'electronics' },
  { name: 'Phone Charger (Fast)', watts: 45, icon: 'fa-mobile', category: 'electronics' },
  { name: 'Tablet Charger', watts: 30, icon: 'fa-tablet', category: 'electronics' },
  { name: 'Printer (Inkjet)', watts: 50, icon: 'fa-print', category: 'electronics' },
  { name: 'Printer (Laser)', watts: 600, icon: 'fa-print', category: 'electronics' },
  { name: '3D Printer', watts: 200, icon: 'fa-print', category: 'electronics' },
  { name: '3D Printer (Large)', watts: 500, icon: 'fa-print', category: 'electronics' },
  { name: 'UPS (600VA)', watts: 360, icon: 'fa-battery-full', category: 'electronics' },
  { name: 'UPS (1500VA)', watts: 900, icon: 'fa-battery-full', category: 'electronics' },

  // ===== TOOLS & WORKSHOP (35 items) =====
  { name: 'Drill (Corded)', watts: 600, icon: 'fa-screwdriver', category: 'tools' },
  { name: 'Impact Driver (Corded)', watts: 700, icon: 'fa-screwdriver', category: 'tools' },
  { name: 'Hammer Drill', watts: 800, icon: 'fa-hammer', category: 'tools' },
  { name: 'Rotary Hammer', watts: 1000, icon: 'fa-hammer', category: 'tools' },
  { name: 'Circular Saw', watts: 1400, icon: 'fa-circle', category: 'tools' },
  { name: 'Jigsaw', watts: 700, icon: 'fa-scissors', category: 'tools' },
  { name: 'Reciprocating Saw', watts: 1100, icon: 'fa-scissors', category: 'tools' },
  { name: 'Table Saw (Contractor)', watts: 1800, icon: 'fa-table', category: 'tools' },
  { name: 'Table Saw (Cabinet)', watts: 3000, icon: 'fa-table', category: 'tools' },
  { name: 'Miter Saw (10")', watts: 1500, icon: 'fa-angle-right', category: 'tools' },
  { name: 'Miter Saw (12")', watts: 1800, icon: 'fa-angle-right', category: 'tools' },
  { name: 'Band Saw', watts: 1000, icon: 'fa-scissors', category: 'tools' },
  { name: 'Scroll Saw', watts: 150, icon: 'fa-scissors', category: 'tools' },
  { name: 'Router (Woodworking)', watts: 1800, icon: 'fa-gear', category: 'tools' },
  { name: 'Planer (Benchtop)', watts: 1500, icon: 'fa-gear', category: 'tools' },
  { name: 'Planer (Floor)', watts: 3000, icon: 'fa-gear', category: 'tools' },
  { name: 'Jointer', watts: 1200, icon: 'fa-gear', category: 'tools' },
  { name: 'Lathe (Wood)', watts: 750, icon: 'fa-gear', category: 'tools' },
  { name: 'Lathe (Metal)', watts: 1500, icon: 'fa-gear', category: 'tools' },
  { name: 'Belt Sander', watts: 1000, icon: 'fa-gear', category: 'tools' },
  { name: 'Orbital Sander', watts: 300, icon: 'fa-gear', category: 'tools' },
  { name: 'Random Orbital Sander', watts: 400, icon: 'fa-gear', category: 'tools' },
  { name: 'Angle Grinder (4.5")', watts: 800, icon: 'fa-gear', category: 'tools' },
  { name: 'Angle Grinder (7")', watts: 2000, icon: 'fa-gear', category: 'tools' },
  { name: 'Bench Grinder', watts: 400, icon: 'fa-gear', category: 'tools' },
  { name: 'Shop Vacuum (6 gal)', watts: 1000, icon: 'fa-wind', category: 'tools' },
  { name: 'Shop Vacuum (12 gal)', watts: 1400, icon: 'fa-wind', category: 'tools' },
  { name: 'Dust Collector', watts: 1500, icon: 'fa-wind', category: 'tools' },
  { name: 'Air Compressor (Pancake)', watts: 1200, icon: 'fa-wind', category: 'tools' },
  { name: 'Air Compressor (20 gal)', watts: 1500, icon: 'fa-wind', category: 'tools' },
  { name: 'Air Compressor (60 gal)', watts: 3700, icon: 'fa-wind', category: 'tools' },
  { name: 'Welder (MIG 110V)', watts: 2400, icon: 'fa-fire', category: 'tools' },
  { name: 'Welder (MIG 220V)', watts: 7500, icon: 'fa-fire', category: 'tools' },
  { name: 'Welder (TIG)', watts: 5000, icon: 'fa-fire', category: 'tools' },
  { name: 'Plasma Cutter', watts: 4500, icon: 'fa-fire', category: 'tools' },
  { name: 'Heat Gun', watts: 1500, icon: 'fa-fire', category: 'tools' },
  { name: 'Soldering Station', watts: 80, icon: 'fa-fire', category: 'tools' },
  { name: 'Garage Door Opener (1/2 HP)', watts: 550, icon: 'fa-door-open', category: 'tools' },
  { name: 'Garage Door Opener (3/4 HP)', watts: 725, icon: 'fa-door-open', category: 'tools' },
  { name: 'EV Charger (Level 1)', watts: 1400, icon: 'fa-charging-station', category: 'tools' },
  { name: 'EV Charger (Level 2 - 32A)', watts: 7700, icon: 'fa-charging-station', category: 'tools' },
  { name: 'EV Charger (Level 2 - 48A)', watts: 11500, icon: 'fa-charging-station', category: 'tools' },
  { name: 'Battery Charger (Auto)', watts: 100, icon: 'fa-battery-half', category: 'tools' },
  { name: 'Battery Charger (Jump Starter)', watts: 200, icon: 'fa-battery-half', category: 'tools' },

  // ===== OUTDOOR & YARD (25 items) =====
  { name: 'Lawn Mower (Electric)', watts: 1400, icon: 'fa-leaf', category: 'outdoor' },
  { name: 'Lawn Mower (Robot)', watts: 30, icon: 'fa-robot', category: 'outdoor' },
  { name: 'Leaf Blower (Electric)', watts: 1000, icon: 'fa-wind', category: 'outdoor' },
  { name: 'Leaf Blower (Corded)', watts: 1500, icon: 'fa-wind', category: 'outdoor' },
  { name: 'String Trimmer (Electric)', watts: 500, icon: 'fa-scissors', category: 'outdoor' },
  { name: 'Hedge Trimmer (Electric)', watts: 500, icon: 'fa-scissors', category: 'outdoor' },
  { name: 'Chain Saw (Electric)', watts: 1800, icon: 'fa-scissors', category: 'outdoor' },
  { name: 'Pole Saw (Electric)', watts: 800, icon: 'fa-scissors', category: 'outdoor' },
  { name: 'Chipper/Shredder', watts: 2500, icon: 'fa-scissors', category: 'outdoor' },
  { name: 'Pressure Washer (Electric)', watts: 1500, icon: 'fa-droplet', category: 'outdoor' },
  { name: 'Pressure Washer (Heavy Duty)', watts: 2000, icon: 'fa-droplet', category: 'outdoor' },
  { name: 'Snow Blower (Electric)', watts: 1800, icon: 'fa-snowflake', category: 'outdoor' },
  { name: 'Snow Blower (2-Stage)', watts: 2400, icon: 'fa-snowflake', category: 'outdoor' },
  { name: 'Heat Tape (per foot)', watts: 5, icon: 'fa-fire', category: 'outdoor' },
  { name: 'De-Icer (Roof)', watts: 600, icon: 'fa-fire', category: 'outdoor' },
  { name: 'Pond Pump (Small)', watts: 50, icon: 'fa-water', category: 'outdoor' },
  { name: 'Pond Pump (Large)', watts: 200, icon: 'fa-water', category: 'outdoor' },
  { name: 'Fountain Pump', watts: 80, icon: 'fa-water', category: 'outdoor' },
  { name: 'Pool Pump (1 HP)', watts: 1500, icon: 'fa-water', category: 'outdoor' },
  { name: 'Pool Pump (1.5 HP)', watts: 2000, icon: 'fa-water', category: 'outdoor' },
  { name: 'Pool Pump (2 HP)', watts: 2500, icon: 'fa-water', category: 'outdoor' },
  { name: 'Pool Pump (Variable Speed)', watts: 500, icon: 'fa-water', category: 'outdoor' },
  { name: 'Pool Heater (Electric)', watts: 5500, icon: 'fa-fire', category: 'outdoor' },
  { name: 'Sprinkler Pump (1/2 HP)', watts: 750, icon: 'fa-droplet', category: 'outdoor' },
  { name: 'Sprinkler Pump (1 HP)', watts: 1500, icon: 'fa-droplet', category: 'outdoor' },
  { name: 'Irrigation Controller', watts: 5, icon: 'fa-droplet', category: 'outdoor' },
  { name: 'Landscape Lighting (per fixture)', watts: 7, icon: 'fa-lightbulb', category: 'outdoor' },
  { name: 'Path Lights (per fixture)', watts: 3, icon: 'fa-lightbulb', category: 'outdoor' },
  { name: 'Bug Zapper', watts: 40, icon: 'fa-bug', category: 'outdoor' },
  { name: 'Patio Heater (Electric)', watts: 1500, icon: 'fa-fire', category: 'outdoor' },
  { name: 'Patio Heater (Infrared)', watts: 3000, icon: 'fa-fire', category: 'outdoor' },
  { name: 'Outdoor Grill (Electric)', watts: 1800, icon: 'fa-fire-burner', category: 'outdoor' },
  { name: 'Electric Smoker', watts: 800, icon: 'fa-fire', category: 'outdoor' },

  // ===== PERSONAL CARE (15 items) =====
  { name: 'Hair Dryer', watts: 1800, icon: 'fa-wind', category: 'personal' },
  { name: 'Hair Dryer (Travel)', watts: 1000, icon: 'fa-wind', category: 'personal' },
  { name: 'Hair Dryer (Professional)', watts: 2000, icon: 'fa-wind', category: 'personal' },
  { name: 'Curling Iron', watts: 150, icon: 'fa-wand-magic', category: 'personal' },
  { name: 'Flat Iron', watts: 200, icon: 'fa-wand-magic', category: 'personal' },
  { name: 'Hot Rollers', watts: 400, icon: 'fa-wand-magic', category: 'personal' },
  { name: 'Electric Shaver', watts: 15, icon: 'fa-face-smile', category: 'personal' },
  { name: 'Hair Clipper', watts: 25, icon: 'fa-scissors', category: 'personal' },
  { name: 'Electric Toothbrush', watts: 5, icon: 'fa-tooth', category: 'personal' },
  { name: 'Water Flosser', watts: 30, icon: 'fa-droplet', category: 'personal' },
  { name: 'Heated Towel Rack', watts: 100, icon: 'fa-bath', category: 'personal' },
  { name: 'Bidet (Electric)', watts: 1200, icon: 'fa-toilet', category: 'personal' },
  { name: 'Hot Tub/Spa (6 person)', watts: 6000, icon: 'fa-hot-tub', category: 'personal' },
  { name: 'Hot Tub/Spa (4 person)', watts: 4500, icon: 'fa-hot-tub', category: 'personal' },
  { name: 'Sauna (2 person)', watts: 4500, icon: 'fa-fire', category: 'personal' },
  { name: 'Sauna (4 person)', watts: 6000, icon: 'fa-fire', category: 'personal' },
  { name: 'Steam Shower', watts: 7000, icon: 'fa-cloud', category: 'personal' },
  { name: 'Massage Chair', watts: 200, icon: 'fa-chair', category: 'personal' },

  // ===== OTHER HOUSEHOLD (30 items) =====
  { name: 'Vacuum Cleaner (Upright)', watts: 1000, icon: 'fa-wind', category: 'other' },
  { name: 'Vacuum Cleaner (Canister)', watts: 1200, icon: 'fa-wind', category: 'other' },
  { name: 'Vacuum Cleaner (Stick)', watts: 200, icon: 'fa-wind', category: 'other' },
  { name: 'Robot Vacuum', watts: 70, icon: 'fa-robot', category: 'other' },
  { name: 'Steam Mop', watts: 1500, icon: 'fa-broom', category: 'other' },
  { name: 'Carpet Cleaner', watts: 1200, icon: 'fa-broom', category: 'other' },
  { name: 'Floor Polisher', watts: 300, icon: 'fa-broom', category: 'other' },
  { name: 'Aquarium (10 gal)', watts: 30, icon: 'fa-fish', category: 'other' },
  { name: 'Aquarium (50 gal)', watts: 100, icon: 'fa-fish', category: 'other' },
  { name: 'Aquarium (100+ gal)', watts: 250, icon: 'fa-fish', category: 'other' },
  { name: 'Aquarium Heater (50W)', watts: 50, icon: 'fa-fish', category: 'other' },
  { name: 'Aquarium Heater (200W)', watts: 200, icon: 'fa-fish', category: 'other' },
  { name: 'Electric Blanket', watts: 200, icon: 'fa-bed', category: 'other' },
  { name: 'Heated Mattress Pad', watts: 200, icon: 'fa-bed', category: 'other' },
  { name: 'Heating Pad', watts: 60, icon: 'fa-temperature-high', category: 'other' },
  { name: 'Clock Radio', watts: 10, icon: 'fa-clock', category: 'other' },
  { name: 'Alarm System', watts: 15, icon: 'fa-shield', category: 'other' },
  { name: 'Security Camera', watts: 10, icon: 'fa-camera', category: 'other' },
  { name: 'Doorbell Camera', watts: 5, icon: 'fa-bell', category: 'other' },
  { name: 'Baby Monitor (Video)', watts: 10, icon: 'fa-baby', category: 'other' },
  { name: 'CPAP Machine', watts: 60, icon: 'fa-lungs', category: 'other' },
  { name: 'Oxygen Concentrator', watts: 300, icon: 'fa-lungs', category: 'other' },
  { name: 'Nebulizer', watts: 45, icon: 'fa-lungs', category: 'other' },
  { name: 'Treadmill', watts: 1500, icon: 'fa-person-running', category: 'other' },
  { name: 'Elliptical', watts: 500, icon: 'fa-person-running', category: 'other' },
  { name: 'Exercise Bike', watts: 200, icon: 'fa-bicycle', category: 'other' },
  { name: 'Rowing Machine', watts: 100, icon: 'fa-person-running', category: 'other' },
  { name: 'Home Gym (Multi-station)', watts: 400, icon: 'fa-dumbbell', category: 'other' },
  { name: 'Elevator (Residential)', watts: 3000, icon: 'fa-elevator', category: 'other' },
  { name: 'Stair Lift', watts: 400, icon: 'fa-wheelchair', category: 'other' },
  { name: 'Garage Heater (5000W)', watts: 5000, icon: 'fa-fire', category: 'other' },
  { name: 'Workshop Heater', watts: 4000, icon: 'fa-fire', category: 'other' },
];

// Common devices shown at the top of the picker (most frequently used)
export const COMMON_DEVICE_NAMES = [
  'LED Bulb (9W)',
  'TV (55" LED)',
  'Laptop',
  'Microwave',
  'Coffee Maker (Drip)',
  'Phone Charger',
  'Ceiling Fan',
  'Space Heater',
  'Refrigerator (French Door)',
  'Dishwasher',
];

// Get devices by category
export const getDevicesByCategory = (category: DeviceCategory): DeviceType[] => {
  return ALL_DEVICES.filter((device) => device.category === category);
};

// Get common devices
export const getCommonDevices = (): DeviceType[] => {
  return COMMON_DEVICE_NAMES.map((name) =>
    ALL_DEVICES.find((device) => device.name === name)
  ).filter((device): device is DeviceType => device !== undefined);
};

// Search devices by name (fuzzy search)
export const searchDevices = (query: string): DeviceType[] => {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  return ALL_DEVICES.filter((device) => {
    const normalizedName = device.name.toLowerCase();
    // Exact match or starts with
    if (normalizedName.startsWith(normalizedQuery)) return true;
    // Contains
    if (normalizedName.includes(normalizedQuery)) return true;
    // Match individual words
    const queryWords = normalizedQuery.split(/\s+/);
    return queryWords.every((word) => normalizedName.includes(word));
  }).sort((a, b) => {
    // Sort by match quality
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aStartsWith = aName.startsWith(normalizedQuery);
    const bStartsWith = bName.startsWith(normalizedQuery);
    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;
    return a.name.localeCompare(b.name);
  });
};

// Legacy exports for backward compatibility
export const DEVICE_TYPES: DeviceType[] = ALL_DEVICES.filter(
  (d) => d.category !== 'lighting'
);

export const LIGHT_TYPES: DeviceType[] = ALL_DEVICES.filter(
  (d) => d.category === 'lighting'
);
