import DrawService from "../services/draw.service";

export type TDrawType = keyof DrawService['options'];

export interface IPainter {
  drawService: DrawService;
  drawType: TDrawType;
  id: string;
};