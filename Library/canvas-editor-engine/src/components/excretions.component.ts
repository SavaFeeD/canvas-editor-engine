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
import CropService from "../services/crop.service";

export default class ExcretionsComponent extends ComponentService {
  private static template: string = ``;

  private static templateExcretion: string = `
    <button type="button" class="crop-button">
      <svg fill="#ffffff" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M426.667 0h106.666v1386.67H1920v106.66H426.667V0zM320 426.667H0v106.666h320V426.667zm320 0v106.666h746.67V1280h106.66V426.667H640zM1493.33 1600h-106.66v320h106.66v-320z"></path> </g></svg>
    </button>
  `;
  private static _excretionDefaultStyle: string[] = ['excretion'];

  private static css: string = `
    .excretion {
      display: flex;
      position: absolute;
      background-image: linear-gradient(90deg, silver 50%, transparent 50%), linear-gradient(90deg, silver 50%, transparent 50%), linear-gradient(0deg, silver 50%, transparent 50%), linear-gradient(0deg, silver 50%, transparent 50%);
      background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
      background-size: 8px 1px, 8px 1px, 1px 8px, 1px 8px;
      background-position: left top, right bottom, left bottom, right top;
      animation: border-dance 1s infinite linear;
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

  public static excretionWrap: HTMLElement;
  private static _excretions: HTMLElement[] = [];

  private static _excretionState: TExcretionState = 'abandoned';
  private static _excretionActivity: TExcretionActivity = 'abandoned';
  private static _excretionToolState: TExcretionToolState = 'abandoned';

  private static _tempCoords: TExcretionTempCoords = [];
  public static excretionsCoords: IExcretionsCoords[] = [];

  private static _additionStyle: TExcretionStyle = 'default';

  public static get additionStyle() {
    return ExcretionsComponent._additionStyle;
  }

  public static set additionStyle(value: TExcretionStyle) {
    ExcretionsComponent._additionStyle = value;
    ExcretionsComponent.applyExcretionStyle();
  }

  private static applyExcretionStyle() {
    switch(ExcretionsComponent._additionStyle) {
      case 'crop':
        ExcretionsComponent.determineCropStyle();
        break;
      case 'default':
        ExcretionsComponent.determineDefaultStyle();
        break;
      default:
        ExcretionsComponent.determineDefaultStyle();
        break;
    }
  };

  private static determineCropStyle() {
    ExcretionsComponent._excretions.forEach((excretion) => {
      if (!!excretion === false) return;
      if (!excretion.classList.contains('excretion_crop')) {
        excretion.classList.add("excretion_crop");
        CropService.viewCropButton();
      }
    });
  }

  private static determineDefaultStyle() {
    ExcretionsComponent._excretions.forEach((excretion) => {
      if (!!excretion === false) return;
      // @ts-ignore
      excretion.classList = ExcretionsComponent._excretionDefaultStyle;
    });
  }

  private static tool: ITool = {
    id: 1,
    name: 'excretion',
    onAction: () => ExcretionsComponent.setToolState('taken'),
    offAction: () => ExcretionsComponent.setToolState('abandoned'),
    support: () => {
      ExcretionsComponent.clearExcretionsCoords();
      ExcretionsComponent.additionStyle = 'default';
    },
  };

  static {
    ToolService.add(ExcretionsComponent.tool);
    LoggerService.components.add({
      info: {
        name: 'excretion',
        description: 'excretion component',
      },
      prototype: ExcretionsComponent,
    });
  }

  public static getComponent() {
    const wrapOptions = {
      className: 'excretions-wrap',
    };
    const excretionsTemplate = ExcretionsComponent.getTemplate(ExcretionsComponent.template, wrapOptions);
    const excretionsStyle = ExcretionsComponent.getStyle(ExcretionsComponent.css);

    ExcretionsComponent.excretionWrap = excretionsTemplate;
    ExcretionsComponent.emmit();

    return { excretionsTemplate, excretionsStyle };
  }

  private static set excretionState(state: TExcretionState) {
    ExcretionsComponent._excretionState = state;
    ExcretionsComponent.applyExcretionStyle();
    switch (state) {
      case 'abandoned':
        CanvasComponent.cursorStyle = 'default';
        break;
      case 'create':
        CanvasComponent.cursorStyle = 'crosshair';
        break;
      case 'add':
        CanvasComponent.cursorStyle = 'copy';
        break;
      case 'remove':
        CanvasComponent.cursorStyle = 'alias';
        break;
      default:
        CanvasComponent.cursorStyle = 'default';
        break;
    }
  }

  public static setToolState(toolState: TExcretionToolState) {
    ExcretionsComponent._excretionToolState = toolState;

    switch (toolState) {
      case 'abandoned':
        ExcretionsComponent.excretionState = 'abandoned';
        ExcretionsComponent._excretionActivity = 'abandoned';
        break;
      case 'taken':
        ExcretionsComponent.excretionState = 'create';
        break;
      default:
        ExcretionsComponent.excretionState = 'abandoned';
        ExcretionsComponent._excretionActivity = 'abandoned';
        break;
    }
  }

  public static clearExcretionsCoords() {
    console.log('clear!');
    ExcretionsComponent._excretions.forEach((excretion) => excretion.remove());
    ExcretionsComponent._excretions = [];
    ExcretionsComponent.excretionsCoords = [];
  }

  private static getTempCoords() {
    const startCoords = ExcretionsComponent._tempCoords[0];
    const endCoords = ExcretionsComponent._tempCoords[1];
    const coords = Object.assign(startCoords, endCoords);
    ExcretionsComponent._tempCoords = [];
    return coords;
  }

  private static endExcretion() {
    const coords = ExcretionsComponent.getTempCoords();
    ExcretionsComponent.excretionsCoords.push(coords);
    ExcretionsComponent._excretionActivity = 'end';
    console.log('ExcretionsComponent.excretionsCoords', ExcretionsComponent.excretionsCoords);
  }

  private static emmit() {
    CanvasComponent.subscribe('mousedown', (event: MouseEvent, cursorPosition: ICursorPosition) => {
      const toolState = ExcretionsComponent._excretionToolState;
      if (toolState === 'abandoned') return;

      const state = ExcretionsComponent._excretionState;

      if (state === 'create') {
        const wrapOptions = {
          className: ExcretionsComponent._excretionDefaultStyle[0],
        };
        const excretionTemplate = ExcretionsComponent.getTemplate(ExcretionsComponent.templateExcretion, wrapOptions);

        ExcretionsComponent.clearExcretionsCoords();

        const tempStart: IExcretionTempStart = {
          start: cursorPosition,
        };

        excretionTemplate.style.left = `${tempStart.start.x}px`;
        excretionTemplate.style.top = `${tempStart.start.y}px`;

        const excretionElement = ExcretionsComponent.excretionWrap.appendChild(excretionTemplate);

        ExcretionsComponent._excretions.push(excretionElement);
        ExcretionsComponent._tempCoords.push(tempStart);
      }

      if (state === 'add') {
        const tempStart: IExcretionTempStart = {
          start: cursorPosition,
        };
        ExcretionsComponent._tempCoords.push(tempStart);
      }

      ExcretionsComponent.applyExcretionStyle();
      ExcretionsComponent._excretionActivity = 'active';
    });


    CanvasComponent.subscribe('mousemove', (event: MouseEvent, cursorPosition: ICursorPosition) => {
      const toolState = ExcretionsComponent._excretionToolState;
      if (toolState === 'abandoned') return;

      const activity = ExcretionsComponent._excretionActivity;
      if (event.altKey && ExcretionsComponent._excretionState !== 'abandoned') {
        ExcretionsComponent._excretionState = 'add';
      }

      if (activity === 'abandoned') return;

      if (activity === 'active') {
        const excretionLastIndex = ExcretionsComponent._excretions.length - 1;
        const excretion = ExcretionsComponent._excretions[excretionLastIndex];
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

    CanvasComponent.subscribe('mouseup', (event: MouseEvent, cursorPosition: ICursorPosition) => {
      const toolState = ExcretionsComponent._excretionToolState;
      if (toolState === 'abandoned') return;

      const state = ExcretionsComponent._excretionState;

      if (state === 'abandoned') return;

      if (state === 'create' || state === 'add') {
        const tempEnd: IExcretionTempEnd = {
          end: cursorPosition,
        };
        ExcretionsComponent._tempCoords.push(tempEnd);
        ExcretionsComponent.endExcretion();
      }
    });
  }
} 