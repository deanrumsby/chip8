import DecodedInstruction from "./interfaces/decoded-instruction";

export default class Chip8 {
    memory: DataView;
    stack: Uint16Array;
    PC: number;
    I: number;
    registers: {
        V0: number, V1: number, V2: number, V3: number,
        V4: number, V5: number, V6: number, V7: number,
        V8: number, V9: number, VA: number, VB: number,
        VC: number, VD: number, VE: number, VF: number,
    };
    delayTimer: number;
    soundTimer: number;

    constructor() {
        this.memory = new DataView(new ArrayBuffer(4096));
        this.stack = new Uint16Array(16);
        this.PC = 0x200;
        this.I = 0x00;
        this.registers = {
            V0: 0x00, V1: 0x00, V2: 0x00, V3: 0x00,
            V4: 0x00, V5: 0x00, V6: 0x00, V7: 0x00,
            V8: 0x00, V9: 0x00, VA: 0x00, VB: 0x00,
            VC: 0x00, VD: 0x00, VE: 0x00, VF: 0x00, 
        }
        this.delayTimer = 0x00;
        this.soundTimer = 0x00;
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
            n: instruction & 0b0000000000001111,
            x: (instruction & 0b0000111100000000) >> 8,
            y: (instruction & 0b0000000011110000) >> 4,
            kk: instruction & 0b0000000011111111
        }
        return decodedInstruction;
    }

    execute(instruction: DecodedInstruction) {
        
    }
}