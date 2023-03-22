import { Model } from "./model.js";
import { View } from "./view.js";

class Controller {
  constructor() {
    this._model = null;
    this._view = null;

    document
      .querySelector("#run_one")
      .addEventListener("click", this.runOne.bind(this));

    document
      .querySelector("#run_all")
      .addEventListener("click", this.runAll.bind(this));

    document
      .querySelector("#reset")
      .addEventListener("click", this.reset.bind(this));

    document
      .querySelectorAll("#reset_change")
      .forEach((element) =>
        element.addEventListener("click", this.reset.bind(this))
      );

    document
      .querySelector("#upload_code_button")
      .addEventListener("click", () => {
        document.querySelector("#upload_code").click();
      });

    // open file and set it as the code
    document.querySelector("#upload_code").addEventListener("change", (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.addEventListener("load", (e) => {
        const code = e.target.result.split("\n");
        this.reset();
        this.setCode(code);
      });

      reader.readAsText(file);
    });
  }

  /**
   * Reset the model and view to their initial state.
   */
  reset() {
    this._model.setCBP(...this._getModelValues());
    this._model.reset();
    this._updateView();
  }

  /**
   * Set the model for the controller.
   *
   * @param {Model} model
   */
  setModel(model) {
    this._model = model;
    this._model.setCBP(...this._getModelValues());
  }

  /**
   * Set the view for the controller.
   *
   * @param {View} view
   */
  setView(view) {
    this._view = view;
  }

  /**
   * Set the code for the model and view.
   *
   * @param {Array<string>} code
   */
  setCode(code) {
    this._model.setCode(code);
    this._view.setCode(code);
    this._updateView();
  }

  /**
   * Run one instruction and update the view.
   */
  runOne() {
    this._model.runOne();
    this._updateView();
  }

  /**
   * Run all instructions and update the view.
   */
  runAll() {
    this._model.runAll();
    this._updateView();
  }

  /**
   * Update the view with the current state of the model.
   * @private
   */
  _updateView() {
    this._view.setActiveInstruction(this._model.current_line);
    this._view.setMemory(this._model.registers, this._model.global);
    this._view.setCBP(this._model.cbp, this._model.cpu);
  }

  _getModelValues() {
    const k = parseInt(document.querySelector("#bht_k").value);
    const n = parseInt(document.querySelector("#cbp_n").value);
    const m = parseInt(document.querySelector("#cbp_m").value);
    return [k, n, m];
  }

  _setModelValues(n, k, m) {
    this._model.setCBP(n, k, m);
    this.reset();
  }
}

export { Controller };
