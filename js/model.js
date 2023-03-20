import { CPU } from "./cpu.js";
import { CBP } from "./cbp.js";
import { Instruction } from "./instruction.js";
import { View } from "./view.js";

class Model {
  constructor() {
    this._cpu = new CPU();
    this._view = null;
  }

  /**
   * Set the values of n, k and m.
   * @param {Number} k - number of LSB of the PC used as the address of the BHT
   * @param {Number} n - number of bits used to represent the history
   * @param {Number} m - number of bits in each entry of the BHT
   */
  setCBP(k, n, m) {
    this._cpu.setCBP(k, n, m);
    this.reset();
  }

  /**
   * Reset the CPU.
   */
  reset() {
    this._cpu.reset();
  }

  /**
   *
   * @param {View} view
   */
  setView(view) {
    this._view = view;
  }

  /**
   * Set the code to be executed by the CPU.
   *
   * @param {string[]} code
   */
  setCode(code) {
    const instructions = code
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => Instruction.fromString(line));

    this._cpu.load(instructions);
  }

  /**
   * Run one instruction
   * @returns {boolean} true if the CPU is still running, false otherwise
   */
  runOne() {
    return this._cpu.runOne();
  }

  /**
   *  Run all instructions
   * @returns {boolean} true if the CPU is still running, false otherwise
   */
  runAll() {
    return this._cpu.run();
  }

  /**
   * Get the registers of the CPU.
   *
   * @returns {Array.<string, Number>}
   */
  get registers() {
    return this._cpu.registers;
  }

  /**
   * Get the global variables of the CPU.
   * @returns {Array.<string, Number>}
   */
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

  /**
   * Get the current line of the CPU.
   * @returns {Number}
   * @readonly
   */
  get current_line() {
    return this._cpu.pc;
  }

  /**
   * Get the cbp of the CPU.
   *
   * @returns {CBP}
   */
  get cbp() {
    return this._cpu.cbp;
  }

  /**
   * Get the CPU.
   * @returns {CPU}
   * @readonly
   */
  get cpu() {
    return this._cpu;
  }
}

export { Model };
