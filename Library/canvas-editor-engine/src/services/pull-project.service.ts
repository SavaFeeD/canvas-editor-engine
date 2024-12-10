import AppStoreRepository from "../store/storeRepository";
import { IUpdateProject, Project } from "../types/project";
import { Guid4 } from "../utils/guid4";
import ThroughHistoryService from "./through-history.service";

export default class PullProjectService {
  private _project: Project = new Project();

  constructor(
    private throughHistoryService: ThroughHistoryService,
    private appStoreRepository: AppStoreRepository,
  ) {}

  public get project(): Project {
    return this._project;
  }

  public refreshProject() {
    this._project = new Project();
  }

  public updateProject(project: IUpdateProject) {
    Object.keys(project).forEach((key) => {
      this._project[key] = project[key];
    });
  }

  public pull(name: Project['name'], description: Project['description']) {
    const project = new Project();

    const state: Project['state'] = {
      cache: this.throughHistoryService.cache,
      history: this.appStoreRepository.store.historyState.historyLines,
      current: this.appStoreRepository.store.imageState.getEntry(),
    };

    project.id = new Guid4().generate();
    project.description = description || 'New Project';
    project.name = name || 'New Project';
    project.state = state;

    this._project = project;
  }
}