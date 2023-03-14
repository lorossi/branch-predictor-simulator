class Instruction {
  constructor(opcode, op1, op2, op3, label) {
    this._opcode = this._formatOperand(opcode);
    this._op1 = this._formatOperand(op1);
    this._op2 = this._formatOperand(op2);
    this._op3 = this._formatOperand(op3);
    this._label = this._formatOperand(label);
  }

  static fromString(str) {
    const label_match = /([a-zA-Z]+):\s*$/.exec(str);
    if (label_match)
      return new Instruction(null, null, null, null, label_match[1]);

    const matches =
      /(([a-zA-Z]+):\s*)?(([a-zA-Z]+))?\s*([$a-zA-Z0-9]+)?(\s+([$a-zA-Z0-9]+))?(\s+([$a-zA-Z0-9]+))?/.exec(
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
    str += `${this._opcode}`;
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
}

export { Instruction };
