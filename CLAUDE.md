# CLAUDE.md

This file provides guidance to Claude Code when working with the circuits-app codebase.

## Project Overview

Circuit Panel Simulator - A React 19 + TypeScript application for simulating electrical circuit panels with real-time load calculations, thermal modeling, and device management.

## Development Philosophy

### Test-Driven Development (TDD)

**This project follows strict TDD principles. All development MUST follow the Red-Green-Refactor cycle:**

1. **RED**: Write a failing test first that describes the expected behavior
2. **GREEN**: Write the minimum code necessary to make the test pass
3. **REFACTOR**: Clean up the code while keeping tests green

**Never write implementation code without a failing test first.**

### Component Independence

Components must be:
- **Self-contained**: Work in isolation without external dependencies
- **Independently testable**: Each component should render and function on its own
- **Use-case driven**: Have tests covering all expected use cases and edge cases

### When Creating or Modifying Components

1. Start with unit tests in `src/components/__tests__/`
2. Write tests for all use cases before implementation
3. Ensure component can render independently
4. Validate with Playwright MCP for UI verification when needed
5. Follow React best practices for modularity

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3
- **Icons**: Font Awesome 7
- **Unit Testing**: Vitest + React Testing Library + jest-dom
- **E2E Testing**: Playwright
- **Linting**: ESLint with TypeScript and React plugins

## Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # TypeScript check + production build
npm run preview          # Preview production build
npm run lint             # Run ESLint

# Unit Tests
npm run test             # Run Vitest in watch mode
npm run test:ui          # Run Vitest with UI
npm run test:run         # Run tests once (CI mode)

# E2E Tests
npm run test:e2e         # Run Playwright tests
npm run test:e2e:ui      # Run Playwright with interactive UI
```

## Project Structure

```
src/
├── components/          # React components
│   ├── __tests__/       # Component unit tests (*.test.tsx)
│   ├── BreakerModule.tsx
│   ├── CircuitEditor.tsx
│   ├── DeviceManager.tsx
│   ├── ElectricalPanel.tsx
│   ├── EmptySlot.tsx
│   └── MainBreaker.tsx
├── hooks/               # Custom React hooks
├── constants/           # Application constants
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── services/            # API services
└── test/
    └── setup.ts         # Test configuration (jest-dom)

e2e/                     # Playwright E2E tests (*.spec.ts)
```

## Testing Guidelines

### Unit Tests (Vitest + React Testing Library)

Location: `src/components/__tests__/*.test.tsx`

**Test file naming**: `ComponentName.test.tsx`

**Test structure**:
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  describe('when [scenario]', () => {
    it('should [expected behavior]', () => {
      // Arrange
      render(<ComponentName {...props} />);

      // Act
      // ... interactions

      // Assert
      expect(screen.getByRole(...)).toBe...
    });
  });
});
```

**Coverage requirements**:
- All props and their variations
- User interactions (clicks, inputs, etc.)
- Edge cases and error states
- Accessibility (use accessible queries: getByRole, getByLabelText)

### E2E Tests (Playwright)

Location: `e2e/*.spec.ts`

Use Playwright MCP to verify:
- Complete user flows
- Visual appearance and layout
- Cross-component interactions
- Real browser behavior

### TDD Workflow Example

When adding a new feature or component:

```bash
# 1. Write failing tests first
# Create/update test file in src/components/__tests__/

# 2. Run tests to confirm they fail
npm run test:run

# 3. Implement minimum code to pass
# Update component file

# 4. Confirm tests pass
npm run test:run

# 5. Refactor if needed (keep tests green)

# 6. Add E2E test if it's a user-facing feature
# Create test in e2e/

# 7. Run E2E to verify
npm run test:e2e
```

## Code Quality Standards

### TypeScript
- Complete type coverage - no `any` types
- Interfaces for component props
- Type definitions in `src/types/`

### React Patterns
- Functional components only
- Custom hooks for reusable logic
- Props destructuring
- Early returns for conditional rendering
- Memoization when needed (useMemo, useCallback)

### Component Design
- Single responsibility principle
- Clear prop interfaces
- Default values where appropriate
- Event handlers prefixed with `handle` or `on`

### Styling
- Tailwind CSS utility classes
- Responsive design with mobile-first approach
- Consistent spacing and color usage

## When in Doubt

1. **Search the internet** for React best practices and patterns
2. **Use Playwright MCP** to visually verify UI changes
3. **Write a test first** - if you can't test it, reconsider the approach
4. **Keep components small** - if it's getting complex, break it down

## Common Patterns in This Codebase

### Breaker State Management
- Breakers have on/off states and trip conditions
- Thermal modeling affects breaker behavior
- Main breaker controls all child breakers

### Device Power Calculations
- Devices have wattage ratings
- Amperage = Watts / Voltage (120V standard)
- Cumulative load affects breaker trips

### UI Interactions
- Click to toggle breakers
- Drag to add devices
- Visual feedback for overload conditions
