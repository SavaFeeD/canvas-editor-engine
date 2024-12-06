import AppStore from "../store/store";
import { Project, IProjectModule, TProjectModule, TProjectModuleName } from "../types/project";
import { Guid4 } from "../utils/guid4";
import { ProjectFileSerializer } from "../utils/project-file-serializer";
import ThroughHistoryService from "./through-history.service";


class LocalStorageProjectModule implements IProjectModule {
  projectsKey: string = 'cee-projects';

  private getProjectsFromLocalStorage(): Project[] {
    const projects = localStorage.getItem(this.projectsKey);
    return projects ? JSON.parse(projects) : [];
  }
  
  private getProjectFromLocalStorage(projectId: string): Project {
    const projects = this.getProjectsFromLocalStorage();
    return projects.find((project: Project) => project.id === projectId);
  }

  private saveProjectsToLocalStorage(projects: Project[]) {
    localStorage.setItem(this.projectsKey, JSON.stringify(projects));
  }

  private saveProjectToLocalStorage(project: Project) {
    const projects = this.getProjectsFromLocalStorage();
    projects.push(project);
    localStorage.setItem(this.projectsKey, JSON.stringify(projects));
  }

  private removeProjectFromLocalStorage(projectId: string) {
    const projects = this.getProjectsFromLocalStorage();
    const index = projects.findIndex((project: Project) => project.id === projectId);
    projects.splice(index, 1);
    localStorage.setItem(this.projectsKey, JSON.stringify(projects));
  }

  private updateProjectInLocalStorage(project: Project) {
    const projects = this.getProjectsFromLocalStorage();
    const index = projects.findIndex((p: Project) => p.id === project.id);
    projects[index] = project;
    localStorage.setItem(this.projectsKey, JSON.stringify(projects));
  }

  getProjects() {
    return this.getProjectsFromLocalStorage();
  }

  getProject(projectId: string) {
    return this.getProjectFromLocalStorage(projectId);
  }

  saveProjects(projects: Project[]): void {
    this.saveProjectsToLocalStorage(projects);
  }

  saveProject(project: Project): void {
    this.saveProjectToLocalStorage(project);
  }

  removeProject(projectId: string): void {
    this.removeProjectFromLocalStorage(projectId);
  }

  updateProject(project: Project): void {
    this.updateProjectInLocalStorage(project);
  }

}

class ProjectFileProjectModule implements IProjectModule {
  private static _serializer: ProjectFileSerializer;

  public static setSerializer(serializer: ProjectFileSerializer) {
    ProjectFileProjectModule._serializer = serializer;
  }

  getProjects(): Project[] {
    return ProjectFileProjectModule._serializer.getProjects();
  }

  getProject(projectId: string): Project {
    return ProjectFileProjectModule._serializer.getProject(projectId);
  }

  saveProject(project: Project): void {
    return ProjectFileProjectModule._serializer.saveProject(project);
  }

  saveProjects(projects: Project[]): void {
    return ProjectFileProjectModule._serializer.saveProjects(projects);
  }

  removeProject(projectId: string): void {
    return ProjectFileProjectModule._serializer.removeProject(projectId);
  }

  updateProject(project: Project): void {
    return ProjectFileProjectModule._serializer.updateProject(project);
  }

}

export default class ProjectsService {
  private static _modules: TProjectModule[] = [];
  private static _serializer = ProjectFileSerializer;


  public static on(moduleName: TProjectModuleName) {
    const module = ProjectsService._modules.find((module) => module.name === moduleName);
    if (!module) {
      throw new Error(`Module ${moduleName} not found`);
    }
    return {
      getSerializerInstance: (file: any) => new ProjectsService._serializer(file),
      instance: module.instance,
    };
  }

  static {
    ProjectsService._addModule('LocalStorage', new LocalStorageProjectModule());
    ProjectsService._addModule('File', new ProjectFileProjectModule());
  }

  private static _addModule(name: TProjectModuleName, module: IProjectModule) {
    ProjectsService._modules.push({ name, instance: module });
  }
}