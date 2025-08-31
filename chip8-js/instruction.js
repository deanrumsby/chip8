class Instruction {
    constructor(value) {
        this.value = value;
        this.type = this.decode(value);
    }

    decode(value) {
        const opcode = (value & 0xf000) >> 12;

        switch (opcode) {
            case 0x0: {
                return "00E0";
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