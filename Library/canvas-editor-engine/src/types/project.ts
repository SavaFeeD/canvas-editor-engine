import { IHistoryLine } from "./history";
import { IImageLoggingData } from "./image";

export class Project {
  id: string = null;
  name: string = null;
  description: string = null;
  state: {
    current: IImageLoggingData,
    history: IHistoryLine[],
    cache: IHistoryLine[],
  } = null;
  createdAt: string = new Date(Date.now()).toString();
  updatedAt: string = new Date(Date.now()).toString();
};

export interface IUpdateProject {
  id?: string;
  name?: string;
  description?: string;
  state?: {
    current: IImageLoggingData,
    history: IHistoryLine[],
    cache: IHistoryLine[],
  };
  updatedAt?: string;
}

export interface IProjectModule {
  getProjects(): Project[];
  getProject(projectId: string): Project;
  saveProjects(projects: Project[]): void;
  saveProject(project: Project): void;
  removeProject(projectId: string): void;
  updateProject(project: Project): void;
};

export type TProjectModule = {
  name: string,
  instance: IProjectModule
};

export type TProjectModuleName = 'LocalStorage' | 'File';