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

      expect(screen.getByDisplayValue('200')).toBeInTheDocument();
      expect(screen.getByText('Main Service Disconnect')).toBeInTheDocument();
    });

    it('should display MAIN label', () => {
      render(<MainBreaker {...defaultProps} />);

      expect(screen.getByText('MAIN')).toBeInTheDocument();
    });

    it('should show all limit options in select', () => {
      render(<MainBreaker {...defaultProps} />);

      expect(screen.getByRole('option', { name: '100' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '200' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '400' })).toBeInTheDocument();
    });

    it('should render with different limit values', () => {
      const { rerender } = render(<MainBreaker {...defaultProps} limit={100} />);
      expect(screen.getByDisplayValue('100')).toBeInTheDocument();

      rerender(<MainBreaker {...defaultProps} limit={400} />);
      expect(screen.getByDisplayValue('400')).toBeInTheDocument();
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
      const { container } = render(
        <MainBreaker {...defaultProps} isOn={true} isTripped={true} />
      );

      // Handle should be in bottom position (off) when tripped
      const handle = container.querySelector('.bottom-2.bg-red-500');
      expect(handle).toBeInTheDocument();
    });
  });

  describe('toggle interaction', () => {
    it('should call onToggle when breaker handle is clicked', () => {
      const onToggle = vi.fn();
      const { container } = render(
        <MainBreaker {...defaultProps} onToggle={onToggle} />
      );

      const breakerHandle = container.querySelector('.w-10.h-16');
      fireEvent.click(breakerHandle!);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('should call onToggle when off', () => {
      const onToggle = vi.fn();
      const { container } = render(
        <MainBreaker {...defaultProps} isOn={false} onToggle={onToggle} />
      );

      const breakerHandle = container.querySelector('.w-10.h-16');
      fireEvent.click(breakerHandle!);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('limit change interaction', () => {
    it('should call onChangeLimit when limit is changed to 400', () => {
      const onChangeLimit = vi.fn();
      render(<MainBreaker {...defaultProps} onChangeLimit={onChangeLimit} />);

      const select = screen.getByDisplayValue('200');
      fireEvent.change(select, { target: { value: '400' } });

      expect(onChangeLimit).toHaveBeenCalledWith(400);
    });

    it('should call onChangeLimit when limit is changed to 100', () => {
      const onChangeLimit = vi.fn();
      render(<MainBreaker {...defaultProps} onChangeLimit={onChangeLimit} />);

      const select = screen.getByDisplayValue('200');
      fireEvent.change(select, { target: { value: '100' } });

      expect(onChangeLimit).toHaveBeenCalledWith(100);
    });

    it('should pass numeric value to onChangeLimit', () => {
      const onChangeLimit = vi.fn();
      render(<MainBreaker {...defaultProps} onChangeLimit={onChangeLimit} />);

      const select = screen.getByDisplayValue('200');
      fireEvent.change(select, { target: { value: '400' } });

      expect(typeof onChangeLimit.mock.calls[0][0]).toBe('number');
    });
  });

  describe('handle position', () => {
    it('should apply correct handle position when on', () => {
      const { container } = render(
        <MainBreaker {...defaultProps} isOn={true} isTripped={false} />
      );

      // Handle in top position with green color when on
      const handle = container.querySelector('.top-2.bg-green-500');
      expect(handle).toBeInTheDocument();
    });

    it('should apply correct handle position when off', () => {
      const { container } = render(
        <MainBreaker {...defaultProps} isOn={false} />
      );

      // Handle in bottom position with red color when off
      const handle = container.querySelector('.bottom-2.bg-red-500');
      expect(handle).toBeInTheDocument();
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

      expect(screen.getByDisplayValue('100')).toBeInTheDocument();
      expect(screen.getByDisplayValue('200')).toBeInTheDocument();
      expect(screen.getByDisplayValue('400')).toBeInTheDocument();
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