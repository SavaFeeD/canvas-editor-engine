import { IGUID4 } from "../types/general";
import { Guid4 } from "../utils/guid4";

export abstract class ControlEvent {
  name: string;
  action: (args?: any) => any;
}

export class EventAtom implements ControlEvent {
  id: IGUID4;
  name: string;
  action: (args?: any) => any;
}

export default class EventService {
  public static eventList: EventAtom[] = [];

  public static subcribe(controlEvent: ControlEvent) {
    const eventAtom: EventAtom = {
      id: new Guid4().generate(),
      ...controlEvent
    }
    EventService.eventList.push(eventAtom);
  }
  
  public static dispatch(name: ControlEvent['name'], eventArgs?: any) {
    const eventAtom = EventService.eventList.find((event) => event.name === name);
    eventAtom.action(eventArgs);
  }

  public static applyEvents(baseElement: HTMLDivElement) {
    EventService.eventList?.forEach((event) => {
      baseElement.addEventListener(event.name, event.action);
    });
  }
}