import DecodedInstruction from "../interfaces/decoded-instruction";
import { FONT } from "../data/font";

export default class Chip8 {
  memory: DataView;
  stack: Uint16Array;
  progStart: number;
  progEnd: number;
  fontStart: number;
  PC: number;
  I: number;
  SP: number;
  registers: Array<number>
  delayTimer: number;
  soundTimer: number;
  running: boolean;
  cyclesPerSecond: number;
  clearScreen: Function;
  drawSprite: Function;

  constructor() {
    this.memory = new DataView(new ArrayBuffer(4096));
    this.stack = new Uint16Array(16);
    this.progStart = 0x200;
    this.progEnd = 0x1000;
    this.fontStart = 0x50;
    this.PC = this.progStart;
    this.I = 0x00;
    this.SP = 0x00;
    this.registers = [
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
    ];
    this.delayTimer = 0x00;
    this.soundTimer = 0x00;
    this.running = false;
    this.cyclesPerSecond = 700;
    this.clearScreen = () => {};
    this.drawSprite = () => {};
  }

  bindClearScreen(callback: Function) {
    this.clearScreen = callback;
  }

  bindDrawSprite(callback: Function) {
    this.drawSprite = callback;
  }

  async load(path: string) {
    this.reset();
    for (let i = 0; i < FONT.length; i++) {
      this.memory.setUint8(this.fontStart + i, FONT[i]);
    }
    const data = await fetch(path);
    const buffer = await data.arrayBuffer();
    const uint8 = new Uint8Array(buffer);
    for (let i = 0; i < uint8.byteLength; i++) {
      this.memory.setUint8(this.progStart + i, uint8[i]);
    }
  }

  setMemory(byteOffset: number, numBytes: 1 | 2, value: number) {
    if (numBytes === 1) {
      this.memory.setUint8(byteOffset, value);
    } else if (numBytes === 2) {
      this.memory.setUint16(byteOffset, value);
    }
  }

  dumpMemory() {
    for (let i = 0; i < 4096; i += 2) {
      console.log(i.toString(16), this.memory.getUint16(i).toString(16));
    }
  }

  resetMemory() {
    this.memory = new DataView(new ArrayBuffer(4096));
  }

  resetRegisters() {
    for (let register of this.registers) {
      register = 0x00;
    }
    this.I = 0x00;
    this.PC = this.progStart;
    this.delayTimer = 0x00;
    this.soundTimer = 0x00;
  }

