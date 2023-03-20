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
  }

  /**
   * Reset the model and view to their initial state.
   */
  reset() {
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
}

export { Controller };
