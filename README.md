# Circuit Panel Simulator

A modern React TypeScript application for simulating electrical circuit panels with real-time load calculations, thermal modeling, and device management.

## Features

- **Interactive Electrical Panel**: Visual representation of main breakers and circuit breakers
- **Real-time Load Calculations**: Automatic amperage calculations with thermal modeling
- **Device Management**: Add and remove electrical devices with power consumption tracking
- **Circuit Builder**: Create and manage electrical runs with outlets and switches
- **Thermal Protection**: Breakers trip when overloaded or overheated
- **Save/Load Configuration**: Export and import panel configurations
- **Responsive Design**: Works across different screen sizes

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome
- **Testing**: Vitest + React Testing Library
- **Type Safety**: Complete TypeScript coverage

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or pnpm

### Installation

```bash
# Navigate to the project directory
cd circuits-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173/` (or another port if 5173 is in use).

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run lint` - Run ESLint

## Project Structure

```
circuits-app/
├── src/
│   ├── components/           # React components
│   │   ├── MainBreaker.tsx
│   │   ├── BreakerModule.tsx
│   │   ├── ElectricalPanel.tsx
│   │   ├── CircuitEditor.tsx
│   │   ├── DeviceManager.tsx
│   │   └── EmptySlot.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useBreakers.ts
│   │   └── useSimulation.ts
│   ├── constants/           # Application constants
│   │   ├── breakers.ts
│   │   └── devices.ts
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   │   └── calculations.ts
│   ├── services/           # API services
│   │   └── deviceApi.ts
│   └── test/               # Test configuration
│       └── setup.ts
├── dist/                   # Production build output
├── public/                 # Static assets
└── package.json
```

## Key Features Explained

### Electrical Panel Simulation

The application simulates a realistic electrical panel with:

- **Main Service Disconnect**: Controls power to the entire panel
- **Individual Breakers**: Can be added, removed, and configured
- **Slot Management**: Proper slot allocation for single and double pole breakers
- **Amperage Ratings**: Configurable breaker ratings (15A, 20A, 30A, 40A, 50A, 60A, 100A)

### Load Calculations

- Real-time amperage calculations based on connected devices
- Thermal heat modeling with automatic breaker trips
- Main panel overload protection
- Power consumption tracking per device

### Device Management

- Predefined device library (LED bulbs, appliances, etc.)
- Custom device search with AI-powered specifications
- Individual device power control
- Ground fault circuit protection simulation

### Circuit Building

- Visual circuit representation
- Multiple runs per breaker
- Outlets and switches with different behaviors
- Wire grounding status indicators

## Build and Deployment

### Production Build

```bash
npm run build
```

This creates an optimized build in the `dist/` directory ready for deployment.

### Testing

The project includes comprehensive unit tests:

```bash
# Run tests
npm run test

# Run tests once (CI mode)  
npm run test:run
```

### Browser Compatibility

- Modern browsers with ES2015+ support
- Responsive design for mobile and desktop
- Font Awesome icons for consistent visuals

## Development

### Adding New Components

1. Create component in `src/components/`
2. Add TypeScript interfaces in `src/types/`
3. Write tests in `src/components/__tests__/`
4. Update exports if needed

### Adding New Device Types

1. Update `DEVICE_TYPES` or `LIGHT_TYPES` in `src/constants/devices.ts`
2. Ensure proper icon mapping with Font Awesome classes

### Configuration

- **Tailwind CSS**: Configuration in `tailwind.config.js`
- **Vite**: Configuration in `vite.config.ts`
- **TypeScript**: Configuration in `tsconfig.json`

## Migration from Original

This modern React application is a complete rewrite of the original single-file HTML application, featuring:

- ✅ Modular component architecture
- ✅ TypeScript type safety
- ✅ Modern build system (Vite)
- ✅ Comprehensive testing suite
- ✅ Responsive design improvements
- ✅ Performance optimizations
- ✅ Code organization and maintainability

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

## License

This project is for educational and simulation purposes.