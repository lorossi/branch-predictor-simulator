class View {
  constructor() {
    this._code = document.querySelector("#code");
    this._registers = document.querySelector(".registers");
    this._globals = document.querySelector(".globals");
    this._predictor = document.querySelector(".predictor");
    this._active_bht = document.querySelector(".bht");
    this._history = document.querySelector(".history");

    this._active_line = 0;
  }

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

      if (i == cbp.activeBHT) {
        name.classList.add("active");
      }

      div.appendChild(name);

      const stats = document.createElement("p");
      stats.textContent = `Predictions: ${bht.correct}/${bht.total} \
      (${bht.accuracy_formatted})`;
      div.appendChild(stats);
    });

    // fill the divs with the entries
    cbp.BHTs.forEach((bht, i) => {
      const div = this._predictor.querySelector(div_selector(i));

      bht.entriesFormatted.forEach((entry) => {
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

  setMemory(registers, globals) {
    this._registers.innerHTML = "";
    this._globals.innerHTML = "";
    this._setRegisters(registers, this._registers);
    this._setRegisters(globals, this._globals);
  }

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

  setActiveInstruction(line_index) {
    this._active_line = line_index;

    this._code.querySelectorAll("div").forEach((div, i) => {
      if (i === line_index) div.classList.add("active");
      else div.classList.remove("active");
    });
  }
}

export { View };
