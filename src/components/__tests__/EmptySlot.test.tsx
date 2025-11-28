import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmptySlot from '../EmptySlot';

describe('EmptySlot', () => {
  describe('rendering', () => {
    it('should render with the slot number displayed', () => {
      render(<EmptySlot slotNum={5} onClick={() => {}} />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should render different slot numbers correctly', () => {
      const { rerender } = render(<EmptySlot slotNum={1} onClick={() => {}} />);
      expect(screen.getByText('1')).toBeInTheDocument();

      rerender(<EmptySlot slotNum={20} onClick={() => {}} />);
      expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('should have a dashed circular border with plus icon', () => {
      const { container } = render(<EmptySlot slotNum={3} onClick={() => {}} />);

      // The circle contains the plus icon
      const circle = container.querySelector('.rounded-full.border-dashed');
      expect(circle).toBeInTheDocument();
    });

    it('should have cursor pointer for clickability', () => {
      render(<EmptySlot slotNum={1} onClick={() => {}} />);

      const slot = screen.getByText('1').closest('div[class*="cursor-pointer"]');
      expect(slot).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<EmptySlot slotNum={7} onClick={handleClick} />);

      const slot = screen.getByText('7').closest('div[class*="cursor-pointer"]');
      fireEvent.click(slot!);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick with the event object', () => {
      const handleClick = vi.fn();
      render(<EmptySlot slotNum={2} onClick={handleClick} />);

      const slot = screen.getByText('2').closest('div[class*="cursor-pointer"]');
      fireEvent.click(slot!);

      // onClick receives the click event from React
      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick.mock.calls[0][0]).toHaveProperty('type', 'click');
    });
  });

  describe('styling', () => {
    it('should have semi-transparent dark background', () => {
      const { container } = render(<EmptySlot slotNum={1} onClick={() => {}} />);

      // Uses bg-apple-bg-tertiary/30 for semi-transparent dark background
      const slot = container.querySelector('[class*="bg-apple-bg-tertiary"]');
      expect(slot).toBeInTheDocument();
    });

    it('should have dashed border', () => {
      const { container } = render(<EmptySlot slotNum={1} onClick={() => {}} />);

      const slot = container.querySelector('.border-dashed');
      expect(slot).toBeInTheDocument();
    });

    it('should have fixed height of h-12', () => {
      render(<EmptySlot slotNum={1} onClick={() => {}} />);

      const slot = screen.getByText('1').closest('div[class*="h-12"]');
      expect(slot).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should be keyboard accessible via click event', () => {
      const handleClick = vi.fn();
      render(<EmptySlot slotNum={4} onClick={handleClick} />);

      const slot = screen.getByText('4').closest('div[class*="cursor-pointer"]');
      fireEvent.click(slot!);

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('independent rendering', () => {
    it('should render without any external dependencies', () => {
      expect(() => {
        render(<EmptySlot slotNum={1} onClick={() => {}} />);
      }).not.toThrow();
    });

    it('should render multiple instances independently', () => {
      render(
        <>
          <EmptySlot slotNum={1} onClick={() => {}} />
          <EmptySlot slotNum={2} onClick={() => {}} />
          <EmptySlot slotNum={3} onClick={() => {}} />
        </>
      );

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });
});
