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

    this._last_prediction = null;
    this._last_outcome = null;
    this._last_branch_address = null;

    this._cbp = new CBP(4, 2, 2);
  }

  /**
   * Load the instructions into the CPU.
   *
   * @param {Array<Instruction>} instructions
   */
  load(instructions) {
    this._instructions = instructions;
    // find the start of the program
    this._program_start = this._findProgramStart();
    // set the program counter to the start of the program
    this.pc = 0;
    // find all the labels in the program
    this._labels = this._findAllLabels();
  }

  /**
   * Reset the CPU.
   */
  reset() {
    this._registers.reset();
    this._cbp.reset();
  }

  /**
   * Run the program.
   * @returns {boolean} true if the program ran to completion, false otherwise
   */
  run() {
    while (this.pc < this._instructions.length) this._runInstruction();
    return true;
  }

  /**
   * Run one instruction.
   *
   * @returns {boolean} true if the program ran to completion, false otherwise
   */
  runOne() {
    if (this.pc >= this._instructions.length) return false;

    this._runInstruction();
    return true;
  }

  /**
   * Return the first line of the program.
   *
   * @returns {number} the first line of the program
   * @throws {Error} if no .text section is found
   * @throws {Error} if no instructions are found
   * @private
   */
  _findProgramStart() {
    const index = this._instructions.findIndex((i) => i.opcode === ".text");

    if (index === -1) throw new Error("No .text section found");
    if (index === this._instructions.length - 1)
      throw new Error("No instructions found");

    return index + 1;
  }

  /**
   * Find all the labels in the program.
   *
   * @returns {Map<string, number>} a map of labels to their addresses
   * @private
   */
  _findAllLabels() {
    let labels = new Map();
    this._instructions.forEach((i, x) => {
      if (i.hasLabel) labels.set(i.label, x);
    });

    return labels;
  }

  /**
   * Find the address of a label.
   * @param {string} label
   * @returns {number} the address of the label
   * @throws {Error} if the label is not found
   * @private
   */
  _findLabel(label) {
    if (!this._labels.has(label)) throw new Error(`Label ${label} not found`);
    return this._labels.get(label);
  }

  /**
   * Run one instruction.
   * @private
   * @throws {Error} if the instruction is not recognized
   * @throws {Error} if the instruction is not implemented
   */
  _runInstruction() {
    const instruction = this._instructions[this.pc];
    const opcode = instruction.opcode;
    const [op1, op2, op3] = instruction.operands;

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
      const outcome = this._ju.run(opcode, op1, op2, op3);

      if (outcome) {
        const dest_label = op3 == null ? op1 : op3;
        const dest_addr = this._findLabel(dest_label);
        this.pc = dest_addr;
      } else {
        this.pc++;
      }

      this._last_prediction = prediction;
      this._last_outcome = outcome;
      this._last_branch_address = this.pc;

      this._cbp.update(this.pc, outcome);
    } else {
      throw new Error(`Operation ${opcode} not found`);
    }
  }

  /**
   * Get the accuracy of the branch predictor.
   * @returns {number} the accuracy of the branch predictor
   * @readonly
   */
  get accuracy() {
    return this._cbp.accuracy;
  }

  /**
   * Get the contents of the registers.
   * @returns {Map<string, number>} the contents of the registers
   * @readonly
   */
  get registers() {
    return this._registers.registers;
  }

  /**
   * Get the contents of the global memory.
   * @returns {Map<string, number>} the contents of the global memory
   * @readonly
   */
  get global() {
    return this._registers.global;
  }

  /**
   * Get the program counter.
   * @returns {number} the program counter
   */
  get pc() {
    return this._registers.get("$pc");
  }

  /**
   * Set the program counter.
   * @param {number} value
   */
  set pc(value) {
    this._registers.set("$pc", value);
  }

  /**
   * Get the current instruction.
   * @returns {Instruction} the current instruction
   * @readonly
   */
  get currentInstruction() {
    return this._instructions[this.pc];
  }

  /**
   * Get the branch predictor.
   * @returns {CBP} the branch predictor
   * @readonly
   */
  get cbp() {
    return this._cbp;
  }

  /**
   * Get the instruction set architecture of the CPU.
   * @returns {string[]} the instruction set architecture of the CPU
   * @readonly
   */
  get isa() {
    return this._alu.operations
      .concat(this._mu.operations)
      .concat(this._ju.operations)
      .concat(this._sc.operations)
      .concat(["NOP"]);
  }

  /**
   * Get the last prediction of the branch predictor.
   * @returns {boolean} the last prediction of the branch predictor
   * @readonly
   */
  get last_prediction() {
    return this._last_prediction;
  }

  /**
   * Get the last outcome of a branch.
   * @returns {boolean} true if the branch was taken, false otherwise
   * @readonly
   */
  get last_outcome() {
    return this._last_outcome;
  }

  /**
   * Get the address of the last branch.
   * @returns {number} the address of the last branch
   * @readonly
   */
  get last_branch_address() {
    return this._last_branch_address;
  }
}

export { CPU };
