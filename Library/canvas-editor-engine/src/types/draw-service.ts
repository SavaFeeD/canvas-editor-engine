import DrawService from "../services/draw.service";
import { IDrawImageArgs, IFilterOptions } from "./image";

export type TDrawType = keyof DrawService['options'];

export interface IPainter {
  drawService: DrawService;
  drawType: TDrawType;
  id: string;
  name: string;
};

export interface IPutPainter {
  name?: string;
}

export interface ISmoothFilterOptions {
  useStore: boolean;
  options: IDrawImageArgs;
  filterOptions: IFilterOptions;
}