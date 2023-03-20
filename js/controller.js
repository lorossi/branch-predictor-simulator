class Controller {
  constructor() {
    this._model = null;
    this._view = null;

    document
      .querySelector("#run_one")
      .addEventListener("click", this.runOne.bind(this));
    document.querySelector("#run_all").addEventListener("click", () => {
      this.runAll().bind(this);
    });
  }

  reset() {
    this._model.reset();
    this._updateView();
  }

  setModel(model) {
    this._model = model;
  }

  setView(view) {
    this._view = view;
  }

  _updateView() {
    this._view.setActiveInstruction(this._model.current_line);
    this._view.setMemory(this._model.registers, this._model.global);
    this._view.setCBP(this._model.cbp);
  }

  setCode(code) {
    this._model.setCode(code);
    this._view.setCode(code);
    this._updateView();
  }

  runOne() {
    this._model.runOne();
    this._updateView();
  }

  runAll() {
    this._model.runAll();
    this._updateView();
  }
}

export { Controller };
