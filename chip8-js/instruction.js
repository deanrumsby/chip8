import { formatHex, formatDec } from "./utils.js";

class Instruction {
    constructor(value) {
        this.value = value;
        this.type = this.decode(value);
    }

    decode(value) {
        if (!value) return;

        const opcode = (value & 0xf000) >> 12;
        const n = this.value & 0x000f;

        switch (opcode) {
            case 0x0: {
                switch (n) {
                    case 0x0: {
                        return "00E0";
                    }
                }
            }
            case 0x1: {
                return "1NNN";
            }
            case 0x6: {
                return "6XNN";
            }
            case 0x7: {
                return "7XNN";
            }
            case 0xa: {
                return "ANNN";
            }
            case 0xd: {
                return "DXYN";
            }
        };
    }

    mnemonic() {
        switch (this.type) {
            case "00E0": {
                return "CLS";
            }
            case "1NNN": {
                return `JMP ${formatHex(this.nnn(), 4)}`;
            }
            case "6XNN": {
                return `SET V${formatHex(this.x(), 1, false)} ${formatHex(this.nn(), 2)}`;
            }
            case "7XNN": {
                return `ADD V${formatHex(this.x(), 1, false)} ${formatHex(this.nn(), 2)}`;
            }
            case "ANNN": {
                return `SET I ${formatHex(this.nnn(), 4)}`;
            }
            case "DXYN": {
                return `DRAW V${formatHex(this.x(), 1, false)} V${formatHex(this.y(), 1, false)} ${formatDec(this.n(), 2)}`;
            }
        }
    }

    opcode() {
        return (this.value & 0xf000) >> 12;
    }

    x() {
        return (this.value & 0x0f00) >> 8;
    }

    y() {
        return (this.value & 0x00f0) >> 4;
    }

    nnn() {
        return this.value & 0x0fff;
    }

    nn() {
        return this.value & 0x00ff;
    }

    n() {
        return this.value & 0x000f;
    }
}

export default Instruction;