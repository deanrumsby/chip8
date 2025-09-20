const chip8 = @import("chip8.zig");
const Chip8 = chip8.Chip8;

var instance = Chip8{};

pub export fn program_ptr() usize {
    return @intFromPtr(instance.memory[chip8.PROG_START..].ptr);
}

pub export fn pc() u16 {
    return instance.pc;
}

pub export fn i() u16 {
    return instance.i;
}

pub export fn sp() u8 {
    return instance.sp;
}

pub export fn dt() u8 {
    return instance.dt;
}

pub export fn st() u8 {
    return instance.st;
}

pub export fn v(index: usize) u8 {
    return instance.v[index];
}

pub export fn v_len() usize {
    return instance.v.len;
}

pub export fn step() void {
    instance.step();
}
