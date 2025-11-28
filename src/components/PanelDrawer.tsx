import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Panel } from '../types';

interface PanelDrawerProps {
  panels: Panel[];
  selectedPanelId: string | null;
  isOpen: boolean;
  onSelectPanel: (id: string) => void;
  onAddPanel: () => void;
  onDeletePanel: (id: string) => void;
  onUpdatePanelName: (id: string, name: string) => void;
  onToggleDrawer: () => void;
}

interface PanelItemProps {
  panel: Panel;
  isSelected: boolean;
  canDelete: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdateName: (name: string) => void;
}

const PanelItem: React.FC<PanelItemProps> = ({
  panel,
  isSelected,
  canDelete,
  onSelect,
  onDelete,
  onUpdateName,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(panel.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback(() => {
    setEditValue(panel.name);
    setIsEditing(true);
  }, [panel.name]);

  const handleSave = useCallback(() => {
    if (editValue.trim()) {
      onUpdateName(editValue.trim());
    }
    setIsEditing(false);
  }, [editValue, onUpdateName]);

  const handleCancel = useCallback(() => {
    setEditValue(panel.name);
    setIsEditing(false);
  }, [panel.name]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    },
    [handleSave, handleCancel]
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete();
    },
    [onDelete]
  );

  return (
    <li className="relative group" data-testid={`panel-item-${panel.id}`}>
      <div
        className={`w-full text-left px-3 py-3 rounded-apple-lg transition-all duration-200 flex items-center justify-between ${
          isSelected
            ? 'bg-apple-blue text-white shadow-apple'
            : 'bg-apple-bg-tertiary text-apple-label-secondary hover:bg-apple-gray-3'
        }`}
        data-selected={isSelected}
      >
        <button
          type="button"
          onClick={onSelect}
          className="flex-1 min-w-0 text-left"
          data-testid={`panel-select-${panel.id}`}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className="w-full bg-apple-bg-secondary text-white px-2 py-1 rounded-apple border border-apple-separator text-sm focus:border-apple-blue focus:ring-1 focus:ring-apple-blue"
              onClick={(e) => e.stopPropagation()}
              data-testid={`panel-name-input-${panel.id}`}
            />
          ) : (
            <span
              onDoubleClick={handleDoubleClick}
              className="block truncate text-sm font-medium"
              data-testid={`panel-name-${panel.id}`}
            >
              {panel.name}
            </span>
          )}
          <span className={`text-xs ${isSelected ? 'text-white/70' : 'text-apple-gray-1'}`} data-testid={`panel-service-${panel.id}`}>
            {panel.mainServiceLimit}A
          </span>
        </button>
        <button
          type="button"
          onClick={handleDeleteClick}
          disabled={!canDelete}
          aria-label={`Delete ${panel.name}`}
          data-testid={`panel-delete-${panel.id}`}
          className={`ml-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            canDelete
              ? 'hover:bg-apple-red/20 text-apple-gray-1 hover:text-apple-red'
              : 'text-apple-gray-3 cursor-not-allowed'
          }`}
        >
          <i className="fas fa-trash-alt text-xs" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
};

const PanelDrawer: React.FC<PanelDrawerProps> = ({
  panels,
  selectedPanelId,
  isOpen,
  onSelectPanel,
  onAddPanel,
  onDeletePanel,
  onUpdatePanelName,
  onToggleDrawer,
}) => {
  const canDelete = panels.length > 1;

  return (
    <nav
      aria-label="Panel navigation"
      data-testid="panel-drawer"
      className={`bg-apple-bg-elevated border-r border-apple-separator flex flex-col transition-all duration-300 ${
        isOpen ? 'w-60' : 'w-14'
      }`}
    >
      {/* Header */}
      <div className="p-3 border-b border-apple-separator flex items-center justify-between">
        {isOpen && (
          <span className="text-xs font-semibold text-apple-gray-1 uppercase tracking-wider">
            Panels
          </span>
        )}
        <button
          type="button"
          onClick={onToggleDrawer}
          aria-label="Toggle drawer"
          data-testid="toggle-drawer"
          className="w-8 h-8 rounded-apple flex items-center justify-center hover:bg-apple-bg-tertiary transition-colors text-apple-gray-1 hover:text-white"
        >
          <i
            className={`fas ${isOpen ? 'fa-chevron-left' : 'fa-chevron-right'} text-sm`}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Panel List */}
      {isOpen && (
        <div className="flex-1 overflow-hidden transition-opacity duration-300 opacity-100">
          <ul className="h-full overflow-y-auto p-3 space-y-2" data-testid="panel-list">
            {panels.map((panel) => (
              <PanelItem
                key={panel.id}
                panel={panel}
                isSelected={selectedPanelId === panel.id}
                canDelete={canDelete}
                onSelect={() => onSelectPanel(panel.id)}
                onDelete={() => onDeletePanel(panel.id)}
                onUpdateName={(name) => onUpdatePanelName(panel.id, name)}
              />
            ))}
          </ul>
        </div>
      )}

      {/* Add Panel Button */}
      {isOpen && (
        <div className="p-3 border-t border-apple-separator transition-opacity duration-300 opacity-100">
          <button
            type="button"
            onClick={onAddPanel}
            aria-label="Add panel"
            data-testid="add-panel-button"
            className="w-full py-2.5 px-4 rounded-apple-lg bg-apple-green hover:brightness-110 transition-all active:scale-98 text-white text-sm font-medium flex items-center justify-center gap-2"
          >
            <i className="fas fa-plus" aria-hidden="true" />
            Add Panel
          </button>
        </div>
      )}

      {/* Collapsed Add Button */}
      {!isOpen && (
        <div className="p-2 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onAddPanel}
            aria-label="Add panel"
            data-testid="add-panel-button-collapsed"
            className="w-10 h-10 rounded-apple flex items-center justify-center hover:bg-apple-green/20 transition-colors text-apple-green"
          >
            <i className="fas fa-plus" aria-hidden="true" />
          </button>
        </div>
      )}
    </nav>
  );
};

export default PanelDrawer;
