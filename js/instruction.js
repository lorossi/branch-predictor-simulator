class Instruction {
  constructor(opcode, op1, op2, op3, label, global = null) {
    this._opcode = this._formatOperand(opcode);
    this._op1 = this._formatOperand(op1);
    this._op2 = this._formatOperand(op2);
    this._op3 = this._formatOperand(op3);
    this._label = this._formatOperand(label);

    if (global != null) this._global = [...global];
    else this._global = [];
  }

  /**
   * Matches a section declaration
   * e.g. .text, .global, .bss
   *
   *
   * @param {string} str
   * @returns {Instruction|null}
   * @memberof Instruction
   * @private
   * @static
   *
   */
  static _matchSection(str) {
    const match = /^(\.[a-zA-Z]+)$/.exec(str);
    if (match) return new Instruction(match[1], null, null, null, null);
    return null;
  }

  /**
   * Matches a space reservation
   * e.g. .space 100
   *
   * @param {string} str
   * @returns {Instruction|null}
   * @memberof Instruction
   * @private
   * @static
   */
  static _matchSpace(str) {
    const match = /^([a-zA-Z_0-9]+):\s\.space\s([0-9]+)$/.exec(str);
    if (match) {
      const length = Array(parseInt(match[2])).fill(0);
      return new Instruction(".space", null, null, null, match[1], length);
    }
    return null;
  }

  /**
   * Matches a word declaration
   * e.g. .word 1 2 3 4
   * @param {string} str
   * @returns {Instruction|null}
   * @memberof Instruction
   * @private
   * @static
   */
  static _matchWord(str) {
    const match = /^([a-zA-Z_0-9]+):\s\.word\s(([0-9]+\s*)+)$/.exec(str);
    if (match) {
      const values = match[2].split(" ").map((v) => parseInt(v));
      return new Instruction(".word", null, null, null, match[1], values);
    }
    return null;
  }

  /**
   * Matches a label
   * e.g. main:
   * @param {string} str
   * @returns {Instruction|null}
   * @memberof Instruction
   * @private
   * @static
   */
  static _matchLabel(str) {
    const match = /^([a-zA-Z_0-9]+):\s*$/.exec(str);
    if (match) return new Instruction(null, null, null, null, match[1]);
    return null;
  }

  /**
   * Matches a lw/sw instruction
   * e.g. lw $t0, 0($t1)
   * @param {string} str
   * @returns {Instruction|null}
   * @memberof Instruction
   * @private
   * @static
   */
  static _matchLwSw(str) {
    const match =
      /(lw|sw|LW|SW)\s([$a-zA-Z_0-9]+),\s([0-9]*)?\(([$a-zA-Z0-9]+)\)/.exec(
        str
      );
    if (match) return new Instruction(match[1], match[2], match[3], match[4]);

    return null;
  }

  /**
   * Matches an instruction
   * e.g. addi $t0, $zero 1
   * @param {string} str
   * @returns {Instruction|null}
   * @memberof Instruction
   * @private
   * @static
   */
  static _matchInstruction(str) {
    const matches =
      /(?:([a-zA-Z_0-9]+):\s+)?([a-zA-Z_]+)\s*([$a-zA-Z0-9]+)?,?\s*([$a-zA-Z0-9]+)?,?\s*([$a-zA-Z_0-9]+)?/.exec(
        str
      );

    if (matches) {
      return new Instruction(
        matches[2],
        matches[3],
        matches[4],
        matches[5],
        matches[1]
      );
    }

    return null;
  }

  /**
   * Returns the instruction parsed from a string.
   * If the string is not a valid instruction, an error is thrown.
   *
   * @throws {Error} if the string is not a valid instruction
   * @param {string} str string representation of an instruction
   * @returns {Instruction}
   * @static
   */
  static fromString(str) {
    const methods = [
      Instruction._matchSection,
      Instruction._matchSpace,
      Instruction._matchWord,
      Instruction._matchLabel,
      Instruction._matchLwSw,
      Instruction._matchInstruction,
    ];

    for (const method of methods) {
      const instruction = method(str);
      if (instruction) return instruction;
    }

    throw new Error(`Invalid instruction: ${str}`);
  }

  toString() {
    let str = "";
    if (this._label) str += `${this._label}: `;

    if (this.hasGlobal) {
      switch (this._opcode) {
        case ".word":
          str += `${this._opcode} ${this._global.join(", ")}`;
          break;
        case ".space":
          str += `${this._opcode} ${this._global.length}`;
          break;
      }
    } else if (this._opcode) str += `${this._opcode}`;
    if (this._op1) str += ` ${this._op1},`;
    if (this._op2) str += ` ${this._op2},`;
    if (this._op3) str += ` ${this._op3}`;
    // remove trailing comma
    str = str.replace(/,$/, "");
    return str;
  }

  _formatOperand(operand) {
    if (operand === undefined || operand == null) return null;
    if (!isNaN(operand)) return parseInt(operand);
    return operand.toLowerCase();
  }

  /**
   * Returns the label associated with the instruction.
   */
  get label() {
    return this._label;
  }

  /**
   * Returns the opcode associated with the instruction.
   */
  get opcode() {
    return this._opcode;
  }

  /**
   * Returns the operands associated with the instruction.
   */
  get operands() {
    return [this._op1, this._op2, this._op3];
  }

  /**
   * Returns the global data associated with the instruction.
   * This is only used for .word and .space instructions.
   * @returns {Array}
   */
  get global() {
    return this._global;
  }

  /**
   * Returns true if the instruction is a section declaration.
   * @returns {Boolean}
   */
  get isSection() {
    return (
      this._opcode != null &&
      this._opcode.startsWith(".") &&
      this._global.length == 0
    );
  }

  /**
   * Returns true if the instruction has a label.
   * @returns {Boolean}
   */
  get hasLabel() {
    return this._label != null;
  }

  /**
   * Returns true if the instruction is a label.
   * @returns {Boolean}
   */
  get isLabel() {
    return this._label != null && this._opcode == null;
  }

  /**
   * Returns true if the instruction has global data.
   * @returns {Boolean}
   */
  get hasGlobal() {
    return this._global.length > 0;
  }
}

export { Instruction };
