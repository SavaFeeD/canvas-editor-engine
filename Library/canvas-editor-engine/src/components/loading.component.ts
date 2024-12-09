import { reflect } from "../utils/reflect";
reflect();

import ComponentService from "../services/component.service";
import EventService, { ControlEvent } from "../services/event.service";
import LoggerService from "../services/logger.service";


export default class LoadingComponent extends ComponentService {
  private static template: string = `
    <span class="loader"></span>
  `;

  private static css: string = `
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

  public static loading: HTMLElement;

  static {
    LoggerService.components.add({
      info: {
        name: 'loading', 
        description: 'loading component', 
      },
      prototype: LoadingComponent,
    });
  }

  public static getComponent() {
    const wrapOptions = {
      className: 'loading-wrapper',
    };
    const loadingTemplate = LoadingComponent.getTemplate(LoadingComponent.template, wrapOptions);
    const loadingStyle = LoadingComponent.getStyle(LoadingComponent.css);

    LoadingComponent.loading = loadingTemplate;

    LoadingComponent.subscribeLoadingStart();
    LoadingComponent.subscribeLoadingEnd();

    return { loadingTemplate, loadingStyle };
  }

  public static hide() {
    LoadingComponent.loading.style.display = 'none';
  }

  public static view() {
    LoadingComponent.loading.style.display = 'flex';
  }

  private static subscribeLoadingStart() {
    const controlEvent: ControlEvent = {
      name: 'loading-start',
      action: () => LoadingComponent.view(),
    };
    EventService.subcribe(controlEvent);
  }

  private static subscribeLoadingEnd() {
    const controlEvent: ControlEvent = {
      name: 'loading-end',
      action: () => LoadingComponent.hide(),
    };
    EventService.subcribe(controlEvent);
  }
}