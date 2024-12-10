import { ILog, ILogItem, ILogItemInfo } from "../types/log";
import ComponentService from "./component.service";

export default class LoggerService {
  public log: ILog<ComponentService, any, any> = {
    components: [],
    services: [],
    planed: [],
  };

  public get components() {
    return this.getMethods('components');
  };

  public get services() {
    return this.getMethods('services');
  };

  public get planed() {
    return this.getMethods('planed');
  };

  private getMethods(fields: keyof typeof this.log) {
    const proto = this;
    return {
      add<TLogPrototype>(logItem: ILogItem<TLogPrototype>) { 
        proto._add(fields, logItem);
      },
      get<TLogPrototype>(...args: Parameters<typeof proto._get<TLogPrototype>>) {
        proto._get<TLogPrototype>(...args);
      },
    };
  }

  private _add<TLogPrototype>(
    field: any, // keyof typeof this.log
    logItem: ILogItem<TLogPrototype>
  ): void {
    this.log[field].push(logItem);
  }

  private _get<TLogPrototype>(
    field: keyof typeof this.log,
    name: ILogItemInfo['name']
  ): ILogItem<TLogPrototype> {
    return this.log[field].find((logItem) => logItem.info.name === name);
  }
}