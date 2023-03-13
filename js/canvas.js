class Canvas {
  constructor(selector) {
    this._canvas = document.querySelector(selector);
    this._ctx = this._canvas.getContext("2d");
    this._last_time = 0;

    window.requestAnimationFrame(this._run.bind(this));
  }

  _run() {
    window.requestAnimationFrame(this._run.bind(this));

    if (this._last_time == 0) this._last_time = performance.now();

    const now = performance.now();
    const dt = now - this._last_time;

    if (dt > 1000 / 60) {
      this._last_time = now;
      this.update(dt);
      this.draw();
    }
  }

  update(dt) {
    // Override this method
  }

  draw() {
    // Override this method
  }
}

export { Canvas };
