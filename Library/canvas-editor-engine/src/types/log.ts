import ComponentService from "../services/component.service";

export interface ILog<A, R, P> {
  components: ILogItem<A>[];
  services: ILogItem<R>[];
  planed: ILogItem<P>[];
};

export interface ILogItem<TLogPrototype> {
  info: ILogItemInfo;
  prototype: TLogPrototype;
};

export interface ILogItemInfo {
  name: string;
  description: string;
};