import { IGUID4 } from "../types/general";

export class Guid4 {
  stack: IGUID4[] = [];
  guid4: IGUID4;

  constructor() {
    // generateWithFactor not working
    // this.generateWithFactor(this.attempt);
  }

  public generate() {
    return this.Guid4;
  }

  public get finite(): IGUID4 { // not working
    const guid4 = this.stack[this.stack?.length];
    if (!!guid4) {
      return guid4;
    } else {
      throw new Error("Guid4 not generate");
    }
  };

  private generateWithFactor(attempt: GenerateAttempt) { // not working
    const factor = this.getFactor(this.guid4);
    attempt.use('withError').run(factor);
  }

  private getFactor(guid4: IGUID4) {
    return (attempt: IAttemptConfig) => {
      guid4 = this.Guid4;
      if (!this.stack.includes(guid4)) {
        attempt.current = attempt.max;
        this.stack.push(guid4);
      }
    }
  }

  private get attempt(): GenerateAttempt {
    const attemptConfig = {
      attempt: {
        current: 1,
        max: 5,
      },
      error: {
        message: '[Fatal Error] Guid4 module cannot generate unique guid4'
      }
    };

    const attempt = new GenerateAttempt(
      attemptConfig.attempt,
      attemptConfig.error
    );

    return attempt;
  }

  private get Guid4(): IGUID4 {
    const base = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    const regex = /[xy]/g;
    const guid4 = base.replace(regex, this.formating);
    return guid4 as IGUID4;
  }

  private formating(char: string) {
    const preformer = Math.random() * 16 | 0;
    const formattedChar = (char == 'x') ? preformer : (preformer & 0x3 | 0x8);
    return formattedChar.toString(16);
  }
}

interface IAttemptConfig {
  current: number,
  max: number,
}

interface IErrorConfig {
  message: string,
};

class GenerateAttempt {
  private _attempt: IAttemptConfig;
  private _error: IErrorConfig | undefined;

  constructor(config: IAttemptConfig, error?: IErrorConfig) {
    this._attempt = config;
    if (!!error) this._error = error;
  }

  public use(strategy: 'default' | 'withError' = 'default') {
    const context = this;
    switch(strategy) {
      case 'default':
        return {
          run(action: (config: IAttemptConfig) => void) {
            context.defaultRun(action);
          },
        };
      case 'withError':
        return {
          run(action: (config: IAttemptConfig) => void) {
            context.withErrorRun(action);
          },
        };
    }
  }

  private defaultRun(action: (config: IAttemptConfig) => void) {
    const attemptCondition = this._attempt.current <= this._attempt.max;
    
    while(attemptCondition) {
      action(this._attempt);
      this._attempt.current++;
    }
  }

  private withErrorRun(action: (config: IAttemptConfig) => void) {
    const attemptCondition = this._attempt.current <= this._attempt.max;
    const errorCondition = this._attempt.current === this._attempt.max;
    const errorMessage = this._error.message;

    while(attemptCondition) {
      this.throwError(errorCondition, errorMessage);
      action(this._attempt);
      this._attempt.current++;
    }
  }

  throwError(condition: boolean, message: string) {
    if (condition) {
      throw new Error(message);
    }
  }
}