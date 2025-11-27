import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BreakerTypeModal from '../BreakerTypeModal';

describe('BreakerTypeModal', () => {
  const defaultProps = {
    isOpen: true,
    slotNumber: 5,
    onSelect: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when closed', () => {
    it('should not render anything when isOpen is false', () => {
      render(<BreakerTypeModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText(/Install Breaker/)).not.toBeInTheDocument();
    });
  });

  describe('when open', () => {
    it('should render the modal overlay', () => {
      const { container } = render(<BreakerTypeModal {...defaultProps} />);

      expect(container.querySelector('[data-testid="modal-overlay"]')).toBeInTheDocument();
    });

    it('should render the modal title with slot number', () => {
      render(<BreakerTypeModal {...defaultProps} slotNumber={7} />);

      expect(screen.getByText('Install Breaker in Slot 7')).toBeInTheDocument();
    });

    it('should render single pole option', () => {
      render(<BreakerTypeModal {...defaultProps} />);

      expect(screen.getByText('Single Pole')).toBeInTheDocument();
      expect(screen.getByText('120V')).toBeInTheDocument();
    });

    it('should render double pole option', () => {
      render(<BreakerTypeModal {...defaultProps} />);

      expect(screen.getByText('Double Pole')).toBeInTheDocument();
      expect(screen.getByText('240V')).toBeInTheDocument();
    });

    it('should render single pole description', () => {
      render(<BreakerTypeModal {...defaultProps} />);

      expect(screen.getByText(/Standard circuits/)).toBeInTheDocument();
    });

    it('should render double pole description', () => {
      render(<BreakerTypeModal {...defaultProps} />);

      expect(screen.getByText(/Large appliances/)).toBeInTheDocument();
    });

    it('should render cancel button', () => {
      render(<BreakerTypeModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('single pole selection', () => {
    it('should call onSelect with "single" when single pole is clicked', () => {
      render(<BreakerTypeModal {...defaultProps} />);

      const singlePoleButton = screen.getByTestId('single-pole-option');
      fireEvent.click(singlePoleButton);

      expect(defaultProps.onSelect).toHaveBeenCalledWith('single');
    });

    it('should call onClose after selecting single pole', () => {
      render(<BreakerTypeModal {...defaultProps} />);

      const singlePoleButton = screen.getByTestId('single-pole-option');
      fireEvent.click(singlePoleButton);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('double pole selection', () => {
    it('should call onSelect with "double" when double pole is clicked', () => {
      render(<BreakerTypeModal {...defaultProps} />);

      const doublePoleButton = screen.getByTestId('double-pole-option');
      fireEvent.click(doublePoleButton);

      expect(defaultProps.onSelect).toHaveBeenCalledWith('double');
    });

    it('should call onClose after selecting double pole', () => {
      render(<BreakerTypeModal {...defaultProps} />);

      const doublePoleButton = screen.getByTestId('double-pole-option');
      fireEvent.click(doublePoleButton);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('cancel action', () => {
    it('should call onClose when cancel button is clicked', () => {
      render(<BreakerTypeModal {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should not call onSelect when cancelled', () => {
      render(<BreakerTypeModal {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(defaultProps.onSelect).not.toHaveBeenCalled();
    });

    it('should call onClose when overlay is clicked', () => {
      render(<BreakerTypeModal {...defaultProps} />);

      const overlay = screen.getByTestId('modal-overlay');
      fireEvent.click(overlay);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should not close when modal content is clicked', () => {
      render(<BreakerTypeModal {...defaultProps} />);

      const modalContent = screen.getByTestId('modal-content');
      fireEvent.click(modalContent);

      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  describe('keyboard interaction', () => {
    it('should call onClose when Escape key is pressed', () => {
      render(<BreakerTypeModal {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('visual indicators', () => {
    it('should show single pole icon', () => {
      const { container } = render(<BreakerTypeModal {...defaultProps} />);

      expect(container.querySelector('[data-testid="single-pole-icon"]')).toBeInTheDocument();
    });

    it('should show double pole icon', () => {
      const { container } = render(<BreakerTypeModal {...defaultProps} />);

      expect(container.querySelector('[data-testid="double-pole-icon"]')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper role for modal', () => {
      render(<BreakerTypeModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-modal attribute', () => {
      render(<BreakerTypeModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby for title', () => {
      render(<BreakerTypeModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });
  });

  describe('independent rendering', () => {
    it('should render without any external dependencies', () => {
      expect(() => {
        render(<BreakerTypeModal {...defaultProps} />);
      }).not.toThrow();
    });
  });
});