  resetStack() {
    this.stack = new Uint16Array(16);
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
        switch (instruction.nnn) {
          case 0x0E0:
            // 00E0: CLS
            // Clears the display
            this.clearScreen();
            break;
          case 0x0EE:
            // RETURN FROM SUBROUTINE
            break;
        }
        break;

      case 0x1:
        // 1NNN: JMP NNN
        // Jumps the program counter to value NNN
        this.PC = instruction.nnn;
        break;

      case 0x2:
        // 2NNN: CALL NNN
        // Calls subroutine at NNN
        this.stack[this.SP] = this.PC;
        this.SP += 1;
        this.PC = instruction.nnn;
        break;

      case 0x3:
        // 3XNN: SE VX, NN
        // Skips the next instruction if VX === NN
        if (this.registers[instruction.x] === instruction.nn) {
          this.PC += 2;
        }
        break;

      case 0x4:
        // 4XNN: SNE VX, NN
        // Skips the next instruction if VX !== NN
        if (this.registers[instruction.x] !== instruction.nn) {
          this.PC += 2;
        }
        break;

      case 0x5:
        // 5XY0: SE VX, VY
        // Skips the next instruction if VX === VY
        if (this.registers[instruction.x] === this.registers[instruction.y]) {
          this.PC += 2;
        }
        break;

      case 0x6:
        // 6XNN: LD VX, NN
        // Sets VX = NN
        this.registers[instruction.x] = instruction.nn;
        break;

      case 0x7:
        // 7XNN: ADD VX, NN
        // Sets VX += NN
        // No flag set on overflow
        this.registers[instruction.x] += instruction.nn;
        break;

      case 0x8:
        switch (instruction.n) {
          case 0x0:
            // 8XY0: LD VX, VY
            // Sets VX = VY
            this.registers[instruction.x] = this.registers[instruction.y];
            break;

          case 0x1:
            // 8XY1: OR VX, VY
            // Sets VX |= VY
            this.registers[instruction.x] |= this.registers[instruction.y];
            break;

          case 0x2:
            // 8XY2: AND VX, VY
            // Sets VX &= VY
            this.registers[instruction.x] &= this.registers[instruction.y];
            break;

          case 0x3:
            // 8XY3: XOR VX, VY
            // Sets VX ^= VY
            this.registers[instruction.x] ^= this.registers[instruction.y];
            break;

          case 0x4:
            // 8XY4: ADD VX, VY
            // Sets VX += VY
            // In the event of an overflow, sets VF = 1
            this.registers[instruction.x] += this.registers[instruction.y];
            if (this.registers[instruction.x] > 0xFF) {
              this.registers[instruction.x] -= 0x100;
              this.registers[0xF] = 1;
            }
            break;

          case 0x5:
            // 8XY5: SUB VX, VY
            // Sets VX -= VY
            // In the event of an underflow, keeps VF = 0; else VF = 1
            this.registers[instruction.x] -= this.registers[instruction.y];
            this.registers[0xF] = 1;
            if (this.registers[instruction.x] < 0x00) {
              this.registers[instruction.x] += 0x100;
              this.registers[0xF] = 0;
            }
            break;

          case 0x6:
            // OPTION ONE: SET VX = VY, then VX >> 1
            // (SHIFTED OUT BIT IN VF FLAG)
            // OPTION TWO : VX >> 1
            // (SHIFTED OUT BIT IN VF FLAG)
            break;

          case 0x7:
            // 8XY7: SUBN VX, VY 
            // Sets VX = VY - VX
            // In the event of an underflow, keeps VF = 0; else VF = 1
            const result = this.registers[instruction.y] - this.registers[instruction.x];
            this.registers[instruction.x] = result;
            this.registers[0xF] = 1;
            if (this.registers[instruction.x] < 0x00) {
              this.registers[instruction.x] += 0x100;
              this.registers[0xF] = 0;
            }
            break;

          case 0xE:
            // OPTION ONE: SET VX = VY, then VX << 1
            // (SHIFTED OUT BIT IN VF FLAG)
            // OPTION TWO : VX << 1
            // (SHIFTED OUT BIT IN VF FLAG)
            break;
        }
      
      case 0x9:
        // 9XY0: SNE VX, VY
        // Skips the next instruction if VX !== VY
        if (this.registers[instruction.x] !== this.registers[instruction.y]) {
          this.PC += 2;
        }
        break;

      case 0xA:
        // ANNN: LD I, NNN
        // Sets I = NNN
        this.I = instruction.nnn;
        break;

      case 0xB:
        // OPTION ONE: JUMP TO NNN + V0
        // OPTION TWO: JUMP TO XNN + VX
        break;

      case 0xC:
        // CXNN: RND VX, NN
        // For random number R, sets VX = R & NN
        const r = Math.floor(Math.random() * 0x100);
        this.registers[instruction.x] = r & instruction.nn;
        break;

      case 0xD:
        // DXYN: DRW VX, VY, N
        // Draws a sprite N tall at location X, Y on the display
        const x = this.registers[instruction.x] % 64;
        const y = this.registers[instruction.y] % 32;
        const height = instruction.n;
        const sprite = [];
        for (let i = 0; i < height; i++) {
          const byte = this.memory.getUint8(this.I + i);
          sprite.push(byte);
        }
        this.drawSprite(x, y, sprite);
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
            // FX07: LD VX, DT
            // Set VX = DT
            this.registers[instruction.x] = this.delayTimer;
            break;

          case 0x0A:
            // HALTS PC UNTIL KEY IS PRESSED
            break;

          case 0x15:
            // FX15: LD DT, VX
            // Set DT = VX
            this.delayTimer = this.registers[instruction.x];
            break;

          case 0x18:
            // FX18: LD ST, VX
            // Set ST = VX
            this.soundTimer = this.registers[instruction.x];
            break;

          case 0x1E:
            // FX1E: ADD I, VX
            // Set I = I + VX
            // After addition, if I >= 0x1000 then set VF = 1
            this.I += this.registers[instruction.x];
            if (this.I >= 0x1000) {
              this.registers[0xF] = 1;
            }
            break;

          case 0x29:
            // FX29: LD F, VX
            // Set I to the location of the font character value in VX
            this.I = this.fontStart + (this.registers[instruction.x] * 5); 
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
    if (this.PC === this.progEnd) {
      return;
    }
    const instruction = this.fetch();
    console.log(instruction.toString(16)); // <-------- REMOVE THIS LATER
    const decodedInstruction = this.decode(instruction);
    this.execute(decodedInstruction);
  }

  sleep(milliseconds: number) {
    return new Promise((resolve: Function) => {
      setTimeout(() => resolve(), milliseconds);
    });
  }

  async run() {
    this.running = true;
    let startTime = performance.now();
    let cycles = 0;
    while (this.running) {
      if (cycles === this.cyclesPerSecond) {
        const endTime = performance.now();
        const sleepTime = 1000 - (endTime - startTime);
        console.log(sleepTime);
        await this.sleep(sleepTime);
        cycles = 0;
        startTime = performance.now();
      }
      this.step();
      cycles++;
    }
  }

  stop() {
    this.running = false;
  }

  reset() {
    this.stop();
    this.clearScreen();
    this.resetRegisters();
    this.resetStack();
  }

  eject() {
    this.reset();
    this.resetMemory();
  }
}