import { ICursorPosition } from "./cursor";

export interface ICanvasSize {
  width: number,
  height: number,
};

export type TSubscriptionTypes = 'click'| 'mousemove' | 'mousedown' | 'mouseup';

export type TSubscribeAction = (event: MouseEvent, cursorPosition?: ICursorPosition) => void;

export type TSubscriptions = { [key in TSubscriptionTypes]: TSubscribeAction[] }; 