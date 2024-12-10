import { reflect } from "../utils/reflect";
reflect();

import ComponentService from "../services/component.service";
import ToolService from "../services/tool.service";
import CanvasComponent from "./canvas.component";
import type { ICursorPosition } from "../types/cursor";
import type {
  IExcretionsCoords,
  IExcretionTempEnd,
  IExcretionTempStart,
  TExcretionActivity,
  TExcretionState,
  TExcretionStyle,
  TExcretionTempCoords,
  TExcretionToolState
} from "../types/excretion";
import type { ITool } from "../types/general";
import LoggerService from "../services/logger.service";
// import CropService from "../services/crop.service";
import ToolLayerService from "../services/tool-layers.service";

export default class ExcretionsComponent extends ComponentService {
  
  constructor(
    private toolService: ToolService,
    private loggerService: LoggerService,
    private toolLayerService: ToolLayerService,
    // private cropService: CropService,
    private canvasComponent: CanvasComponent,
  ) {
    super();

    this.toolService.add(this.tool);
    this.loggerService.components.add({
      info: {
        name: 'excretion',
        description: 'excretion component',
      },
      prototype: this,
    });
  }

  private template: string = ``;

  private templateExcretion: string = `
    <button type="button" class="crop-button">
      <svg fill="#ffffff" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M426.667 0h106.666v1386.67H1920v106.66H426.667V0zM320 426.667H0v106.666h320V426.667zm320 0v106.666h746.67V1280h106.66V426.667H640zM1493.33 1600h-106.66v320h106.66v-320z"></path> </g></svg>
    </button>
  `;
  private _excretionDefaultStyle: string[] = ['excretion'];

  private css: string = `
    .excretion {
      display: flex;
      position: absolute;
      background-image: linear-gradient(90deg, silver 50%, transparent 50%), linear-gradient(90deg, silver 50%, transparent 50%), linear-gradient(0deg, silver 50%, transparent 50%), linear-gradient(0deg, silver 50%, transparent 50%);
      background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
      background-size: 8px 1px, 8px 1px, 1px 8px, 1px 8px;
      background-position: left top, right bottom, left bottom, right top;
      animation: border-dance 1s infinite linear;
      z-index: ${this.toolLayerService.getLayerIndex('low')};
    }

    .excretion_crop {
      box-shadow: 0px 0px 0px calc(100vw + 100vh) #50505070;
    }

    .crop-button {
      display: none;
      justify-content: center;
      align-items: center;
      position: absolute;
      padding: 5px;
      right: -35px;
      top: 0;
      background: #232222;
      border: 1px solid #ffffff50;
      border-radius: 4px;
      width: 30px;
      height: 30px;
      cursor: pointer;
      z-index: ${this.toolLayerService.getLayerIndex('high')};
    }

    .crop-button--view {
      display: flex;
    }

    @keyframes border-dance {
      0% {
        background-position: left top, right bottom, left bottom, right top;
      }
      100% {
        background-position: left 8px top, right 8px bottom, left bottom 8px, right top 8px;
      }
    }
  `;

  public excretionWrap: HTMLElement;
  private _excretions: HTMLElement[] = [];

  private _excretionState: TExcretionState = 'abandoned';
  private _excretionActivity: TExcretionActivity = 'abandoned';
  private _excretionToolState: TExcretionToolState = 'abandoned';

  private _tempCoords: TExcretionTempCoords = [];
  public excretionsCoords: IExcretionsCoords[] = [];

  private _additionStyle: TExcretionStyle = 'default';

  public get additionStyle() {
    return this._additionStyle;
  }

  public set additionStyle(value: TExcretionStyle) {
    this._additionStyle = value;
    this.applyExcretionStyle();
  }

  private applyExcretionStyle() {
    switch(this._additionStyle) {
      case 'crop':
        this.determineCropStyle();
        break;
      case 'default':
        this.determineDefaultStyle();
        break;
      default:
        this.determineDefaultStyle();
        break;
    }
  };

  private determineCropStyle() {
    this._excretions.forEach((excretion) => {
      if (!!excretion === false) return;
      if (!excretion.classList.contains('excretion_crop')) {
        excretion.classList.add("excretion_crop");
        // this.cropService.viewCropButton();
      }
    });
  }

  private determineDefaultStyle() {
    this._excretions.forEach((excretion) => {
      if (!!excretion === false) return;
      // @ts-ignore
      excretion.classList = this._excretionDefaultStyle;
    });
  }

  private tool: ITool = {
    id: 1,
    name: 'excretion',
    onAction: () => this.setToolState('taken'),
    offAction: () => this.setToolState('abandoned'),
    support: () => {
      this.clearExcretionsCoords();
      this.additionStyle = 'default';
    },
  };

  public getComponent() {
    const wrapOptions = {
      className: 'excretions-wrap',
    };
    const excretionsTemplate = this.getTemplate(this.template, wrapOptions);
    const excretionsStyle = this.getStyle(this.css);

    this.excretionWrap = excretionsTemplate;
    this.emmit();

    return { excretionsTemplate, excretionsStyle };
  }

