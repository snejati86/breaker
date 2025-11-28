import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BreakerModule from '../BreakerModule';
import type { Breaker } from '../../types';

describe('BreakerModule', () => {
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
        },
      ],
    ],
  };

  const defaultProps = {
    breaker: mockBreaker,
    slotNumber: 1,
    isRightSide: false,
    isSelected: false,
    onSelect: vi.fn(),
    onToggle: vi.fn(),
    onDelete: vi.fn(),
  };

  describe('rendering', () => {
    it('should render breaker with name and rating', () => {
      render(<BreakerModule {...defaultProps} />);

      expect(screen.getByText('Kitchen')).toBeInTheDocument();
      expect(screen.getByText('/20A')).toBeInTheDocument();
    });

    it('should show default label when breaker has no name', () => {
      const breakerWithoutName = { ...mockBreaker, name: '' };
      render(
        <BreakerModule
          {...defaultProps}
          breaker={breakerWithoutName}
          slotNumber={5}
        />
      );

      expect(screen.getByText('Circuit 5')).toBeInTheDocument();
    });

    it('should render different ratings correctly', () => {
      const { rerender } = render(<BreakerModule {...defaultProps} />);
      expect(screen.getByText('/20A')).toBeInTheDocument();

      rerender(
        <BreakerModule
          {...defaultProps}
          breaker={{ ...mockBreaker, rating: 30 }}
        />
      );
      expect(screen.getByText('/30A')).toBeInTheDocument();
    });

    it('should display current load with color coding', () => {
      const { rerender } = render(<BreakerModule {...defaultProps} currentLoad={5} />);
      expect(screen.getByText('5')).toBeInTheDocument();

      // Warning state (>80%)
      rerender(<BreakerModule {...defaultProps} currentLoad={17} />);
      expect(screen.getByText('17')).toHaveClass('text-apple-orange');

      // Overloaded state (>100%)
      rerender(<BreakerModule {...defaultProps} currentLoad={25} />);
      expect(screen.getByText('25')).toHaveClass('text-apple-red');
    });
  });

  describe('single vs double pole', () => {
    it('should render single pole breaker with standard height', () => {
      const { container } = render(<BreakerModule {...defaultProps} />);

      const breakerDiv = container.querySelector('.h-12');
      expect(breakerDiv).toBeInTheDocument();
    });

    it('should render double pole breaker with increased height', () => {
      const doublePoleBreaker = { ...mockBreaker, slots: [1, 3] };
      const { container } = render(
        <BreakerModule {...defaultProps} breaker={doublePoleBreaker} />
      );

      const breakerDiv = container.querySelector('.h-\\[6\\.25rem\\]');
      expect(breakerDiv).toBeInTheDocument();
    });
  });

  describe('selection state', () => {
    it('should show selected state with blue ring', () => {
      const { container } = render(
        <BreakerModule {...defaultProps} isSelected={true} />
      );

      // Selected state uses ring-apple-blue
      const breakerDiv = container.querySelector('.ring-apple-blue');
      expect(breakerDiv).toBeInTheDocument();
    });

    it('should show hover ring when not selected', () => {
      const { container } = render(
        <BreakerModule {...defaultProps} isSelected={false} />
      );

      // Non-selected has hover ring effect
      const breakerDiv = container.querySelector('[class*="hover:ring"]');
      expect(breakerDiv).toBeInTheDocument();
    });

    it('should have ring effect when selected', () => {
      const { container } = render(
        <BreakerModule {...defaultProps} isSelected={true} />
      );

      // ring-2 with blue glow effect when selected
      const breakerDiv = container.querySelector('.ring-2');
      expect(breakerDiv).toBeInTheDocument();
    });
  });

  describe('onSelect interaction', () => {
    it('should call onSelect when breaker is clicked', () => {
      const onSelect = vi.fn();
      render(<BreakerModule {...defaultProps} onSelect={onSelect} />);

      const breakerDiv = screen.getByText('Kitchen').closest('div');
      fireEvent.click(breakerDiv!);

      expect(onSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe('onToggle interaction', () => {
    it('should call onToggle when handle is clicked', () => {
      const onToggle = vi.fn();
      render(
        <BreakerModule {...defaultProps} onToggle={onToggle} />
      );

      const handle = screen.getByRole('switch');
      fireEvent.click(handle);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('should not trigger onSelect when handle is clicked', () => {
      const onSelect = vi.fn();
      const onToggle = vi.fn();
      render(
        <BreakerModule
          {...defaultProps}
          onSelect={onSelect}
          onToggle={onToggle}
        />
      );

      const handle = screen.getByRole('switch');
      fireEvent.click(handle);

      expect(onToggle).toHaveBeenCalledTimes(1);
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('onDelete interaction', () => {
    it('should have delete button on hover', () => {
      const { container } = render(<BreakerModule {...defaultProps} />);

      const deleteButton = container.querySelector('.group-hover\\:flex');
      expect(deleteButton).toBeInTheDocument();
    });

    it('should call onDelete when delete button is clicked', () => {
      const onDelete = vi.fn();
      render(
        <BreakerModule {...defaultProps} onDelete={onDelete} />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('should not trigger onSelect when delete button is clicked', () => {
      const onSelect = vi.fn();
      const onDelete = vi.fn();
      render(
        <BreakerModule
          {...defaultProps}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('handle position based on side', () => {
    it('should position handle correctly for left side when on', () => {
      render(
        <BreakerModule {...defaultProps} isRightSide={false} />
      );

      // iOS-style toggle uses translate-x-4 when on
      const toggleButton = screen.getByRole('switch');
      expect(toggleButton).toHaveAttribute('aria-checked', 'true');
    });

    it('should position handle correctly for left side when off', () => {
      const offBreaker = { ...mockBreaker, on: false };
      render(
        <BreakerModule {...defaultProps} breaker={offBreaker} isRightSide={false} />
      );

      // Toggle has translate-x-0.5 when off
      const toggleButton = screen.getByRole('switch');
      expect(toggleButton).toHaveAttribute('aria-checked', 'false');
    });

    it('should position handle correctly for right side when on', () => {
      render(
        <BreakerModule {...defaultProps} isRightSide={true} />
      );

      const toggleButton = screen.getByRole('switch');
      expect(toggleButton).toHaveAttribute('aria-checked', 'true');
    });

    it('should position handle correctly for right side when off', () => {
      const offBreaker = { ...mockBreaker, on: false };
      render(
        <BreakerModule {...defaultProps} breaker={offBreaker} isRightSide={true} />
      );

      const toggleButton = screen.getByRole('switch');
      expect(toggleButton).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('on/off visual feedback', () => {
    it('should show green toggle when breaker is on', () => {
      render(<BreakerModule {...defaultProps} />);

      const toggleButton = screen.getByRole('switch');
      expect(toggleButton).toHaveClass('bg-apple-green');
    });

    it('should show gray toggle when breaker is off', () => {
      const offBreaker = { ...mockBreaker, on: false };
      render(
        <BreakerModule {...defaultProps} breaker={offBreaker} />
      );

      const toggleButton = screen.getByRole('switch');
      expect(toggleButton).toHaveClass('bg-apple-gray-3');
    });
  });

  describe('independent rendering', () => {
    it('should render without any external dependencies', () => {
      expect(() => {
        render(<BreakerModule {...defaultProps} />);
      }).not.toThrow();
    });

    it('should render multiple instances independently', () => {
      const breaker2 = { ...mockBreaker, id: 'b2', name: 'Bathroom', rating: 15 };
      const breaker3 = { ...mockBreaker, id: 'b3', name: 'Garage', rating: 30 };

      render(
        <>
          <BreakerModule {...defaultProps} />
          <BreakerModule {...defaultProps} breaker={breaker2} slotNumber={2} />
          <BreakerModule {...defaultProps} breaker={breaker3} slotNumber={3} />
        </>
      );

      expect(screen.getByText('Kitchen')).toBeInTheDocument();
      expect(screen.getByText('Bathroom')).toBeInTheDocument();
      expect(screen.getByText('Garage')).toBeInTheDocument();
    });
  });

  describe('text alignment based on side', () => {
    it('should align text to left on left side', () => {
      const { container } = render(
        <BreakerModule {...defaultProps} isRightSide={false} />
      );

      const textContainer = container.querySelector('.text-left');
      expect(textContainer).toBeInTheDocument();
    });

    it('should align text to right on right side', () => {
      const { container } = render(
        <BreakerModule {...defaultProps} isRightSide={true} />
      );

      const textContainer = container.querySelector('.text-right');
      expect(textContainer).toBeInTheDocument();
    });
  });
});