export interface ICursorPosition {
  x: number,
  y: number,
}

export interface ICursorStyle {
  before: TCursorStyleName | null;
  current: TCursorStyleName | null;
};

export type TCursorStyleName = 'default' | 'context-menu' | 'help' | 'pointer' | 'progress' | 'wait' | 'cell' | 'crosshair' | 'text' | 'vertical-text' | 'copy' | 'alias' | 'move' | 'not-allowed' | 'grab' | 'grabbing' | 'zoom-in' | 'zoom-out';
