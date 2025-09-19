import Instruction from './instruction.js';
import FONT from './font.js';
import { formatHex } from './utils.js';

const V_REG_COUNT = 16;
const STACK_SIZE = 16;
const MEMORY_SIZE = 4096;
const PROG_START = 0x200;
const FONT_START = 0x050;
const FONT_SPRITE_SIZE = 5;
const FRAME_HEIGHT = 32;
const FRAME_WIDTH = 64;
const DEFAULT_SPEED = 700;
const TIMERS_FREQ = 60;
const KEY_COUNT = 16;
const SECOND_IN_MS = 1000;

class Chip8 {
    pc = PROG_START;
    i = 0;
    sp = 0;
    dt = 0;
    st = 0;
    v = new Array(V_REG_COUNT).fill(0);
    stack = new Array(STACK_SIZE).fill(0);
    memory = new ArrayBuffer(MEMORY_SIZE);
    keys = new Array(KEY_COUNT).fill(false);
    speed = DEFAULT_SPEED;
    #program = undefined;
    #recentKeyUp = undefined;
    #cycles = 0;
    #st = 0;
    #dt = 0;

    /**
     * Creates a new instance of the Chip8
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(canvas) {
        this.view = new DataView(this.memory);
        this.ctx = canvas.getContext('2d');
        this.#loadFont();
    }

    /**
     * Loads program into memory and retains a copy
     * @param {Uint8Array} bytes 
     */
    load(bytes) {
        const memory = new Uint8Array(this.memory);
        memory.set(bytes, PROG_START);
        this.#program = bytes;
    }

    /**
     * Progresses the state of the emulation by a duration of time.
     * @param {DOMHighResTimeStamp} duration 
     */
    emulate(duration) {
        this.#cycles += ((duration / SECOND_IN_MS) * this.speed);

        const steps = Math.floor(this.#cycles);

        for (let i = 0; i < steps; i += 1) {
            this.step();
        }
        this.#cycles -= steps;
    }

    /**
     * Steps the emulator through one execution cycle
     */
    step() {
        this.#stepTimers();

        const instruction = this.#fetch();
        this.#execute(instruction);
    }

    /**
     * Resets the emulator state. Any loaded program will be reset to its initial state.
     */
    reset() {
        this.pc = PROG_START;
        this.i = 0;
        this.sp = 0;
        this.dt = 0;
        this.st = 0;
        this.v.fill(0);
        this.stack.fill(0);
        this.#recentKeyUp = undefined;
        this.#cycles = 0;
        this.#st = 0;
        this.#dt = 0;
        this.#resetMemory();

        if (this.#program) {
            this.load(this.#program);
        }

        this.#clearScreen();
    }

    /**
     * Sets the state for a given key
     * @param {number} key 
     * @param {boolean} isPressed 
     */
    setKeyState(key, isPressed) {
        this.keys[key] = isPressed;
        this.#recentKeyUp = !isPressed ? key : undefined;
    }

    /**
     * Disassembles the currently loaded program into an array of lines
     * @returns {string[]}
     */
    disassemble() {
        let result = "";
        let offset = PROG_START;
        while (offset < this.memory.byteLength) {
            const u16 = this.view.getUint16(offset);
            const instruction = new Instruction(u16);
            if (instruction.type) {
                result += `${formatHex(offset, 4)}: ${instruction.mnemonic()}\n`;
            }
            offset += 2;
        }
        return result;
    }

    #stepTimers() {
        this.#stepDT();
        this.#stepST();
    }

    #stepDT() {
        if (this.dt > 0) {
            this.#dt += ((1 / this.speed) * TIMERS_FREQ);
        }
        const decrement = Math.floor(this.#dt);
        this.dt -= decrement;
        this.#dt -= decrement;
    }

    #stepST() {
        if (this.st > 0) {
            this.#st += ((1 / this.speed) * TIMERS_FREQ);
        }
        const decrement = Math.floor(this.#st);
        this.st -= decrement;
        this.#st -= decrement;
    }

    #loadFont() {
        const memory = new Uint8Array(this.memory);
        memory.set(FONT, FONT_START);
    }

