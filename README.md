# Circuit Panel Simulator

An <img width="1496" height="771" alt="Screenshot 2025-11-28 at 4 00 46 PM" src="https://github.com/user-attachments/assets/6408b11a-3f85-47c7-8d80-03eb14f01037" />
interactive electrical panel simulation tool for planning, visualizing, and understanding residential electrical systems.

## What is this?

Circuit Panel Simulator is a web-based application that lets you design and simulate a residential electrical panel. It provides a realistic visualization of how breakers, circuits, and devices interact, complete with real-time load calculations and thermal modeling.

## Who is this for?

- **Homeowners**: Plan electrical upgrades before calling an electrician. Understand your panel's capacity and identify which circuits power which outlets.
- **Electricians & Contractors**: Quickly sketch out panel layouts for estimates or explain configurations to clients.
- **Students & Educators**: Learn about electrical systems, load balancing, and circuit safety in an interactive environment.
- **DIY Enthusiasts**: Experiment with panel configurations safely before making real-world changes.

## Features

### Panel Management
- **Configurable service sizes**: 100A, 200A, or 400A main breaker
- **Single and double-pole breakers**: Support for 120V and 240V circuits
- **Drag-and-drop breaker positioning**: Rearrange breakers by dragging them to new slots
- **Visual slot layout**: Left/right column arrangement matching real panels

### Circuit Editor
- **Multiple runs per breaker**: Branch circuits from a single breaker
- **Outlet and switch components**: Add receptacles and light switches to circuits
- **Ground wire toggle**: Enable/disable grounding per component
- **Real-time load display**: See amperage draw per circuit

### Device Simulation
- **Pre-configured devices**: Common appliances with realistic wattage (LED bulbs, laptops, microwaves, space heaters, EV chargers, etc.)
- **Custom device search**: Add any device by name with AI-powered wattage lookup
- **Per-device power toggle**: Turn individual devices on/off
- **Automatic load calculation**: Watts converted to amps at 120V/240V

### Thermal Modeling
- **Temperature simulation**: Components heat up under load
- **Visual temperature indicators**: Color-coded warnings (green/orange/red)
- **Breaker trip simulation**: Overloaded circuits will trip

### Data Persistence
- **Save/Load configurations**: Export panel layouts as JSON files
- **PWA support**: Install as a standalone app on desktop or mobile

## Getting Started

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd circuits-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## Tech Stack

- **React 19** with TypeScript
- **Vite 7** for fast builds and HMR
- **Tailwind CSS** for styling
- **@dnd-kit** for drag-and-drop functionality
- **Vitest** + React Testing Library for unit tests
- **Playwright** for E2E testing
- **PWA** with offline support

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once (CI) |
| `npm run test:e2e` | Run Playwright E2E tests |

## Project Structure

```
src/
├── components/          # React components
│   ├── __tests__/       # Component unit tests
│   ├── BreakerModule    # Individual breaker display
│   ├── CircuitEditor    # Circuit configuration panel
│   ├── DeviceManager    # Device list and controls
│   ├── ElectricalPanel  # Main panel visualization
│   └── MainBreaker      # Main service disconnect
├── hooks/               # Custom React hooks
│   └── useBreakers      # Breaker state management
├── constants/           # Device and breaker specs
├── types/               # TypeScript definitions
├── utils/               # Calculation helpers
└── services/            # API services
```

## Development

### Adding New Device Types

Update `DEVICE_TYPES` or `LIGHT_TYPES` in `src/constants/devices.ts`:

```typescript
{
  name: 'Coffee Maker',
  watts: 900,
  icon: 'fa-mug-hot'
}
```

### Adding New Breaker Ratings

Update `BREAKER_SPECS` in `src/constants/breakers.ts`.

### Testing

```bash
# Run unit tests
npm run test

# Run tests once (CI mode)
npm run test:run

# Run E2E tests
npm run test:e2e
```

## CI/CD

The project includes GitHub Actions for:
- **Automated testing**: Runs lint and tests on every push/PR
- **Production deployment**: Deploys to AWS S3 on main branch pushes

See `.github/workflows/ci.yml` for configuration.

## Safety Disclaimer

This is a **simulation tool for educational and planning purposes only**. It does not replace professional electrical work or advice. Always consult a licensed electrician for real electrical installations and modifications. Working with electricity is dangerous and should only be performed by qualified professionals.

## License

MIT
