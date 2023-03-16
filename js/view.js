import { Canvas } from "./canvas.js";

class View {
  constructor() {
    this._canvas = new Canvas("#canvas");
    this._code = document.querySelector("#code");
    window.addEventListener("resize", this._onResize.bind(this));
  }

  _onResize() {
    this._canvas.autoResize();
  }

  resizeCanvas(width, height) {
    this._canvas.resize(width, height);
  }

  setCode(code) {
    // this._code.textContent = code;
    code
      .filter((line) => line.length > 0)
      .forEach((line) => {
        const div = document.createElement("div");
        div.textContent = line;
        this._code.appendChild(div);
      });

    this.setActiveLine(0);
  }

  setActiveLine(line_index) {
    this._code.querySelectorAll("div").forEach((div, i) => {
      if (i === line_index) div.classList.add("active");
      else div.classList.remove("active");
    });
  }
}

export { View };
