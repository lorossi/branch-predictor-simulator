/**
 * @class Registers
 *
 * @param {number} k - Number of registers
 * @param {number} n - Size of the registers (in bits)
 *
 * @description
 * This class represents the registers of the CPU.
 * Each register is a n-bit integer.
 *
 */
class Registers {
  constructor(k = 8, n = 8) {
    this._k = k;
    this._n = n;
    this._max_val = 2 ** n - 1;

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

    this._registers.set("$data", []);
    this._registers.set("$addr", new Map());
  }

  inc(reg) {
    const v = this._registers.get(reg) + 1;
    this.set(reg, v);
  }

  dec(reg) {
    const v = this.get(reg) - 1;
    this.set(reg, v);
  }

  get(reg) {
    if (!this._registers.has(reg)) throw new Error(`Register ${reg} not found`);

    return this._registers.get(reg);
  }

  set(reg, value) {
    if (!this._registers.has(reg)) throw new Error(`Register ${reg} not found`);
    if (reg == "$zero") return;
    
    const v = Math.floor(value) % this._max_val;
    this._registers.set(reg, v);
  }

  getDataByLabel(label) {
    if (!this._registers.get("$addr").has(label))
      throw new Error(`Label ${label} not found`);

    const addr = this._registers.get("$addr").get(label);
    return this._registers.get("$data")[addr];
  }

  getDataByAddress(addr) {
    if (addr >= this._registers.get("$data").length)
      throw new Error(`Address ${addr} not found`);

    return this._registers.get("$data")[addr];
  }

  setDataByLabel(label, data) {
    const addr = this._registers.get("$data").length;
    this._registers.get("$data").push(...data);
    this._registers.get("$addr").set(label, addr);
    return addr;
  }

  setDataByAddress(addr, data) {
    if (addr >= this._registers.get("$data").length)
      throw new Error(`Address ${addr} not found`);

    this._registers.get("$data")[addr] = data;
  }

  getAddressByLabel(label) {
    if (!this._registers.get("$addr").has(label))
      throw new Error(`Label ${label} not found`);

    return this._registers.get("$addr").get(label);
  }

  get registers() {
    let registers = {};
    for (let [key, value] of this._registers) registers[key] = value;
    return registers;
  }

  get k() {
    return this._k;
  }

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

  _addi(op1, imm) {
    const v1 = this._registers.get(op1);
    this._registers.set(op1, v1 + imm);
  }

  _subi(op1, imm) {
    const v1 = this._registers.get(op1);
    this._registers.set(op1, v1 - imm);
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
 * This class represents the Memory Unit of the CPU.
 * All the memory-related operations are defined and performed here.
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
    const address = Math.floor(v2 / 4 + imm);
    const data = this._registers.getDataByAddress(address);

    this._registers.set(op1, data);
  }

  _sw(op1, imm, op3) {
    const v1 = this._registers.get(op1);
    const v3 = this._registers.get(op3);
    const address = Math.floor(v3 / 4 + imm);

    this._registers.setDataByAddress(address, v1);
  }

  _li(op1, v1) {
    this._registers.set(op1, v1);
  }

  _la(op1, label) {
    const address = this._registers.getAddressByLabel(label);
    this._registers.set(op1, address);
  }

  _lui(op1, v1) {
    this._registers.set(op1, v1 << (this._registers.k / 2));
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
    this._operations.set("jump", this._jmp);
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

  _jmp() {
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
    console.log(`$v0 = ${i}`);
  }

  _print_char() {
    const c = this._registers.get("$a0");
    console.log(`$v0 = ${String.fromCharCode(c)}`);
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
