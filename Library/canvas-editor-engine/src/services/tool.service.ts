import CanvasComponent from "../components/canvas.component";
import { ITool } from "../types/general";

export default class ToolService {
  public static before: ITool | null = null;
  public static active: ITool | null = null;
  public static registry: ITool[] = [];

  public static add(tool: ITool) {
    const hasRegisteredTool = ToolService.registry.find((registeredTool) => registeredTool.id === tool.id);
    if (hasRegisteredTool) {
      console.warn('Tool has been previously registered!');
      return false;
    }

    ToolService.registry.push(tool);
    return true;
  }

  public static setActive(id: ITool['id']) {
    if (ToolService.active?.id === id) return console.warn('Tool is already active');

    if (!!ToolService.active?.offAction) {
      ToolService.active.offAction();
    }

    const registeredTool = ToolService.registry.find((registeredTool) => registeredTool.id === id);

    if (!!registeredTool) {
      ToolService.active = registeredTool;
      if (!!ToolService.active?.onAction) {
        ToolService.active.onAction();
      }
    } else {
      console.warn('Tool has not previously been registered with this identifier');
    }
  }

  public static offActive(id?: ITool['id']) {
    if (!!id) {
      if (ToolService.active.id === id) {
        ToolService.off();
      } else {
        return console.warn(`ID active tool is not "${id}"`);
      }
    } else {
      ToolService.off();
    }
  }

  private static off() {
    if (!!ToolService.active?.offAction) {
      ToolService.active.offAction();
    }
    ToolService.before = ToolService.active; 
    ToolService.active = null;
    CanvasComponent.cursorStyle = 'default';
  }
}