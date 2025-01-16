import { IImageState } from "../store/image.state";
import { ISize } from "../types/general";
import { IImageLoggingData } from "../types/image";
import { Project } from "../types/project";

export class ProjectFileSerializer {
  private file: any;
  private projects: Project[] = [];

  constructor(file: any) {
    this.file = file;
    this.projects = this.load();
  };

  private load(): Project[] {
    const rowProjects = JSON.parse(this.file) as Project[];

    const imageDataProcessor = (temp: {current?: IImageLoggingData, state?: IImageState}) => {
      let data: number[];
      let size: ISize;

      if (temp?.current) {
        data = Object.values(temp?.current.imageData.data);
        size = temp?.current.size;
      } else if (temp?.state) {
        data = Object.values(temp?.state.tempImageData.data);
        size = temp?.state.size;
      }

      const tempImageData = new ImageData(size.width, size.height);

      data.forEach((colorAtom, index) => {
        tempImageData.data[index] = colorAtom;
      });

      return tempImageData;
    };

    const projects = rowProjects.map((project) => {
      project.state.current.imageData = imageDataProcessor({ current: project.state.current });

      project.state.history = project.state.history.map((historyLine) => {
        historyLine.stateValue.tempImageData = imageDataProcessor({ state: historyLine.stateValue });
        return historyLine;
      });

      project.state.cache = project.state.cache.map((historyLine) => {
        historyLine.stateValue.tempImageData = imageDataProcessor({ state: historyLine.stateValue });
        return historyLine;
      });

      return project;
    });

    return projects;
  }

  public saveProjects(projects: Project[]) {
    // TODO: not sure if this works
    this.file.save(JSON.stringify(projects));
  }

  public getProjects(): Project[] {
    return this.projects;
  }

  public getProject(projectId: string): Project {
    return this.projects.find((project) => project.id === projectId);
  }

  public saveProject(project: Project) {
    const index = this.projects.findIndex((p) => p.id === project.id);
    if (index !== -1) {
      this.projects[index] = project;
    } else {
      this.projects.push(project);
    }
    this.saveProjects(this.projects);
  }

  public removeProject(projectId: string) {
    const index = this.projects.findIndex((p) => p.id === projectId);
    if (index !== -1) {
      this.projects.splice(index, 1);
      this.saveProjects(this.projects);
    }
  }

  public updateProject(project: Project) {
    const index = this.projects.findIndex((p) => p.id === project.id);
    if (index !== -1) {
      this.projects[index] = project;
      this.saveProjects(this.projects);
    }
  }
}