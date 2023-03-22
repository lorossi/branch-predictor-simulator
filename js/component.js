/**
 * @class Registers
 *
 * @param {Number} n - Size of of registers
 *
 * @description
 * This class represents the registers of the CPU.
 * Each register is a n-bit integer.
 *
 */
class Registers {
  constructor(n = 32) {
    if (n < 0) throw new Error("Size of registers cannot be negative");
    if (n > 64) throw new Error("Size of registers cannot be greater than 32");

    this._n = n;
    this._max_val = 2 ** (n - 1) - 1;
    this._min_val = (-2) ** (n - 1);

    this._addr_increment = Math.floor(n / 8);

    this._registers = new Map();

    this._registers.set("$zero", 0);

    for (let i = 0; i < 2; i++) this._registers.set(`$v${i}`, 0);

    for (let i = 0; i < 4; i++) this._registers.set(`$a${i}`, 0);

    for (let i = 0; i < 8; i++) this._registers.set(`$t${i}`, 0);

    for (let i = 0; i < 8; i++) this._registers.set(`$s${i}`, 0);

    for (let i = 0; i < 2; i++) this._registers.set(`$s${i + 8}`, 0);

    this._registers.set("$ra", 0);
    this._registers.set("$pc", 0);
    this._registers.set("$hi", 0);
    this._registers.set("$lo", 0);

    this._registers.set("global", []);
    this._registers.set("addr", new Map());
  }

  /**
   * Wrap a value to the range of the registers.
   *
   * @param {Number} val
   * @returns {Number}
   */
  _wrap(val) {
    if (val > this._max_val) val %= this._max_val;
    if (val < this._min_val) val %= this._min_val;

    return val;
  }

  /**
   * Increment a register by 1.
   * @param {string} reg - Register to increment
   */
  inc(reg) {
    const v = this._registers.get(reg) + 1;
    this.set(reg, v);
  }

  /**
   * Decrement a register by 1.
   *
   * @param {string} reg - Register to decrement
   * @returns {Number}
   */
  dec(reg) {
    const v = this.get(reg) - 1;
    this.set(reg, v);
  }

  /**
   * Get the value of a register.
   * @param {string} reg - Register to get
   * @returns {Number}
   */
  get(reg) {
    if (!this._registers.has(reg)) throw new Error(`Register ${reg} not found`);

    return this._registers.get(reg);
  }

  /**
   * Set the value of a register.
   *
   * @param {string} reg - Register to set
   * @param {Number} value - Value to set
   * @returns {Number}
   */
  set(reg, value) {
    if (!this._registers.has(reg)) throw new Error(`Register ${reg} not found`);
    if (reg == "$zero") return;

    const v = this._wrap(value);
    this._registers.set(reg, v);
  }

  /**
   * Get the value of a global variable.
   *
   * @param {string} label - Label of the global variable
   * @returns {Number}
   * @throws {Error} If the label is not found
   */
  getGlobalByLabel(label) {
    if (!this._registers.get("addr").has(label))
      throw new Error(`Label ${label} not found`);

    const addr = this._registers.get("addr").get(label);
    return this._registers.get("global")[addr];
  }

  /**
   * Get the value of a global variable.
   *
   * @param {Number} addr - Address of the global variable
   * @returns {Number}
   * @throws {Error} If the address is not found
   */
  getGlobalByAddress(addr) {
    if (addr >= this._registers.get("global").length)
      throw new Error(`Address ${addr} not found`);

    return this._registers.get("global")[addr];
  }

  /**
   * Set the value of a global variable.
   *
   * @param {string} label - Label of the global variable
   * @param {Number} global - Value to set
   * @returns {Number} - Address of the global variable
   */
  setGlobalByLabel(label, global) {
    const addr = this._registers.get("global").length;
    this._registers.get("global").push(...global);
    this._registers.get("addr").set(label, addr);
    return addr;
  }

  /**
   * Set the value of a global variable.
   *
   * @param {Number} addr - Address of the global variable
   * @param {Number} global - Value to set
   * @throws {Error} If the address is not found
   */
  setGlobalByAddress(addr, global) {
    if (addr >= this._registers.get("global").length)
      throw new Error(`Address ${addr} not found`);

    this._registers.get("global")[addr] = global;
  }

  /**
   * Get the address of a global variable.
   *
   * @param {string} label - Label of the global variable
   * @returns {Number}
   * @throws {Error} If the label is not found
   */
  getAddressByLabel(label) {
    if (!this._registers.get("addr").has(label))
      throw new Error(`Label ${label} not found`);

    return this._registers.get("addr").get(label);
  }

