import CanvasComponent from "./components/canvas.component";
import ExcretionsComponent from "./components/excretions.component";
import PipetteComponent from "./components/pipette.component";
import SlotComponent from "./components/slot.component";
import { TComponent } from "./types/general";

export class WebComponentWrapper {
  public element: HTMLDivElement;

  constructor() {
    const webComponentWrapper = document.createElement('div');
    webComponentWrapper.className = 'editor-wrap';
    webComponentWrapper.style.position = 'relative';
    webComponentWrapper.style.display = 'flex';
    this.element = webComponentWrapper;
    this._stylish();
  }

  public add(component: TComponent, style?: HTMLStyleElement) {
    const componentElement: HTMLDivElement = this.element.appendChild(component) as HTMLDivElement;
    if (!!style) {
      this.element.appendChild(style);
    }
    return componentElement;
  }

  private _stylish() {
    const style = document.createElement('style');
    style.innerHTML = `
      * {
        user-select: none;
      }
    `;
    this.element.appendChild(style);
  }
}

export default class WebComponent extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    
    const webComponentWrapper = new WebComponentWrapper();

    const { canvasTemplate, canvasStyle } = CanvasComponent.getComponent();
    const canvasElement = webComponentWrapper.add(canvasTemplate, canvasStyle);

    const { pipetteTemplate, pipetteStyle } = PipetteComponent.getComponent();
    webComponentWrapper.add(pipetteTemplate, pipetteStyle);

    const { slotTemplate, slotStyle } = SlotComponent.getComponent('tools');
    webComponentWrapper.add(slotTemplate, slotStyle);

    const { excretionsTemplate, excretionsStyle } = ExcretionsComponent.getComponent();
    webComponentWrapper.add(excretionsTemplate, excretionsStyle);

    shadowRoot.appendChild(webComponentWrapper.element);

    CanvasComponent.simulateSubscriptions();

    this.addEventListener('initial', () => {
      this.dispatchEvent(new CustomEvent('get-editor-element', {
        detail: {
          editorElement: canvasElement,
          canvasSelector: CanvasComponent.getCanvasSelector(),
        }
      }));
    });
  }
}