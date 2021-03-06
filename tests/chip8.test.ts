import Chip8 from '../classes/chip8';
import DecodedInstruction from '../interfaces/decoded-instruction';
jest.mock('../classes/display');

describe('fetch', () => {
  let chip8: Chip8;

  beforeEach(() => {
    chip8 = new Chip8();
  });

  test('reads the first program instruction from memory', () => {
    chip8.memory.setUint16(chip8.PC, 0x2332);
    expect(chip8.fetch()).toBe(0x2332);
  });

  test('increments the PC', () => {
    chip8.fetch();
    expect(chip8.PC).toBe(0x202);
  });

  test('reads two instructions sequentially', () => {
    chip8.memory.setUint32(chip8.PC, 0x12345678);
    const instructions = [];
    instructions.push(chip8.fetch());
    instructions.push(chip8.fetch());
    expect(instructions).toEqual([0x1234, 0x5678]);
  });
});

describe('decode', () => {
  let chip8: Chip8;
  let instruction: DecodedInstruction;

  beforeAll(() => {
    chip8 = new Chip8();
    instruction = chip8.decode(0x752E);
  });

  test("decodes variable 'type'", () => {
    expect(instruction.type).toEqual(0x0007);
  });

  test("decodes variable 'nnn'", () => {
    expect(instruction.nnn).toEqual(0x052E);
  });

  test("decodes variable 'nn'", () => {
    expect(instruction.nn).toEqual(0x002E);
  });

  test("decodes variable 'n'", () => {
    expect(instruction.n).toEqual(0x000E);
  });

  test("decodes variable 'x'", () => {
    expect(instruction.x).toEqual(0x0005);
  });

  test("decodes variable 'y'", () => {
    expect(instruction.y).toEqual(0x0002);
  });
});

