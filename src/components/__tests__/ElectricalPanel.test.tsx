import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ElectricalPanel from '../ElectricalPanel';
import type { Breaker } from '../../types';

// Mock child components
vi.mock('../MainBreaker', () => ({
  default: vi.fn(({ isOn, isTripped, limit, onToggle, onChangeLimit }) => (
    <div data-testid="main-breaker-mock">
      <span data-testid="main-breaker-on">{isOn.toString()}</span>
      <span data-testid="main-breaker-tripped">{isTripped.toString()}</span>
      <span data-testid="main-breaker-limit">{limit}</span>
      <button data-testid="main-breaker-toggle" onClick={onToggle}>
        Toggle
      </button>
      <button
        data-testid="main-breaker-change-limit"
        onClick={() => onChangeLimit(200)}
      >
        Change Limit
      </button>
    </div>
  )),
}));

vi.mock('../BreakerModule', () => ({
  default: vi.fn(({ breaker, slotNumber, isRightSide, isSelected, onSelect, onToggle, onDelete }) => (
    <div
      data-testid={`breaker-module-${breaker.id}`}
      data-slot={slotNumber}
      data-right-side={isRightSide}
      data-selected={isSelected}
    >
      <span>{breaker.name}</span>
      <button data-testid={`select-${breaker.id}`} onClick={onSelect}>
        Select
      </button>
      <button data-testid={`toggle-${breaker.id}`} onClick={onToggle}>
        Toggle
      </button>
      <button data-testid={`delete-${breaker.id}`} onClick={onDelete}>
        Delete
      </button>
    </div>
  )),
}));

vi.mock('../EmptySlot', () => ({
  default: vi.fn(({ slotNum, onClick }) => (
    <div data-testid={`empty-slot-${slotNum}`} onClick={onClick}>
      Empty Slot {slotNum}
    </div>
  )),
}));

vi.mock('../BreakerTypeModal', () => ({
  default: vi.fn((props) => {
    if (!props.isOpen) return null;
    return (
      <div data-testid="breaker-type-modal">
        <span data-testid="modal-slot">{props.slotNumber}</span>
        <button
          data-testid="modal-single-pole"
          onClick={() => props.onSelect('single')}
        >
          Single Pole
        </button>
        <button
          data-testid="modal-double-pole"
          onClick={() => props.onSelect('double')}
        >
          Double Pole
        </button>
        <button data-testid="modal-close" onClick={props.onClose}>
          Close
        </button>
      </div>
    );
  }),
}));

