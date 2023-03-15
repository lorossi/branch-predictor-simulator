import { CPU } from "./cpu.js";
import { Instruction } from "./instruction.js";

class Model {
  constructor() {
    this._cpu = new CPU();
    this._view = null;
  }

  setView(view) {
    this._view = view;
  }

  setCode(code) {
    const instructions = code
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => Instruction.fromString(line));

    this._cpu.load(instructions);
    console.log(instructions);
  }

  run() {
    this._cpu.run();
    console.log(this._cpu.registers);
  }
}

export { Model };
