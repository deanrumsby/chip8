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
  cycles: number;
  cyclesPerSecond: number;
  clearScreen: Function;
  drawSprite: Function;
  cosmacCompatability: boolean;
  keyPressed: number | null;

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
    this.cycles = 0;
    this.cyclesPerSecond = 700;
    this.clearScreen = () => {};
    this.drawSprite = () => {};
    this.cosmacCompatability = false;
    this.keyPressed = null;
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

  clock() {

  }

  reduceTimers() {
    if (this.delayTimer > 0) {
      this.delayTimer--;
    }
    if (this.soundTimer > 0) {
      this.soundTimer--;
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
        switch (instruction.nnn) {
          case 0x0E0:
            // 00E0: CLS
            // Clears the display
            this.clearScreen();
            break;
          case 0x0EE:
            // 00EE: RET
            // Returns from subroutine
            this.SP -= 1;
            this.PC = this.stack[this.SP];
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
            // 8XY6: SHR VX {, VY}
            // Shifts VX bitwise to the right, storing the shifted bit in VF
            // If cosmac compatability is on, first sets VX = VY before the shift
            if (this.cosmacCompatability) {
              this.registers[instruction.x] = this.registers[instruction.y];
            }
            this.registers[0xF] = this.registers[instruction.x] % 2;
            this.registers[instruction.x] >>= 1;
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
            // 8XYE: SHL VX {, VY}
            // Shifts VX bitwise to the left, storing the shifted bit in VF
            // If cosmac compatability is on, first sets VX = VY before the shift
            if (this.cosmacCompatability) {
              this.registers[instruction.x] = this.registers[instruction.y];
            }
            this.registers[0xF] = (this.registers[instruction.x] & 0b10000000) >> 7;
            this.registers[instruction.x] <<= 1;
            this.registers[instruction.x] %= 0x100;
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
        // BNNN: JMP V0, NNN (Cosmac Capatability On)
        // Sets PC = V0 + NNN
        // BXNN: JMP X0, NNN (Cosmac Capatability Off)
        // Sets PC = VX + XNN
        if (this.cosmacCompatability) {
          this.PC = this.registers[0x0] + instruction.nnn;
        } else {
          this.PC = this.registers[instruction.x] + instruction.nnn;
        }
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
        switch (instruction.nn) {
          case 0x9E:
            // EX9E: SKP VX
            // Skips the next instruction if the key with value VX is currently pressed
            if (this.keyPressed === this.registers[instruction.x]) {
              this.PC += 2;
            }
            break;

          case 0xA1:
            // EXA1: SKNP VX
            // Skips the next instruction if the key with value VX is not pressed
            if (this.keyPressed !== this.registers[instruction.x]) {
              this.PC += 2;
            }
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
            // FX0A: LD VX, K
            // Waits for a key press, then stores the value in VX
            // Only registers the key when released
            if (this.keyPressed) {
              this.registers[instruction.x] = this.keyPressed;
            } else {
              this.PC -= 2;
            }
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
            // FX33: LD B, VX
            // Stores the decimal value of VX in memory I, I + 1, I + 2
            // One decimal digit in each address space
            for (let i = 0; i < 3; i++) {
              const digit = Math.floor(this.registers[instruction.x] / (10 ** (2 - i))) % 10;
              this.setMemory(this.I + i, 1, digit);
            }
            break;

          case 0x55:
            // FX55: LD [I], VX
            // Stores registers V0 to VX to memory, starting at [I]
            // With cosmac compatability on, each register stored increments I
            for (let i = 0; i <= instruction.x; i++) {
              this.memory.setUint8(this.I + i, this.registers[i]);
            }
            if (this.cosmacCompatability) {
              this.I += instruction.x + 1;
            }
            break;

          case 0x65:
            // FX55: LD VX, [I]
            // Loads memory into registers V0 to VX, starting at [I]
            // With cosmac compatability on, each register loaded increments I
            for (let i = 0; i <= instruction.x; i++) {
              this.registers[i] = this.memory.getUint8(this.I + i);
            }
            if (this.cosmacCompatability) {
              this.I += instruction.x + 1;
            }
            break;
        }
      break;

      default:
        console.log('Not a valid instruction!', instruction);
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
    if (this.keyPressed) {
      this.keyPressed = null;
    }
    // CODE BELOW ONLY WORKS AT SPEED >= 60 per second
    if (this.cycles % Math.floor(this.cyclesPerSecond / 60) === 0) {
      this.reduceTimers();
    }
    this.cycles++;
  }

  sleep(milliseconds: number) {
    return new Promise((resolve: Function) => {
      setTimeout(() => resolve(), milliseconds);
    });
  }

  determineCyclesPerInterval() {
    if (this.cyclesPerSecond < 40) {
      return 1;
    } else if (this.cyclesPerSecond < 100) {
      return 4;
    } else if (this.cyclesPerSecond < 200) {
      return 8;
    } else if (this.cyclesPerSecond < 500) {
      return 24;
    } else {
      return 50;
    }
  }

  async run() {
    this.running = true;
    let startTime = performance.now();
    while (this.running) {
      const cyclesPerInterval = this.determineCyclesPerInterval();
      if (this.cycles === cyclesPerInterval) {
        const endTime = performance.now();
        const timeDelta = endTime - startTime;
        const timePerCycle = 1000 / this.cyclesPerSecond;
        const sleepTime = (timePerCycle * cyclesPerInterval) - timeDelta;
        console.log(sleepTime);
        await this.sleep(sleepTime);
        this.cycles = 0;
        startTime = performance.now();
      }
      this.step();
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