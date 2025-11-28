import React, { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Breaker } from '../types';
import { SLOTS_MAP } from '../constants/breakers';
import { calculateBreakerLoad } from '../utils/calculations';
import MainBreaker from './MainBreaker';
import BreakerModule from './BreakerModule';
import EmptySlot from './EmptySlot';
import BreakerTypeModal from './BreakerTypeModal';

interface ElectricalPanelProps {
  breakers: Breaker[];
  mainServiceLimit: number;
  mainBreakerTripped: boolean;
  mainBreakerManualOff: boolean;
  mainPowerOn: boolean;
  selectedBreakerId: string | null;
  onToggleMainPower: () => void;
  onChangeMainLimit: (limit: number) => void;
  onSelectBreaker: (id: string) => void;
  onToggleBreaker: (id: string) => void;
  onDeleteBreaker: (id: string) => void;
  onAddBreaker: (slotNum: number, type: 'single' | 'double') => void;
  onMoveBreaker: (breakerId: string, targetSlot: number) => void;
}

// Draggable wrapper for BreakerModule
interface DraggableBreakerProps {
  breaker: Breaker;
  slotNumber: number;
  isRightSide: boolean;
  isSelected: boolean;
  currentLoad: number;
  onSelect: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

const DraggableBreaker: React.FC<DraggableBreakerProps> = ({
  breaker,
  slotNumber,
  isRightSide,
  isSelected,
  currentLoad,
  onSelect,
  onToggle,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: breaker.id,
    data: {
      breaker,
      slotNumber,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <BreakerModule
        breaker={breaker}
        slotNumber={slotNumber}
        isRightSide={isRightSide}
        isSelected={isSelected}
        currentLoad={currentLoad}
        onSelect={onSelect}
        onToggle={onToggle}
        onDelete={onDelete}
      />
    </div>
  );
};

// Droppable wrapper for EmptySlot
interface DroppableEmptySlotProps {
  slotNum: number;
  onClick: () => void;
}

const DroppableEmptySlot: React.FC<DroppableEmptySlotProps> = ({
  slotNum,
  onClick,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `empty-slot-${slotNum}`,
    data: {
      slotNumber: slotNum,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-200 ${
        isOver ? 'scale-105 ring-2 ring-apple-blue rounded-apple' : ''
      }`}
    >
      <EmptySlot slotNum={slotNum} onClick={onClick} />
    </div>
  );
};

const ElectricalPanel: React.FC<ElectricalPanelProps> = ({
  breakers,
  mainServiceLimit,
  mainBreakerTripped,
  mainBreakerManualOff,
  mainPowerOn,
  selectedBreakerId,
  onToggleMainPower,
  onChangeMainLimit,
  onSelectBreaker,
  onToggleBreaker,
  onDeleteBreaker,
  onAddBreaker,
  onMoveBreaker,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [activeBreaker, setActiveBreaker] = useState<Breaker | null>(null);

  // Calculate current load for each breaker
  const breakerLoads = useMemo(() => {
    const loads: Record<string, number> = {};
    breakers.forEach(breaker => {
      loads[breaker.id] = calculateBreakerLoad(breaker, mainPowerOn);
    });
    return loads;
  }, [breakers, mainPowerOn]);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleEmptySlotClick = useCallback((slotNum: number) => {
    setSelectedSlot(slotNum);
    setModalOpen(true);
  }, []);

  const handleModalSelect = useCallback(
    (type: 'single' | 'double') => {
      if (selectedSlot !== null) {
        onAddBreaker(selectedSlot, type);
      }
    },
    [selectedSlot, onAddBreaker]
  );

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedSlot(null);
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const breaker = breakers.find(b => b.id === event.active.id);
    setActiveBreaker(breaker || null);
  }, [breakers]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveBreaker(null);

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const overId = over.id as string;
    const overData = over.data.current;

    let targetSlot: number;

    if (overId.startsWith('empty-slot-')) {
      targetSlot = parseInt(overId.replace('empty-slot-', ''), 10);
    } else if (overData?.slotNumber) {
      targetSlot = overData.slotNumber;
    } else {
      return;
    }

    onMoveBreaker(active.id as string, targetSlot);
  }, [onMoveBreaker]);

  const renderPanelSlots = () => {
    const leftCol: React.ReactNode[] = [];
    const rightCol: React.ReactNode[] = [];
    const totalSlots = SLOTS_MAP[mainServiceLimit];

    for (let i = 1; i <= totalSlots; i++) {
      const isRight = i % 2 === 0;
      const col = isRight ? rightCol : leftCol;
      const occupant = breakers.find(b => b.slots.includes(i));

      if (occupant) {
        if (occupant.slots[0] === i) {
          col.push(
            <div
              key={i}
              className={`relative w-full ${
                occupant.slots.length > 1 ? 'h-[6.25rem]' : 'h-12'
              } mb-1`}
            >
              <DraggableBreaker
                breaker={occupant}
                slotNumber={i}
                isRightSide={isRight}
                isSelected={selectedBreakerId === occupant.id}
                currentLoad={breakerLoads[occupant.id] || 0}
                onSelect={() => onSelectBreaker(occupant.id)}
                onToggle={() => onToggleBreaker(occupant.id)}
                onDelete={() => onDeleteBreaker(occupant.id)}
              />
            </div>
          );
        }
      } else {
        col.push(
          <div key={i} className="w-full h-12 mb-1 p-0.5">
            <DroppableEmptySlot
              slotNum={i}
              onClick={() => handleEmptySlotClick(i)}
            />
          </div>
        );
      }
    }

    return { leftCol, rightCol };
  };

  const { leftCol, rightCol } = renderPanelSlots();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full md:w-[420px] bg-apple-bg-elevated flex flex-col items-center p-4 md:p-6 overflow-y-auto border-r border-apple-separator">
        <MainBreaker
          isOn={!mainBreakerManualOff}
          isTripped={mainBreakerTripped}
          limit={mainServiceLimit}
          onToggle={onToggleMainPower}
          onChangeLimit={onChangeMainLimit}
        />

        {/* Panel Box */}
        <div className="panel-surface p-3 md:p-4 w-full max-w-sm">
          <div className="bg-apple-bg flex gap-1 md:gap-2 p-2 rounded-apple-lg">
            <div className="flex-1 flex flex-col">{leftCol}</div>
            <div className="w-3 bg-apple-bg-tertiary rounded-full" />
            <div className="flex-1 flex flex-col">{rightCol}</div>
          </div>
        </div>

        <BreakerTypeModal
          isOpen={modalOpen}
          slotNumber={selectedSlot ?? 0}
          onSelect={handleModalSelect}
          onClose={handleModalClose}
        />
      </div>

      <DragOverlay>
        {activeBreaker ? (
          <div className="opacity-90 rotate-2 scale-105">
            <BreakerModule
              breaker={activeBreaker}
              slotNumber={activeBreaker.slots[0]}
              isRightSide={activeBreaker.slots[0] % 2 === 0}
              isSelected={true}
              currentLoad={breakerLoads[activeBreaker.id] || 0}
              onSelect={() => {}}
              onToggle={() => {}}
              onDelete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ElectricalPanel;
