# Architecture Overview

This document provides a high-level overview of the Circuit Panel Simulator architecture for developers and AI agents.

## Application Summary

A React SPA that simulates a residential electrical panel. Users can add/remove breakers, configure circuits with outlets and switches, plug in devices, and observe real-time load calculations with thermal simulation.

## Component Hierarchy

```
App
├── ElectricalPanel          # Left side - visual panel representation
│   ├── MainBreaker          # Main service disconnect (100A/200A/400A)
│   ├── BreakerModule[]      # Individual circuit breakers (draggable)
│   ├── EmptySlot[]          # Unoccupied panel slots (drop targets)
│   └── BreakerTypeModal     # Modal for selecting single/double pole
│
├── CircuitEditor            # Right side - selected breaker details
│   ├── Run[]                # Circuit branches from breaker
│   │   └── Component[]      # Outlets or switches in the run
│   │       └── DeviceManager # Devices plugged into component
│   │           └── Device[] # Individual appliances
│
└── NotificationToast        # User feedback messages
```

## State Architecture

### Primary State: `useBreakers` Hook

All breaker/circuit state lives in a single custom hook (`src/hooks/useBreakers.ts`):

```typescript
const {
  breakers,              // Breaker[] - all panel breakers
  selectedBreakerId,     // string | null - currently editing
  addBreakerAtSlot,      // Add new breaker
  deleteBreaker,         // Remove breaker
  toggleBreaker,         // On/off toggle
  moveBreaker,           // Drag-and-drop reposition
  updateBreakerRating,   // Change amperage (may expand to double-pole)
  addRun,                // Add circuit branch
  addComponent,          // Add outlet/switch to run
  addDevice,             // Plug device into component
  // ... more actions
} = useBreakers(mainServiceLimit, notify);
```

### Simulation State: `useSimulation` Hook

Handles thermal modeling and breaker trips (`src/hooks/useSimulation.ts`):
- Runs on interval (configurable speed: 1x, 10x, 50x)
- Calculates heat buildup based on load
- Triggers breaker trips when thresholds exceeded
- Updates component temperatures

### UI State

Local component state for:
- Modal open/close states
- Drag-and-drop active item
- Form inputs

## Domain Model

### Core Types (`src/types/index.ts`)

```
Breaker
├── id: string
├── name: string
├── rating: number (15, 20, 30, 40, 50, 60, 100)
├── slots: number[] (single: [1], double: [1, 3])
├── on: boolean
├── thermalHeat: number (0-100, triggers trip at 100)
└── runs: Component[][]

Component (Outlet or Switch)
├── id: string
├── type: 'outlet' | 'switch'
├── devices: Device[]
├── grounded: boolean
├── temperature: number (°F)
└── isOn?: boolean (switches only)

Device
├── uid: string
├── name: string
├── watts: number
├── icon: string (Font Awesome class)
└── isOn: boolean
```

### Panel Layout

```
       LEFT (odd)    |    RIGHT (even)
    ─────────────────┼─────────────────
         Slot 1      │      Slot 2
         Slot 3      │      Slot 4
         Slot 5      │      Slot 6
           ...       │        ...
```

- Single-pole breakers occupy 1 slot
- Double-pole (240V) breakers occupy 2 slots in same column (e.g., 1+3)
- Slot count depends on service: 100A=20, 200A=30, 400A=40

## Data Flow

```
User Action → Component Handler → useBreakers action → setBreakers() → Re-render
                                                              ↓
                                              useSimulation reads breakers
                                                              ↓
                                              Calculate loads & temperatures
                                                              ↓
                                              Update breakers (trips, heat)
```

## Key Calculations (`src/utils/calculations.ts`)

```typescript
// Device current draw
amps = watts / voltage  // voltage = 120V (single) or 240V (double)

// Breaker load percentage
loadPercent = totalAmps / breakerRating * 100

// Thermal accumulation (per tick)
if (loadPercent > 80) thermalHeat += (loadPercent - 80) * factor
if (loadPercent < 80) thermalHeat -= coolingRate

// Trip condition
if (thermalHeat >= 100) breaker.on = false
```

## Constants (`src/constants/`)

### `breakers.ts`
- `BREAKER_SPECS`: Rating → slot count mapping
- `SLOTS_MAP`: Service limit → total slots

### `devices.ts`
- `DEVICE_TYPES`: Common appliances (Laptop, Microwave, EV Charger, etc.)
- `LIGHT_TYPES`: Lighting fixtures (LED Bulb, Chandelier, etc.)

## External Services (`src/services/`)

### `deviceApi.ts`
- `fetchCustomDeviceSpecs(query)`: AI-powered device lookup
- Returns estimated wattage for arbitrary device names

## File Naming Conventions

| Type | Location | Pattern |
|------|----------|---------|
| Components | `src/components/` | `PascalCase.tsx` |
| Hooks | `src/hooks/` | `useCamelCase.ts` |
| Tests | `*/__tests__/` | `*.test.tsx` |
| Types | `src/types/` | `index.ts` |
| Constants | `src/constants/` | `camelCase.ts` |

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `@dnd-kit/core` | Drag-and-drop framework |
| `@dnd-kit/sortable` | Sortable lists |
| `react` | UI framework (v19) |
| `vite` | Build tool |
| `vitest` | Unit testing |
| `tailwindcss` | Styling |

## Entry Points

- `src/main.tsx` - React root mount
- `src/App.tsx` - Main application component
- `index.html` - HTML shell with Font Awesome CDN
