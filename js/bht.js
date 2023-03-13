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

    this._correct = 0;
    this._incorrect = 0;

    this._prediction = new Map();
  }

  _correctAddressLength(x) {
    if (x.length < this._k) x = x.padStart(this._k, 0);
    else if (x.length > this._k) x = x.slice(x.length - this._k);

    return x;
  }

  _getPrediction(key) {
    if (!this._prediction.has(key)) this._prediction.set(key, 0);
    return this._prediction.get(key);
  }

  _setPrediction(key, value) {
    const prediction = this._getPrediction(key);
    let new_value = prediction + value;

    if (new_value > this._n) new_value = this._n;
    else if (new_value < 0) new_value = 0;

    if (this._toBool(new_value) == this._toBool(prediction)) this._correct++;
    else this._incorrect++;

    this._prediction.set(key, new_value);
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
