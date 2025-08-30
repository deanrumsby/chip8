const V_REG_COUNT = 16;
const STACK_SIZE = 16;
const MEMORY_SIZE = 4096;

class Chip8 {
    pc = 0;
    i = 0;
    sp = 0;
    dt = 0;
    st = 0;
    v = Array(V_REG_COUNT).fill(0);
    stack = Array(STACK_SIZE).fill(0);
    memory = Array(MEMORY_SIZE).fill(0);
}

export default Chip8;