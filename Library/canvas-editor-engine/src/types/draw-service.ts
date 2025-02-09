import DrawService from "../services/draw.service";
import Painter from "../utils/painter";
import { IDrawImageArgs, IFilterOptions } from "./image";

export type TDrawType = keyof DrawService['options'];

export interface ICreatePainter {
  drawService: DrawService;
  drawType: TDrawType;
  id: string;
  name: string;
  order?: number;
};

export interface IPutPainter {
  name?: Painter['name'];
  order?: Painter['order'];
}

export interface ISmoothFilterOptions {
  useStore: boolean;
  options: IDrawImageArgs;
  filterOptions: IFilterOptions;
}