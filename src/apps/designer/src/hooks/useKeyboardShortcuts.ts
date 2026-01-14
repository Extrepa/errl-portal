import { useEffect } from 'react';
import { useStore } from '../state/useStore';
import type { ToolType } from '../state/types';
import { useKeyboardShortcutsSimple } from '@shared/hooks';

/**
 * Keyboard Shortcuts Hook
 * - Tool shortcuts: Ctrl+letter (all platforms) - project-specific
 * - Standard commands: Uses shared hook for undo/redo/delete/deselect
 */
export const useKeyboardShortcuts = () => {
  const { mode, setMode, clearSelection, undo, redo, canUndo, canRedo, setActiveTool } = useStore();

  // Use shared hook for basic operations (undo/redo/delete/deselect)
  useKeyboardShortcutsSimple({
    onUndo: canUndo() ? undo : undefined,
    onRedo: canRedo() ? redo : undefined,
    onDelete: undefined, // Delete handled by project-specific logic if needed
    onDeselect: () => {
      clearSelection();
      setActiveTool(null);
    },
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Tool shortcuts: Always use Ctrl (all platforms)
      // Only trigger when Ctrl is pressed and NOT Command (to avoid conflicts)
      if (e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        let tool: ToolType | null = null;
        
        switch (key) {
          case 'v':
            e.preventDefault();
            tool = 'select';
            break;
          case 'p':
            e.preventDefault();
            tool = 'pen';
            break;
          case 'a':
            // Ctrl+A for Node Editor (conflicts with Select All - tool takes priority in SVG Edit mode)
            if (mode.type === 'svg-edit') {
              e.preventDefault();
              tool = 'node-editor';
            }
            break;
          case 'r':
            e.preventDefault();
            tool = 'rectangle';
            break;
          case 'o':
            e.preventDefault();
            tool = 'circle';
            break;
          case 's':
            e.preventDefault();
            tool = 'star';
            break;
          case 't':
            e.preventDefault();
            tool = 'text';
            break;
          case 'l':
            e.preventDefault();
            tool = 'line';
            break;
          case 'h':
            e.preventDefault();
            tool = 'hand';
            break;
          case 'n':
            e.preventDefault();
            tool = 'node-editor';
            break;
          case 'f':
            e.preventDefault();
            tool = 'fit-to-view';
            break;
        }

        if (tool !== null) {
          setActiveTool(tool);
          return; // Don't process further
        }

        // Mode switching with Ctrl+number
        if (key >= '1' && key <= '4') {
          e.preventDefault();
          switch (key) {
            case '1':
              setMode({ type: 'svg-edit' });
              break;
            case '2':
              setMode({ type: 'fx-lab' });
              break;
            case '3':
              setMode({ type: 'scene-maker' });
              break;
            case '4':
              setMode({ type: 'export' });
              break;
          }
          return;
        }
      }

      // Space for panning (when not in input)
      if (e.key === ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Pan functionality would be handled by canvas component
        // Prevent default scrolling
        if (e.target === document.body) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, setMode, setActiveTool]);
};

