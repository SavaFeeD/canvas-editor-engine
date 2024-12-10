import { reflect } from "./utils/reflect";
reflect();

import AppConfig from "./config";

import WebComponent from "./web-component";

import CanvasComponent from "./components/canvas.component";
import PipetteComponent from "./components/pipette.component";
import ExcretionComponent from "./components/excretions.component";
import SlotComponent from "./components/slot.component";
import LoadingComponent from "./components/loading.component";

import DrawService from "./services/draw.service";
import ToolService from "./services/tool.service";
import LoggerService from "./services/logger.service";
import CropService from "./services/crop.service";
import DownloadService from "./services/download.service";
import ToolLayerService from "./services/tool-layers.service";
import EventService from "./services/event.service";
import ThroughHistoryService from "./services/through-history.service";
import ProjectsService from "./services/projects.service";
import PullProjectService from "./services/pull-project.service"

import AppStore from "./store/store";
import AppStoreRepository from "./store/storeRepository";


class CanvasEditorEngine {
  
  constructor(
  ) {}

  public getInitial() {
    return { component: WebComponent };
  }
}


class StaticCanvasEditorEngine extends CanvasEditorEngine {
  
  constructor() {
    super();
  }

  public init() {
    const customElementRegistry = window.customElements;
    const { component } = this.getInitial();
    customElementRegistry.define('canvas-editor-engine', component);
  }
}


class VueCanvasEditorEngine extends CanvasEditorEngine {

  constructor() {
    super();
  }

  // public getContext2D() {
  //   return CanvasComponent.ctx;
  // }

  // public getCanvas() {
  //   return CanvasComponent.canvas;
  // }
}

export {
  // config
  AppConfig,

  // components
  PipetteComponent,
  CanvasComponent,
  ExcretionComponent,
  SlotComponent,
  LoadingComponent,

  // services
  ToolService,
  DrawService,
  LoggerService,
  CropService,
  DownloadService,
  ToolLayerService,
  EventService,
  ThroughHistoryService,
  ProjectsService,
  PullProjectService,

  // general
  StaticCanvasEditorEngine,
  VueCanvasEditorEngine,

  // store
  AppStore,
  AppStoreRepository,
};