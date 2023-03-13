import { BHT } from "./bht.js";

/**
 * @class CBP
 *
 * @description
 * CBP is a class that implements a Combined Branch Predictor.
 *
 * @param {number} k - The number of bits used to index the address
 * @param {number} n - The number of bits used to represent the prediction
 * @param {number} m - The number of bits used to index the history
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
  }

  predict(address) {
    const key = this._history.get();
    const value = this._BHTs[key].predict(address);

    return value;
  }

  update(address, outcome) {
    if (typeof outcome != "boolean")
      throw new Error(
        `outcome must be a boolean, `,
        `got ${typeof outcome} instead`
      );

    const key = this._history.get();
    this._BHTs[key].update(address, outcome);
    this._history.update(outcome);
  }

  get accuracy() {
    return this._BHTs.reduce(
      (acc, bht) => (bht.accuracy == 0 ? 1 : bht.accuracy) * acc,
      1
    );
  }
}

class History {
  constructor(m) {
    this._m = m;
    this._history = Array(m).fill(0);
  }

  update(value) {
    const v = value ? 1 : 0;
    this._history.shift();
    this._history.push(v);
  }

  get() {
    return parseInt(this._history.join(""), 2);
  }
}

export { CBP };
