import { IGUID4 } from "../types/general";
import { Guid4 } from "../utils/guid4";

export abstract class ControlEvent {
  name: string;
  action: (args?: any) => Event;
}

export class EventAtom implements ControlEvent {
  id: IGUID4;
  name: string;
  action: (args?: any) => Event;
}

export abstract class AbstractEvent {
  eventList: EventAtom[];
  abstract subcribe(event: EventAtom): void;
  abstract dispatch(name: ControlEvent['name'], eventArgs?: any): void;
  abstract applyEvents(baseElement: HTMLDivElement): void;
}

export class EventService implements AbstractEvent {
  eventList: EventAtom[];

  constructor(
    private baseElement: HTMLDivElement
  ) { }

  subcribe(controlEvent: ControlEvent) {
    const eventAtom: EventAtom = {
      id: new Guid4().finite,
      ...controlEvent
    }
    this.eventList.push(eventAtom);
  }
  
  dispatch(name: ControlEvent['name'], eventArgs?: any) {
    const eventAtom = this.eventList.find((event) => event.name === name);
    eventAtom.action(eventArgs);
  }

  applyEvents() {
    this.eventList.forEach((event) => {
      this.baseElement.addEventListener(event.name, event.action);
    });
  }
}