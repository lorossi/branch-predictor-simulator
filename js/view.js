import { Canvas } from "./canvas.js";

class View {
  constructor() {
    this._canvas = new Canvas("#canvas");
    this._code = document.querySelector("#code");
    this._registers = document.querySelector(".registers");
    this._globals = document.querySelector(".globals");
    window.addEventListener("resize", this._onResize.bind(this));
  }

  _onResize() {
    this._canvas.autoResize();
  }

  resizeCanvas(width, height) {
    this._canvas.resize(width, height);
  }

  setCode(code) {
    code
      .filter((line) => line.length > 0)
      .forEach((line) => {
        const div = document.createElement("div");
        div.textContent = line;
        this._code.appendChild(div);
      });

    this.setActiveLine(0);
  }

  setMemory(registers, globals) {
    this._setRegisters(registers, this._registers);
    this._setRegisters(globals, this._globals);
  }

  _setRegisters(register, container) {
    const create_selector = (key) => `#${key.replace("$", "")}`;
    const create_id = (key) => create_selector(key).replace("#", "");
    const create_div = (key, value) => {
      const name_p = document.createElement("p");
      name_p.textContent = `${key}:`;
      name_p.classList.add("name");
      const value_p = document.createElement("p");
      value_p.textContent = value;
      value_p.classList.add("value");
      const div = document.createElement("div");
      div.id = create_id(key);
      div.classList.add("cell");
      div.appendChild(name_p);
      div.appendChild(value_p);
      return div;
    };

    Object.entries(register).forEach(([key, value]) => {
      const selector = create_selector(key);
      const existing_div = container.querySelector(selector);

      if (existing_div) {
        existing_div.querySelector(".value").textContent = value;
      } else {
        const div = create_div(key, value);
        container.appendChild(div);
      }
    });
  }

  setActiveLine(line_index) {
    this._code.querySelectorAll("div").forEach((div, i) => {
      if (i === line_index) div.classList.add("active");
      else div.classList.remove("active");
    });
  }
}

export { View };
