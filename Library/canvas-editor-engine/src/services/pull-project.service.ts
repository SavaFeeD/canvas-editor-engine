import AppStore from "../store/store";
import { IUpdateProject, Project } from "../types/project";
import { Guid4 } from "../utils/guid4";
import ThroughHistoryService from "./through-history.service";

export default class PullProjectService {
  private static _project: Project = new Project();

  public static get project(): Project {
    return this._project;
  }

  public static refreshProject() {
    PullProjectService._project = new Project();
  }

  public static updateProject(project: IUpdateProject) {
    Object.keys(project).forEach((key) => {
      PullProjectService._project[key] = project[key];
    });
  }

  public static pull(name: Project['name'], description: Project['description']) {
    const project = new Project();

    const state: Project['state'] = {
      cache: ThroughHistoryService.cache,
      history: AppStore.store.historyState.historyLines,
      current: AppStore.store.imageState.getEntry(),
    };

    project.id = new Guid4().generate();
    project.description = description || 'New Project';
    project.name = name || 'New Project';
    project.state = state;

    this._project = project;
  }
}