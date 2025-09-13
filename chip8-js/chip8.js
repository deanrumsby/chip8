import Instruction from './instruction.js';
import { formatHex } from './utils.js';

const V_REG_COUNT = 16;
const STACK_SIZE = 16;
const MEMORY_SIZE = 4096;
const PROG_START = 0x200;
const FRAME_HEIGHT = 32;
const FRAME_WIDTH = 64;

class Chip8 {
    pc = PROG_START;
    i = 0;
    sp = 0;
    dt = 0;
    st = 0;
    v = new Array(V_REG_COUNT).fill(0);
    stack = new Array(STACK_SIZE).fill(0);
    memory = new ArrayBuffer(MEMORY_SIZE);
    program = undefined;

    /**
     * Creates a new instance of the Chip8
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(canvas) {
        this.view = new DataView(this.memory);
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    /**
     * Loads program into memory and retains a copy
     * @param {Uint8Array} bytes 
     */
    load(bytes) {
        const memory = new Uint8Array(this.memory);
        memory.set(bytes, PROG_START);
        this.program = bytes;
    }

    /**
     * Steps the emulator through one execution cycle
     */
    step() {
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
        this.#resetMemory();

        if (this.program) {
            this.load(this.program);
        }

        this.#clearScreen();
    }

    /**
     * Disassembles the currently loaded program into an array of lines
     * @returns {string[]}
     */
    disassemble() {
        const result = [];
        let offset = PROG_START;
        while (offset < this.memory.byteLength) {
            const u16 = this.view.getUint16(offset);
            const instruction = new Instruction(u16);
            if (instruction.type) {
                result.push(`${formatHex(offset, 4)}: ${instruction.mnemonic()}`);
            }
            offset += 2;
        }
        return result;
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
            case '1NNN': {
                this.pc = nnn;
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
            case 'ANNN': {
                this.i = nnn;
                break;
            }
            case 'DXYN': {
                const sx = this.v[x] % FRAME_WIDTH;
                const sy = this.v[y] % FRAME_HEIGHT;
                const sw = 8;
                const sh = n;

                const imageData = this.ctx.getImageData(sx, sy, sw, sh);

                for (let i = 0; i < n; i += 1) {
                    let byte = this.view.getUint8(this.i + i);

                    for (let j = 0; j < sw; j += 1) {
                        const bit = byte & 1;
                        const spritePixelAlpha = bit === 1 ? 255 : 0;
                        byte = byte >> 1;

                        const pixelOffset = (i * 4 * sw) + (j * 4)
                        const pixelAlphaOffset = pixelOffset + 3;
                        const pixelAlpha = imageData.data[pixelAlphaOffset];
                        imageData.data[pixelAlphaOffset] = spritePixelAlpha ^ pixelAlpha;
                    }
                }


                console.log('image', imageData.data);

                this.ctx.putImageData(imageData, sx, sy);
                break;
            }
        }
    }

    #clearScreen() {
        this.ctx.clearRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);
    }
}

export default Chip8;