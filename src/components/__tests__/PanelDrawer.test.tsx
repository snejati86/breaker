import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PanelDrawer from '../PanelDrawer';
import type { Panel } from '../../types';

describe('PanelDrawer', () => {
  const mockPanels: Panel[] = [
    {
      id: 'p-1',
      name: 'Main Panel',
      mainServiceLimit: 200,
      mainBreakerTripped: false,
      mainBreakerManualOff: false,
      breakers: [],
    },
    {
      id: 'p-2',
      name: 'Garage',
      mainServiceLimit: 100,
      mainBreakerTripped: false,
      mainBreakerManualOff: false,
      breakers: [],
    },
  ];

  const defaultProps = {
    panels: mockPanels,
    selectedPanelId: 'p-1',
    isOpen: true,
    onSelectPanel: vi.fn(),
    onAddPanel: vi.fn(),
    onDeletePanel: vi.fn(),
    onUpdatePanelName: vi.fn(),
    onToggleDrawer: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render all panels when open', () => {
      render(<PanelDrawer {...defaultProps} />);

      expect(screen.getByText('Main Panel')).toBeInTheDocument();
      expect(screen.getByText('Garage')).toBeInTheDocument();
    });

    it('should highlight the selected panel', () => {
      render(<PanelDrawer {...defaultProps} />);

      const mainPanelItem = screen.getByText('Main Panel').closest('div');
      expect(mainPanelItem).toHaveClass('bg-apple-blue');
    });

    it('should show add panel button', () => {
      render(<PanelDrawer {...defaultProps} />);

      expect(screen.getByRole('button', { name: /add panel/i })).toBeInTheDocument();
    });

    it('should show toggle button', () => {
      render(<PanelDrawer {...defaultProps} />);

      expect(screen.getByRole('button', { name: /toggle drawer/i })).toBeInTheDocument();
    });

    it('should show panel service limits', () => {
      render(<PanelDrawer {...defaultProps} />);

      expect(screen.getByText('200A')).toBeInTheDocument();
      expect(screen.getByText('100A')).toBeInTheDocument();
    });
  });

  describe('collapsed state', () => {
    it('should show minimal content when collapsed', () => {
      render(<PanelDrawer {...defaultProps} isOpen={false} />);

      // Should still show the toggle button
      expect(screen.getByRole('button', { name: /toggle drawer/i })).toBeInTheDocument();
    });

    it('should not show panel names when collapsed', () => {
      render(<PanelDrawer {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Main Panel')).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onSelectPanel when clicking a panel', async () => {
      const user = userEvent.setup();
      render(<PanelDrawer {...defaultProps} />);

      await user.click(screen.getByText('Garage'));

      expect(defaultProps.onSelectPanel).toHaveBeenCalledWith('p-2');
    });

    it('should call onAddPanel when clicking add button', async () => {
      const user = userEvent.setup();
      render(<PanelDrawer {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /add panel/i }));

      expect(defaultProps.onAddPanel).toHaveBeenCalled();
    });

    it('should call onToggleDrawer when clicking toggle button', async () => {
      const user = userEvent.setup();
      render(<PanelDrawer {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /toggle drawer/i }));

      expect(defaultProps.onToggleDrawer).toHaveBeenCalled();
    });

    it('should call onDeletePanel when clicking delete button', async () => {
      const user = userEvent.setup();
      render(<PanelDrawer {...defaultProps} />);

      // Find delete button for a panel (use more specific query)
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      expect(defaultProps.onDeletePanel).toHaveBeenCalledWith('p-1');
    });
  });

  describe('inline renaming', () => {
    it('should enter edit mode on double-click', async () => {
      const user = userEvent.setup();
      render(<PanelDrawer {...defaultProps} />);

      const panelName = screen.getByText('Main Panel');
      await user.dblClick(panelName);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveValue('Main Panel');
    });

    it('should call onUpdatePanelName when saving edit', async () => {
      const user = userEvent.setup();
      render(<PanelDrawer {...defaultProps} />);

      const panelName = screen.getByText('Main Panel');
      await user.dblClick(panelName);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'House Panel');
      await user.keyboard('{Enter}');

      expect(defaultProps.onUpdatePanelName).toHaveBeenCalledWith('p-1', 'House Panel');
    });

    it('should cancel edit on Escape', async () => {
      const user = userEvent.setup();
      render(<PanelDrawer {...defaultProps} />);

      const panelName = screen.getByText('Main Panel');
      await user.dblClick(panelName);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'Changed Name');
      await user.keyboard('{Escape}');

      expect(defaultProps.onUpdatePanelName).not.toHaveBeenCalled();
      expect(screen.getByText('Main Panel')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have accessible role for the drawer', () => {
      render(<PanelDrawer {...defaultProps} />);

      expect(screen.getByRole('navigation', { name: /panel/i })).toBeInTheDocument();
    });

    it('should have accessible panel list', () => {
      render(<PanelDrawer {...defaultProps} />);

      expect(screen.getByRole('list')).toBeInTheDocument();
    });
  });

  describe('single panel behavior', () => {
    it('should disable delete button when only one panel exists', () => {
      const singlePanelProps = {
        ...defaultProps,
        panels: [mockPanels[0]],
      };
      render(<PanelDrawer {...singlePanelProps} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeDisabled();
    });
  });
});
