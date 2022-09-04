export class Memory {

  private static memory: Memory;

  private data: { [key: string]: any } = {};

  private constructor() {}

  static getMemory(): Memory {
    if (!Memory.memory) {
      Memory.memory = new Memory();
    }

    return Memory.memory;
  }

  setValue(key: string, value: any) {
    this.data[key] = value;
  }

  getValue(key: string) {
    return this.data[key];
  }

  getData(): { [key: string]: any } {
    return this.data;
  }
}