class Instruction {
  constructor(opcode, op1, op2, op3, label, data = null) {
    this._opcode = this._formatOperand(opcode);
    this._op1 = this._formatOperand(op1);
    this._op2 = this._formatOperand(op2);
    this._op3 = this._formatOperand(op3);
    this._label = this._formatOperand(label);

    if (data != null) this._data = [...data];
    else this._data = [];
  }

  static fromString(str) {
    const section_match = /^(\.[a-zA-Z]+)$/.exec(str);

    if (section_match)
      return new Instruction(section_match[1], null, null, null, null);

    const space_match = /^([a-zA-Z]+):\s\.space\s([0-9]+)$/.exec(str);
    console.log(space_match);
    if (space_match) {
      const values = Array(parseInt(space_match[2])).fill(0);
      return new Instruction(
        ".space",
        null,
        null,
        null,
        space_match[1],
        values
      );
    }

    const word_match = /^([a-zA-Z]+):\s\.word\s(([0-9]+\s*)+)$/.exec(str);
    if (word_match) {
      const values = word_match[2].split(" ").map((v) => parseInt(v));
      return new Instruction(".word", null, null, null, word_match[1], values);
    }

    const label_match = /([a-zA-Z]+):\s*$/.exec(str);
    if (label_match)
      return new Instruction(null, null, null, null, label_match[1]);

    const lw_match =
      /(lw|sw) ([$a-zA-Z0-9]+),\s*([0-9]+)?\(([$a-zA-Z0-9]+)\)/.exec(str);

    if (lw_match)
      return new Instruction(
        lw_match[1],
        lw_match[2],
        lw_match[3],
        lw_match[4]
      );

    const matches =
      /(([a-zA-Z_]+):\s*)?(([a-zA-Z_]+))?\s*(\(?[$a-zA-Z0-9]+\)?)?,?(\s+([$a-zA-Z0-9]+))?,?(\s+([$a-zA-Z0-9]+))?/.exec(
        str
      );

    const label = matches[2];
    const opcode = matches[4];
    const op1 = matches[5];
    const op2 = matches[7];
    const op3 = matches[9];

    return new Instruction(opcode, op1, op2, op3, label);
  }

  toString() {
    let str = "";
    if (this._label) str += `${this._label}: `;

    if (this.hasData) {
      switch (this._opcode) {
        case ".word":
          str += `${this._opcode} ${this._data.join(", ")}`;
          break;
        case ".space":
          str += `${this._opcode} ${this._data.length}`;
          break;
      }
    } else if (this._opcode) str += `${this._opcode}`;
    if (this._op1) str += ` ${this._op1}`;
    if (this._op2) str += ` ${this._op2}`;
    if (this._op3) str += ` ${this._op3}`;
    return str;
  }

  _formatOperand(operand) {
    if (operand === undefined) return null;
    if (!isNaN(operand)) return parseInt(operand);
    return operand.toLowerCase();
  }

  get label() {
    return this._label;
  }

  get opcode() {
    return this._opcode;
  }

  get op1() {
    return this._op1;
  }

  get op2() {
    return this._op2;
  }

  get op3() {
    return this._op3;
  }

  get operators() {
    return [this._op1, this._op2, this._op3];
  }

  get data() {
    return this._data;
  }

  get isSection() {
    return this._opcode && this._opcode[0] === ".";
  }

  get hasLabel() {
    return this._label != null;
  }

  get hasData() {
    return this._data.length > 0;
  }
}

export { Instruction };
