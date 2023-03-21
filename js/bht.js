/**
 * @class BHT
 *
 * @param {integer} k - The Number of bits used to represent the address
 * @param {integer} n - The Number of bits used to represent the prediction
 */
class BHT {
  constructor(k, n) {
    this._k = k;
    this._n = n;

    this._max_addr = 2 ** k;

    this.reset();
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

    this._prediction.set(address, new_value);
  }

  /**
   *
   * @param {integer} value address for the prediction
   * @returns {boolean} true if the prediction is greater than n/2, false otherwise
   * @private
   */
  _toBool(value) {
    return value > this._n / 2;
  }

  /**
   *
   * @param {integer} address
   * @returns {boolean} true if the prediction is "taken", false if the prediction is "not taken"
   */
  predict(address) {
    const key = this._correctAddressLength(address);
    const value = this._getPrediction(key);

    return this._toBool(value);
  }

  /**
   * Updates the prediction for the given address.
   * If the prediction is correct, the value is incremented by 1.
   * If the prediction is incorrect, the value is decremented by 1.
   *
   * @param {integer} address
   * @param {boolean} outcome
   * @returns {boolean} true if the prediction was correct, false otherwise
   */
  update(address, outcome) {
    if (typeof outcome !== "boolean")
      throw new Error(
        `outcome must be a boolean, `,
        `got ${typeof outcome} instead`
      );

    const key = this._correctAddressLength(address);
    const value = this._toBool(this._getPrediction(key));
    const new_value = outcome ? value + 1 : value - 1;

    if (value === outcome) this._correct++;
    else this._incorrect++;

    this._setPrediction(key, new_value);
    return this._toBool(value);
  }

  /**
   * Reset the branch history table to its initial state.
   * All predictions are set to 0.
   * The Number of correct and incorrect predictions is set to 0.
   */
  reset() {
    this._correct = 0;
    this._incorrect = 0;

    this._prediction = new Map();
    for (let i = 0; i < this._max_addr; i++) {
      const addr = this._correctAddressLength(i);
      this._prediction.set(addr, 0);
    }
  }

  /**
   * @returns {Array} - An array of arrays, where each inner array contains the address and prediction
   */
  get predictions() {
    return [...this._prediction.entries()].sort();
  }

  /**
   * @returns {Array} - An array of objects, where each object contains the address, prediction, and boolean prediction
   * @property {string} address - The address in binary
   * @property {Number} int_address - The address in decimal
   * @property {string} prediction - The prediction in binary
   * @property {boolean} bool_prediction - The prediction as a boolean
   */
  get predictions_formatted() {
    return this.predictions.map((entry) => ({
      address: entry[0],
      int_address: String(parseInt(entry[0], 2)).padStart(
        String(this._max_addr).length,
        "0"
      ),
      prediction: entry[1].toString(2).padStart(this._n, "0"),
      bool_prediction: this._toBool(entry[1]),
    }));
  }

  /**
   * @returns {Number} - The accuracy of the branch history table
   */
  get accuracy() {
    if (this._correct + this._incorrect == 0) return 0;
    return this._correct / (this._correct + this._incorrect);
  }

  /**
   * @returns {string} - The accuracy of the branch history table as a string with 2 decimal places
   */
  get accuracy_formatted() {
    return (this.accuracy * 100).toFixed(2) + "%";
  }

  /**
   * @returns {Number} - The Number of correct predictions
   */
  get correct() {
    return this._correct;
  }

  /**
   * @returns {Number} - The Number of incorrect predictions
   */
  get incorrect() {
    return this._incorrect;
  }

  /**
   * @returns {Number} - The total Number of predictions
   */
  get total() {
    return this._correct + this._incorrect;
  }

  /**
   * @returns {Number} - The highest possible address stored in the BHT
   */
  get max_addr() {
    return this._max_addr;
  }
}

export { BHT };
