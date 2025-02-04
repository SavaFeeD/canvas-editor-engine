import { TestLayers } from "./layers.spec";
import { Test } from "./test-plugin";

class TestsRunner {
  _tests: Test[] = [];

  public addTest<T extends new () => Test>(TestInstance: T) {
    this._tests.push(new TestInstance());
    return this;
  }

  public approve() {
    try {
      this._tests.forEach(test => test.run());
      return true;
    } catch (error) {
      console.error('Test execution failed:', error);
      return false;
    }
  }

  public get tests() {
    return this._tests;
  }
  
  public get testsCount() {
    return this._tests.length;
  }
}

new TestsRunner()
  .addTest(TestLayers)
  .approve();