// Shared hooks for designer app
// Keyboard shortcuts hook implementation

import { useEffect } from 'react';

export function useKeyboardShortcutsSimple(options?: {
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
  onDeselect?: () => void;
}) {
  useEffect(() => {
    if (!options) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      
      // Detect platform (Mac uses Cmd, others use Ctrl)
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? event.metaKey : event.ctrlKey;
      
      // Undo: Cmd/Ctrl + Z
      if (modKey && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        options.onUndo?.();
        return;
      }
      
      // Redo: Cmd/Ctrl + Shift + Z (or Cmd/Ctrl + Y on Windows)
      if ((modKey && event.shiftKey && event.key === 'z') || (modKey && event.key === 'y')) {
        event.preventDefault();
        options.onRedo?.();
        return;
      }
      
      // Delete: Delete or Backspace
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Only trigger if not in an input field (already checked above)
        event.preventDefault();
        options.onDelete?.();
        return;
      }
      
      // Deselect: Escape
      if (event.key === 'Escape') {
        event.preventDefault();
        options.onDeselect?.();
        return;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [options?.onUndo, options?.onRedo, options?.onDelete, options?.onDeselect]);
}
