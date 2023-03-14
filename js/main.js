import { Canvas } from "./canvas.js";
import { Instruction } from "./instruction.js";
import { CPU } from "./cpu.js";

const clamp_max = (x, max1, max2) => Math.min(Math.min(x, max1), max2);

const resize_canvas = () => {
  const canvas = document.querySelector("canvas");
  const container = canvas.parentElement;
  const w = container.clientWidth;
  const h = container.clientHeight;
  const page_w = window.innerWidth;
  const page_h = window.innerHeight;

  const size = clamp_max(Math.min(w, h), page_w, page_h);
  canvas.style.width = size + "px";
  canvas.style.height = size + "px";
};

const main = () => {
  window.addEventListener("resize", resize_canvas);
  resize_canvas();

  const instructions = [
    "li $t0 512",
    "li $t1 1",
    "LOOP: beq $zero $t0 END",
    "sub $t0 $t0 $t1",
    "jump LOOP",
    "mov $v0 $t0",
    "END: print_int",
  ].map((s) => Instruction.fromString(s));

  const cpu = new CPU();
  cpu.load(instructions);
  cpu.run();
};

document.addEventListener("DOMContentLoaded", main);
