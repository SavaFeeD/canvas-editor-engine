import { reflect } from "./utils/reflect";
reflect();

import CanvasComponent from "./components/canvas.component";
import ExcretionsComponent from "./components/excretions.component";
import LoadingComponent from "./components/loading.component";
import PipetteComponent from "./components/pipette.component";
import SlotComponent from "./components/slot.component";
import EventService from "./services/event.service";
import { TComponent } from "./types/general";
import AppConfig from "./config";
import LoggerService from "./services/logger.service";
import ToolLayerService from "./services/tool-layers.service";
import ToolService from "./services/tool.service";
import CropService from "./services/crop.service";
import AppStore from "./store/store";
import ThroughHistoryService from "./services/through-history.service";
import AppStoreRepository from "./store/storeRepository";
import ProjectsService from "./services/projects.service";
import PullProjectService from "./services/pull-project.service";
import DrawService, { DrawAccumulator } from "./services/draw.service";
import DownloadService from "./services/download.service";
import ResizeService from "./services/serize.service";
import DrawLayersService from "./services/draw-leayers.service";
import { ILayer } from "./types/draw-layers";

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

export default class WebComponent extends HTMLElement {
  appConfig: AppConfig;
  appStoreRepository: AppStoreRepository;
  appStore: AppStore;
  webComponentWrapper: WebComponentWrapper;
  canvasElement: HTMLDivElement;

  canvasComponent: CanvasComponent;
  excretionsComponent: ExcretionsComponent;
  loadingComponent: LoadingComponent;
  pipetteComponent: PipetteComponent;
  slotComponent: SlotComponent;

  toolService: ToolService;
  toolLayerService: ToolLayerService;
  cropService: CropService;
  eventService: EventService;
  throughHistoryService: ThroughHistoryService;
  projectsService: ProjectsService;
  pullProjectService: PullProjectService;
  loggerService: LoggerService;
  drawService: DrawService;
  downloadService: DownloadService;
  resizeService: ResizeService;
  drawAccumulator: DrawAccumulator;
  drawLayersService: DrawLayersService;

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    this.webComponentWrapper = new WebComponentWrapper();
    shadowRoot.appendChild(this.webComponentWrapper.baseElement);
  }

  init(
    appConfig: AppConfig
  ) {
    this.appConfig = appConfig;

    this.projectsService = new ProjectsService();

    this.loggerService = new LoggerService();
    this.toolLayerService = new ToolLayerService(this.appConfig);
    this.eventService = new EventService();

    this.canvasComponent = new CanvasComponent(
      this.appConfig,
      this.loggerService,
      this.toolLayerService
    );

    this.toolService = new ToolService(this.canvasComponent);
    this.appStoreRepository = new AppStoreRepository();
    this.throughHistoryService = new ThroughHistoryService(this.appConfig, this.appStoreRepository);
    this.resizeService = new ResizeService(this.appConfig, this.throughHistoryService);
    this.appStore = new AppStore(this.throughHistoryService, this.appStoreRepository);
    this.pullProjectService = new PullProjectService(this.throughHistoryService, this.appStoreRepository);
    this.drawService = new DrawService(
      this.appConfig,
      this.appStoreRepository,
      this.eventService
    );
    this.drawLayersService = new DrawLayersService(this.appStoreRepository);
    this.drawAccumulator = new DrawAccumulator(
      this.appConfig,
      this.appStoreRepository,
      this.eventService,
      this.drawLayersService,
    );
    this.downloadService = new DownloadService(this.canvasComponent);

    const { canvasTemplate, canvasStyle } = this.canvasComponent.getComponent();
    this.canvasElement = this.webComponentWrapper.editorWrap.add(canvasTemplate, canvasStyle);

    const pipetteComponent = new PipetteComponent(
      this.toolService,
      this.loggerService,
      this.canvasComponent
    );

    const { pipetteTemplate, pipetteStyle } = pipetteComponent.getComponent();
    this.webComponentWrapper.editorWrap.add(pipetteTemplate, pipetteStyle);

    const slotComponent = new SlotComponent(
      this.loggerService,
    );

    const { slotTemplate, slotStyle } = slotComponent.getComponent('tools');
    this.webComponentWrapper.toolsWrap.add(slotTemplate, slotStyle);

    this.excretionsComponent = new ExcretionsComponent(
      this.toolService,
      this.loggerService,
      this.toolLayerService,
      this.canvasComponent
    );

    this.cropService = new CropService(this.appConfig, this.appStoreRepository, this.excretionsComponent);

    const { excretionsTemplate, excretionsStyle } = this.excretionsComponent.getComponent();
    this.webComponentWrapper.editorWrap.add(excretionsTemplate, excretionsStyle);

    const loadingComponent = new LoadingComponent(
      this.loggerService,
      this.eventService
    );

    const { loadingTemplate, loadingStyle } = loadingComponent.getComponent();
    this.webComponentWrapper.editorWrap.add(loadingTemplate, loadingStyle);

    this.canvasComponent.simulateSubscriptions();

    this.eventService.applyEvents(this.webComponentWrapper.baseElement);

    return this.initial();
  }

  initial() {
    this.appConfig.bindCanvas(this.canvasElement);
    return {
      editorElement: this.canvasElement,
      canvasSelector: this.canvasComponent.getCanvasSelector(),
    };
  }

  restoreJSONProjects(layerId: ILayer['id'], jsonProjects: string) {
    // const canvas = this.canvasElement.querySelector('canvas');
    // const ctx = canvas.getContext('2d');

    const projectProcessor = this.projectsService.on('File');
    const serializer = projectProcessor.getSerializerInstance(jsonProjects);
    const projects = serializer.getProjects();
    this.drawAccumulator.add(layerId, 'project', projects[0]);
    // this.drawService.drawProject(ctx, projects[0]);
    this.throughHistoryService.recovery(projects[0]);
  }
}
