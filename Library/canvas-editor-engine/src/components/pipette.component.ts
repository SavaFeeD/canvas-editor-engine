import { reflect } from "../utils/reflect";
reflect();

import { ICursorPosition } from "../types/cursor";
import { TPipetteState } from "../types/pipette";
import { ITool, THEXColor } from "../types/general";
import { Convert } from "../utils/convert";
import CanvasComponent from "./canvas.component";
import ComponentService from "../services/component.service";
import ToolService from "../services/tool.service";
import LoggerService from "../services/logger.service";

export default class PipetteComponent extends ComponentService {
  constructor(
    private toolService: ToolService,
    private loggerService: LoggerService,
    private canvasComponent: CanvasComponent,
  ) {
    super();

    this.toolService.add(this.tool);

    this.loggerService.components.add({
      info: {
        name: 'pipette', 
        description: 'pipette component', 
      },
      prototype: this,
    });
  }

  public template = `
    <div class="pipette_border-out">
      <div class="pipette_color">
        <div class="pipette_border-in">
          <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M17 12C17 14.7614 14.7614 17 12 17M17 12C17 9.23858 14.7614 7 12 7M17 12H19M12 17C9.23858 17 7 14.7614 7 12M12 17V19M7 12C7 9.23858 9.23858 7 12 7M7 12H5M12 7V5M14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12Z" stroke="#d9d9d9" stroke-linecap="round" stroke-linejoin="round"></path></g></svg>
        </div> 
      </div>
    </div>
  `;

  public css = `
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
  `;

  public pipette: HTMLElement;
  
  private _pipetteColor: THEXColor;

  public set pipetteColor(color: THEXColor) {
    this._pipetteColor = color;
    this._pipetteColorElement.style.borderColor = this._pipetteColor;
  }

  public get pipetteColor(): THEXColor {
    return this._pipetteColor;
  }
  
  private _pipetteColorElement: HTMLDivElement;

  private _pipetteState: TPipetteState = 'abandoned';

  private tool: ITool = {
    id: 0,
    name: 'pipette',
    onAction: () => this.setState('taken'),
    offAction: () => this.setState('abandoned'),
  };

  public getComponent() {
    const wrapOptions = {
      className: 'pipette',
    };
    const pipetteTemplate = this.getTemplate(this.template, wrapOptions);
    const pipetteStyle = this.getStyle(this.css);
    
    this.pipette = pipetteTemplate;
    this._pipetteColorElement = pipetteTemplate.querySelector('.pipette_color');

    this.emmit();

    return { pipetteTemplate, pipetteStyle };
  }

  public setState(state: TPipetteState) {
    this._pipetteState = state;

    switch(state) {
      case 'abandoned':
        return this.hide();
      case 'taken':
        return this.show();
      case 'selected-color':
        return this.show();
      default:
        return this.hide();
    }
  }

  public emmit() {
    this.canvasComponent.subscribe('mousemove', (event: MouseEvent, cursorPosition: ICursorPosition) => {
      const state = this._pipetteState; 
      if (state === 'taken' || state === 'selected-color') {
        const { x, y } = cursorPosition;
        this.pipette.style.left = `${x+10}px`;
        this.pipette.style.top = `${y+10}px`;
      }
    });

    this.canvasComponent.subscribe('click', (event: MouseEvent, cursorPosition: ICursorPosition) => {
      const state = this._pipetteState; 
      if (state === 'taken' || state === 'selected-color') {

        console.log('pipetteState', state);

        if (state === 'taken') {
          this.setColorFromChoosenPixel(cursorPosition);
          this.setState('selected-color');
        }

        if (state === 'selected-color') {
          this.setColorFromChoosenPixel(cursorPosition);
        }
      }
    });
  }

  private setColorFromChoosenPixel(cursorPosition: ICursorPosition) {
    const { x, y } = cursorPosition;
    const pixel = this.canvasComponent.ctx.getImageData(x, y, 1, 1).data;
    const hexPixel = Convert.rgbToHex(pixel[0], pixel[1], pixel[2]);
    this.pipetteColor = hexPixel;
  }

  private show() {
    this.pipette.style.display = 'flex';
    this.canvasComponent.cursorStyle = 'default';
  }

  private hide() {
    this.pipette.style.display = 'none';
    this.canvasComponent.cursorStyle = 'default';
  }
}