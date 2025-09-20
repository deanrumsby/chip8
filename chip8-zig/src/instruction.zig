pub const InstructionType = enum {
    op_00e0,
    op_1nnn,
    op_6xnn,
    op_7xnn,
    op_annn,
    op_dxyn,
};

pub const Instruction = struct {
    value: u16,
    opcode: u8,
    x: u8,
    y: u8,
    nnn: u16,
    nn: u8,
    n: u8,
    tag: InstructionType,

    pub fn from_u16(value: u16) Instruction {
        const opcode: u8 = @intCast((value & 0xf000) >> 12);
        const x: u8 = @intCast((value & 0x0f00) >> 8);
        const y: u8 = @intCast((value & 0x00f0) >> 4);
        const nnn: u16 = value & 0x0fff;
        const nn: u8 = @intCast(value & 0x00ff);
        const n: u8 = @intCast(value & 0x000f);

        const tag: InstructionType = switch (opcode) {
            0x0 => .op_00e0,
            0x1 => .op_1nnn,
            0x6 => .op_6xnn,
            0x7 => .op_7xnn,
            0xa => .op_annn,
            0xd => .op_dxyn,
            else => .op_00e0,
        };

        return Instruction{
            .value = value,
            .opcode = opcode,
            .x = x,
            .y = y,
            .nnn = nnn,
            .nn = nn,
            .n = n,
            .tag = tag,
        };
    }
};
