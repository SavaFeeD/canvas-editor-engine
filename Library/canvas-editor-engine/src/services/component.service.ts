import { reflect } from "../utils/reflect";
reflect();

import { IWrapOptions } from "../types/general";

export default class ComponentService {
  protected getTemplate(template: string, wrapOptions?: IWrapOptions): HTMLElement | null {
    const options: IWrapOptions = {
      tag: 'div',
    };

    if (!!wrapOptions) {
      Object.keys(wrapOptions).forEach((key) => {
        if (!!wrapOptions[key]) {
          options[key] = wrapOptions[key];
        }
      });
    }

    const wrap = document.createElement(options.tag);

    if (!!options) {
      Object.keys(options).forEach((key) => {
        if (!!options[key] && key !== 'tag') {
          wrap[key] = options[key];
        }
      });
    }

    if (!!template) {
      wrap.innerHTML = template;
    }
    
    return wrap;
  }

  protected getStyle(css: string): HTMLStyleElement | null {
    if (!!css === false) return null; 
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    return style;
  }
}