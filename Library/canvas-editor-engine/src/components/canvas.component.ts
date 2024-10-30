import AppConfig from "../config";
import { TSubscribeAction, TSubscriptions, TSubscriptionTypes } from "../types/canvas";
import { ICursorPosition, ICursorStyle, TCursorStyleName } from "../types/cursor";
import ComponentService from "../services/component.service";
import LoggerService from "../services/logger.service";

export default class CanvasComponent extends ComponentService {
  private static template: string = `
    <div id="event-listener"></div>
    <canvas id="sc-canvas"></canvas>
  `;

  private static css: string = `
    #event-listener {
      position: absolute;
      z-index: 10000;
    }
  `;

  public static eventListener: HTMLDivElement;
  public static canvas: HTMLCanvasElement;
  public static ctx: CanvasRenderingContext2D | null;

  private static subscriptions: TSubscriptions = {
    click: [],
    mousemove: [],
    mousedown: [],
    mouseup: [],
  };

  private static _cursorStyle: ICursorStyle = {
    before: null,
    current: 'default',
  };

  static {
    LoggerService.components.add({
      info: {
        name: 'canvas',
        description: 'canvas component',
      },
      prototype: CanvasComponent,
    });
  };

  public static getComponent() {
    const canvasTemplate = CanvasComponent.getTemplate(CanvasComponent.template);
    const canvasStyle = CanvasComponent.getStyle(CanvasComponent.css);

    CanvasComponent.canvas = canvasTemplate.getElementsByTagName('canvas')[0];
    CanvasComponent.canvas.width = AppConfig.CANVAS_SIZE.width;
    CanvasComponent.canvas.height = AppConfig.CANVAS_SIZE.height;
    CanvasComponent.ctx = CanvasComponent.canvas.getContext("2d", { willReadFrequently: true });

    CanvasComponent.eventListener = canvasTemplate.querySelector('#event-listener');
    CanvasComponent.eventListener.style.width = AppConfig.CANVAS_SIZE.width + 'px';
    CanvasComponent.eventListener.style.height = AppConfig.CANVAS_SIZE.height + 'px';

    return { canvasTemplate, canvasStyle };
  }

  public static getCanvasSelector(): string {
    return '#sc-canvas';
  }

  public static set cursorStyle(styleName: TCursorStyleName | undefined | null) {
    if (!!styleName) {
      CanvasComponent._cursorStyle.before = CanvasComponent._cursorStyle.current;
      CanvasComponent._cursorStyle.current = styleName;
      (CanvasComponent.eventListener.style.cursor as TCursorStyleName) = styleName;
    } else {
      (CanvasComponent.eventListener.style.cursor as TCursorStyleName) = 'default';
    }
  }

  public static getCursorPosition(event: MouseEvent): ICursorPosition {
    const rect = CanvasComponent.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x, y };
  }

  public static subscribe(eventName: TSubscriptionTypes, action: TSubscribeAction) {
    CanvasComponent.subscriptions[eventName].push(action);
  }

  public static simulateSubscriptions() {
    const eventNames = Object.keys(CanvasComponent.subscriptions);
    eventNames.forEach((eventName: TSubscriptionTypes) => {
      const actionsList = CanvasComponent.subscriptions[eventName];
      if (!!actionsList.length) {
        CanvasComponent.eventListener.addEventListener(eventName, (event: MouseEvent) => {
          const cursorPosition = CanvasComponent.getCursorPosition(event);
          actionsList.forEach((action) => {
            action(event, cursorPosition);
          });
        });
      }
    });
  }
}