class Controller {
  constructor() {
    this._model = null;
    this._view = null;
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
}

export { Controller };
