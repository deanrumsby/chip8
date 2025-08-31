const V_REG_COUNT = 16;
const STACK_SIZE = 16;
const MEMORY_SIZE = 4096;
const PROG_START = 0x200;

class Chip8 {
    pc = PROG_START;
    i = 0;
    sp = 0;
    dt = 0;
    st = 0;
    v = new Array(V_REG_COUNT).fill(0);
    stack = new Array(STACK_SIZE).fill(0);
    memory = new ArrayBuffer(MEMORY_SIZE);

    constructor() {
        this.view = new DataView(this.memory);
    }

    /**
     * Loads program into memory
     * @param {Uint8Array} bytes 
     */
    load(bytes) {
        const memory = new Uint8Array(this.memory);
        memory.set(bytes, PROG_START);
        console.log('memory', this.memory);
    }

    fetch() {
        const instruction = this.view.getUint16(this.pc);
        console.log('instruction', instruction.toString(16));
    }
}

export default Chip8;