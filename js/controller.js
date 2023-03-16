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
  }

  runOne() {
    this._model.runOne();
  }
}

export { Controller };
