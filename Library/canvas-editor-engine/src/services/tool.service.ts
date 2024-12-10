import CanvasComponent from "../components/canvas.component";
import { ITool } from "../types/general";

export default class ToolService {
  public before: ITool | null = null;
  public active: ITool | null = null;
  public registry: ITool[] = [];

  constructor(private canvasComponent: CanvasComponent) {}

  public add(tool: ITool) {
    const hasRegisteredTool = this.registry.find((registeredTool) => registeredTool.id === tool.id);
    if (hasRegisteredTool) {
      console.warn('Tool has been previously registered!');
      return false;
    }

    this.registry.push(tool);
    return true;
  }

  public setActive(id: ITool['id']) {
    if (this.active?.id === id) return console.warn('Tool is already active');

    if (!!this.active?.offAction) {
      this.active.offAction();
    }

    const registeredTool = this.registry.find((registeredTool) => registeredTool.id === id);

    if (!!registeredTool) {
      this.active = registeredTool;
      if (!!this.active?.onAction) {
        this.active.onAction();
      }
    } else {
      console.warn('Tool has not previously been registered with this identifier');
    }
  }

  public offActive(id?: ITool['id']) {
    if (!!id) {
      if (this.active.id === id) {
        this.off();
      } else {
        return console.warn(`ID active tool is not "${id}"`);
      }
    } else {
      this.off();
    }
  }

  private off() {
    if (!!this.active?.offAction) {
      this.active.offAction();
    }
    this.before = this.active; 
    this.active = null;
    this.canvasComponent.cursorStyle = 'default';
  }
}