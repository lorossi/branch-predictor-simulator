import { BHT } from "./bht.js";

/**
 * @class CBP
 *
 * @description
 * CBP is a class that implements a Combined Branch Predictor.
 *
 * @param {Number} k - The Number of bits used to index the address
 * @param {Number} n - The Number of bits used to represent the prediction
 * @param {Number} m - The Number of bits used to index the history
 */
class CBP {
  constructor(k, n, m) {
    this._k = k;
    this._n = n;
    this._m = m;

    this._BHTs = Array(2 ** m)
      .fill(null)
      .map(() => new BHT(k, n));

    this._history = new History(m);
    this._last_prediction = null;
  }

  /**
   * Reset the CBP to its initial state
   */
  reset() {
    this._BHTs.forEach((bht) => bht.reset());
    this._history.reset();
  }

  /**
   * Predict the outcome of a branch
   *
   * @param {Number} address - The address of the branch
   * @returns {Boolean} The predicted outcome of the branch
   */
  predict(address) {
    const key = this._history.get();
    const value = this._BHTs[key].predict(address);

    return value;
  }

  /**
   * Update the CBP with the outcome of a branch
   *
   * @param {Number} address - The address of the branch
   * @param {Boolean} outcome - The outcome of the branch
   * @returns {Boolean} The old prediction of the branch
   * @throws {Error} If the outcome is not a boolean
   */
  update(address, outcome) {
    if (typeof outcome != "boolean")
      throw new Error(
        `outcome must be a boolean, `,
        `got ${typeof outcome} instead`
      );

    const key = this._history.get();
    const old_prediction = this._BHTs[key].update(address, outcome);
    this._history.update(outcome);

    return old_prediction;
  }

  /**
   * Get the accuracy of the CBP.
   * The accuracy is the product of the accuracy of each BHT.
   * @return {Number}
   */
  get accuracy() {
    return this._BHTs.reduce(
      (acc, bht) => (bht.accuracy == 0 ? 1 : bht.accuracy) * acc,
      1
    );
  }

  /**
   * Get the formatted accuracy of the CBP.
   * The formatted accuracy is the product of the formatted accuracy of each BHT.
   * @return {string}
   * @readonly
   */
  get accuracy_formatted() {
    return (
      this._BHTs.reduce(
        (acc, bht) => (bht.accuracy == 0 ? 1 : bht.accuracy) * acc,
        1
      ) * 100
    )
      .toFixed(2)
      .concat("%");
  }

  /**
   * Get the BHTs used by the CBP
   * @return {Array<BHT>}
   * @readonly
   */
  get BHTs() {
    return this._BHTs;
  }

  /**
   * Get the counter of the active BHT of the CBP
   * @return {Number}
   * @readonly
   */
  get activeBHT() {
    return this._history.get();
  }

  /**
   * Get the history of the CBP
   * @return {string}
   * @readonly
   */
  get history() {
    return this._history.history.join("").padStart(this._m, "0");
  }
}

/**
 * @class History
 *
 * @description
 * History is a class that implements a history of the last m outcomes.
 *
 * @param {Number} m - The Number of bits used to index the history
 */
class History {
  constructor(m) {
    this._m = m;
    this._history = Array(m).fill(0);
  }

  /**
   * Update the history with the outcome of a branch.
   *
   * @param {Boolean} value
   * @throws {Error} If the outcome is not a boolean
   */
  update(value) {
    if (typeof value != "boolean")
      throw new Error(
        `value must be a boolean, `,
        `got ${typeof value} instead`
      );
    const v = value ? 1 : 0;
    this._history.shift();
    this._history.push(v);
  }

  /**
   * Reset the history to its initial state
   */
  reset() {
    this._history = Array(this._m).fill(0);
  }

  /**
   * Get the history as a binary number
   * @return {string}
   * @readonly
   */
  get() {
    return parseInt(this._history.join(""), 2);
  }

  /**
   * Get the history as an array of numbers
   * @return {Array<Number>}
   * @readonly
   */
  get history() {
    return [...this._history];
  }
}

export { CBP };
