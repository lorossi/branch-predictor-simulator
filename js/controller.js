class Controller {
  constructor() {
    this._model = null;
    this._view = null;

    document
      .querySelector("#run_one")
      .addEventListener("click", this.runOne.bind(this));
  }

  setModel(model) {
    this._model = model;
  }

  setView(view) {
    this._view = view;
  }

  setCode(code) {
    this._model.setCode(code);
    this._view.setCode(code);
    this._view.setMemory(this._model.registers, this._model.global);
    this._view.setCBP(this._model.cbp);
  }

  runOne() {
    this._model.runOne();
    this._view.setActiveInstruction(this._model.current_line);
    this._view.setMemory(this._model.registers, this._model.global);
    this._view.setCBP(this._model.cbp);
  }
}

export { Controller };
