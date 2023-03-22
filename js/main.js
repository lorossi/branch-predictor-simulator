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
    ".data",
    "out: .space 3",
    ".text",
    "main:",
    "li $t0, 100",
    "la $t3, out",
    "LOOP1:",
    "subi $t0, $t0, 1",
    "lw $t4, 0($t3)",
    "addi $t4, $t4, 1",
    "sw $t4, 0($t3)",
    "li $t1, 100",
    "LOOP2:",
    "lw $t4, 1($t3)",
    "addi $t4, $t4, 1",
    "sw $t4, 1($t3)",
    "subi $t1, $t1, 1",
    "li $t2, 100",
    "LOOP3:",
    "lw $t4, 2($t3)",
    "addi $t4, $t4, 1",
    "sw $t4, 2($t3)",
    "subi $t2, $t2, 1",
    "bne $t2, $zero, LOOP3",
    "bne $t1, $zero, LOOP2",
    "bne $t0, $zero, LOOP1",
    "la $t0, out",
    "lw $a0, 0($t0)",
    "print_int",
    "lw $a0, 1($t0)",
    "print_int",
    "lw $a0, 2($t0)",
    "print_int",
  ]);
};

document.addEventListener("DOMContentLoaded", main);
