import DecodedInstruction from "../interfaces/decoded-instruction";
import Display from "./display";

export default class Chip8 {
    display: Display;
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
        this.display = new Display();
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
                        // CLEAR SCREEN
                        break;
                    case 0xE:
                        // RETURN FROM SUBROUTINE
                        break;
                }
                break;
            
            case 0x1:
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
                // SET VX = NN
                break;

            case 0x7:
                // VX += NN (NO OVERFLOW VF FLAG)
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
                // SET I = NNN
                break;

            case 0xB:
                // OPTION ONE: JUMP TO NNN + V0
                // OPTION TWO: JUMP TO XNN + VX
                break;

            case 0xC:
                // GENERATE RANDOM NUMBER 'R', THEN VX = R & NN
                break;
                    
            case 0xD:
                // DISPLAY - CHECK DOCS
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
}