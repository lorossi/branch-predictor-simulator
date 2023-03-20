import { Registers, ALU, MU, JU, SC } from "./component.js";
import { CBP } from "./cbp.js";

/**
 * @class CPU
 *
 * @description
 * This class represents the CPU of the simulated machine.
 */
class CPU {
  constructor() {
    this._instructions = [];

    this._registers = new Registers();
    this._alu = new ALU(this._registers);
    this._mu = new MU(this._registers);
    this._ju = new JU(this._registers);
    this._sc = new SC(this._registers);

    this._cbp = new CBP(4, 2, 2);
  }

  load(instructions) {
    this._instructions = instructions;
    // find the start of the program
    this._program_start = this._findProgramStart();
    // set the program counter to the start of the program
    this.pc = 0;
    // find all the labels in the program
    this._labels = this._findAllLabels();
  }

  run() {
    while (this.pc < this._instructions.length) this._runInstruction();
    return true;
  }

  runOne() {
    if (this.pc >= this._instructions.length) return false;

    this._runInstruction();
    return true;
  }

  _findProgramStart() {
    const index = this._instructions.findIndex((i) => i.opcode === ".text");

    if (index === -1) throw new Error("No .text section found");
    if (index === this._instructions.length - 1)
      throw new Error("No instructions found");

    return index + 1;
  }

  _findAllLabels() {
    let labels = new Map();
    this._instructions.forEach((i, x) => {
      if (i.hasLabel) {
        labels.set(i.label, x);
      }
    });

    return labels;
  }

  _findLabel(label) {
    if (!this._labels.has(label)) throw new Error(`Label ${label} not found`);
    return this._labels.get(label);
  }

  _runInstruction() {
    const instruction = this._instructions[this.pc];
    const opcode = instruction.opcode;
    const [op1, op2, op3] = instruction.operators;

    if (opcode === "nop" || instruction.isSection || instruction.isLabel) {
      // no operation
      this.pc++;
    } else if (instruction.hasGlobal) {
      // global or space
      this._registers.setGlobalByLabel(instruction.label, instruction.global);
      this.pc++;
    } else if (this._alu.operations.includes(opcode)) {
      // arithmetic and logic operations
      this._alu.run(opcode, op1, op2, op3);
      this.pc++;
    } else if (this._mu.operations.includes(opcode)) {
      // memory operations
      this._mu.run(opcode, op1, op2, op3);
      this.pc++;
    } else if (this._sc.operations.includes(opcode)) {
      // system calls
      this._sc.run(opcode, op1, op2, op3);
      this.pc++;
    } else if (this._ju.operations.includes(opcode)) {
      // jumps
      const prediction = this._cbp.predict(this.pc);
      const jump = this._ju.run(opcode, op1, op2, op3);

      if (jump) {
        const dest_label = op3 == null ? op1 : op3;
        const dest_addr = this._findLabel(dest_label);
        this.pc = dest_addr;
      } else {
        this.pc++;
      }

      console.log(
        `PC: ${this.pc}, BHT: ${this._cbp.activeBHT}, Prediction: ${prediction}, Actual: ${jump}`
      );

      this._cbp.update(this.pc, jump);
    } else {
      throw new Error(`Operation ${opcode} not found`);
    }
  }

  get accuracy() {
    return this._cbp.accuracy;
  }

  get registers() {
    return this._registers.registers;
  }

  get global() {
    return this._registers.global;
  }

  get pc() {
    return this._registers.get("$pc");
  }

  set pc(value) {
    this._registers.set("$pc", value);
  }

  get currentInstruction() {
    return this._instructions[this.pc];
  }

  get cbp() {
    return this._cbp;
  }

  get isa() {
    return this._alu.operations
      .concat(this._mu.operations)
      .concat(this._ju.operations)
      .concat(this._sc.operations)
      .concat(["NOP"]);
  }
}

export { CPU };
