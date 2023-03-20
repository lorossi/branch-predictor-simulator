import { CPU } from "./cpu.js";
import { Instruction } from "./instruction.js";

class Model {
  constructor() {
    this._cpu = new CPU();
    this._view = null;
  }

  reset() {
    this._cpu.reset();
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
  }

  runOne() {
    this._cpu.runOne();
  }

  get registers() {
    return this._cpu.registers;
  }

  get global() {
    const entries = [...this._cpu.global["addr"].entries()];
    const values = [...this._cpu.global["global"]];
    const out = {};

    for (let i = 0; i < entries.length; i++) {
      const start = entries[i][1];
      const end = i < entries.length - 1 ? entries[i + 1][1] : values.length;

      out[entries[i][0]] = values.slice(start, end);
    }

    return out;
  }

  get current_line() {
    return this._cpu.pc;
  }

  get registers() {
    return this._cpu.registers;
  }

  get cbp() {
    return this._cpu.cbp;
  }
}

export { Model };