describe('execute', () => {
  let chip8: Chip8;
  let instruction: DecodedInstruction;

  beforeEach(() => {
    chip8 = new Chip8();
  });

  test('1NNN', () => {
    // 0x12A3
    instruction = {
      type: 0x1, nnn: 0x2A3, nn: 0xA3,
      n: 0x3, x: 0x2, y: 0xA
    };
    chip8.execute(instruction);
    expect(chip8.PC).toBe(0x02A3);
  });

  test('6XNN', () => {
    // 0x6E34
    instruction = {
      type: 0x6, nnn: 0xE34, nn: 0x34,
      n: 0x4, x: 0xE, y: 0x3
    };
    chip8.execute(instruction);
    expect(chip8.registers[0xE]).toBe(0x0034);
  });

  test('7XNN', () => {
    // 0x729A with VX = 5
    instruction = {
      type: 0x7, nnn: 0x29A, nn: 0x9A,
      n: 0xA, x: 0x2, y: 0x9
    };
    chip8.registers[0x2] = 0x05;
    chip8.execute(instruction);
    expect(chip8.registers[0x2]).toBe(0x9F);
  });

  test('ANNN', () => {
    // 0xA232
    instruction = {
      type: 0xA, nnn: 0x232, nn: 0x32,
      n: 0x2, x: 0x2, y: 0x3
    };
    chip8.execute(instruction);
    expect(chip8.I).toBe(0x232);
  });

  test('3XNN - where VX === NN', () => {
    // 0x3512
    instruction = {
      type: 0x3, nnn: 0x512, nn: 0x12,
      n: 0x2, x: 0x5, y: 0x1
    };
    chip8.registers[instruction.x] = 0x12;
    chip8.execute(instruction);
    expect(chip8.PC).toBe(0x202);
  });

  test('3XNN - where VX !== NN', () => {
    // 0x3512
    instruction = {
      type: 0x3, nnn: 0x512, nn: 0x12,
      n: 0x2, x: 0x5, y: 0x1
    };
    chip8.registers[instruction.x] = 0x10;
    chip8.execute(instruction);
    expect(chip8.PC).toBe(0x200);
  });

  test('4XNN - where VX !== NN', () => {
    // 0x46FA
    instruction = {
      type: 0x4, nnn: 0x6FA, nn: 0xFA,
      n: 0xA, x: 0x6, y: 0xF
    };
    chip8.registers[instruction.x] = 0x10;
    chip8.execute(instruction);
    expect(chip8.PC).toBe(0x202);
  });

  test('4XNN - where VX === NN', () => {
    // 0x46FA
    instruction = {
      type: 0x4, nnn: 0x6FA, nn: 0xFA,
      n: 0xA, x: 0x6, y: 0xF
    };
    chip8.registers[instruction.x] = 0xFA;
    chip8.execute(instruction);
    expect(chip8.PC).toBe(0x200);
  });

  test('5XY0 - where VX === VY', () => {
    // 0x52A0
    instruction = {
      type: 0x5, nnn: 0x2A0, nn: 0xA0,
      n: 0x0, x: 0x2, y: 0xA
    };
    chip8.registers[instruction.x] = 0xEE;
    chip8.registers[instruction.y] = 0xEE;
    chip8.execute(instruction);
    expect(chip8.PC).toBe(0x202);
  });

  test('5XY0 - where VX !== VY', () => {
    // 0x52A0
    instruction = {
      type: 0x5, nnn: 0x2A0, nn: 0xA0,
      n: 0x0, x: 0x2, y: 0xA
    };
    chip8.registers[instruction.x] = 0xF9;
    chip8.registers[instruction.y] = 0xEE;
    chip8.execute(instruction);
    expect(chip8.PC).toBe(0x200);
  });

  test('9XY0 - where VX !== VY', () => {
    // 0x9E00
    instruction = {
      type: 0x9, nnn: 0xE000, nn: 0x00,
      n: 0x0, x: 0xE, y: 0x0
    };
    chip8.registers[instruction.x] = 0x03;
    chip8.registers[instruction.y] = 0x07;
    chip8.execute(instruction);
    expect(chip8.PC).toBe(0x202);
  });

  test('9XY0 - where VX === VY', () => {
    // 0x9E00
    instruction = {
      type: 0x9, nnn: 0xE000, nn: 0x00,
      n: 0x0, x: 0xE, y: 0x0
    };
    chip8.registers[instruction.x] = 0x07;
    chip8.registers[instruction.y] = 0x07;
    chip8.execute(instruction);
    expect(chip8.PC).toBe(0x200);
  });

  test('8XY0', () => {
    // 0x8160
    instruction = {
      type: 0x8, nnn: 0x160, nn: 0x60,
      n: 0x0, x: 0x1, y: 0x6
    };
    chip8.registers[instruction.y] = 0x23;
    chip8.execute(instruction);
    expect(chip8.registers[instruction.x]).toBe(0x23);
  });

  test('8XY1', () => {
    // 0x82E1
    instruction = {
      type: 0x8, nnn: 0x2E1, nn: 0xE1,
      n: 0x1, x: 0x2, y: 0xE
    };
    chip8.registers[instruction.x] = 0x1F;
    chip8.registers[instruction.y] = 0x21;
    chip8.execute(instruction);
    expect(chip8.registers[instruction.x]).toBe(0x3F);
  });

  test('8XY2', () => {
    // 0x8E62
    instruction = {
      type: 0x8, nnn: 0xE62, nn: 0x62,
      n: 0x2, x: 0xE, y: 0x6
    };
    chip8.registers[instruction.x] = 0xA2;
    chip8.registers[instruction.y] = 0x58;
    chip8.execute(instruction);
    expect(chip8.registers[instruction.x]).toBe(0x00);
  });

  test('8XY3', () => {
    // 0x8243
    instruction = {
      type: 0x8, nnn: 0x243, nn: 0x43,
      n: 0x3, x: 0x2, y: 0x4
    };
    chip8.registers[instruction.x] = 0x51;
    chip8.registers[instruction.y] = 0x4F;
    chip8.execute(instruction);
    expect(chip8.registers[instruction.x]).toBe(0x1E);
  });

  test('8XY4 - no overflow', () => {
    // 0x81A4
    instruction = {
      type: 0x8, nnn: 0x1A4, nn: 0xA4,
      n: 0x4, x: 0x1, y: 0xA
    };
    chip8.registers[instruction.x] = 0x22;
    chip8.registers[instruction.y] = 0x3E;
    chip8.execute(instruction)
    const result = [chip8.registers[instruction.x], chip8.registers[0xF]];
    expect(result).toEqual([0x60, 0]);
  });

  test('8XY4 - with overflow', () => {
    // 0x81A4
    instruction = {
      type: 0x8, nnn: 0x1A4, nn: 0xA4,
      n: 0x4, x: 0x1, y: 0xA
    };
    chip8.registers[instruction.x] = 0xFF;
    chip8.registers[instruction.y] = 0x3E;
    chip8.execute(instruction)
    const result = [chip8.registers[instruction.x], chip8.registers[0xF]];
    expect(result).toEqual([0x3D, 1]);
  });

  test('8XY5 - no underflow', () => {
    // 0x8CB5
    instruction = {
      type: 0x8, nnn: 0xCB5, nn: 0xB5,
      n: 0x5, x: 0xC, y: 0xB
    };
    chip8.registers[instruction.x] = 0x0A;
    chip8.registers[instruction.y] = 0x02;
    chip8.execute(instruction)
    const result = [chip8.registers[instruction.x], chip8.registers[0xF]];
    expect(result).toEqual([0x08, 1]);
  });

  test('8XY5 - with underflow', () => {
    // 0x8CB5
    instruction = {
      type: 0x8, nnn: 0xCB5, nn: 0xB5,
      n: 0x5, x: 0xC, y: 0xB
    };
    chip8.registers[instruction.x] = 0x01;
    chip8.registers[instruction.y] = 0x05;
    chip8.execute(instruction)
    const result = [chip8.registers[instruction.x], chip8.registers[0xF]];
    expect(result).toEqual([0xFC, 0]);
  });

  test('8XY7 - no underflow', () => {
    // 0x8A07
    instruction = {
      type: 0x8, nnn: 0xA07, nn: 0x07,
      n: 0x7, x: 0xA, y: 0x0
    };
    chip8.registers[instruction.x] = 0x0E;
    chip8.registers[instruction.y] = 0x1F;
    chip8.execute(instruction)
    const result = [chip8.registers[instruction.x], chip8.registers[0xF]];
    expect(result).toEqual([0x11, 1]);
  });

  test('8XY7 - with underflow', () => {
    // 0x8A07
    instruction = {
      type: 0x8, nnn: 0xA07, nn: 0x07,
      n: 0x7, x: 0xA, y: 0x0
    };
    chip8.registers[instruction.x] = 0x31;
    chip8.registers[instruction.y] = 0x21;
    chip8.execute(instruction)
    const result = [chip8.registers[instruction.x], chip8.registers[0xF]];
    expect(result).toEqual([0xF0, 0]);
  });

  test('FX07', () => {
    // 0xF207
    instruction = {
      type: 0xF, nnn: 0x207, nn: 0x07,
      n: 0x7, x: 0x2, y: 0x0
    };
    chip8.delayTimer = 0x12;
    chip8.execute(instruction);
    expect(chip8.registers[instruction.x]).toBe(0x12);
  });

  test('FX15', () => {
    // 0xF715
    instruction = {
      type: 0xF, nnn: 0x715, nn: 0x15,
      n: 0x5, x: 0x7, y: 0x1
    };
    chip8.registers[instruction.x] = 0xAA;
    chip8.execute(instruction);
    expect(chip8.delayTimer).toBe(0xAA);
  });

  test('FX18', () => {
    // 0xFB18
    instruction = {
      type: 0xF, nnn: 0xB18, nn: 0x18,
      n: 0x8, x: 0xB, y: 0x1
    };
    chip8.registers[instruction.x] = 0xF1;
    chip8.execute(instruction);
    expect(chip8.soundTimer).toBe(0xF1);
  });

  test('FX1E - result < 0x1000', () => {
    // 0xF71E
    instruction = {
      type: 0xF, nnn: 0x71E, nn: 0x1E,
      n: 0xE, x: 0x7, y: 0x1
    };
    chip8.I = 0x0035;
    chip8.registers[instruction.x] = 0xF1;
    chip8.execute(instruction);
    const result = [chip8.I, chip8.registers[0xF]];
    expect(result).toEqual([0x0126, 0x00]);
  });

  test('FX1E - result >= 0x1000', () => {
    // 0xF71E
    instruction = {
      type: 0xF, nnn: 0x71E, nn: 0x1E,
      n: 0xE, x: 0x7, y: 0x1
    };
    chip8.I = 0x0FFF;
    chip8.registers[instruction.x] = 0x05;
    chip8.execute(instruction);
    const result = [chip8.I, chip8.registers[0xF]];
    expect(result).toEqual([0x1004, 0x01]);
  });

  test('FX29', () => {
    // 0xFA29
    instruction = {
      type: 0xF, nnn: 0xA29, nn: 0x29,
      n: 0x9, x: 0xA, y: 0x2
    };
    chip8.registers[instruction.x] = 0x07;
    chip8.execute(instruction);
    expect(chip8.I).toBe(0x73);
  });

  test('2NNN', () => {
    // 0x2513
    instruction = {
      type: 0x2, nnn: 0x513, nn: 0x13,
      n: 0x3, x: 0x5, y: 0x1
    };
    chip8.execute(instruction);
    const result = [chip8.PC, chip8.stack[chip8.SP - 1], chip8.SP];
    expect(result).toEqual([0x0513, 0x0200, 0x01]);
  });

  test('00EE', () => {
    // 0x00EE
    instruction = {
      type: 0x0, nnn: 0x0EE, nn: 0xEE,
      n: 0xE, x: 0x0, y: 0xE
    };
    chip8.SP = 0x5;
    chip8.stack[chip8.SP - 1] = 0x244;
    chip8.execute(instruction);
    const result = [chip8.PC, chip8.SP];
    expect(result).toEqual([0x244, 0x4]);
  });

  test('FX33', () => {
    // 0xFC33
    instruction = {
      type: 0xF, nnn: 0xC33, nn: 0x33,
      n: 0x3, x: 0xC, y: 0x3
    };
    chip8.registers[instruction.x] = 0x3A;
    chip8.execute(instruction);
    const result = [
      chip8.memory.getUint8(chip8.I),
      chip8.memory.getUint8(chip8.I + 1),
      chip8.memory.getUint8(chip8.I + 2)
    ]
    expect(result).toEqual([0, 5, 8]);
  });

  test('8XY6 - cosmac compatability off', () => {
    // 0x84C6
    instruction = {
      type: 0x8, nnn: 0x4C6, nn: 0xC6,
      n: 0x6, x: 0x4, y: 0xC
    };
    chip8.cosmacCompatability = false;
    chip8.registers[instruction.x] = 0x22;
    chip8.execute(instruction);
    const result = [chip8.registers[instruction.x], chip8.registers[0xF]];
    expect(result).toEqual([0x11, 0]);
  });

  test('8XY6 - cosmac compatability on', () => {
    // 0x84C6
    instruction = {
      type: 0x8, nnn: 0x4C6, nn: 0xC6,
      n: 0x6, x: 0x4, y: 0xC
    };
    chip8.cosmacCompatability = true;
    chip8.registers[instruction.x] = 0x33;
    chip8.registers[instruction.y] = 0x51;
    chip8.execute(instruction);
    const result = [chip8.registers[instruction.x], chip8.registers[0xF]];
    expect(result).toEqual([0x28, 1]);
  });

  test('8XYE - cosmac compatability off', () => {
    // 0x80EE
    instruction = {
      type: 0x8, nnn: 0x0EE, nn: 0xEE,
      n: 0xE, x: 0x0, y: 0xE
    };
    chip8.cosmacCompatability = false;
    chip8.registers[instruction.x] = 0x05;
    chip8.execute(instruction);
    const result = [chip8.registers[instruction.x], chip8.registers[0xF]];
    expect(result).toEqual([0x0A, 0]);
  });

  test('8XYE - cosmac compatability on', () => {
    // 0x80EE
    instruction = {
      type: 0x8, nnn: 0x0EE, nn: 0xEE,
      n: 0xE, x: 0x0, y: 0xE
    };
    chip8.cosmacCompatability = true;
    chip8.registers[instruction.x] = 0x04;
    chip8.registers[instruction.y] = 0xF5;
    chip8.execute(instruction);
    const result = [chip8.registers[instruction.x], chip8.registers[0xF]];
    expect(result).toEqual([0xEA, 1]);
  });

  test('BNNN - cosmac compatability on', () => {
    // 0xB521
    instruction = {
      type: 0xB, nnn: 0x521, nn: 0x21,
      n: 0x1, x: 0x5, y: 0x2
    };
    chip8.cosmacCompatability = true;
    chip8.registers[0x0] = 0xA2;
    chip8.PC = 0x250;
    chip8.execute(instruction);
    expect(chip8.PC).toBe(0x5C3);
  });

  test('BXNN - cosmac compatability off', () => {
    // 0xB521
    instruction = {
      type: 0xB, nnn: 0x521, nn: 0x21,
      n: 0x1, x: 0x5, y: 0x2
    };
    chip8.cosmacCompatability = false;
    chip8.registers[instruction.x] = 0x05;
    chip8.PC = 0x250;
    chip8.execute(instruction);
    expect(chip8.PC).toBe(0x526);
  });

  test('FX55 - cosmac compatability off', () => {
    // 0xF355
    instruction = {
      type: 0xF, nnn: 0x355, nn: 0x55,
      n: 0x5, x: 0x3, y: 0x5
    };
    chip8.cosmacCompatability = false;
    chip8.I = 0x234;
    chip8.registers[0x0] = 0x52;
    chip8.registers[0x1] = 0xAA;
    chip8.registers[0x2] = 0x31;
    chip8.registers[0x3] = 0x10;
    chip8.execute(instruction);
    const result = [];
    for (let i = 0; i <= instruction.x; i++) {
      result.push(chip8.memory.getUint8(chip8.I + i));
    }
    result.push(chip8.I);
    expect(result).toEqual([0x52, 0xAA, 0x31, 0x10, 0x234]);
  });

  test('FX55 - cosmac compatability on', () => {
    // 0xF255
    instruction = {
      type: 0xF, nnn: 0x255, nn: 0x55,
      n: 0x5, x: 0x2, y: 0x5
    };
    chip8.cosmacCompatability = true;
    chip8.I = 0x202;
    chip8.registers[0x0] = 0x23;
    chip8.registers[0x1] = 0xAB;
    chip8.registers[0x2] = 0x54;
    chip8.execute(instruction);
    const result = [];
    for (let i = 0; i <= instruction.x; i++) {
      result.push(chip8.memory.getUint8(0x202 + i));
    }
    result.push(chip8.I)
    expect(result).toEqual([0x23, 0xAB, 0x54, 0x205]);
  });

  test('FX65 - cosmac compatability off', () => {
    // 0xF365
    instruction = {
      type: 0xF, nnn: 0x365, nn: 0x65,
      n: 0x5, x: 0x3, y: 0x6
    };
    chip8.cosmacCompatability = false;
    chip8.I = 0x234;
    chip8.memory.setUint8(chip8.I, 0x24);
    chip8.memory.setUint8(chip8.I + 1, 0x45);
    chip8.memory.setUint8(chip8.I + 2, 0xA2);
    chip8.memory.setUint8(chip8.I + 3, 0x67);
    chip8.execute(instruction);
    const result = [];
    for (let i = 0; i <= instruction.x; i++) {
      result.push(chip8.registers[i]);
    }
    result.push(chip8.I);
    expect(result).toEqual([0x24, 0x45, 0xA2, 0x67, 0x234]);
  });

  test('FX65 - cosmac compatability on', () => {
    // 0xF265
    instruction = {
      type: 0xF, nnn: 0x265, nn: 0x65,
      n: 0x5, x: 0x2, y: 0x6
    };
    chip8.cosmacCompatability = true;
    chip8.I = 0x204;
    chip8.memory.setUint8(chip8.I, 0x25);
    chip8.memory.setUint8(chip8.I + 1, 0xC5);
    chip8.memory.setUint8(chip8.I + 2, 0xE2);
    chip8.execute(instruction);
    const result = [];
    for (let i = 0; i <= instruction.x; i++) {
      result.push(chip8.registers[i]);
    }
    result.push(chip8.I);
    expect(result).toEqual([0x25, 0xC5, 0xE2, 0x207]);
  });
});