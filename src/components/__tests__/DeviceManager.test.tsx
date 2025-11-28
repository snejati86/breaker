import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    // Clear localStorage between tests
    localStorage.clear();
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

    it('should render add device picker button', () => {
      render(<DeviceManager {...defaultProps} />);

      // DevicePicker uses a button with aria-haspopup="listbox"
      const pickerButton = screen.getByRole('button', { name: /add device/i });
      expect(pickerButton).toBeInTheDocument();
      expect(pickerButton).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('should show "+ Add Device..." as default placeholder for outlets', () => {
      render(<DeviceManager {...defaultProps} />);

      expect(screen.getByText('+ Add Device...')).toBeInTheDocument();
    });

    it('should show "+ Add Light..." as default placeholder for switches', () => {
      const switchComponent: Component = {
        ...mockComponent,
        type: 'switch',
      };
      render(<DeviceManager {...defaultProps} component={switchComponent} />);

      expect(screen.getByText('+ Add Light...')).toBeInTheDocument();
    });
  });

  describe('device list', () => {
    it('should render empty device list', () => {
      render(<DeviceManager {...defaultProps} />);

      expect(screen.getByTestId('device-list')).toBeInTheDocument();
      expect(screen.queryByTestId('device-row')).not.toBeInTheDocument();
    });

    it('should show "No devices connected" when list is empty', () => {
      render(<DeviceManager {...defaultProps} />);

      expect(screen.getByText('No devices connected')).toBeInTheDocument();
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

  describe('adding devices via picker', () => {
    it('should open picker when button is clicked', async () => {
      const user = userEvent.setup();
      render(<DeviceManager {...defaultProps} />);

      const pickerButton = screen.getByRole('button', { name: /add device/i });
      await user.click(pickerButton);

      // Should show search input and device list
      expect(screen.getByRole('searchbox')).toBeInTheDocument();
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should add device when selected from picker', async () => {
      const user = userEvent.setup();
      render(<DeviceManager {...defaultProps} />);

      // Open picker
      const pickerButton = screen.getByRole('button', { name: /add device/i });
      await user.click(pickerButton);

      // Click on a device option (LED Bulb is a common device)
      const deviceOption = await screen.findByRole('option', { name: /LED Bulb \(9W\)/i });
      await user.click(deviceOption);

      // Should call onAddDevice with the selected device
      expect(defaultProps.onAddDevice).toHaveBeenCalledTimes(1);
      const addedDevice = defaultProps.onAddDevice.mock.calls[0][0];
      expect(addedDevice.name).toBe('LED Bulb (9W)');
      expect(addedDevice.watts).toBe(9);
      expect(addedDevice.uid).toBeDefined();
      expect(addedDevice.isOn).toBe(true);
    });

    it('should close picker after selecting a device', async () => {
      const user = userEvent.setup();
      render(<DeviceManager {...defaultProps} />);

      // Open picker
      const pickerButton = screen.getByRole('button', { name: /add device/i });
      await user.click(pickerButton);

      // Click on a device
      const deviceOption = await screen.findByRole('option', { name: /LED Bulb \(9W\)/i });
      await user.click(deviceOption);

      // Picker should close (listbox should not be visible)
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should allow searching for devices', async () => {
      const user = userEvent.setup();
      render(<DeviceManager {...defaultProps} />);

      // Open picker
      const pickerButton = screen.getByRole('button', { name: /add device/i });
      await user.click(pickerButton);

      // Type in search box - use a specific device name
      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'microwave');

      // Should show search results - use findAllByRole since there may be multiple microwave types
      const results = await screen.findAllByRole('option', { name: /microwave/i });
      expect(results.length).toBeGreaterThan(0);
    });

    it('should close picker on escape key', async () => {
      const user = userEvent.setup();
      render(<DeviceManager {...defaultProps} />);

      // Open picker
      const pickerButton = screen.getByRole('button', { name: /add device/i });
      await user.click(pickerButton);

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      // Press Escape
      await user.keyboard('{Escape}');

      // Picker should close
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
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

      // Find power button by its aria-label
      const powerButton = screen.getByRole('button', { name: /turn test device off/i });
      fireEvent.click(powerButton);

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

      // Find remove button by its aria-label
      const removeButton = screen.getByRole('button', { name: /remove test device/i });
      fireEvent.click(removeButton);

      expect(defaultProps.onRemoveDevice).toHaveBeenCalledWith('device-1');
    });

    it('should have correct aria-pressed state for device power button', () => {
      const componentWithDevices: Component = {
        ...mockComponent,
        devices: [
          { name: 'On Device', watts: 100, icon: 'fa-1', uid: 'd1', isOn: true },
          { name: 'Off Device', watts: 200, icon: 'fa-2', uid: 'd2', isOn: false },
        ],
      };

      render(
        <DeviceManager {...defaultProps} component={componentWithDevices} />
      );

      const onButton = screen.getByRole('button', { name: /turn on device off/i });
      const offButton = screen.getByRole('button', { name: /turn off device on/i });

      expect(onButton).toHaveAttribute('aria-pressed', 'true');
      expect(offButton).toHaveAttribute('aria-pressed', 'false');
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

  describe('switch vs outlet filtering', () => {
    it('should show all devices for outlet component', async () => {
      const user = userEvent.setup();
      render(<DeviceManager {...defaultProps} />);

      const pickerButton = screen.getByRole('button', { name: /add device/i });
      await user.click(pickerButton);

      // Common devices should include non-lighting items
      expect(screen.getByText(/Laptop/)).toBeInTheDocument();
      expect(screen.getByText(/Microwave/)).toBeInTheDocument();
    });

    it('should filter to lighting devices for switch component', async () => {
      const user = userEvent.setup();
      const switchComponent: Component = {
        ...mockComponent,
        type: 'switch',
      };

      render(<DeviceManager {...defaultProps} component={switchComponent} />);

      const pickerButton = screen.getByRole('button', { name: /add light/i });
      await user.click(pickerButton);

      // Search for a lighting device
      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'chandelier');

      // Use findAllByRole since there are multiple chandelier variants
      await waitFor(async () => {
        const chandeliers = screen.getAllByText(/Chandelier/);
        expect(chandeliers.length).toBeGreaterThan(0);
      });
    });
  });

  describe('custom device search modal', () => {
    it('should show search link', () => {
      render(<DeviceManager {...defaultProps} />);

      expect(screen.getByText(/can't find your device/i)).toBeInTheDocument();
    });

    it('should open custom search modal when link is clicked', async () => {
      const user = userEvent.setup();
      render(<DeviceManager {...defaultProps} />);

      const searchLink = screen.getByText(/can't find your device/i).closest('button')!;
      await user.click(searchLink);

      // Modal should open with its title
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Search for Device')).toBeInTheDocument();
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

  describe('accessibility', () => {
    it('should have accessible device list', () => {
      render(<DeviceManager {...defaultProps} />);

      expect(screen.getByRole('list', { name: /connected devices/i })).toBeInTheDocument();
    });

    it('should have descriptive labels for all interactive elements', () => {
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

      // Power button should have descriptive aria-label
      expect(screen.getByRole('button', { name: /turn test device off/i })).toBeInTheDocument();

      // Remove button should have descriptive aria-label
      expect(screen.getByRole('button', { name: /remove test device/i })).toBeInTheDocument();
    });
  });
});
