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

    this._registers = new Registers(8, 16);
    this._alu = new ALU(this._registers);
    this._mu = new MU(this._registers);
    this._ju = new JU(this._registers);
    this._sc = new SC(this._registers);

    this._cbp = new CBP(16, 2, 2);
  }

  load(instructions) {
    this._instructions = instructions;
    this.pc = this._findProgramStart();
    this._data = this._findData();
    this._labels = this._findAllLabels();
  }

  run(one = false) {
    while (this.pc < this._instructions.length) {
      this._runInstruction();
      if (one) break;
    }
  }

  _findProgramStart() {
    const index = this._instructions.findIndex((i) => i.opcode === ".text");

    if (index === -1) throw new Error("No .text section found");
    if (index === this._instructions.length - 1)
      throw new Error("No instructions found");

    return index + 1;
  }

  _findData() {
    let data = [];
    let index = this._instructions.findIndex((i) => i.opcode === ".data");

    if (index == -1) return data;

    this._instructions
      .filter((i) => i.hasData)
      .forEach((i) => {
        this._registers.setDataByLabel(i.label, i.data);
      });
  }

  _findAllLabels() {
    let labels = new Map();
    this._instructions.forEach((instruction, i) => {
      if (instruction.hasLabel) {
        labels.set(instruction.label, i);
      }
    });

    return labels;
  }

  _findLabel(label) {
    if (!this._labels.has(label)) throw new Error(`Label ${label} not found`);

    return this._labels.get(label);
  }

  _findDest(instruction) {
    if (instruction.op3 == null) return instruction.op1;
    return instruction.op3;
  }

  _runInstruction() {
    const instruction = this._instructions[this.pc];
    const opcode = instruction.opcode;
    const [op1, op2, op3] = instruction.operators;

    console.log(instruction.toString());

    if (opcode === "nop") {
      // no operation
      this._registers.inc("$pc");
    } else if (this._alu.operations.includes(opcode)) {
      // arithmetic and logic operations
      this._alu.run(opcode, op1, op2, op3);
      this._registers.inc("$pc");
    } else if (this._mu.operations.includes(opcode)) {
      // memory operations
      this._mu.run(opcode, op1, op2, op3);
      this._registers.inc("$pc");
    } else if (this._sc.operations.includes(opcode)) {
      // system calls
      this._sc.run(opcode, op1, op2, op3);
      this._registers.inc("$pc");
    } else if (this._ju.operations.includes(opcode)) {
      // jumps
      const prediction = this._cbp.predict(this.pc);
      const jump = this._ju.run(opcode, op1, op2, op3);
      if (jump) {
        const dest = this._findDest(instruction);
        this._registers.set("$pc", this._findLabel(dest));
      } else {
        this._registers.inc("$pc");
      }

      console.log(`PC: ${this.pc} Prediction: ${prediction}, Actual: ${jump}`);

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

  get pc() {
    return this._registers.get("$pc");
  }

  set pc(value) {
    this._registers.set("$pc", value);
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
