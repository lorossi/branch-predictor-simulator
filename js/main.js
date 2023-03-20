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
    ".globl",
    "a: .word 1 2 3 4 5",
    "b: .word 6 7 8 9 10",
    "out: .space 5",
    ".text",
    "la $t0, a",
    "la $t1, b",
    "la $t2, out",
    "li $t3, 5",
    "li $t4, 0",
    "loop:",
    "beq $t4, $t3, end",
    "lw $t5, 0($t0)",
    "lw $t6, 0($t1)",
    "add $t7, $t5, $t6",
    "sw $t7, 0($t2)",
    "addi $t0, $t0, 4",
    "addi $t1, $t1, 4",
    "addi $t2, $t2, 4",
    "addi $t4, $t4, 1",
    "jump loop",
    "end:",
  ]);
};

document.addEventListener("DOMContentLoaded", main);
