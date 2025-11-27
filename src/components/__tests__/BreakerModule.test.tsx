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
      expect(screen.getByText('20A')).toBeInTheDocument();
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
      expect(screen.getByText('20A')).toBeInTheDocument();

      rerender(
        <BreakerModule
          {...defaultProps}
          breaker={{ ...mockBreaker, rating: 30 }}
        />
      );
      expect(screen.getByText('30A')).toBeInTheDocument();
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
    it('should show selected state with blue border', () => {
      const { container } = render(
        <BreakerModule {...defaultProps} isSelected={true} />
      );

      const breakerDiv = container.querySelector('.border-blue-400');
      expect(breakerDiv).toBeInTheDocument();
    });

    it('should show black border when not selected', () => {
      const { container } = render(
        <BreakerModule {...defaultProps} isSelected={false} />
      );

      const breakerDiv = container.querySelector('.border-black');
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
      const { container } = render(
        <BreakerModule {...defaultProps} onToggle={onToggle} />
      );

      const handle = container.querySelector('.w-8.h-10');
      fireEvent.click(handle!);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('should not trigger onSelect when handle is clicked', () => {
      const onSelect = vi.fn();
      const onToggle = vi.fn();
      const { container } = render(
        <BreakerModule
          {...defaultProps}
          onSelect={onSelect}
          onToggle={onToggle}
        />
      );

      const handle = container.querySelector('.w-8.h-10');
      fireEvent.click(handle!);

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
      const { container } = render(
        <BreakerModule {...defaultProps} onDelete={onDelete} />
      );

      const deleteButton = container.querySelector('button');
      fireEvent.click(deleteButton!);

      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('should not trigger onSelect when delete button is clicked', () => {
      const onSelect = vi.fn();
      const onDelete = vi.fn();
      const { container } = render(
        <BreakerModule
          {...defaultProps}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      );

      const deleteButton = container.querySelector('button');
      fireEvent.click(deleteButton!);

      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('handle position based on side', () => {
    it('should position handle correctly for left side when on', () => {
      const { container } = render(
        <BreakerModule {...defaultProps} isRightSide={false} />
      );

      const handle = container.querySelector('.translate-x-3.bg-green-500');
      expect(handle).toBeInTheDocument();
    });

    it('should position handle correctly for left side when off', () => {
      const offBreaker = { ...mockBreaker, on: false };
      const { container } = render(
        <BreakerModule {...defaultProps} breaker={offBreaker} isRightSide={false} />
      );

      const handle = container.querySelector('.-translate-x-2.bg-red-500');
      expect(handle).toBeInTheDocument();
    });

    it('should position handle correctly for right side when on', () => {
      const { container } = render(
        <BreakerModule {...defaultProps} isRightSide={true} />
      );

      const handle = container.querySelector('.-translate-x-3.bg-green-500');
      expect(handle).toBeInTheDocument();
    });

    it('should position handle correctly for right side when off', () => {
      const offBreaker = { ...mockBreaker, on: false };
      const { container } = render(
        <BreakerModule {...defaultProps} breaker={offBreaker} isRightSide={true} />
      );

      const handle = container.querySelector('.translate-x-2.bg-red-500');
      expect(handle).toBeInTheDocument();
    });
  });

  describe('on/off visual feedback', () => {
    it('should show green handle when breaker is on', () => {
      const { container } = render(<BreakerModule {...defaultProps} />);

      const handle = container.querySelector('.bg-green-500');
      expect(handle).toBeInTheDocument();
    });

    it('should show red handle when breaker is off', () => {
      const offBreaker = { ...mockBreaker, on: false };
      const { container } = render(
        <BreakerModule {...defaultProps} breaker={offBreaker} />
      );

      const handle = container.querySelector('.bg-red-500');
      expect(handle).toBeInTheDocument();
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

      const textContainer = container.querySelector('.left-1.text-left');
      expect(textContainer).toBeInTheDocument();
    });

    it('should align text to right on right side', () => {
      const { container } = render(
        <BreakerModule {...defaultProps} isRightSide={true} />
      );

      const textContainer = container.querySelector('.right-1.text-right');
      expect(textContainer).toBeInTheDocument();
    });
  });
});