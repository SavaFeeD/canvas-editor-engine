import ComponentService from "../services/component.service";
import LoggerService from "../services/logger.service";

export default class SlotComponent extends ComponentService {

  constructor(
    private loggerService: LoggerService,
  ) {
    super();

    this.loggerService.components.add({
      info: {
        name: 'slot', 
        description: 'slot component', 
      },
      prototype: this,
    });
  }

  private template: string = `
    <slot class="slot"></slot>
  `;

  private css: string = ``;

  public slot: HTMLSlotElement;

  public getComponent(slotName: string) {
    const wrapOptions = {
      className: 'slot-wrapper',
    };
    const slotTemplate = this.getTemplate(this.template, wrapOptions);

    const slotStyle = this.getStyle(this.css);

    this.slot = slotTemplate.querySelector('slot');
    this.slot.name = slotName;

    return { slotTemplate, slotStyle };
  }
}