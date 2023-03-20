class Canvas {
  constructor(selector) {
    this._canvas = document.querySelector(selector);
    this._ctx = this._canvas.getContext("2d");
    this._last_time = 0;
    this._running = false;

    window.requestAnimationFrame(this._run.bind(this));

    this.autoResize();
  }

  start() {
    this._running = true;
  }

  stop() {
    this._running = false;
  }

  _run() {
    window.requestAnimationFrame(this._run.bind(this));

    if (!this._running) return;
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
    this._ctx.fillStyle = "black";
    this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
  }

  resize(width, height) {
    this._canvas.width = width;
    this._canvas.height = height;
  }

  autoResize() {
    const parent = this._canvas.parentElement;
    const w = parent.clientWidth;
    const h = parent.clientHeight;

    const mh = document.body.scrollHeight * 0.8;

    if (this._canvas.width != w || this._canvas.height != h) {
      const size = Math.min(Math.min(w, h), mh);
      this.resize(size, size);
    }
  }
}

export { Canvas };
