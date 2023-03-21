import { Model } from "./model.js";
import { View } from "./view.js";
import { Controller } from "./controller.js";

const main = () => {
  const model = new Model();
  const view = new View();
  const controller = new Controller();

  controller.setModel(model);
  controller.setView(view);
  model.setView(view);

  controller.setCode([
    ".text",
    "LI $t0, 1000",
    "LI $t2, 0",
    "LI $t3, 0",
    "LOOP:",
    "ADDI $t2, $t2, 1",
    "LI $t1, 100",
    "LOOP2:",
    "ADDI $t3, $t3, 1",
    "SUBI $t1, $t1, 1",
    "BNE $t1, $zero, LOOP2",
    "SUBI $t0, $t0, 1",
    "BNE $t0, $zero, LOOP",
  ]);
};

document.addEventListener("DOMContentLoaded", main);
