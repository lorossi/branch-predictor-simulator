/**
 * @class BHT
 *
 * @param {number} k - The number of bits used to represent the address
 * @param {number} n - The number of bits used to represent the prediction
 */
class BHT {
  constructor(k, n) {
    this._k = k;
    this._n = n;

    this._max_addr = 2 ** k;
    this._correct = 0;
    this._incorrect = 0;

    this._prediction = new Map();
  }

  /**
   * Converts the address to a binary string of length k
   *
   * @param {integer} x
   * @returns {string} - The binary string of length k
   */
  _correctAddressLength(x) {
    if (x < 0) throw new Error(`address must be a positive integer`);
    if (x >= this._max_addr) x %= this._max_addr;

    return x.toString(2).padStart(this._k, "0");
  }

  /**
   * Returns the prediction for the given address.
   * If the address was not previously seen, it is added to the map with a
   * prediction of 0.
   *
   * @param {integer} address
   * @returns {boolean}
   */
  _getPrediction(address) {
    if (!this._prediction.has(address)) this._prediction.set(address, 0);
    return this._prediction.get(address);
  }

  /**
   * Updates the prediction for the given address.
   * If the prediction is correct, the prediction is incremented by 1.
   * If the prediction is incorrect, the prediction is decremented by 1.
   *
   * @param {integer} address
   * @param {boolean} outcome
   * @returns {void}
   */
  _setPrediction(address, outcome) {
    const prediction = this._getPrediction(address);
    let new_value = prediction + outcome;

    if (new_value > this._n) new_value = this._n;
    else if (new_value < 0) new_value = 0;

    if (this._toBool(new_value) == this._toBool(prediction)) this._correct++;
    else this._incorrect++;

    this._prediction.set(address, new_value);
  }

  _toBool(value) {
    return value > this._n / 2;
  }

  predict(address) {
    const key = this._correctAddressLength(address);
    const value = this._getPrediction(key);

    return this._toBool(value);
  }

  update(address, outcome) {
    if (typeof outcome !== "boolean")
      throw new Error(
        `outcome must be a boolean, `,
        `got ${typeof outcome} instead`
      );

    const key = this._correctAddressLength(address);
    const value = outcome == 1 ? 1 : -1;

    this._setPrediction(key, value);
  }

  get addresses() {
    return [...this._prediction.keys()].sort();
  }

  get predictions() {
    return [...this._prediction.values()].sort();
  }

  get pairs() {
    return [...this._prediction.entries()].sort();
  }

  get accuracy() {
    if (this._correct + this._incorrect == 0) return 0;
    return this._correct / (this._correct + this._incorrect);
  }
}

export { BHT };
