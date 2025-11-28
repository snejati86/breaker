import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CircuitEditor from '../CircuitEditor';
import type { Breaker } from '../../types';

// Mock DeviceManager since it's already tested
vi.mock('../DeviceManager', () => ({
  default: vi.fn(() => <div data-testid="device-manager-mock">DeviceManager</div>),
}));

// Mock calculations
vi.mock('../../utils/calculations', () => ({
  calculateBreakerLoad: vi.fn(() => 5.5),
}));

describe('CircuitEditor', () => {
  const mockBreaker: Breaker = {
    id: 'b1',
    name: 'Kitchen',
    rating: 20,
    slots: [1],
    thermalHeat: 0,
    on: true,
    runs: [
      [
        {
          id: 'c1',
          type: 'outlet',
          devices: [],
          grounded: true,
          temperature: 85,
        },
      ],
    ],
  };

  const defaultProps = {
    breaker: mockBreaker,
    mainPowerOn: true,
    onUpdateBreakerName: vi.fn(),
    onUpdateBreakerRating: vi.fn(),
    onAddRun: vi.fn(),
    onAddComponent: vi.fn(),
    onToggleSwitch: vi.fn(),
    onToggleGround: vi.fn(),
    onRemoveComponent: vi.fn(),
    onAddDevice: vi.fn(),
    onToggleDevicePower: vi.fn(),
    onRemoveDevice: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render circuit editor container', () => {
      const { container } = render(<CircuitEditor {...defaultProps} />);

      expect(container.querySelector('.bg-apple-bg-elevated')).toBeInTheDocument();
    });

    it('should render breaker name input with correct value', () => {
      render(<CircuitEditor {...defaultProps} />);

      const nameInput = screen.getByDisplayValue('Kitchen');
      expect(nameInput).toBeInTheDocument();
    });

    it('should render slot number display', () => {
      render(<CircuitEditor {...defaultProps} />);

      expect(screen.getByText('Slot 1')).toBeInTheDocument();
    });

    it('should render slot numbers for double pole breaker', () => {
      const doublePoleBreaker = { ...mockBreaker, slots: [1, 3] };
      render(<CircuitEditor {...defaultProps} breaker={doublePoleBreaker} />);

      expect(screen.getByText('Slot 1+3')).toBeInTheDocument();
    });

    it('should render breaker rating selector', () => {
      render(<CircuitEditor {...defaultProps} />);

      const ratingSelect = screen.getByDisplayValue('20A');
      expect(ratingSelect).toBeInTheDocument();
    });

    it('should render all breaker rating options', () => {
      render(<CircuitEditor {...defaultProps} />);

      expect(screen.getByRole('option', { name: '15A' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '20A' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '30A' })).toBeInTheDocument();
    });

    it('should render active load display', () => {
      render(<CircuitEditor {...defaultProps} />);

      expect(screen.getByText('Load')).toBeInTheDocument();
      // Load now shows current/capacity format (5.5 / 20A)
      expect(screen.getByText('5.5')).toBeInTheDocument();
      expect(screen.getByText(/\/ 20A/)).toBeInTheDocument();
    });

    it('should render breaker temperature display', () => {
      render(<CircuitEditor {...defaultProps} />);

      expect(screen.getByText('Temp')).toBeInTheDocument();
      expect(screen.getByTestId('breaker-temp')).toBeInTheDocument();
    });

    it('should render new branch button', () => {
      render(<CircuitEditor {...defaultProps} />);

      expect(screen.getByText('New Branch')).toBeInTheDocument();
    });
  });

  describe('thermal heat display', () => {
    it('should not show thermal heat bar when thermalHeat is 0', () => {
      const { container } = render(<CircuitEditor {...defaultProps} />);

      expect(container.querySelector('.bg-apple-orange')).not.toBeInTheDocument();
    });

    it('should show thermal heat bar when thermalHeat > 0', () => {
      const breakerWithHeat = { ...mockBreaker, thermalHeat: 50 };
      const { container } = render(
        <CircuitEditor {...defaultProps} breaker={breakerWithHeat} />
      );

      const heatBar = container.querySelector('.bg-apple-orange');
      expect(heatBar).toBeInTheDocument();
      expect(heatBar).toHaveStyle({ width: '50%' });
    });
  });

  describe('breaker name update', () => {
    it('should call onUpdateBreakerName when name is changed', () => {
      render(<CircuitEditor {...defaultProps} />);

      const nameInput = screen.getByDisplayValue('Kitchen');
      fireEvent.change(nameInput, { target: { value: 'Bathroom' } });

      expect(defaultProps.onUpdateBreakerName).toHaveBeenCalledWith(
        'b1',
        'Bathroom'
      );
    });
  });

  describe('breaker rating update', () => {
    it('should call onUpdateBreakerRating when rating is changed', () => {
      render(<CircuitEditor {...defaultProps} />);

      const ratingSelect = screen.getByDisplayValue('20A');
      fireEvent.change(ratingSelect, { target: { value: '30' } });

      expect(defaultProps.onUpdateBreakerRating).toHaveBeenCalledWith('b1', 30);
    });

    it('should convert rating to number', () => {
      render(<CircuitEditor {...defaultProps} />);

      const ratingSelect = screen.getByDisplayValue('20A');
      fireEvent.change(ratingSelect, { target: { value: '15' } });

      expect(defaultProps.onUpdateBreakerRating).toHaveBeenCalledWith('b1', 15);
      expect(typeof defaultProps.onUpdateBreakerRating.mock.calls[0][1]).toBe(
        'number'
      );
    });
  });

  describe('run management', () => {
    it('should render circuit runs', () => {
      render(<CircuitEditor {...defaultProps} />);

      // Should render the outlet component type
      expect(screen.getByText('OUTLET')).toBeInTheDocument();
    });

    it('should call onAddRun when new branch button is clicked', () => {
      render(<CircuitEditor {...defaultProps} />);

      const newBranchButton = screen.getByText('New Branch');
      fireEvent.click(newBranchButton);

      expect(defaultProps.onAddRun).toHaveBeenCalledWith('b1');
    });

    it('should render multiple runs', () => {
      const breakerWithMultipleRuns: Breaker = {
        ...mockBreaker,
        runs: [
          [
            { id: 'c1', type: 'outlet', devices: [], grounded: true },
          ],
          [
            { id: 'c2', type: 'switch', devices: [], grounded: true, isOn: true },
          ],
        ],
      };

      render(
        <CircuitEditor {...defaultProps} breaker={breakerWithMultipleRuns} />
      );

      expect(screen.getByText('OUTLET')).toBeInTheDocument();
      expect(screen.getByText('SWITCH')).toBeInTheDocument();
    });
  });

  describe('component management', () => {
    it('should render add outlet button', () => {
      const { container } = render(<CircuitEditor {...defaultProps} />);

      const outletButton = container.querySelector('.fa-plug')?.closest('button');
      expect(outletButton).toBeInTheDocument();
    });

    it('should render add switch button', () => {
      const { container } = render(<CircuitEditor {...defaultProps} />);

      const switchButton = container.querySelector('.fa-toggle-on')?.closest('button');
      expect(switchButton).toBeInTheDocument();
    });

    it('should call onAddComponent with outlet type when outlet button is clicked', () => {
      const { container } = render(<CircuitEditor {...defaultProps} />);

      const outletButton = container.querySelector('.fa-plug')?.closest('button');
      fireEvent.click(outletButton!);

      expect(defaultProps.onAddComponent).toHaveBeenCalledWith('b1', 0, 'outlet');
    });

    it('should call onAddComponent with switch type when switch button is clicked', () => {
      const { container } = render(<CircuitEditor {...defaultProps} />);

      const switchButton = container.querySelector('.fa-toggle-on')?.closest('button');
      fireEvent.click(switchButton!);

      expect(defaultProps.onAddComponent).toHaveBeenCalledWith('b1', 0, 'switch');
    });

    it('should call onRemoveComponent when remove button is clicked', () => {
      const { container } = render(<CircuitEditor {...defaultProps} />);

      const removeButton = container.querySelector('.fa-times')?.closest('button');
      fireEvent.click(removeButton!);

      expect(defaultProps.onRemoveComponent).toHaveBeenCalledWith('b1', 0, 0);
    });
  });

  describe('switch toggle', () => {
    it('should call onToggleSwitch when switch is clicked', () => {
      const breakerWithSwitch: Breaker = {
        ...mockBreaker,
        runs: [
          [
            { id: 'c1', type: 'switch', devices: [], grounded: true, isOn: false },
          ],
        ],
      };

      const { container } = render(
        <CircuitEditor {...defaultProps} breaker={breakerWithSwitch} />
      );

      // Switch component has cursor-pointer and w-10 h-16 in the new design
      const switchComponent = container.querySelector('.cursor-pointer.w-10.h-16');
      fireEvent.click(switchComponent!);

      expect(defaultProps.onToggleSwitch).toHaveBeenCalledWith('b1', 0, 0);
    });

    it('should show switch in on state', () => {
      const breakerWithSwitch: Breaker = {
        ...mockBreaker,
        runs: [
          [
            { id: 'c1', type: 'switch', devices: [], grounded: true, isOn: true },
          ],
        ],
      };

      const { container } = render(
        <CircuitEditor {...defaultProps} breaker={breakerWithSwitch} />
      );

      // Switch knob moves up (-translate-y-1) and turns green when on
      expect(container.querySelector('.bg-apple-green.-translate-y-1')).toBeInTheDocument();
    });

    it('should show switch in off state', () => {
      const breakerWithSwitch: Breaker = {
        ...mockBreaker,
        runs: [
          [
            { id: 'c1', type: 'switch', devices: [], grounded: true, isOn: false },
          ],
        ],
      };

      const { container } = render(
        <CircuitEditor {...defaultProps} breaker={breakerWithSwitch} />
      );

      // Switch knob moves down (translate-y-1) and turns gray when off
      expect(container.querySelector('.bg-apple-gray-2.translate-y-1')).toBeInTheDocument();
    });
  });

  describe('temperature display', () => {
    it('should display circuit temperature in header', () => {
      render(<CircuitEditor {...defaultProps} />);

      // Circuit temp (max temperature) is shown in header
      const tempDisplay = screen.getByTestId('breaker-temp');
      expect(tempDisplay).toHaveTextContent('85°F');
    });

    it('should use default temperature of 75 when not set', () => {
      const breakerWithoutTemp: Breaker = {
        ...mockBreaker,
        runs: [
          [
            { id: 'c1', type: 'outlet', devices: [], grounded: true },
          ],
        ],
      };

      render(<CircuitEditor {...defaultProps} breaker={breakerWithoutTemp} />);

      // Circuit temp should show default 75°F
      const tempDisplay = screen.getByTestId('breaker-temp');
      expect(tempDisplay).toHaveTextContent('75°F');
    });

    it('should show component temp badge only with multiple components', () => {
      // With single component, component-temp should not be shown
      const singleComponentBreaker: Breaker = {
        ...mockBreaker,
        runs: [
          [
            { id: 'c1', type: 'outlet', devices: [], grounded: true, temperature: 80 },
          ],
        ],
      };

      const { rerender } = render(
        <CircuitEditor {...defaultProps} breaker={singleComponentBreaker} />
      );

      // Component temp badge NOT shown for single component
      expect(screen.queryByTestId('component-temp')).not.toBeInTheDocument();

      // With multiple components, component-temp SHOULD be shown
      const multiComponentBreaker: Breaker = {
        ...mockBreaker,
        runs: [
          [
            { id: 'c1', type: 'outlet', devices: [], grounded: true, temperature: 80 },
            { id: 'c2', type: 'switch', devices: [], grounded: true, isOn: true, temperature: 90 },
          ],
        ],
      };

      rerender(<CircuitEditor {...defaultProps} breaker={multiComponentBreaker} />);

      // Component temp badges should now be visible
      expect(screen.getAllByTestId('component-temp').length).toBe(2);
    });

    it('should apply correct color for normal temperature', () => {
      const breakerWithNormalTemp: Breaker = {
        ...mockBreaker,
        runs: [
          [
            { id: 'c1', type: 'outlet', devices: [], grounded: true, temperature: 80 },
            { id: 'c2', type: 'outlet', devices: [], grounded: true, temperature: 75 },
          ],
        ],
      };

      const { container } = render(
        <CircuitEditor {...defaultProps} breaker={breakerWithNormalTemp} />
      );

      // Apple design uses bg-apple-green/20 for normal temp badge
      expect(container.querySelector('[class*="bg-apple-green"]')).toBeInTheDocument();
    });

    it('should apply warning color for elevated temperature', () => {
      const breakerWithWarmTemp: Breaker = {
        ...mockBreaker,
        runs: [
          [
            { id: 'c1', type: 'outlet', devices: [], grounded: true, temperature: 145 },
            { id: 'c2', type: 'outlet', devices: [], grounded: true, temperature: 100 },
          ],
        ],
      };

      const { container } = render(
        <CircuitEditor {...defaultProps} breaker={breakerWithWarmTemp} />
      );

      // Apple design uses bg-apple-orange/20 for warning temp badge
      expect(container.querySelector('[class*="bg-apple-orange"]')).toBeInTheDocument();
    });

    it('should apply danger color for high temperature', () => {
      const breakerWithHotTemp: Breaker = {
        ...mockBreaker,
        runs: [
          [
            { id: 'c1', type: 'outlet', devices: [], grounded: true, temperature: 210 },
            { id: 'c2', type: 'outlet', devices: [], grounded: true, temperature: 100 },
          ],
        ],
      };

      const { container } = render(
        <CircuitEditor {...defaultProps} breaker={breakerWithHotTemp} />
      );

      // Apple design uses bg-apple-red/20 for danger temp badge
      expect(container.querySelector('[class*="bg-apple-red"]')).toBeInTheDocument();
    });
  });

  describe('DeviceManager integration', () => {
    it('should render DeviceManager for each component', () => {
      render(<CircuitEditor {...defaultProps} />);

      expect(screen.getByTestId('device-manager-mock')).toBeInTheDocument();
    });

    it('should render DeviceManager for multiple components', () => {
      const breakerWithMultipleComponents: Breaker = {
        ...mockBreaker,
        runs: [
          [
            { id: 'c1', type: 'outlet', devices: [], grounded: true },
            { id: 'c2', type: 'outlet', devices: [], grounded: true },
          ],
        ],
      };

      render(
        <CircuitEditor
          {...defaultProps}
          breaker={breakerWithMultipleComponents}
        />
      );

      expect(screen.getAllByTestId('device-manager-mock')).toHaveLength(2);
    });
  });

  describe('independent rendering', () => {
    it('should render without any external dependencies', () => {
      expect(() => {
        render(<CircuitEditor {...defaultProps} />);
      }).not.toThrow();
    });

    it('should render with empty runs', () => {
      const breakerWithEmptyRuns: Breaker = {
        ...mockBreaker,
        runs: [],
      };

      render(<CircuitEditor {...defaultProps} breaker={breakerWithEmptyRuns} />);

      expect(screen.getByText('New Branch')).toBeInTheDocument();
    });
  });
});