    #resetMemory() {
        for (let offset = 0; offset < this.memory.byteLength; offset += 1) {
            this.view.setUint8(offset, 0);
        }
    }

    #fetch() {
        const u16 = this.view.getUint16(this.pc);
        this.pc += 2;
        return new Instruction(u16);
    }

    #execute(instruction) {
        const { type, x, y, nnn, nn, n } = instruction;

        switch (type) {
            case '00E0': {
                this.#clearScreen();
                break;
            }
            case '00EE': {
                const address = this.stack[this.sp];
                this.sp -= 1;
                this.pc = address;
                break;
            }
            case '1NNN': {
                this.pc = nnn;
                break;
            }
            case '2NNN': {
                this.sp += 1;
                this.stack[this.sp] = this.pc;
                this.pc = nnn;
                break;
            }
            case '3XNN': {
                if (this.v[x] === nn) {
                    this.pc += 2;
                }
                break;
            }
            case '4XNN': {
                if (this.v[x] !== nn) {
                    this.pc += 2;
                }
                break;
            }
            case '5XY0': {
                if (this.v[x] === this.v[y]) {
                    this.pc += 2;
                }
                break;
            }
            case '6XNN': {
                this.v[x] = nn;
                break;
            }
            case '7XNN': {
                this.v[x] = (this.v[x] + nn) & 0xff;
                break;
            }
            case '8XY0': {
                this.v[x] = this.v[y];
                break;
            }
            case '8XY1': {
                this.v[x] |= this.v[y];
                break;
            }
            case '8XY2': {
                this.v[x] &= this.v[y];
                break;
            }
            case '8XY3': {
                this.v[x] ^= this.v[y];
                break;
            }
            case '8XY4': {
                const sum = this.v[x] + this.v[y];
                this.v[x] = sum & 0xff;
                this.v[0xf] = sum > 0xff ? 1 : 0;
                break;
            }
            case '8XY5': {
                const difference = this.v[x] - this.v[y];
                this.v[x] = difference > 0 ? difference : 0x100 + difference;
                this.v[0xf] = difference > 0 ? 1 : 0;
                break;
            }
            case '8XY6': {
                this.v[0xf] = this.v[x] & 0x1;
                this.v[x] >>= 1;
                break;
            }
            case '8XY7': {
                const difference = this.v[y] - this.v[x];
                this.v[x] = difference & 0xff;
                this.v[0xf] = difference > 0 ? 1 : 0;
                break;
            }
            case '8XYE': {
                this.v[0xf] = this.v[x] & 0x80;
                this.v[x] = (this.v[x] << 1) & 0xff;
                break;
            }
            case '9XY0': {
                if (this.v[x] !== this.v[y]) {
                    this.pc += 2;
                }
                break;
            }
            case 'ANNN': {
                this.i = nnn;
                break;
            }
            case 'BNNN': {
                this.pc = this.v[0] + nnn;
                break;
            }
            case 'CXNN': {
                this.v[x] = nn & Math.floor(Math.random() * 0x100);
                break;
            }
            case 'DXYN': {
                const sx = this.v[x] % FRAME_WIDTH;
                const sy = this.v[y] % FRAME_HEIGHT;
                const sw = 8;
                const sh = n;

                const imageData = this.ctx.getImageData(sx, sy, sw, sh);
                let hasCollision = false;

                for (let i = 0; i < n; i += 1) {
                    let byte = this.view.getUint8(this.i + i);

                    for (let j = sw - 1; j >= 0; j -= 1) {
                        const bit = byte & 1;
                        const spritePixelAlpha = bit === 1 ? 255 : 0;
                        byte = byte >> 1;

                        const pixelOffset = (i * 4 * sw) + (j * 4)
                        const pixelAlphaOffset = pixelOffset + 3;
                        const pixelAlpha = imageData.data[pixelAlphaOffset];

                        imageData.data[pixelAlphaOffset] = spritePixelAlpha ^ pixelAlpha;

                        if (!hasCollision) {
                            if ((spritePixelAlpha & pixelAlpha) === 0xff) {
                                hasCollision = true;
                            }
                        }
                    }
                }

                this.ctx.putImageData(imageData, sx, sy);
                this.v[0xf] = hasCollision ? 1 : 0;
                break;
            }
            case 'EX9E': {
                if (this.keys[this.v[x]]) {
                    this.pc += 2;
                }
                break;
            }
            case 'EXA1': {
                if (!this.keys[this.v[x]]) {
                    this.pc += 2;
                }
                break;
            }
            case 'FX07': {
                this.v[x] = this.dt;
                break;
            }
            case 'FX0A': {
                if (this.#recentKeyUp !== undefined) {
                    this.v[x] = this.#recentKeyUp;
                } else {
                    this.pc -= 2;
                }
                break;
            }
            case 'FX15': {
                this.dt = this.v[x];
                break;
            }
            case 'FX18': {
                this.st = this.v[x];
                break;
            }
            case 'FX1E': {
                this.i = ((this.i + this.v[x]) & 0xffff);
                break;
            }
            case 'FX29': {
                const digit = this.v[x] & 0xf;
                this.i = FONT_START + (digit * FONT_SPRITE_SIZE);
                break;
            }
            case 'FX33': {
                let number = this.v[x];
                for (let i = 2; i >= 0; i -= 1) {
                    this.view.setUint8(this.i + i, number % 10);
                    number = Math.floor(number / 10);
                }
                break;
            }
            case 'FX55': {
                for (let i = 0; i <= x; i += 1) {
                    this.view.setUint8(this.i + i, this.v[i]);
                }
                break;
            }
            case 'FX65': {
                for (let i = 0; i <= x; i += 1) {
                    this.v[i] = this.view.getUint8(this.i + i);
                }
                break;
            }
        }

        this.#recentKeyUp = undefined;
    }

    #clearScreen() {
        this.ctx.clearRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);
    }
}

export default Chip8;