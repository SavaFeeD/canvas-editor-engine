import type { TByteRGBColor } from "../types/image";
import type { THEXColor } from "../types/general";

export class Convert {
  public static byteRGBToHEX(color: TByteRGBColor): THEXColor {
    const red = color[0];
    const green = color[1];
    const blue = color[2];

    return Convert.rgbToHex(red, green, blue);
  }

  public static rgbToHex(r: number, g: number, b: number): THEXColor {
    return `#${Convert.componentToHEX(r)}${Convert.componentToHEX(g)}${Convert.componentToHEX(b)}`;
  }

  public static hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private static componentToHEX(colorComponent: number): string {
    const hex = colorComponent.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }
}