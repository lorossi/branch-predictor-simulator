import { Registers, ALU, MU, JU } from "./component.js";
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

    this._cbp = new CBP(16, 2, 2);
  }

  load(instructions) {
    this._instructions = instructions;
    this._labels = this._findAllLabels();
  }

  run(one = false) {
    while (this.pc < this._instructions.length) {
      this._runInstruction();
      if (one) break;
    }
  }

  _findAllLabels() {
    let labels = new Map();
    this._instructions.forEach((instruction, i) => {
      if (instruction.label != undefined) {
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
    if (opcode === "NOP") {
      this._registers.inc("PC");
    } else if (this._alu.operations.includes(opcode)) {
      this._alu.run(opcode, op1, op2, op3);
      this._registers.inc("PC");
    } else if (this._mu.operations.includes(opcode)) {
      this._mu.run(opcode, op1, op2, op3);
      this._registers.inc("PC");
    } else if (this._ju.operations.includes(opcode)) {
      const prediction = this._cbp.predict(this.pc);

      const jump = this._ju.run(opcode, op1, op2, op3);
      if (jump) {
        const dest = this._findDest(instruction);
        this._registers.set("PC", this._findLabel(dest));
      } else {
        this._registers.inc("PC");
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
    return this._registers.get("PC");
  }

  get isa() {
    return this._alu.operations
      .concat(this._mu.operations)
      .concat(this._ju.operations);
  }
}

export { CPU };
