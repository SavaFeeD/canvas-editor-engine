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


class CanvasEditorEngine {
  constructor(webComponentTagName?: string) {
    AppConfig.WEB_COMPONENT_TAG_NAME = webComponentTagName;
  }

  public getInitial() {
    return { tag: AppConfig.WEB_COMPONENT_TAG_NAME, component: WebComponent };
  }
}


class StaticCanvasEditorEngine extends CanvasEditorEngine {
  
  constructor(webComponentTagName?: string) {
    super(webComponentTagName);
  }

  public init() {
    const customElementRegistry = window.customElements;
    const { tag, component } = this.getInitial();
    customElementRegistry.define(tag, component);
  }
}


class VueCanvasEditorEngine extends CanvasEditorEngine {

  constructor(webComponentTagName?: string) {
    super(webComponentTagName);
  }

  public getContext2D() {
    return CanvasComponent.ctx;
  }

  public getCanvas() {
    return CanvasComponent.canvas;
  }
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
};