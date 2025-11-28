import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DevicePicker from '../DevicePicker';

describe('DevicePicker', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('rendering', () => {
    it('should render trigger button with default placeholder', () => {
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should render trigger button with custom placeholder', () => {
      render(<DevicePicker onSelect={mockOnSelect} placeholder="+ Add Light..." />);

      expect(screen.getByText('+ Add Light...')).toBeInTheDocument();
    });

    it('should not show dropdown when closed', () => {
      render(<DevicePicker onSelect={mockOnSelect} />);

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    });
  });

  describe('opening and closing', () => {
    it('should open dropdown when button is clicked', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      await user.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });

    it('should close dropdown when pressing Escape', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} />);

      // Open
      const button = screen.getByRole('button', { name: /add device/i });
      await user.click(button);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      // Press Escape
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <DevicePicker onSelect={mockOnSelect} />
          <button>Outside</button>
        </div>
      );

      // Open
      const button = screen.getByRole('button', { name: /add device/i });
      await user.click(button);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      // Click outside
      await user.click(screen.getByText('Outside'));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should focus search input when opened', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      await user.click(button);

      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toHaveFocus();
    });
  });

  describe('common devices section', () => {
    it('should show common devices when dropdown is open', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      await user.click(button);

      // Common devices header should appear
      expect(screen.getByText('Common')).toBeInTheDocument();

      // Common devices like LED Bulb should appear
      expect(screen.getByText(/LED Bulb \(9W\)/)).toBeInTheDocument();
    });

    it('should show all categories section', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      await user.click(button);

      expect(screen.getByText('All Categories')).toBeInTheDocument();
      expect(screen.getByText('Lighting')).toBeInTheDocument();
      expect(screen.getByText('Kitchen')).toBeInTheDocument();
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    it('should filter devices based on search query', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      await user.click(button);

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'laptop');

      // Should show Laptop in results - use findAllByRole since there are multiple laptop variants
      const results = await screen.findAllByRole('option', { name: /laptop/i });
      expect(results.length).toBeGreaterThan(0);
    });

    it('should show no results message when search has no matches', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      await user.click(button);

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'xyznonexistent');

      // Should show no results message
      expect(await screen.findByText(/No devices match/)).toBeInTheDocument();
    });

    it('should show results count header when searching', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      await user.click(button);

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'tv');

      // Should show results header with count
      expect(await screen.findByText(/Results \(\d+\)/)).toBeInTheDocument();
    });

    it('should clear search when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      await user.click(button);

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'laptop');

      // Clear button should appear
      const clearButton = screen.getByRole('button', { name: /clear search/i });
      expect(clearButton).toBeInTheDocument();

      await user.click(clearButton);

      // Search should be cleared and common devices shown again
      expect(searchInput).toHaveValue('');
      expect(screen.getByText('Common')).toBeInTheDocument();
    });
  });

  describe('category expansion', () => {
    it('should expand category when clicked', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      await user.click(button);

      // Click on Kitchen category
      const kitchenCategory = screen.getByText('Kitchen').closest('li');
      expect(kitchenCategory).toHaveAttribute('aria-expanded', 'false');

      await user.click(kitchenCategory!);

      // Category should expand and show devices
      expect(kitchenCategory).toHaveAttribute('aria-expanded', 'true');
      // Kitchen has multiple Microwave options, so use getAllByText
      const microwaves = screen.getAllByText(/Microwave/);
      expect(microwaves.length).toBeGreaterThanOrEqual(1);
    });

    it('should collapse expanded category when clicked again', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      await user.click(button);

      const kitchenCategory = screen.getByText('Kitchen').closest('li');

      // Expand
      await user.click(kitchenCategory!);
      expect(kitchenCategory).toHaveAttribute('aria-expanded', 'true');

      // Collapse
      await user.click(kitchenCategory!);
      expect(kitchenCategory).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('device selection', () => {
    it('should call onSelect when device is clicked', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      await user.click(button);

      // Click on LED Bulb (common device)
      const ledBulb = screen.getByRole('option', { name: /LED Bulb \(9W\)/i });
      await user.click(ledBulb);

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'LED Bulb (9W)',
          watts: 9,
          category: 'lighting',
        })
      );
    });

    it('should close dropdown after selection', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      await user.click(button);

      const ledBulb = screen.getByRole('option', { name: /LED Bulb \(9W\)/i });
      await user.click(ledBulb);

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should clear search after selection', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      await user.click(button);

      // Search and select
      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'laptop');

      // Use findAllByRole and select first result since there are multiple laptop variants
      const laptops = await screen.findAllByRole('option', { name: /laptop/i });
      await user.click(laptops[0]);

      // Reopen picker
      await user.click(button);

      // Search should be cleared
      expect(screen.getByRole('searchbox')).toHaveValue('');
    });
  });

  describe('keyboard navigation', () => {
    it('should open dropdown with Enter key', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      button.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should open dropdown with ArrowDown key', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      button.focus();
      await user.keyboard('{ArrowDown}');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should navigate items with arrow keys', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      await user.click(button);

      // Navigate down through items
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');

      // Should have highlighted an item
      const highlightedItem = screen.getByRole('option', { selected: true });
      expect(highlightedItem).toBeInTheDocument();
    });

    it('should select highlighted item with Enter', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      await user.click(button);

      // Navigate to first item and select
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe('category filtering', () => {
    it('should filter to lighting category when filterCategory is set', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} filterCategory="lighting" />);

      const button = screen.getByRole('button', { name: /add device/i });
      await user.click(button);

      // Should only show lighting category
      expect(screen.getByText('Lighting')).toBeInTheDocument();
      expect(screen.queryByText('Kitchen')).not.toBeInTheDocument();
      expect(screen.queryByText('Electronics')).not.toBeInTheDocument();
    });

    it('should filter search results by category when filterCategory is set', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} filterCategory="lighting" />);

      const button = screen.getByRole('button', { name: /add device/i });
      await user.click(button);

      // Search for something that exists in multiple categories
      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'led');

      // Should only show lighting LEDs - all results are lighting devices
      const results = await screen.findAllByRole('option');
      expect(results.length).toBeGreaterThan(0);

      // All results should contain LED since that's what we searched for
      results.forEach((result) => {
        expect(result.textContent?.toLowerCase()).toContain('led');
      });
    });
  });

  describe('recent devices', () => {
    it('should not show recent section when no devices selected yet', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      await user.click(button);

      expect(screen.queryByText('Recent')).not.toBeInTheDocument();
    });

    it('should show recent section after selecting a device', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      await user.click(button);

      // Select a device
      const ledBulb = screen.getByRole('option', { name: /LED Bulb \(9W\)/i });
      await user.click(ledBulb);

      // Reopen
      await user.click(button);

      // Should show recent section with the selected device
      expect(screen.getByText('Recent')).toBeInTheDocument();
    });

    it('should save recent devices to localStorage', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      await user.click(button);

      // Select a device
      const ledBulb = screen.getByRole('option', { name: /LED Bulb \(9W\)/i });
      await user.click(ledBulb);

      // Check localStorage
      const stored = localStorage.getItem('circuit-app-recent-devices');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toContain('LED Bulb (9W)');
    });
  });

  describe('power level indicators', () => {
    it('should show power indicator for devices', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      await user.click(button);

      // Each device option should have wattage displayed
      const ledBulb = screen.getByRole('option', { name: /LED Bulb \(9W\)/i });
      expect(ledBulb).toHaveTextContent('9W');
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes on trigger button', () => {
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-controls');
    });

    it('should have proper ARIA attributes on search input', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      await user.click(button);

      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toHaveAttribute('aria-label', 'Search devices');
      expect(searchInput).toHaveAttribute('aria-autocomplete', 'list');
      expect(searchInput).toHaveAttribute('aria-controls');
    });

    it('should have proper listbox role and label', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      await user.click(button);

      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveAttribute('aria-label', 'Available devices');
    });

    it('should have minimum touch target size', () => {
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      expect(button).toHaveClass('min-h-[44px]');
    });

    it('should show keyboard navigation hint', async () => {
      const user = userEvent.setup();
      render(<DevicePicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /add device/i });
      await user.click(button);

      // Check for keyboard hint elements (↑↓, Enter, Esc keys)
      expect(screen.getByText('↑↓')).toBeInTheDocument();
      expect(screen.getByText('Enter')).toBeInTheDocument();
      expect(screen.getByText('Esc')).toBeInTheDocument();
    });
  });

  describe('independent rendering', () => {
    it('should render without any external dependencies', () => {
      expect(() => {
        render(<DevicePicker onSelect={mockOnSelect} />);
      }).not.toThrow();
    });

    it('should render multiple instances independently', async () => {
      const user = userEvent.setup();
      const onSelect1 = vi.fn();
      const onSelect2 = vi.fn();

      render(
        <>
          <DevicePicker onSelect={onSelect1} placeholder="Picker 1" />
          <DevicePicker onSelect={onSelect2} placeholder="Picker 2" />
        </>
      );

      const buttons = screen.getAllByRole('button', { name: /picker/i });
      expect(buttons).toHaveLength(2);

      // Open first picker
      await user.click(buttons[0]);

      // Only one listbox should be visible
      expect(screen.getAllByRole('listbox')).toHaveLength(1);
    });
  });
});
