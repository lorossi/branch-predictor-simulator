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
    "MOVI R0 512",
    "MOVI R1 1",
    "LOOP: BEQ ZERO R0 END",
    "SUB R0 R0 R1",
    "JUMP LOOP",
    "END: NOP",
  ].map((s) => Instruction.fromString(s));

  const cpu = new CPU();
  cpu.load(instructions);
  cpu.run();
  console.log(cpu.registers);
  console.log(cpu.accuracy);
};

document.addEventListener("DOMContentLoaded", main);
