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
  }

  runOne() {
    this._cpu.runOne();
    this._view.setActiveLine(this._cpu.pc);
  }

  get registers() {
    return this._cpu.registers;
  }

  get memory() {
    const entries = [...this._cpu.memory["addr"].entries()];
    const values = [...this._cpu.memory["data"]];
    const out = {};

    for (let i = 0; i < entries.length; i++) {
      const start = entries[i][1];
      const end = i < entries.length - 1 ? entries[i + 1][1] : values.length;

      out[entries[i][0]] = values.slice(start, end);
    }

    return out;
  }
}

export { Model };
