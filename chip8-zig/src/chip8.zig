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
    _recentKeyUp: u8 = undefined,
    _cycles: usize = 0,
    _st: usize = 0,
    _dt: usize = 0,

    fn fetch(self: *Chip8) Instruction {
        const bytes = [2]u8{ self.memory[self.pc], self.memory[self.pc + 1] };
        const value = std.mem.readInt(u16, &bytes, .big);
        self.pc += 2;
        return Instruction.from_u16(value);
    }

    pub fn step(self: *Chip8) void {
        _ = self.fetch();
    }
};
