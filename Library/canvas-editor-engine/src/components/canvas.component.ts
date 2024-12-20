import AppConfig from "../config";
import { TSubscribeAction, TSubscriptions, TSubscriptionTypes } from "../types/canvas";
import { ICursorPosition, ICursorStyle, TCursorStyleName } from "../types/cursor";
import ComponentService from "../services/component.service";
import LoggerService from "../services/logger.service";
import ToolLayerService from "../services/tool-layers.service";

export default class CanvasComponent extends ComponentService {
  constructor(
    private appConfig: AppConfig,
    private loggerService: LoggerService,
    private toolLayerService: ToolLayerService
  ) {
    super();

    this.loggerService.components.add({
      info: {
        name: 'canvas',
        description: 'canvas component',
      },
      prototype: this,
    });
  };

  private template: string = `
    <div id="event-listener"></div>
    <canvas id="sc-canvas"></canvas>
  `;

  private css: string = `
    #event-listener {
      position: absolute;
      z-index: ${this.toolLayerService.getLayerIndex('normal')};
    }
  `;

  public eventListener: HTMLDivElement;
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D | null;

  private subscriptions: TSubscriptions = {
    click: [],
    mousemove: [],
    mousedown: [],
    mouseup: [],
  };

  private _cursorStyle: ICursorStyle = {
    before: null,
    current: 'default',
  };

  public getComponent() {
    const canvasTemplate = this.getTemplate(this.template);
    const canvasStyle = this.getStyle(this.css);

    this.canvas = canvasTemplate.getElementsByTagName('canvas')[0];
    this.canvas.width = this.appConfig.CANVAS_SIZE.width;
    this.canvas.height = this.appConfig.CANVAS_SIZE.height;
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });

    this.eventListener = canvasTemplate.querySelector('#event-listener');
    this.eventListener.style.width = this.appConfig.CANVAS_SIZE.width + 'px';
    this.eventListener.style.height = this.appConfig.CANVAS_SIZE.height + 'px';

    return { canvasTemplate, canvasStyle };
  }

  public getCanvasSelector(): string {
    return '#sc-canvas';
  }

  public set cursorStyle(styleName: TCursorStyleName | undefined | null) {
    if (!!styleName) {
      this._cursorStyle.before = this._cursorStyle.current;
      this._cursorStyle.current = styleName;
      (this.eventListener.style.cursor as TCursorStyleName) = styleName;
    } else {
      (this.eventListener.style.cursor as TCursorStyleName) = 'default';
    }
  }

  public getCursorPosition(event: MouseEvent): ICursorPosition {
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / this.appConfig.ZOOM;
    const y = (event.clientY - rect.top) / this.appConfig.ZOOM;
    return { x, y };
  }

  public subscribe(eventName: TSubscriptionTypes, action: TSubscribeAction) {
    this.subscriptions[eventName].push(action);
  }

  public simulateSubscriptions() {
    const eventNames = Object.keys(this.subscriptions);
    eventNames.forEach((eventName: TSubscriptionTypes) => {
      const actionsList = this.subscriptions[eventName];
      if (!!actionsList.length) {
        this.eventListener.addEventListener(eventName, (event: MouseEvent) => {
          const cursorPosition = this.getCursorPosition(event);
          actionsList.forEach((action) => {
            action(event, cursorPosition);
          });
        });
      }
    });
  }
}