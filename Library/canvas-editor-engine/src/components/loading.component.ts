import { reflect } from "../utils/reflect";
reflect();

import ComponentService from "../services/component.service";
import EventService, { ControlEvent } from "../services/event.service";
import LoggerService from "../services/logger.service";


export default class LoadingComponent extends ComponentService {
  constructor(
    private loggerService: LoggerService,
    private eventService: EventService,
  ) {
    super();

    this.loggerService.components.add({
      info: {
        name: 'loading', 
        description: 'loading component', 
      },
      prototype: this,
    });
  }

  private template: string = `
    <span class="loader"></span>
  `;

  private css: string = `
    .loading-wrapper {
      display: none;  
      justify-content: center;
      align-items: center;
      position: absolute;
      width: 100%;
      height: 100%;
      background: #ffffff30;
    }

    .loader {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      position: relative;
      animation: rotate 1s linear infinite
    }
    .loader::before , .loader::after {
      content: "";
      box-sizing: border-box;
      position: absolute;
      inset: 0px;
      border-radius: 50%;
      border: 5px solid #FFF;
      animation: prixClipFix 2s linear infinite ;
    }
    .loader::after{
      inset: 8px;
      transform: rotate3d(90, 90, 0, 180deg );
      border-color: #FF3D00;
    }

    @keyframes rotate {
      0%   {transform: rotate(0deg)}
      100%   {transform: rotate(360deg)}
    }

    @keyframes prixClipFix {
        0%   {clip-path:polygon(50% 50%,0 0,0 0,0 0,0 0,0 0)}
        50%  {clip-path:polygon(50% 50%,0 0,100% 0,100% 0,100% 0,100% 0)}
        75%, 100%  {clip-path:polygon(50% 50%,0 0,100% 0,100% 100%,100% 100%,100% 100%)}
    }
  `;

  public loading: HTMLElement;

  public getComponent() {
    const wrapOptions = {
      className: 'loading-wrapper',
    };
    const loadingTemplate = this.getTemplate(this.template, wrapOptions);
    const loadingStyle = this.getStyle(this.css);

    this.loading = loadingTemplate;

    this.subscribeLoadingStart();
    this.subscribeLoadingEnd();

    return { loadingTemplate, loadingStyle };
  }

  public hide() {
    this.loading.style.display = 'none';
  }

  public view() {
    this.loading.style.display = 'flex';
  }

  private subscribeLoadingStart() {
    const controlEvent: ControlEvent = {
      name: 'loading-start',
      action: () => this.view(),
    };
    this.eventService.subcribe(controlEvent);
  }

  private subscribeLoadingEnd() {
    const controlEvent: ControlEvent = {
      name: 'loading-end',
      action: () => this.hide(),
    };
    this.eventService.subcribe(controlEvent);
  }
}