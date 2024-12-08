import CanvasComponent from "./components/canvas.component";
import ExcretionsComponent from "./components/excretions.component";
import LoadingComponent from "./components/loading.component";
import PipetteComponent from "./components/pipette.component";
import SlotComponent from "./components/slot.component";
import EventService from "./services/event.service";
import { TComponent } from "./types/general";

export class WebComponentWrapper {
  public baseElement: HTMLDivElement;
  public editorWrapElement: HTMLDivElement;
  public stylesWrapElement: HTMLDivElement;
  public toolsWrapElement: HTMLDivElement;

  constructor() {
    const base = document.createElement('div');
    base.className = 'wc-editor';
    base.style.position = 'relative';
    base.style.display = 'flex';
    base.style.overflow = 'hidden';

    const stylesWrap = document.createElement('div');
    stylesWrap.className = 'styles-wrap';

    const editorWrap = document.createElement('div');
    editorWrap.className = 'editor-wrap';
    editorWrap.style.position = 'relative';
    editorWrap.style.display = 'flex';
    editorWrap.style.overflow = 'hidden';
    
    const toolsWrap = document.createElement('div');
    toolsWrap.className = 'tools-wrap';
    toolsWrap.style.position = 'relative';
    toolsWrap.style.display = 'flex';

    base.appendChild(stylesWrap);
    base.appendChild(editorWrap);
    base.appendChild(toolsWrap);

    this.baseElement = base;
    this.stylesWrapElement = stylesWrap;
    this.editorWrapElement = editorWrap;
    this.toolsWrapElement = toolsWrap;
    this._baseStyle();
  }

  public get base() {
    return this._methods(this.baseElement); 
  };

  public get editorWrap() {
    return this._methods(this.editorWrapElement); 
  };

  public get stylesWrap() {
    return this._methods(this.stylesWrapElement); 
  };

  public get toolsWrap() {
    return this._methods(this.toolsWrapElement); 
  };

  private _methods(elementWrapper: HTMLDivElement) {
    return {
      add: (component: TComponent, style?: HTMLStyleElement) => this._add(elementWrapper, component, style),
    };
  }

  private _add(elementWrapper: HTMLDivElement, component: TComponent, style?: HTMLStyleElement) {
    const componentElement: HTMLDivElement = elementWrapper.appendChild(component) as HTMLDivElement;
    if (!!style) {
      this.stylesWrapElement.appendChild(style);
    }
    return componentElement;
  }

  private _baseStyle() {
    const style = document.createElement('style');
    style.innerHTML = `
      * {
        user-select: none;
      }
    `;
    this.stylesWrapElement.appendChild(style);
  }
}

declare global {
  interface HTMLElement {} 
}

export default class WebComponent extends HTMLElement {
  constructor() {
    super();
    
    const shadowRoot = this.attachShadow({ mode: "open" });

    const webComponentWrapper = new WebComponentWrapper();

    const { canvasTemplate, canvasStyle } = CanvasComponent.getComponent();
    const canvasElement = webComponentWrapper.editorWrap.add(canvasTemplate, canvasStyle);

    const { pipetteTemplate, pipetteStyle } = PipetteComponent.getComponent();
    webComponentWrapper.editorWrap.add(pipetteTemplate, pipetteStyle);

    const { slotTemplate, slotStyle } = SlotComponent.getComponent('tools');
    webComponentWrapper.toolsWrap.add(slotTemplate, slotStyle);

    const { excretionsTemplate, excretionsStyle } = ExcretionsComponent.getComponent();
    webComponentWrapper.editorWrap.add(excretionsTemplate, excretionsStyle);

    const { loadingTemplate, loadingStyle } = LoadingComponent.getComponent();
    webComponentWrapper.editorWrap.add(loadingTemplate, loadingStyle);

    shadowRoot.appendChild(webComponentWrapper.baseElement);

    CanvasComponent.simulateSubscriptions();

    EventService.applyEvents(webComponentWrapper.baseElement);

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