import { CBP } from "./cbp.js";
import { CPU } from "./cpu.js";

class View {
  constructor() {
    this._code = document.querySelector("#code");
    this._registers = document.querySelector(".registers");
    this._globals = document.querySelector(".globals");
    this._predictor = document.querySelector(".predictor");
    this._active_bht = document.querySelector(".bht");
    this._history = document.querySelector(".history");
    this._prediction = document.querySelector(".prediction");
    this._accuracy = document.querySelector(".accuracy");

    this._active_line = 0;
  }

  /**
   * Set the code to be displayed in the view
   *
   * @param {Array[str]} code - the code to be displayed
   */
  setCode(code) {
    this._code.innerHTML = "";

    const pad_length = String(code.length).length;
    code
      .filter((line) => line.length > 0)
      .forEach((line, i) => {
        const div = document.createElement("div");
        div.textContent = `${String(i).padStart(pad_length, "0")}\t${line}`;
        this._code.appendChild(div);
      });

    this.setActiveInstruction(0);
  }

  /**
   * Set the correlating branch predictor to be displayed in the view
   *
   * @param {CBP} cbp
   * @param {CPU} cpu
   */
  setCBP(cbp, cpu) {
    this._setHistory(cbp);
    this._setPrediction(cpu);
    this._setActiveBHT(cbp);
    this._setAccuracy(cbp);
    this._setCBPEntries(cbp);
  }

  /**
   *
   * @param {Array.<string, Number>} registers
   * @param {Array.<string, Number>} globals
   */
  setMemory(registers, globals) {
    this._registers.innerHTML = "";
    this._globals.innerHTML = "";
    this._setRegisters(registers, this._registers);
    this._setRegisters(globals, this._globals);
  }

  /**
   * Set the active instruction in the view
   * @param {Number} line_index
   */
  setActiveInstruction(line_index) {
    this._active_line = line_index;

    this._code.querySelectorAll("div").forEach((div, i) => {
      if (i === line_index) div.classList.add("active");
      else div.classList.remove("active");
    });
  }

  /**
   * Create the view for the history of the correlating branch predictor
   * @param {CBP} cbp
   */
  _setHistory(cbp) {
    this._history.innerHTML = "";
    const history_p = document.createElement("p");
    history_p.textContent = "History:";
    history_p.classList.add("name");
    this._history.appendChild(history_p);

    const history_value = document.createElement("p");
    const history = cbp.history.length > 0 ? cbp.history : "N/A";
    history_value.textContent = history;
    this._history.appendChild(history_value);
  }

  /**
   * Create the view for the last prediction of the correlating branch predictor
   * @param {CPU} cpu
   * @private
   */
  _setPrediction(cpu) {
    this._prediction.innerHTML = "";
    const prediction_p = document.createElement("p");
    prediction_p.textContent = "Last prediction:";
    prediction_p.classList.add("name");
    this._prediction.appendChild(prediction_p);

    const last_prediction =
      cpu.last_prediction == null
        ? "N/A"
        : cpu.last_prediction
        ? "Taken"
        : "Not taken";

    const last_outcome =
      cpu.last_outcome == null
        ? "N/A"
        : cpu.last_outcome == cpu.last_prediction
        ? "Correct"
        : "Incorrect";

    const last_branch_address =
      cpu.last_branch_address == null ? "N/A" : cpu.last_branch_address;

    const prediction_value = document.createElement("p");
    prediction_value.textContent = `${last_prediction} (${last_outcome}), line ${last_branch_address}`;
    this._prediction.appendChild(prediction_value);
  }

  /**
   * Set the active bht of the cbp to be displayed in the view
   *
   * @param {CBP} cbp
   * @private
   */
  _setActiveBHT(cbp) {
    this._active_bht.innerHTML = "";
    const active_bht = document.createElement("p");
    active_bht.textContent = "Active BHT:";
    active_bht.classList.add("name");
    this._active_bht.appendChild(active_bht);

    const active_bht_value = document.createElement("p");
    active_bht_value.textContent = cbp.activeBHT;
    this._active_bht.appendChild(active_bht_value);
  }

  /**
   * Show the cbp entries in the view
   *
   * @param {CBP} cbp
   * @private
   */
  _setCBPEntries(cbp) {
    const div_selector = (i) => `#bht_${i}`;
    const divs = [];

    // remove all the divs
    this._predictor
      .querySelectorAll("div")
      .forEach((div) => div.parentNode.removeChild(div));

    // create and empty the divs
    cbp.BHTs.forEach((bht, i) => {
      const div = document.createElement("div");
      div.id = div_selector(i);
      // set the div width as a function of the Number of bhts
      div.style.width = `${100 / cbp.BHTs.length}%`;
      this._predictor.appendChild(div);

      const name = document.createElement("p");
      name.textContent = `BHT ${i}`;
      name.classList.add("name");

      if (i == cbp.activeBHT) {
        name.classList.add("active");
      }

      div.appendChild(name);

      const stats = document.createElement("p");
      stats.textContent = `Predictions: ${bht.correct}/${bht.total} \
      (${bht.accuracy_formatted})`;
      div.appendChild(stats);

      divs.push(div);
    });

    // fill the divs with the entries
    cbp.BHTs.forEach((bht, i) => {
      const div = divs[i];

      bht.predictions_formatted.forEach((entry) => {
        const p = document.createElement("p");
        p.textContent = `${entry.address}(${entry.int_address}): ${entry.prediction}`;
        if (
          entry.int_address == this._active_line % bht.max_addr &&
          i == cbp.activeBHT
        ) {
          p.classList.add("active");
        }

        div.appendChild(p);
      });
    });
  }

  _setAccuracy(cbp) {
    this._accuracy.innerHTML = "";
    const accuracy_p = document.createElement("p");
    accuracy_p.textContent = "Accuracy:";
    accuracy_p.classList.add("name");
    this._accuracy.appendChild(accuracy_p);

    const accuracy_value = document.createElement("p");
    accuracy_value.textContent = `${cbp.accuracy_formatted} (${cbp.correct}/${cbp.total})`;
    this._accuracy.appendChild(accuracy_value);
  }

  /**
   * Set the registers to be displayed in the view
   * @param {Array.<string, Number>} register
   * @param {HTMLElement} container
   * @private
   */
  _setRegisters(register, container) {
    Object.entries(register).forEach(([key, value]) => {
      const name_p = document.createElement("p");
      name_p.textContent = `${key}:`;
      name_p.classList.add("name");
      const value_p = document.createElement("p");
      value_p.textContent = value;
      value_p.classList.add("value");
      const div = document.createElement("div");
      div.id = key.replace("$", "");
      div.classList.add("cell");
      div.appendChild(name_p);
      div.appendChild(value_p);
      container.appendChild(div);
    });
  }
}

export { View };
