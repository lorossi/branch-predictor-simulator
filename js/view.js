class View {
  constructor() {
    this._code = document.querySelector("#code");
    this._registers = document.querySelector(".registers");
    this._globals = document.querySelector(".globals");
    this._predictor = document.querySelector(".predictor");
    this._active_bht = document.querySelector(".bht");
    this._history = document.querySelector(".history");
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

  setCBP(cbp) {
    this._setActiveCBP(cbp);
    this._setHistory(cbp);
    this._setCBPEntries(cbp);
  }

  _setHistory(cbp) {
    this._history.innerHTML = "";
    const history_p = document.createElement("p");
    history_p.textContent = "History:";
    history_p.classList.add("name");
    this._history.appendChild(history_p);

    const history_value = document.createElement("p");
    history_value.textContent = cbp.history;
    this._history.appendChild(history_value);
  }

  _setActiveCBP(cbp) {
    this._active_bht.innerHTML = "";
    const active_bht = document.createElement("p");
    active_bht.textContent = "Active BHT:";
    active_bht.classList.add("name");
    this._active_bht.appendChild(active_bht);

    const active_bht_value = document.createElement("p");
    active_bht_value.textContent = cbp.activeBHT;
    this._active_bht.appendChild(active_bht_value);
  }

  _setCBPEntries(cbp) {
    const div_selector = (i) => `#bht_${i}`;

    // create and empty the divs
    cbp.BHTs.forEach((bht, i) => {
      let div = this._predictor.querySelector(div_selector(i));

      if (div === null) {
        div = document.createElement("div");
        div.id = `bht_${i}`;
        this._predictor.appendChild(div);
      } else {
        div.innerHTML = "";
      }

      // set the div width as a function of the number of bhts
      div.style.width = `${100 / cbp.BHTs.length}%`;

      const name = document.createElement("p");
      name.textContent = `BHT ${i}`;
      name.classList.add("name");
      div.appendChild(name);

      const stats = document.createElement("p");
      stats.textContent = `Predictions: ${bht.correct}/${bht.total} \
      (${bht.accuracy_formatted})`;
      div.appendChild(stats);
    });

    // fill the divs with the entries
    cbp.BHTs.forEach((bht, i) => {
      const div = this._predictor.querySelector(div_selector(i));

      if (i === cbp.activeBHT) {
        div.classList.add("active");
      } else if (div.classList.contains("active")) {
        div.classList.remove("active");
      }

      bht.entriesFormatted.forEach((entry) => {
        const p = document.createElement("p");
        p.textContent = `${entry.address}(${entry.int_address}): ${entry.prediction}`;
        div.appendChild(p);
      });
    });
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
