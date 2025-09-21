const std = @import("std");
const Instruction = @import("instruction.zig").Instruction;

const V_REG_COUNT: usize = 16;
const STACK_SIZE: usize = 16;
const MEMORY_SIZE: usize = 4096;
pub const PROG_START: usize = 0x200;
const FONT_START: usize = 0x050;
const FONT_SPRITE_SIZE: usize = 5;
const FRAME_HEIGHT: usize = 32;
const FRAME_WIDTH: usize = 64;
const PIXEL_COUNT: usize = FRAME_HEIGHT * FRAME_WIDTH;
const RGBA_CHANNELS: usize = 4;
const FRAME_BUFFER_SIZE: usize = PIXEL_COUNT * RGBA_CHANNELS;
const DEFAULT_SPEED: usize = 700;
const TIMERS_FREQ: usize = 60;
const KEY_COUNT: usize = 16;
const SECOND_IN_MS: usize = 1000;

pub const Chip8 = struct {
    pc: u16 = PROG_START,
    i: u16 = 0,
    sp: u8 = 0,
    dt: u8 = 0,
    st: u8 = 0,
    v: [V_REG_COUNT]u8 = [_]u8{0} ** V_REG_COUNT,
    stack: [STACK_SIZE]u8 = [_]u8{0} ** STACK_SIZE,
    memory: [MEMORY_SIZE]u8 = [_]u8{0} ** MEMORY_SIZE,
    keys: [KEY_COUNT]bool = [_]bool{false} ** KEY_COUNT,
    speed: usize = DEFAULT_SPEED,
    frame_buffer: [FRAME_BUFFER_SIZE]u8 = [_]u8{0} ** FRAME_BUFFER_SIZE,
    _recentKeyUp: u8 = undefined,
    _cycles: usize = 0,
    _st: usize = 0,
    _dt: usize = 0,

    pub fn step(self: *Chip8) void {
        const instruction = self.fetch();
        self.execute(instruction);
    }

    fn fetch(self: *Chip8) Instruction {
        const bytes = [2]u8{ self.memory[self.pc], self.memory[self.pc + 1] };
        const value = std.mem.readInt(u16, &bytes, .big);
        self.pc += 2;
        return Instruction.from_u16(value);
    }

    fn execute(self: *Chip8, instruction: Instruction) void {
        const tag = instruction.tag;
        const x = instruction.x;
        const y = instruction.y;
        const nnn = instruction.nnn;
        const nn = instruction.nn;
        const n = instruction.n;

        switch (tag) {
            .op_00e0 => {
                self.clearScreen();
            },
            .op_1nnn => {
                self.pc = nnn;
            },
            .op_6xnn => {
                self.v[x] = nn;
            },
            .op_7xnn => {
                self.v[x] = self.v[x] +% nn;
            },
            .op_annn => {
                self.i = nnn;
            },
            .op_dxyn => {
                _ = self.v[x] % FRAME_WIDTH;
                _ = self.v[y] % FRAME_HEIGHT;
                const sw = 8;

                var hasCollision = false;

                for (0..n) |i| {
                    var byte = self.memory[self.i + i];

                    for (0..7) |_j| {
                        const j = 7 - _j;
                        const bit = byte & 1;
                        const spritePixelAlpha: u8 = if (bit == 1) 255 else 0;
                        byte = byte >> 1;

                        const pixelOffset = (i * 4 * sw) + (j * 4);
                        const pixelAlphaOffset = pixelOffset + 3;
                        const pixelAlpha = self.frame_buffer[pixelAlphaOffset];

                        self.frame_buffer[pixelAlphaOffset] = spritePixelAlpha ^ pixelAlpha;

                        if (!hasCollision) {
                            if ((spritePixelAlpha & pixelAlpha) == 0xff) {
                                hasCollision = true;
                            }
                        }
                    }
                }

                self.v[0xf] = if (hasCollision) 1 else 0;
            },
        }
    }

    fn clearScreen(self: *Chip8) void {
        for (self.frame_buffer, 0..) |_, offset| {
            if (offset % RGBA_CHANNELS == 0) {
                self.frame_buffer[offset] = 0;
            }
        }
    }
};