  private set excretionState(state: TExcretionState) {
    this._excretionState = state;
    this.applyExcretionStyle();
    switch (state) {
      case 'abandoned':
        this.canvasComponent.cursorStyle = 'default';
        break;
      case 'create':
        this.canvasComponent.cursorStyle = 'crosshair';
        break;
      case 'add':
        this.canvasComponent.cursorStyle = 'copy';
        break;
      case 'remove':
        this.canvasComponent.cursorStyle = 'alias';
        break;
      default:
        this.canvasComponent.cursorStyle = 'default';
        break;
    }
  }

  public setToolState(toolState: TExcretionToolState) {
    this._excretionToolState = toolState;

    switch (toolState) {
      case 'abandoned':
        this.excretionState = 'abandoned';
        this._excretionActivity = 'abandoned';
        break;
      case 'taken':
        this.excretionState = 'create';
        break;
      default:
        this.excretionState = 'abandoned';
        this._excretionActivity = 'abandoned';
        break;
    }
  }

  public clearExcretionsCoords() {
    console.log('clear!');
    this._excretions.forEach((excretion) => excretion.remove());
    this._excretions = [];
    this.excretionsCoords = [];
  }

  private getTempCoords() {
    const startCoords = this._tempCoords[0];
    const endCoords = this._tempCoords[1];
    const coords = Object.assign(startCoords, endCoords);
    this._tempCoords = [];
    return coords;
  }

  private endExcretion() {
    const coords = this.getTempCoords();
    this.excretionsCoords.push(coords);
    this._excretionActivity = 'end';
    console.log('this.excretionsCoords', this.excretionsCoords);
  }

  private emmit() {
    this.canvasComponent.subscribe('mousedown', (event: MouseEvent, cursorPosition: ICursorPosition) => {
      const toolState = this._excretionToolState;
      if (toolState === 'abandoned') return;

      const state = this._excretionState;

      if (state === 'create') {
        const wrapOptions = {
          className: this._excretionDefaultStyle[0],
        };
        const excretionTemplate = this.getTemplate(this.templateExcretion, wrapOptions);

        this.clearExcretionsCoords();

        const tempStart: IExcretionTempStart = {
          start: cursorPosition,
        };

        excretionTemplate.style.left = `${tempStart.start.x}px`;
        excretionTemplate.style.top = `${tempStart.start.y}px`;

        const excretionElement = this.excretionWrap.appendChild(excretionTemplate);

        this._excretions.push(excretionElement);
        this._tempCoords.push(tempStart);
      }

      if (state === 'add') {
        const tempStart: IExcretionTempStart = {
          start: cursorPosition,
        };
        this._tempCoords.push(tempStart);
      }

      this.applyExcretionStyle();
      this._excretionActivity = 'active';
    });


    this.canvasComponent.subscribe('mousemove', (event: MouseEvent, cursorPosition: ICursorPosition) => {
      const toolState = this._excretionToolState;
      if (toolState === 'abandoned') return;

      const activity = this._excretionActivity;
      if (event.altKey && this._excretionState !== 'abandoned') {
        this._excretionState = 'add';
      }

      if (activity === 'abandoned') return;

      if (activity === 'active') {
        const excretionLastIndex = this._excretions.length - 1;
        const excretion = this._excretions[excretionLastIndex];
        const excretionX = +(excretion.style.left.split('px')[0]);
        const excretionY = +(excretion.style.top.split('px')[0]);
        const width = Math.abs(cursorPosition.x - excretionX);
        const height = Math.abs(cursorPosition.y - excretionY);
        excretion.style.width = width + 'px';
        excretion.style.height = height + 'px';

        const isRightBottom = cursorPosition.x > excretionX && cursorPosition.y > excretionY;
        const isLeftBottom = cursorPosition.x < excretionX && cursorPosition.y > excretionY;
        const isLeftTop = cursorPosition.x < excretionX && cursorPosition.y < excretionY;
        const isRightTop = cursorPosition.x > excretionX && cursorPosition.y < excretionY;

        if (isRightBottom) {
          excretion.style.transform = `translateX(0px) translateY(0px)`;
        } else if (isLeftBottom) {
          excretion.style.transform = `translateX(-${width}px) translateY(0px)`;
        } else if (isLeftTop) {
          excretion.style.transform = `translateX(-${width}px) translateY(-${height}px)`;
        } else if (isRightTop) {
          excretion.style.transform = `translateX(0px) translateY(-${height}px)`;
        }
      }

    });

    this.canvasComponent.subscribe('mouseup', (event: MouseEvent, cursorPosition: ICursorPosition) => {
      const toolState = this._excretionToolState;
      if (toolState === 'abandoned') return;

      const state = this._excretionState;

      if (state === 'abandoned') return;

      if (state === 'create' || state === 'add') {
        const tempEnd: IExcretionTempEnd = {
          end: cursorPosition,
        };
        this._tempCoords.push(tempEnd);
        this.endExcretion();
      }
    });
  }
} 