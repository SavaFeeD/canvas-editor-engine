export abstract class Test {
  public abstract run(): void;
}

export function describe(name: string, callback: () => void) {
  console.log('Module: ', name);
  callback();
}

export function test(name: string, callback: () => void) {
  console.log('Test: ', name);
  callback();
}

export function expect(value: any) {
  return {
    toBe(expected: any) {
      if (value === expected) {
        console.log('Passed');
      } else {
        console.log('Failed');
      }
    }
  }
}