  /**
   * Reset the registers to their initial values.
   */
  reset() {
    for (let [key, _] of this._registers) {
      if (key.includes("$") && key != "$zero") this._registers.set(key, 0);
      else if (key == "global") this._registers.set(key, []);
      else if (key == "addr") this._registers.set(key, new Map());
    }
  }

  /**
   * Get the registers.
   * @returns {Map<string, Number>}
   */
  get registers() {
    let registers = {};
    for (let [key, value] of this._registers) {
      if (key.includes("$")) registers[key] = value;
    }
    return registers;
  }

  /**
   * Get the global variables.
   * @returns {Map<string, Number>}
   */
  get global() {
    let registers = {};
    for (let [key, value] of this._registers) {
      if (!key.includes("$")) registers[key] = value;
    }
    return registers;
  }

  /**
   * Get the address increment.
   * Used to increment the address in load and store instructions.
   * @readonly
   * @returns {Number}
   */
  get addr_increment() {
    return this._addr_increment;
  }

  /**
   * Get the program counter.
   * @readonly
   * @returns {Number}
   */
  get pc() {
    return this.get("$pc");
  }
}

/**
 * @class UNIT
 * @abstract
 *
 * @param {Registers} registers - The registers of the CPU
 *
 * @property {Array} operations - Operations supported by the unit
 *
 * @description
 * This class represents a unit of the CPU.
 * It is an abstract class and cannot be instantiated.
 * It is extended by the ALU, MU, JU, and SC classes.
 *
 *
 */
class Unit {
  constructor(registers) {
    if (new.target === Unit) throw new Error("Component is an abstract class");

    this._registers = registers;
    this._operations = new Map();
  }

  run(opcode, op1, op2, op3) {
    const operation = this._operations.get(opcode).bind(this);
    if (!operation) throw new Error(`Operation ${opcode} not found`);
    return operation(op1, op2, op3);
  }

  get operations() {
    return [...this._operations.keys()];
  }
}

/**
 * @class ALU
 * @extends Unit
 * @description
 * This class represents the Arithmetic Logic Unit of the CPU.
 * All teh arithmetic and logic operations are implemented here.
 */
class ALU extends Unit {
  constructor(registers) {
    super(registers);

    this._operations.set("add", this._add);
    this._operations.set("sub", this._sub);
    this._operations.set("addi", this._addi);
    this._operations.set("subi", this._subi);
    this._operations.set("mul", this._mul);
    this._operations.set("mult", this._mult);
    this._operations.set("div", this._div);

    this._operations.set("and", this._and);
    this._operations.set("or", this._or);
    this._operations.set("andi", this._andi);
    this._operations.set("ori", this._ori);
    this._operations.set("sll", this._sll);
    this._operations.set("srl", this._srl);

    this._operations.set("slt", this._slt);
    this._operations.set("slti", this._slti);
  }

  _add(op1, op2, op3) {
    const v1 = this._registers.get(op2);
    const v2 = this._registers.get(op3);
    this._registers.set(op1, v1 + v2);
  }

  _sub(op1, op2, op3) {
    const v1 = this._registers.get(op2);
    const v2 = this._registers.get(op3);
    this._registers.set(op1, v1 - v2);
  }

  _addi(op1, op2, imm) {
    const v2 = this._registers.get(op2);
    this._registers.set(op1, v2 + imm);
  }

  _subi(op1, op2, imm) {
    const v2 = this._registers.get(op2);
    this._registers.set(op1, v2 - imm);
  }

  _mul(op1, op2, op3) {
    const v1 = this._registers.get(op2);
    const v2 = this._registers.get(op3);
    this._registers.set(op1, v1 * v2);
  }

  _mult(op1, op2) {
    const v1 = this._registers.get(op1);
    const v2 = this._registers.get(op2);
    const result = v1 * v2;
    this._registers.set("HI", Math.floor(result / 2 ** this._n));
    this._registers.set("LO", result % 2 ** this._n);
  }

  _div(op1, op2, op3) {
    const v1 = this._registers.get(op2);
    const v2 = this._registers.get(op3);
    this._registers.set(op1, v1 / v2);
  }

  _and(op1, op2, op3) {
    const v1 = this._registers.get(op2);
    const v2 = this._registers.get(op3);
    this._registers.set(op1, v1 & v2);
  }

  _or(op1, op2, op3) {
    const v1 = this._registers.get(op2);
    const v2 = this._registers.get(op3);
    this._registers.set(op1, v1 | v2);
  }

  _andi(op1, op2, imm) {
    const v2 = this._registers.get(op2);
    this._registers.set(op1, v2 & imm);
  }

  _ori(op1, op2, imm) {
    const v2 = this._registers.get(op2);
    this._registers.set(op1, v2 | imm);
  }

  _sll(op1, op2, imm) {
    const v2 = this._registers.get(op2);
    this._registers.set(op1, v2 << imm);
  }

