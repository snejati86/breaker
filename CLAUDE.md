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

# 5. Verify production build works
npm run build

# 6. Refactor if needed (keep tests green AND build passing)

# 7. Add E2E test if it's a user-facing feature
# Create test in e2e/

# 8. Run E2E to verify
npm run test:e2e
```

### Validation Requirements

**IMPORTANT: After every test run, also run `npm run build` to ensure production builds succeed.**

This catches:
- TypeScript errors not caught by tests
- Import/export issues
- Tree-shaking problems
- Build-time optimizations that may fail

```bash
# Always run both after making changes:
npm run test:run && npm run build
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
- Drag-and-drop to reposition breakers
- Visual feedback for overload conditions

### Drag-and-Drop Implementation
This project uses `@dnd-kit` for drag-and-drop functionality:
- `DndContext` wraps draggable areas
- `useSortable` for draggable items
- `useDroppable` for drop targets
- `DragOverlay` for visual feedback during drag
- `PointerSensor` with distance threshold (8px) to distinguish clicks from drags

### Auto-Add Dropdown Pattern
For device/item selection, prefer auto-adding on dropdown selection rather than dropdown + separate button. This reduces clicks and feels more intuitive:
- Reset the dropdown to placeholder immediately after adding
- Use refs (`isAddingRef`, `lastAddedRef`) to debounce rapid selections
- Prevents double-triggers from React's synthetic events

## Known Gotchas

### React Hook Dependency Arrays
When using `useCallback` or `useMemo` with optional callback props (like `notify?: (msg: string) => void`), always include them in the dependency array even if optional. The React Compiler's `preserve-manual-memoization` rule will fail if inferred dependencies don't match declared ones.

```typescript
// ❌ Wrong - notify is used but not in deps
const doSomething = useCallback(() => {
  notify?.('message');
}, [otherDep]);

// ✅ Correct - include notify even though optional
const doSomething = useCallback(() => {
  notify?.('message');
}, [otherDep, notify]);
```

### GitHub Actions Secrets in Conditionals
Secrets cannot be accessed directly in `if:` conditions. To conditionally run a step based on whether a secret exists:

```yaml
# ❌ Wrong - secrets not accessible in if
- name: Deploy
  if: secrets.AWS_KEY != ''

# ✅ Correct - set as env first, then check
- name: Deploy
  env:
    AWS_KEY: ${{ secrets.AWS_KEY }}
  if: env.AWS_KEY != ''
```

### Test Updates When Changing Behavior
When changing component behavior (e.g., removing a button, changing interaction patterns):
1. Update tests FIRST to reflect new expected behavior
2. Then update the component
3. Run tests to verify the new behavior works
4. This ensures tests document the intended behavior, not just pass

### CSS Overflow Clipping Pitfall
**CRITICAL:** Custom CSS tooltips/popups positioned with `absolute` will be clipped by parent containers with `overflow: hidden`, `overflow: auto`, or `overflow: scroll`.

**What happened:** A custom tooltip was positioned with `-top-8` (above the element), but the parent had `overflow-y-auto`. The tooltip existed in the DOM but was visually invisible due to clipping.

**Why tests didn't catch it:**
- Unit tests only check DOM presence, not visual visibility
- Playwright's accessibility snapshot shows elements exist even when clipped
- Neither approach tests if CSS `overflow` clips content

**The fix:** Use native browser features like the `title` attribute for tooltips instead of custom CSS tooltips. They:
- Always work regardless of overflow settings
- Are accessible by default
- Don't require complex z-index or positioning

```typescript
// ❌ Wrong - custom tooltip can be clipped by overflow
<span className="relative group">
  <span className="truncate">{text}</span>
  <span className="absolute -top-8 opacity-0 group-hover:opacity-100">
    {text}
  </span>
</span>

// ✅ Correct - native title always works
<span className="truncate" title={text}>{text}</span>
```

**Testing visual rendering:** After implementing UI features, ALWAYS manually verify in the browser or use Playwright screenshots to confirm visual appearance, not just DOM presence.
