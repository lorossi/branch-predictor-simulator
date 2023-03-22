# Branch Predictor

This is a simple simulation of a MIPS cpu with a correlating branch predictor, with customisable table size, addressing size, and counter size.

The cpu supports a limited set of the MIPS instructions (currently the subroutine calls are not supported).

Try it here: [branch-predictor](https://lorossi.github.io/branch-predictor-simulator/)


## Supported instructions

- `"add"`​
- `"sub"`​
- `"addi"`​
- `"subi"`​
- `"mul"`​
- `"mult"`​
- `"div"`​
- `"and"`​
- `"or"`​
- `"andi"`​
- `"ori"`​
- `"sll"`​
- `"srl"`​
- `"slt"`​
- `"slti"`​
- `"lw"`​
- `"sw"`​
- `"li"`​
- `"la"`​
- `"lui"`​
- `"mfhi"`​
- `"mflo"`​
- `"move"`​
- `"beq"`​
- `"bne"`​
- `"bgt"`​
- `"bge"`​
- `"blt"`​
- `"ble"`​
- `"jump"`​
- `"print_int"` - to browser console​
- `"print_char"`​ - to browser console​
- `"read_int"`​ - from browser prompt​
- `"read_char"`​ - from browser prompt​
- `"exit"`​
- `"NOP"`
