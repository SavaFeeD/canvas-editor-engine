import { ICursorPosition } from "../types/cursor";
import { TPipetteState } from "../types/pipette";
import { ITool, THEXColor } from "../types/general";
import { Convert } from "../utils/convert";
import CanvasComponent from "./canvas.component";
import ComponentService from "../services/component.service";
import ToolService from "../services/tool.service";
import LoggerService from "../services/logger.service";

export default class PipetteComponent extends ComponentService {
  public static template = `
    <div class="pipette_border-out">
      <div class="pipette_color">
        <div class="pipette_border-in">
          <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M17 12C17 14.7614 14.7614 17 12 17M17 12C17 9.23858 14.7614 7 12 7M17 12H19M12 17C9.23858 17 7 14.7614 7 12M12 17V19M7 12C7 9.23858 9.23858 7 12 7M7 12H5M12 7V5M14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12Z" stroke="#d9d9d9" stroke-linecap="round" stroke-linejoin="round"></path></g></svg>
        </div> 
      </div>
    </div>
  `;

  public static css = `
  .pipette {
    position: absolute;
    display: none;
    justify-content: center;
    align-items: center;
    width: 48px;
    height: 48px;
  }

  .pipette_border-out {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 100px;
    border: solid 2px #d9d9d9;
    width: 44px;
    height: 44px;
  }

  .pipette_border-in {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 100px;
    border: solid 1px #d9d9d9;
    width: 32px;
    height: 32px;
  }

  .pipette_color {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 34px;
    height: 34px;
    border-radius: 100px;
    border-color: blue;
    border-style: solid;
    border-width: 5px;
  }
  `

  public static pipette: HTMLElement;
  
  private static _pipetteColor: THEXColor;

  public static set pipetteColor(color: THEXColor) {
    PipetteComponent._pipetteColor = color;
    PipetteComponent._pipetteColorElement.style.borderColor = PipetteComponent._pipetteColor;
  }

  public static get pipetteColor(): THEXColor {
    return PipetteComponent._pipetteColor;
  }
  
  private static _pipetteColorElement: HTMLDivElement;

  private static _pipetteState: TPipetteState = 'abandoned';

  private static tool: ITool = {
    id: 0,
    name: 'pipette',
    onAction: () => PipetteComponent.setState('taken'),
    offAction: () => PipetteComponent.setState('abandoned'),
  };

  static {
    ToolService.add(PipetteComponent.tool);
    LoggerService.components.add({
      info: {
        name: 'pipette', 
        description: 'pipette component', 
      },
      prototype: PipetteComponent,
    });
  }

  public static getComponent() {
    const wrapOptions = {
      className: 'pipette',
    };
    const pipetteTemplate = PipetteComponent.getTemplate(PipetteComponent.template, wrapOptions);
    const pipetteStyle = PipetteComponent.getStyle(PipetteComponent.css);
    
    PipetteComponent.pipette = pipetteTemplate;
    PipetteComponent._pipetteColorElement = pipetteTemplate.querySelector('.pipette_color');

    PipetteComponent.emmit();

    return { pipetteTemplate, pipetteStyle };
  }

  public static setState(state: TPipetteState) {
    PipetteComponent._pipetteState = state;

    switch(state) {
      case 'abandoned':
        return PipetteComponent.hide();
      case 'taken':
        return PipetteComponent.show();
      case 'selected-color':
        return PipetteComponent.show();
      default:
        return PipetteComponent.hide();
    }
  }

  public static emmit() {
    CanvasComponent.subscribe('mousemove', (event: MouseEvent, cursorPosition: ICursorPosition) => {
      const state = PipetteComponent._pipetteState; 
      if (state === 'taken' || state === 'selected-color') {
        const { x, y } = cursorPosition;
        PipetteComponent.pipette.style.left = `${x+10}px`;
        PipetteComponent.pipette.style.top = `${y+10}px`;
      }
    });

    CanvasComponent.subscribe('click', (event: MouseEvent, cursorPosition: ICursorPosition) => {
      const state = PipetteComponent._pipetteState; 
      if (state === 'taken' || state === 'selected-color') {

        console.log('pipetteState', state);

        if (state === 'taken') {
          PipetteComponent.setColorFromChoosenPixel(cursorPosition);
          PipetteComponent.setState('selected-color');
        }

        if (state === 'selected-color') {
          PipetteComponent.setColorFromChoosenPixel(cursorPosition);
        }
      }
    });
  }

  private static setColorFromChoosenPixel(cursorPosition: ICursorPosition) {
    const { x, y } = cursorPosition;
    const pixel = CanvasComponent.ctx.getImageData(x, y, 1, 1).data;
    const hexPixel = Convert.rgbToHex(pixel[0], pixel[1], pixel[2]);
    PipetteComponent.pipetteColor = hexPixel;
  }

  private static show() {
    PipetteComponent.pipette.style.display = 'flex';
    CanvasComponent.cursorStyle = 'default';
  }

  private static hide() {
    PipetteComponent.pipette.style.display = 'none';
    CanvasComponent.cursorStyle = 'default';
  }
}