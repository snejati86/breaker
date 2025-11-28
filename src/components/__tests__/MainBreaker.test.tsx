import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MainBreaker from '../MainBreaker';

describe('MainBreaker', () => {
  const defaultProps = {
    isOn: true,
    isTripped: false,
    limit: 200,
    onToggle: vi.fn(),
    onChangeLimit: vi.fn(),
  };

  describe('rendering', () => {
    it('should render main breaker with correct limit', () => {
      render(<MainBreaker {...defaultProps} />);

      const select = screen.getByRole('combobox', { name: /change service limit/i });
      expect(select).toHaveValue('200');
      expect(screen.getByText('Main Service')).toBeInTheDocument();
    });

    it('should display MAIN label', () => {
      render(<MainBreaker {...defaultProps} />);

      expect(screen.getByText('MAIN')).toBeInTheDocument();
    });

    it('should show all limit options in select', () => {
      render(<MainBreaker {...defaultProps} />);

      expect(screen.getByRole('option', { name: '100A' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '200A' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '400A' })).toBeInTheDocument();
    });

    it('should render with different limit values', () => {
      const { rerender } = render(<MainBreaker {...defaultProps} limit={100} />);
      const select = screen.getByRole('combobox', { name: /change service limit/i });
      expect(select).toHaveValue('100');

      rerender(<MainBreaker {...defaultProps} limit={400} />);
      expect(select).toHaveValue('400');
    });
  });

  describe('tripped state', () => {
    it('should show TRIPPED when breaker is tripped', () => {
      render(<MainBreaker {...defaultProps} isTripped={true} />);

      expect(screen.getByText('TRIPPED')).toBeInTheDocument();
    });

    it('should not show TRIPPED when breaker is not tripped', () => {
      render(<MainBreaker {...defaultProps} isTripped={false} />);

      // TRIPPED badge should not be visible when not tripped
      expect(screen.queryByText('TRIPPED')).not.toBeInTheDocument();
      // Status badge should show ON instead
      expect(screen.getAllByText('ON').length).toBeGreaterThan(0);
    });

    it('should show handle in off position when tripped even if isOn is true', () => {
      render(
        <MainBreaker {...defaultProps} isOn={true} isTripped={true} />
      );

      // Handle should be in off position when tripped - toggle knob at translate-x-1
      const toggleButton = screen.getByRole('switch');
      expect(toggleButton).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('toggle interaction', () => {
    it('should call onToggle when breaker handle is clicked', () => {
      const onToggle = vi.fn();
      render(
        <MainBreaker {...defaultProps} onToggle={onToggle} />
      );

      const toggleButton = screen.getByRole('switch');
      fireEvent.click(toggleButton);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('should call onToggle when off', () => {
      const onToggle = vi.fn();
      render(
        <MainBreaker {...defaultProps} isOn={false} onToggle={onToggle} />
      );

      const toggleButton = screen.getByRole('switch');
      fireEvent.click(toggleButton);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('limit change interaction', () => {
    it('should call onChangeLimit when limit is changed to 400', () => {
      const onChangeLimit = vi.fn();
      render(<MainBreaker {...defaultProps} onChangeLimit={onChangeLimit} />);

      const select = screen.getByRole('combobox', { name: /change service limit/i });
      fireEvent.change(select, { target: { value: '400' } });

      expect(onChangeLimit).toHaveBeenCalledWith(400);
    });

    it('should call onChangeLimit when limit is changed to 100', () => {
      const onChangeLimit = vi.fn();
      render(<MainBreaker {...defaultProps} onChangeLimit={onChangeLimit} />);

      const select = screen.getByRole('combobox', { name: /change service limit/i });
      fireEvent.change(select, { target: { value: '100' } });

      expect(onChangeLimit).toHaveBeenCalledWith(100);
    });

    it('should pass numeric value to onChangeLimit', () => {
      const onChangeLimit = vi.fn();
      render(<MainBreaker {...defaultProps} onChangeLimit={onChangeLimit} />);

      const select = screen.getByRole('combobox', { name: /change service limit/i });
      fireEvent.change(select, { target: { value: '400' } });

      expect(typeof onChangeLimit.mock.calls[0][0]).toBe('number');
    });
  });

  describe('handle position', () => {
    it('should apply correct handle position when on', () => {
      render(
        <MainBreaker {...defaultProps} isOn={true} isTripped={false} />
      );

      // Toggle has aria-checked true and green background when on
      const toggleButton = screen.getByRole('switch');
      expect(toggleButton).toHaveAttribute('aria-checked', 'true');
      expect(toggleButton).toHaveClass('bg-apple-green');
    });

    it('should apply correct handle position when off', () => {
      render(
        <MainBreaker {...defaultProps} isOn={false} />
      );

      // Toggle has aria-checked false and gray background when off
      const toggleButton = screen.getByRole('switch');
      expect(toggleButton).toHaveAttribute('aria-checked', 'false');
      expect(toggleButton).toHaveClass('bg-apple-gray-3');
    });
  });

  describe('independent rendering', () => {
    it('should render without any external dependencies', () => {
      expect(() => {
        render(<MainBreaker {...defaultProps} />);
      }).not.toThrow();
    });

    it('should render multiple instances independently', () => {
      render(
        <>
          <MainBreaker {...defaultProps} limit={100} />
          <MainBreaker {...defaultProps} limit={200} />
          <MainBreaker {...defaultProps} limit={400} />
        </>
      );

      // Should render 3 main breakers with their respective limits
      const selects = screen.getAllByRole('combobox', { name: /change service limit/i });
      expect(selects).toHaveLength(3);
      expect(selects[0]).toHaveValue('100');
      expect(selects[1]).toHaveValue('200');
      expect(selects[2]).toHaveValue('400');
    });
  });

  describe('styling', () => {
    it('should have cursor pointer on handle for clickability', () => {
      const { container } = render(<MainBreaker {...defaultProps} />);

      const handle = container.querySelector('.cursor-pointer');
      expect(handle).toBeInTheDocument();
    });
  });
});