  _srl(op1, op2, imm) {
    const v2 = this._registers.get(op2);
    this._registers.set(op1, v2 >> imm);
  }

  _slt(op1, op2, op3) {
    const v1 = this._registers.get(op2);
    const v2 = this._registers.get(op3);
    const result = v1 < v2 ? 1 : 0;
    this._registers.set(op1, result);
  }

  _slti(op1, op2, imm) {
    const v2 = this._registers.get(op2);
    const result = v2 < imm ? 1 : 0;
    this._registers.set(op1, result);
  }
}

/**
 * @class MU
 * @extends Unit
 * @description
 * This class represents the global Unit of the CPU.
 * All the global-related operations are defined and performed here.
 */
class MU extends Unit {
  constructor(registers) {
    super(registers);

    this._operations.set("lw", this._lw);
    this._operations.set("sw", this._sw);
    this._operations.set("li", this._li);
    this._operations.set("la", this._la);
    this._operations.set("lui", this._lui);
    this._operations.set("mfhi", this._mfhi);
    this._operations.set("mflo", this._mflo);
    this._operations.set("move", this._move);
  }

  _lw(op1, imm, op2) {
    const v2 = this._registers.get(op2);
    const address = Math.floor(v2 / this._registers.addr_increment + imm);
    const global = this._registers.getGlobalByAddress(address);

    this._registers.set(op1, global);
  }

  _sw(op1, imm, op3) {
    const v1 = this._registers.get(op1);
    const v3 = this._registers.get(op3);
    const address = Math.floor(v3 / 4 + imm);
    this._registers.setGlobalByAddress(address, v1);
  }

  _li(op1, v1) {
    this._registers.set(op1, v1);
  }

  _la(op1, label) {
    const address =
      this._registers.getAddressByLabel(label) * this._registers.addr_increment;
    this._registers.set(op1, address);
  }

  _lui(op1, v1) {
    this._registers.set(op1, v1 / this._registers.addr_increment);
  }

  _mfhi(op1) {
    const v1 = this._registers.get("HI");
    this._registers.set(op1, v1);
  }

  _mflo(op1) {
    const v1 = this._registers.get("LO");
    this._registers.set(op1, v1);
  }

  _move(op1, op2) {
    const v2 = this._registers.get(op2);
    this._registers.set(op1, v2);
  }
}

/**
 * @class JU
 * @extends Unit
 * @description
 * This class represents the Jump Unit of the CPU.
 * All the jump-related operations are defined and performed here.
 */
class JU extends Unit {
  constructor(registers) {
    super(registers);

    this._operations.set("beq", this._beq);
    this._operations.set("bne", this._bne);
    this._operations.set("bgt", this._bgt);
    this._operations.set("bge", this._bge);
    this._operations.set("blt", this._blt);
    this._operations.set("ble", this._ble);
    this._operations.set("jump", this._jump);
  }

  _beq(op1, op2) {
    const v1 = this._registers.get(op1);
    const v2 = this._registers.get(op2);
    return v1 === v2;
  }

  _bne(op1, op2) {
    const v1 = this._registers.get(op1);
    const v2 = this._registers.get(op2);
    return v1 !== v2;
  }

  _bgt(op1, op2) {
    const v1 = this._registers.get(op1);
    const v2 = this._registers.get(op2);
    return v1 > v2;
  }

  _bge(op1, op2) {
    const v1 = this._registers.get(op1);
    const v2 = this._registers.get(op2);
    return v1 >= v2;
  }

  _blt(op1, op2) {
    const v1 = this._registers.get(op1);
    const v2 = this._registers.get(op2);
    return v1 < v2;
  }

  _ble(op1, op2) {
    const v1 = this._registers.get(op1);
    const v2 = this._registers.get(op2);
    return v1 <= v2;
  }

  _jump() {
    return true;
  }
}

class SC extends Unit {
  constructor(registers) {
    super(registers);

    this._operations.set("print_int", this._print_int);
    this._operations.set("print_char", this._print_char);
    this._operations.set("read_int", this._read_int);
    this._operations.set("read_char", this._read_char);
    this._operations.set("exit", this._exit);
  }

  _print_int() {
    const i = this._registers.get("$a0");
    console.log(`$a0 = ${i}`);
  }

  _print_char() {
    const c = this._registers.get("$a0");
    console.log(`$a0 = ${string.fromCharCode(c)}`);
  }

  _read_int() {
    const i = parseInt(prompt("Enter an integer: "));
    this._registers.set("$v0", i);
  }

  _read_char() {
    const c = prompt("Enter a character: ");
    this._registers.set("$v0", c.charCodeAt(0));
  }

  _exit() {
    throw new Error("Not implemented yet.");
  }
}

export { Registers, ALU, MU, JU, SC };
