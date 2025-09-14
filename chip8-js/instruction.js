import { formatHex, formatDec } from "./utils.js";

class Instruction {
    constructor(value) {
        this.value = value;
        this.opcode = (value & 0xf000) >> 12;
        this.x = (value & 0x0f00) >> 8;
        this.y = (value & 0x00f0) >> 4;
        this.nnn = value & 0x0fff;
        this.nn = value & 0x00ff;
        this.n = value & 0x000f;
        this.type = this.#decode(value);
    }

    /**
     * Returns the human readable mnemonic for the instruction
     * @returns {string}
     */
    mnemonic() {
        switch (this.type) {
            case "00E0": {
                return "CLS";
            }
            case "00EE": {
                return "RET";
            }
            case "1NNN": {
                return `JMP ${formatHex(this.nnn, 4)}`;
            }
            case "2NNN": {
                return `CALL ${formatHex(this.nnn, 4)}`;
            }
            case "3XNN": {
                return `SE V${formatHex(this.x, 1, false)}, ${formatDec(this.nn, 2)}`;
            }
            case "4XNN": {
                return `SNE V${formatHex(this.x, 1, false)}, ${formatDec(this.nn, 2)}`;
            }
            case "5XY0": {
                return `SE V${formatHex(this.x, 1, false)}, V${formatHex(this.y, 1, false)}`
            }
            case "6XNN": {
                return `SET V${formatHex(this.x, 1, false)}, ${formatDec(this.nn, 3)}`;
            }
            case "7XNN": {
                return `ADD V${formatHex(this.x, 1, false)}, ${formatDec(this.nn, 3)}`;
            }
            case "8XY0": {
                return `LD V${formatHex(this.x, 1, false)}, V${formatHex(this.y, 1, false)}`;
            }
            case "8XY1": {
                return `OR V${formatHex(this.x, 1, false)}, V${formatHex(this.y, 1, false)}`;
            }
            case "8XY2": {
                return `AND V${formatHex(this.x, 1, false)}, V${formatHex(this.y, 1, false)}`;
            }
            case "8XY3": {
                return `XOR V${formatHex(this.x, 1, false)}, V${formatHex(this.y, 1, false)}`;
            }
            case "8XY4": {
                return `ADD V${formatHex(this.x, 1, false)}, V${formatHex(this.y, 1, false)}`;
            }
            case "8XY5": {
                return `SUB V${formatHex(this.x, 1, false)}, V${formatHex(this.y, 1, false)}`;
            }
            case "8XY6": {
                return `SHR V${formatHex(this.x, 1, false)} {, V${formatHex(this.y, 1, false)}}`;
            }
            case "8XY7": {
                return `SUBN V${formatHex(this.x, 1, false)}, V${formatHex(this.y, 1, false)}`;
            }
            case "8XYE": {
                return `SHL V${formatHex(this.x, 1, false)} {, V${formatHex(this.y, 1, false)}}`;
            }
            case "9XY0": {
                return `SNE V${formatHex(this.x, 1, false)}, V${formatHex(this.y, 1, false)}`;
            }
            case "ANNN": {
                return `SET I ${formatHex(this.nnn, 4)}`;
            }
            case "BNNN": {
                return `JP V0, ${formatHex(this.nnn, 4)}`;
            }
            case "CXNN": {
                return `RND V${formatHex(this.x, 1, false)}, ${formatDec(this.nn, 3)}`;
            }
            case "DXYN": {
                return `DRAW V${formatHex(this.x, 1, false)} V${formatHex(this.y, 1, false)} ${formatDec(this.n, 2)}`;
            }
        }
    }

    #decode(value) {
        if (!value) return;

        switch (this.opcode) {
            case 0x0: {
                switch (this.n) {
                    case 0x0: {
                        return "00E0";
                    }
                    case 0xe: {
                        return "00EE";
                    }
                }
            }
            case 0x1: {
                return "1NNN";
            }
            case 0x2: {
                return "2NNN";
            }
            case 0x3: {
                return "3XNN";
            }
            case 0x4: {
                return "4XNN";
            }
            case 0x5: {
                return "5XY0";
            }
            case 0x6: {
                return "6XNN";
            }
            case 0x7: {
                return "7XNN";
            }
            case 0x8: {
                switch (this.n) {
                    case 0x0: {
                        return "8XY0";
                    }
                    case 0x1: {
                        return "8XY1";
                    }
                    case 0x2: {
                        return "8XY2";
                    }
                    case 0x3: {
                        return "8XY3";
                    }
                    case 0x4: {
                        return "8XY4";
                    }
                    case 0x5: {
                        return "8XY5";
                    }
                    case 0x6: {
                        return "8XY6";
                    }
                    case 0x7: {
                        return "8XY7";
                    }
                    case 0xe: {
                        return "8XYE";
                    }
                }
            }
            case 0x9: {
                return "9XY0";
            }
            case 0xa: {
                return "ANNN";
            }
            case 0xb: {
                return "BNNN";
            }
            case 0xc: {
                return "CXNN";
            }
            case 0xd: {
                return "DXYN";
            }
        };
    }


}

export default Instruction;