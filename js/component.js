/**
 * @class Registers
 *
 * @param {number} k - Number of registers
 * @param {number} n - Size of the registers
 *
 * @description
 * This class represents the registers of the CPU.
 * Each register is a n-bit integer.
 *
 */
class Registers {
  constructor(k = 8, n = 8) {
    this._n = n;
    this._max_val = 2 ** n - 1;

    this._registers = new Map();
    for (let i = 0; i < k; i++) this._registers.set(`R${i}`, 0);
    this._registers.set("PC", 0);
    this._registers.set("ZERO", 0);
  }

  get(reg) {
    return this._registers.get(reg);
  }

  inc(reg) {
    const v = this._registers.get(reg) + 1;
    this._registers.set(reg, v);
  }

  dec(reg) {
    const v = this._registers.get(reg) - 1;
    this._registers.set(reg, v);
  }

  set(reg, value) {
    const v = Math.floor(value) % this._max_val;
    this._registers.set(reg, v);
  }

  get registers() {
    let registers = {};
    for (let [key, value] of this._registers) registers[key] = value;
    return registers;
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
 * It is extended by the ALU, MU and JU classes.
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

    this._operations.set("ADD", this._add);
    this._operations.set("SUB", this._sub);
    this._operations.set("MUL", this._mul);
    this._operations.set("DIV", this._div);
    this._operations.set("MOD", this._mod);
    this._operations.set("AND", this._and);
    this._operations.set("OR", this._or);
    this._operations.set("XOR", this._xor);
    this._operations.set("NOT", this._not);
    this._operations.set("ADDI", this._addi);
    this._operations.set("SUBI", this._subi);
    this._operations.set("MULI", this._muli);
    this._operations.set("DIVI", this._divi);
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

  _mul(op1, op2, op3) {
    const v1 = this._registers.get(op2);
    const v2 = this._registers.get(op3);
    this._registers.set(op1, v1 * v2);
  }

  _div(op1, op2, op3) {
    const v1 = this._registers.get(op2);
    const v2 = this._registers.get(op3);
    this._registers.set(op1, v1 / v2);
  }

  _mod(op1, op2, op3) {
    const v1 = this._registers.get(op2);
    const v2 = this._registers.get(op3);
    this._registers.set(op1, v1 % v2);
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

  _xor(op1, op2, op3) {
    const v1 = this._registers.get(op2);
    const v2 = this._registers.get(op3);
    this._registers.set(op1, v1 ^ v2);
  }

  _not(op1, op2) {
    const v1 = this._registers.get(op2);
    this._registers.set(op1, ~v1);
  }

  _addi(op1, imm) {
    const v1 = this._registers.get(op1);
    this._registers.set(op1, v1 + imm);
  }

  _subi(op1, imm) {
    const v1 = this._registers.get(op1);
    this._registers.set(op1, v1 - imm);
  }

  _muli(op1, imm) {
    const v1 = this._registers.get(op1);
    this._registers.set(op1, v1 * imm);
  }

  _divi(op1, imm) {
    const v1 = this._registers.get(op1);
    this._registers.set(op1, v1 / imm);
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

    this._operations.set("LW", this._lw);
    this._operations.set("SW", this._sw);
    this._operations.set("MOVI", this._movi);
  }

  _lw(op1, op2) {
    const v2 = this._registers.get(op2);
    this._registers.set(op1, v2);
  }

  _sw(op1, op2) {
    const v1 = this._registers.get(op1);
    this._registers.set(op2, v1);
  }

  _movi(op1, v1) {
    this._registers.set(op1, v1);
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

    this._operations.set("BEQ", this._beq);
    this._operations.set("BNE", this._bne);
    this._operations.set("BGT", this._bgt);
    this._operations.set("BGE", this._bge);
    this._operations.set("BLT", this._blt);
    this._operations.set("BLE", this._ble);
    this._operations.set("JUMP", this._jmp);
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

export { Registers, ALU, MU, JU };
