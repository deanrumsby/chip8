import DecodedInstruction from "../interfaces/decoded-instruction";
import Display from "./display";
import { FONT } from "../data/font";

export default class Chip8 {
  display: Display;
  memory: DataView;
  stack: Uint16Array;
  start: number;
  end: number;
  PC: number;
  I: number;
  registers: Array<number>
  delayTimer: number;
  soundTimer: number;
  instructionsPerSecond: number;

  constructor() {
    this.display = new Display();
    this.memory = new DataView(new ArrayBuffer(4096));
    this.stack = new Uint16Array(16);
    this.start = 0x200;
    this.end = 0x1000;
    this.PC = this.start;
    this.I = 0x00;
    this.registers = [
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
    ];
    this.delayTimer = 0x00;
    this.soundTimer = 0x00;
    this.instructionsPerSecond = 700;

    this.load('')
  }

  async load(path: string) {
    for (let i = 0; i < FONT.length; i++) {
      this.memory.setUint8(0x50 + i, FONT[i]);
    }
    const data = await fetch(path);
    const buffer = await data.arrayBuffer();
    const uint8 = new Uint8Array(buffer);
    for (let i = 0; i < uint8.byteLength; i++) {
      this.memory.setUint8(this.start + i, uint8[i]);
    }
  }

  dumpMemory() {
    for (let i = 0; i < 4096; i += 2) {
      console.log(i.toString(16), this.memory.getUint16(i).toString(16));
    }
  }

  fetch() {
    const instruction = this.memory.getUint16(this.PC);
    this.PC += 2;
    return instruction;
  }

  decode(instruction: number) {
    const decodedInstruction: DecodedInstruction = {
      type: (instruction & 0b1111000000000000) >> 12,
      nnn: instruction & 0b0000111111111111,
      nn: instruction & 0b0000000011111111,
      n: instruction & 0b0000000000001111,
      x: (instruction & 0b0000111100000000) >> 8,
      y: (instruction & 0b0000000011110000) >> 4,
    }
    return decodedInstruction;
  }

  execute(instruction: DecodedInstruction) {
    switch (instruction.type) {
      case 0x0:
        switch (instruction.n) {
          case 0x0:
            // 00E0: CLEAR SCREEN
            // Clears the display
            this.display.clearScreen();
            break;
          case 0xE:
            // RETURN FROM SUBROUTINE
            break;
        }
        break;

      case 0x1:
        // 1NNN: JUMP
        // Jumps the program counter to instruction NNN
        this.PC = instruction.nnn;
        break;

      case 0x2:
        // CALL SUBROUTINE AT NNN
        break;

      case 0x3:
        // SKIP INSTRUCTION IF VX === NN
        break;

      case 0x4:
        // SKIP INSTRUCTION IF VX !== NN
        break;

      case 0x5:
        // SKIP INSTRUCTION IF VX === VY
        break;

      case 0x6:
        // 6XNN: SET
        // Sets VX = NN
        this.registers[instruction.x] = instruction.nn;
        break;

      case 0x7:
        // 7XNN: ADD
        // Sets VX += NN
        // No flag set on overflow
        this.registers[instruction.x] += instruction.nn;
        break;

      case 0x8:
        switch (instruction.n) {
          case 0x0:
            // SET VX = VY
            break;

          case 0x1:
            // VX |= VY
            break;

          case 0x2:
            // VX &= VY
            break;

          case 0x3:
            // VX ^= VY
            break;

          case 0x4:
            // VX += VY (WITH OVERFLOW VF FLAG)
            break;

          case 0x5:
            // VX -= VY (AFFECTS VF FLAG)
            break;

          case 0x6:
            // OPTION ONE: SET VX = VY, then VX >> 1
            // (SHIFTED OUT BIT IN VF FLAG)
            // OPTION TWO : VX >> 1
            // (SHIFTED OUT BIT IN VF FLAG)
            break;

          case 0x7:
            // VX = VY - VX (AFFECTS FLAG)
            break;

          case 0xE:
            // OPTION ONE: SET VX = VY, then VX << 1
            // (SHIFTED OUT BIT IN VF FLAG)
            // OPTION TWO : VX << 1
            // (SHIFTED OUT BIT IN VF FLAG)
            break;
        }

      case 0xA:
        // ANNN: SET INDEX
        // Sets I = NNN
        this.I = instruction.nnn;
        break;

      case 0xB:
        // OPTION ONE: JUMP TO NNN + V0
        // OPTION TWO: JUMP TO XNN + VX
        break;

      case 0xC:
        // GENERATE RANDOM NUMBER 'R', THEN VX = R & NN
        break;

      case 0xD:
        // DXYN: DISPLAY
        // Draws a sprite N tall at location X, Y on the display
        const x = this.registers[instruction.x] % 64;
        const y = this.registers[instruction.y] % 32;
        const height = instruction.n;
        for (let i = 0; i < height; i++) {
          const byte = this.memory.getUint8(this.I + i);
          this.display.toggleByte(x, y + i, byte);
        }
        this.display.draw();
        break;

      case 0xE:
        switch (instruction.n) {
          case 0x1:
            // SKIP INSTRUCTION IF BUTTON WITH VALUE VX NOT 
            // CURRENTLY PRESSED DOWN
            break;

          case 0xE:
            // SKIP INSTRUCTION IF BUTTON WITH VALUE VX IS 
            // CURRENTLY PRESSED DOWN
            break;
        }

      case 0xF:
        switch (instruction.nn) {
          case 0x07:
            // SET VX TO CURRENT VALUE OF DELAY TIMER
            break;

          case 0x0A:
            // HALTS PC UNTIL KEY IS PRESSED
            break;

          case 0x15:
            // SETS DELAY TIMER TO VALUE OF VX
            break;

          case 0x18:
            // SETS THE SOUND TIMER TO VALUE IN VX
            break;

          case 0x1E:
            // SET I += VX (AFFECTS OVERFLOW FLAG)
            break;

          case 0x29:
            // SET I TO THE FONT ADDRESS OF THE HEX
            // CHARACTER IN VX
            break;

          case 0x33:
            // BINARY CODED DECIMAL CONVERSION -
            // SEE DOCS
            break;

          case 0x55:
            // STORES REGISTERS TO MEMORY - SEE DOCS
            break;

          case 0x65:
            // LOADS REGISTERS FROM MEMORY - SEE DOCS
            break;
        }
    }
  }

  step() {
    const instruction = this.fetch();
    const decodedInstruction = this.decode(instruction);
    this.execute(decodedInstruction);
  }

  run() {
    setInterval(() => {
      this.step()
    }, 1000 / this.instructionsPerSecond);
  }
}