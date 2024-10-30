import { ILog, ILogItem, ILogItemInfo } from "../types/log";
import ComponentService from "./component.service";

export default class LoggerService {
  public static log: ILog<ComponentService, any, any> = {
    components: [],
    services: [],
    planed: [],
  };

  public static get components() {
    return LoggerService.getMethods('components');
  };

  public static get services() {
    return LoggerService.getMethods('services');
  };

  public static get planed() {
    return LoggerService.getMethods('planed');
  };

  private static getMethods(fields: keyof typeof LoggerService.log) {
    return {
      add<TLogPrototype>(logItem: ILogItem<TLogPrototype>) { 
        LoggerService._add(fields, logItem);
      },
      get<TLogPrototype>(...args: Parameters<typeof LoggerService._get<TLogPrototype>>) {
        LoggerService._get<TLogPrototype>(...args)
      },
    };
  }

  private static _add<TLogPrototype>(
    field: keyof typeof LoggerService.log,
    logItem: ILogItem<TLogPrototype>
  ): void {
    LoggerService.log[field].push(logItem);
  }

  private static _get<TLogPrototype>(
    field: keyof typeof LoggerService.log,
    name: ILogItemInfo['name']
  ): ILogItem<TLogPrototype> {
    return LoggerService.log[field].find((logItem) => logItem.info.name === name);
  }
}