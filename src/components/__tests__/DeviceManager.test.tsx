import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DeviceManager from '../DeviceManager';
import type { Component } from '../../types';

// Mock the device API
vi.mock('../../services/deviceApi', () => ({
  fetchCustomDeviceSpecs: vi.fn().mockResolvedValue({
    name: 'Custom Device',
    watts: 100,
    icon: 'fa-custom',
  }),
}));

describe('DeviceManager', () => {
  const mockComponent: Component = {
    id: 'c1',
    type: 'outlet',
    devices: [],
    grounded: true,
  };

  const defaultProps = {
    component: mockComponent,
    breakerId: 'b1',
    runIndex: 0,
    compIndex: 0,
    onToggleDevice: vi.fn(),
    onRemoveDevice: vi.fn(),
    onAddDevice: vi.fn(),
    onToggleGround: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render device manager with data-testid', () => {
      render(<DeviceManager {...defaultProps} />);

      expect(screen.getByTestId('device-manager')).toBeInTheDocument();
    });

    it('should render ground wire checkbox', () => {
      render(<DeviceManager {...defaultProps} />);

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByText('Ground Wire')).toBeInTheDocument();
    });

    it('should render add device dropdown', () => {
      render(<DeviceManager {...defaultProps} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should show "+ Plug In Device..." as default option', () => {
      render(<DeviceManager {...defaultProps} />);

      const dropdown = screen.getByRole('combobox') as HTMLSelectElement;
      expect(dropdown.value).toBe('');
    });
  });

  describe('device list', () => {
    it('should render empty device list', () => {
      render(<DeviceManager {...defaultProps} />);

      expect(screen.getByTestId('device-list')).toBeInTheDocument();
      expect(screen.queryByTestId('device-row')).not.toBeInTheDocument();
    });

    it('should render device list correctly', () => {
      const componentWithDevices: Component = {
        ...mockComponent,
        devices: [
          {
            name: 'Test Device',
            watts: 100,
            icon: 'fa-test',
            uid: 'device-1',
            isOn: true,
          },
        ],
      };

      render(
        <DeviceManager {...defaultProps} component={componentWithDevices} />
      );

      expect(screen.getByText('Test Device')).toBeInTheDocument();
      expect(screen.getByText('100W')).toBeInTheDocument();
    });

    it('should render multiple devices', () => {
      const componentWithDevices: Component = {
        ...mockComponent,
        devices: [
          { name: 'Device 1', watts: 100, icon: 'fa-1', uid: 'd1', isOn: true },
          {
            name: 'Device 2',
            watts: 200,
            icon: 'fa-2',
            uid: 'd2',
            isOn: false,
          },
        ],
      };

      render(
        <DeviceManager {...defaultProps} component={componentWithDevices} />
      );

      expect(screen.getByText('Device 1')).toBeInTheDocument();
      expect(screen.getByText('Device 2')).toBeInTheDocument();
      expect(screen.getByText('100W')).toBeInTheDocument();
      expect(screen.getByText('200W')).toBeInTheDocument();
    });
  });

  describe('adding devices', () => {
    it('should auto-add device when selected from dropdown', () => {
      render(<DeviceManager {...defaultProps} />);

      const dropdown = screen.getByRole('combobox');

      // Select LED Bulb - should auto-add
      fireEvent.change(dropdown, { target: { value: 'LED Bulb' } });

      // Should call onAddDevice immediately
      expect(defaultProps.onAddDevice).toHaveBeenCalledTimes(1);

      // Verify the device added has correct properties
      const addedDevice = defaultProps.onAddDevice.mock.calls[0][0];
      expect(addedDevice.name).toBe('LED Bulb');
      expect(addedDevice.watts).toBe(10);
      expect(addedDevice.uid).toBeDefined();
      expect(addedDevice.isOn).toBe(true);
    });

    it('should prevent duplicate device addition when same device is selected rapidly', async () => {
      render(<DeviceManager {...defaultProps} />);

      const dropdown = screen.getByRole('combobox');

      // Simulate rapid selection attempts of the same device
      fireEvent.change(dropdown, { target: { value: 'LED Bulb' } });
      fireEvent.change(dropdown, { target: { value: 'LED Bulb' } });

      // Should only call onAddDevice once due to debounce
      expect(defaultProps.onAddDevice).toHaveBeenCalledTimes(1);
    });

    it('should reset select value immediately after adding device', () => {
      render(<DeviceManager {...defaultProps} />);

      const dropdown = screen.getByRole('combobox') as HTMLSelectElement;

      // Select LED Bulb
      fireEvent.change(dropdown, { target: { value: 'LED Bulb' } });

      // Select value should be reset to empty string immediately
      expect(dropdown.value).toBe('');

      // Should have added device
      expect(defaultProps.onAddDevice).toHaveBeenCalledTimes(1);
    });

    it('should allow adding different devices sequentially after debounce', async () => {
      vi.useFakeTimers();
      render(<DeviceManager {...defaultProps} />);

      const dropdown = screen.getByRole('combobox');

      // Add first device
      fireEvent.change(dropdown, { target: { value: 'LED Bulb' } });
      expect(defaultProps.onAddDevice).toHaveBeenCalledTimes(1);

      // Advance timers past the debounce period (200ms)
      await vi.advanceTimersByTimeAsync(250);

      // Add second device
      fireEvent.change(dropdown, { target: { value: 'Laptop' } });

      // Should call onAddDevice twice for different devices
      expect(defaultProps.onAddDevice).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
    });

    it('should not add device when empty option is selected', () => {
      render(<DeviceManager {...defaultProps} />);

      const dropdown = screen.getByRole('combobox');

      // Select the empty/placeholder option
      fireEvent.change(dropdown, { target: { value: '' } });

      expect(defaultProps.onAddDevice).not.toHaveBeenCalled();
    });
  });

  describe('device interactions', () => {
    it('should call onToggleDevice when power button is clicked', () => {
      const componentWithDevices: Component = {
        ...mockComponent,
        devices: [
          {
            name: 'Test Device',
            watts: 100,
            icon: 'fa-test',
            uid: 'device-1',
            isOn: true,
          },
        ],
      };

      render(
        <DeviceManager {...defaultProps} component={componentWithDevices} />
      );

      const powerButton = screen
        .getByText('Test Device')
        .closest('div')
        ?.querySelector('button');
      fireEvent.click(powerButton!);

      expect(defaultProps.onToggleDevice).toHaveBeenCalledWith('device-1');
    });

    it('should call onRemoveDevice when remove button is clicked', () => {
      const componentWithDevices: Component = {
        ...mockComponent,
        devices: [
          {
            name: 'Test Device',
            watts: 100,
            icon: 'fa-test',
            uid: 'device-1',
            isOn: true,
          },
        ],
      };

      render(
        <DeviceManager {...defaultProps} component={componentWithDevices} />
      );

      const deviceRow = screen.getByTestId('device-row');
      const removeButton = deviceRow.querySelectorAll('button')[1];
      fireEvent.click(removeButton!);

      expect(defaultProps.onRemoveDevice).toHaveBeenCalledWith('device-1');
    });
  });

  describe('ground wire toggle', () => {
    it('should toggle ground wire state', () => {
      render(<DeviceManager {...defaultProps} />);

      const groundCheckbox = screen.getByRole('checkbox');
      fireEvent.click(groundCheckbox);

      expect(defaultProps.onToggleGround).toHaveBeenCalledTimes(1);
    });

    it('should show grounded state when grounded is true', () => {
      render(<DeviceManager {...defaultProps} />);

      const groundCheckbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(groundCheckbox.checked).toBe(true);
    });

    it('should show ungrounded state when grounded is false', () => {
      const ungroundedComponent = { ...mockComponent, grounded: false };
      render(
        <DeviceManager {...defaultProps} component={ungroundedComponent} />
      );

      const groundCheckbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(groundCheckbox.checked).toBe(false);
    });
  });

  describe('switch vs outlet', () => {
    it('should show DEVICE_TYPES options for outlet', () => {
      render(<DeviceManager {...defaultProps} />);

      const dropdown = screen.getByRole('combobox');
      fireEvent.click(dropdown);

      // Check for outlet-specific devices
      expect(screen.getByText(/Laptop/)).toBeInTheDocument();
      expect(screen.getByText(/Microwave/)).toBeInTheDocument();
    });

    it('should show LIGHT_TYPES options for switch', () => {
      const switchComponent: Component = {
        ...mockComponent,
        type: 'switch',
      };

      render(<DeviceManager {...defaultProps} component={switchComponent} />);

      const dropdown = screen.getByRole('combobox');
      fireEvent.click(dropdown);

      // Check for light-specific devices
      expect(screen.getByText(/Chandelier/)).toBeInTheDocument();
      expect(screen.getByText(/Flood Light/)).toBeInTheDocument();
    });
  });

  describe('independent rendering', () => {
    it('should render without any external dependencies', () => {
      expect(() => {
        render(<DeviceManager {...defaultProps} />);
      }).not.toThrow();
    });

    it('should render multiple instances independently', () => {
      const component2: Component = { ...mockComponent, id: 'c2' };
      const component3: Component = {
        ...mockComponent,
        id: 'c3',
        type: 'switch',
      };

      render(
        <>
          <DeviceManager {...defaultProps} compIndex={0} />
          <DeviceManager {...defaultProps} component={component2} compIndex={1} />
          <DeviceManager {...defaultProps} component={component3} compIndex={2} />
        </>
      );

      const managers = screen.getAllByTestId('device-manager');
      expect(managers).toHaveLength(3);
    });
  });
});