describe('ElectricalPanel', () => {
  const mockBreaker: Breaker = {
    id: 'b1',
    name: 'Kitchen',
    rating: 20,
    slots: [1],
    thermalHeat: 0,
    on: true,
    runs: [],
  };

  const defaultProps = {
    breakers: [mockBreaker],
    mainServiceLimit: 100,
    mainBreakerTripped: false,
    mainBreakerManualOff: false,
    selectedBreakerId: null,
    onToggleMainPower: vi.fn(),
    onChangeMainLimit: vi.fn(),
    onSelectBreaker: vi.fn(),
    onToggleBreaker: vi.fn(),
    onDeleteBreaker: vi.fn(),
    onAddBreaker: vi.fn(),
    onMoveBreaker: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render electrical panel container', () => {
      const { container } = render(<ElectricalPanel {...defaultProps} />);

      expect(container.querySelector('.bg-apple-bg-elevated')).toBeInTheDocument();
    });

    it('should render MainBreaker component', () => {
      render(<ElectricalPanel {...defaultProps} />);

      expect(screen.getByTestId('main-breaker-mock')).toBeInTheDocument();
    });

    it('should pass correct props to MainBreaker', () => {
      render(<ElectricalPanel {...defaultProps} />);

      expect(screen.getByTestId('main-breaker-on')).toHaveTextContent('true');
      expect(screen.getByTestId('main-breaker-tripped')).toHaveTextContent(
        'false'
      );
      expect(screen.getByTestId('main-breaker-limit')).toHaveTextContent('100');
    });

    it('should show MainBreaker as off when manually off', () => {
      render(
        <ElectricalPanel {...defaultProps} mainBreakerManualOff={true} />
      );

      expect(screen.getByTestId('main-breaker-on')).toHaveTextContent('false');
    });

    it('should show MainBreaker as tripped when tripped', () => {
      render(
        <ElectricalPanel {...defaultProps} mainBreakerTripped={true} />
      );

      expect(screen.getByTestId('main-breaker-tripped')).toHaveTextContent(
        'true'
      );
    });
  });

  describe('breaker modules', () => {
    it('should render BreakerModule for each breaker', () => {
      render(<ElectricalPanel {...defaultProps} />);

      expect(screen.getByTestId('breaker-module-b1')).toBeInTheDocument();
      expect(screen.getByText('Kitchen')).toBeInTheDocument();
    });

    it('should render multiple breaker modules', () => {
      const breaker2: Breaker = {
        id: 'b2',
        name: 'Bathroom',
        rating: 15,
        slots: [2],
        thermalHeat: 0,
        on: true,
        runs: [],
      };

      render(
        <ElectricalPanel
          {...defaultProps}
          breakers={[mockBreaker, breaker2]}
        />
      );

      expect(screen.getByTestId('breaker-module-b1')).toBeInTheDocument();
      expect(screen.getByTestId('breaker-module-b2')).toBeInTheDocument();
    });

    it('should mark selected breaker as selected', () => {
      render(
        <ElectricalPanel {...defaultProps} selectedBreakerId="b1" />
      );

      const breakerModule = screen.getByTestId('breaker-module-b1');
      expect(breakerModule).toHaveAttribute('data-selected', 'true');
    });

    it('should not mark unselected breaker as selected', () => {
      render(<ElectricalPanel {...defaultProps} />);

      const breakerModule = screen.getByTestId('breaker-module-b1');
      expect(breakerModule).toHaveAttribute('data-selected', 'false');
    });

    it('should position odd slots on left side', () => {
      render(<ElectricalPanel {...defaultProps} />);

      const breakerModule = screen.getByTestId('breaker-module-b1');
      expect(breakerModule).toHaveAttribute('data-slot', '1');
      expect(breakerModule).toHaveAttribute('data-right-side', 'false');
    });

    it('should position even slots on right side', () => {
      const rightBreaker: Breaker = {
        ...mockBreaker,
        id: 'b2',
        slots: [2],
      };

      render(
        <ElectricalPanel {...defaultProps} breakers={[rightBreaker]} />
      );

      const breakerModule = screen.getByTestId('breaker-module-b2');
      expect(breakerModule).toHaveAttribute('data-slot', '2');
      expect(breakerModule).toHaveAttribute('data-right-side', 'true');
    });
  });

  describe('empty slots', () => {
    it('should render empty slots for unoccupied positions', () => {
      render(<ElectricalPanel {...defaultProps} />);

      // With 100A service limit, there are 20 slots
      // Slot 1 is occupied, so slots 2-20 should be empty
      expect(screen.getByTestId('empty-slot-2')).toBeInTheDocument();
      expect(screen.getByTestId('empty-slot-3')).toBeInTheDocument();
    });

    it('should open modal when empty slot is clicked', () => {
      render(<ElectricalPanel {...defaultProps} />);

      // Modal should not be visible initially
      expect(screen.queryByTestId('breaker-type-modal')).not.toBeInTheDocument();

      const emptySlot = screen.getByTestId('empty-slot-2');
      fireEvent.click(emptySlot);

      // Modal should now be visible with correct slot number
      expect(screen.getByTestId('breaker-type-modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-slot')).toHaveTextContent('2');
    });

    it('should call onAddBreaker with single type when single pole is selected', () => {
      render(<ElectricalPanel {...defaultProps} />);

      const emptySlot = screen.getByTestId('empty-slot-2');
      fireEvent.click(emptySlot);

      const singlePoleButton = screen.getByTestId('modal-single-pole');
      fireEvent.click(singlePoleButton);

      expect(defaultProps.onAddBreaker).toHaveBeenCalledWith(2, 'single');
    });

    it('should call onAddBreaker with double type when double pole is selected', () => {
      render(<ElectricalPanel {...defaultProps} />);

      const emptySlot = screen.getByTestId('empty-slot-2');
      fireEvent.click(emptySlot);

      const doublePoleButton = screen.getByTestId('modal-double-pole');
      fireEvent.click(doublePoleButton);

      expect(defaultProps.onAddBreaker).toHaveBeenCalledWith(2, 'double');
    });

    it('should close modal when close button is clicked', () => {
      render(<ElectricalPanel {...defaultProps} />);

      const emptySlot = screen.getByTestId('empty-slot-2');
      fireEvent.click(emptySlot);

      expect(screen.getByTestId('breaker-type-modal')).toBeInTheDocument();

      const closeButton = screen.getByTestId('modal-close');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('breaker-type-modal')).not.toBeInTheDocument();
    });
  });

  describe('slot count based on service limit', () => {
    it('should render 20 slots for 100A service', () => {
      render(<ElectricalPanel {...defaultProps} mainServiceLimit={100} />);

      // Should have slots 1-20 (minus occupied slot 1)
      expect(screen.getByTestId('empty-slot-20')).toBeInTheDocument();
      expect(screen.queryByTestId('empty-slot-21')).not.toBeInTheDocument();
    });

    it('should render 30 slots for 200A service', () => {
      render(<ElectricalPanel {...defaultProps} mainServiceLimit={200} />);

      expect(screen.getByTestId('empty-slot-30')).toBeInTheDocument();
      expect(screen.queryByTestId('empty-slot-31')).not.toBeInTheDocument();
    });

    it('should render 40 slots for 400A service', () => {
      render(<ElectricalPanel {...defaultProps} mainServiceLimit={400} />);

      expect(screen.getByTestId('empty-slot-40')).toBeInTheDocument();
      expect(screen.queryByTestId('empty-slot-41')).not.toBeInTheDocument();
    });
  });

  describe('main breaker interactions', () => {
    it('should call onToggleMainPower when MainBreaker toggle is clicked', () => {
      render(<ElectricalPanel {...defaultProps} />);

      const toggleButton = screen.getByTestId('main-breaker-toggle');
      fireEvent.click(toggleButton);

      expect(defaultProps.onToggleMainPower).toHaveBeenCalledTimes(1);
    });

    it('should call onChangeMainLimit when MainBreaker limit is changed', () => {
      render(<ElectricalPanel {...defaultProps} />);

      const changeLimitButton = screen.getByTestId('main-breaker-change-limit');
      fireEvent.click(changeLimitButton);

      expect(defaultProps.onChangeMainLimit).toHaveBeenCalledWith(200);
    });
  });

  describe('breaker interactions', () => {
    it('should call onSelectBreaker when breaker is selected', () => {
      render(<ElectricalPanel {...defaultProps} />);

      const selectButton = screen.getByTestId('select-b1');
      fireEvent.click(selectButton);

      expect(defaultProps.onSelectBreaker).toHaveBeenCalledWith('b1');
    });

    it('should call onToggleBreaker when breaker is toggled', () => {
      render(<ElectricalPanel {...defaultProps} />);

      const toggleButton = screen.getByTestId('toggle-b1');
      fireEvent.click(toggleButton);

      expect(defaultProps.onToggleBreaker).toHaveBeenCalledWith('b1');
    });

    it('should call onDeleteBreaker when breaker is deleted', () => {
      render(<ElectricalPanel {...defaultProps} />);

      const deleteButton = screen.getByTestId('delete-b1');
      fireEvent.click(deleteButton);

      expect(defaultProps.onDeleteBreaker).toHaveBeenCalledWith('b1');
    });
  });

  describe('double pole breakers', () => {
    it('should not render empty slot for occupied secondary slot', () => {
      const doublePoleBreaker: Breaker = {
        ...mockBreaker,
        slots: [1, 3], // Double pole occupies slots 1 and 3
      };

      render(
        <ElectricalPanel {...defaultProps} breakers={[doublePoleBreaker]} />
      );

      // Should not render empty slot 3 since it's occupied by the double pole
      expect(screen.queryByTestId('empty-slot-3')).not.toBeInTheDocument();
    });

    it('should only render breaker once even for double pole', () => {
      const doublePoleBreaker: Breaker = {
        ...mockBreaker,
        slots: [1, 3],
      };

      render(
        <ElectricalPanel {...defaultProps} breakers={[doublePoleBreaker]} />
      );

      // Should only render one breaker module
      expect(screen.getAllByTestId(/breaker-module/)).toHaveLength(1);
    });
  });

  describe('panel layout', () => {
    it('should render two columns for breakers', () => {
      const { container } = render(<ElectricalPanel {...defaultProps} />);

      const columns = container.querySelectorAll('.flex-1.flex.flex-col');
      expect(columns).toHaveLength(2);
    });

    it('should render center divider', () => {
      const { container } = render(<ElectricalPanel {...defaultProps} />);

      expect(container.querySelector('.w-3.bg-apple-bg-tertiary')).toBeInTheDocument();
    });
  });

  describe('independent rendering', () => {
    it('should render without any external dependencies', () => {
      expect(() => {
        render(<ElectricalPanel {...defaultProps} />);
      }).not.toThrow();
    });

    it('should render with empty breakers array', () => {
      render(<ElectricalPanel {...defaultProps} breakers={[]} />);

      // Should still render main breaker and empty slots
      expect(screen.getByTestId('main-breaker-mock')).toBeInTheDocument();
      expect(screen.getByTestId('empty-slot-1')).toBeInTheDocument();
    });
  });
});
