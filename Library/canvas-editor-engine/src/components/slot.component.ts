import ComponentService from "../services/component.service";

export default class SlotComponent extends ComponentService {
  private static template: string = `
    <slot class="slot"></slot>
  `;

  private static css: string = ``;

  public static slot: HTMLSlotElement;

  public static getComponent(slotName: string) {
    const wrapOptions = {
      className: 'slot-wrapper',
    };
    const slotTemplate = SlotComponent.getTemplate(SlotComponent.template, wrapOptions);

    const slotStyle = SlotComponent.getStyle(SlotComponent.css);

    SlotComponent.slot = slotTemplate.querySelector('slot');
    SlotComponent.slot.name = slotName;

    return { slotTemplate, slotStyle };
  }
}