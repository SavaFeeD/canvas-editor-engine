import { Project, IProjectModule, TProjectModule, TProjectModuleName } from "../types/project";
import { ProjectFileSerializer } from "../utils/project-file-serializer";

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
  private _serializer: ProjectFileSerializer;

  public setSerializer(serializer: ProjectFileSerializer) {
    this._serializer = serializer;
  }

  getProjects(): Project[] {
    return this._serializer.getProjects();
  }

  getProject(projectId: string): Project {
    return this._serializer.getProject(projectId);
  }

  saveProject(project: Project): void {
    return this._serializer.saveProject(project);
  }

  saveProjects(projects: Project[]): void {
    return this._serializer.saveProjects(projects);
  }

  removeProject(projectId: string): void {
    return this._serializer.removeProject(projectId);
  }

  updateProject(project: Project): void {
    return this._serializer.updateProject(project);
  }

}

export default class ProjectsService {
  private _modules: TProjectModule[] = [];
  private _serializer = ProjectFileSerializer;

  constructor() {
    this._addModule('LocalStorage', new LocalStorageProjectModule());
    this._addModule('File', new ProjectFileProjectModule());
  }

  public on(moduleName: TProjectModuleName) {
    const module = this._modules.find((module) => module.name === moduleName);
    if (!module) {
      throw new Error(`Module ${moduleName} not found`);
    }
    return {
      getSerializerInstance: (file: any) => new this._serializer(file),
      instance: module.instance,
    };
  }

  private _addModule(name: TProjectModuleName, module: IProjectModule) {
    this._modules.push({ name, instance: module });
  }
}