import Chip8 from '../classes/chip8';
import DecodedInstruction from '../interfaces/decoded-instruction';

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
    }
    chip8.execute(instruction);
    expect(chip8.PC).toBe(0x02A3);
  });

  test('6XNN', () => {
    // 0x6E34
    instruction = {
      type: 0x6, nnn: 0xE34, nn: 0x34,
      n: 0x4, x: 0xE, y: 0x3
    }
    chip8.execute(instruction);
    expect(chip8.registers[0xE]).toBe(0x0034);
  });

  test('7XNN', () => {
    // 0x729A with VX = 5
    instruction = {
      type: 0x7, nnn: 0x29A, nn: 0x9A,
      n: 0xA, x: 0x2, y: 0x9
    }
    chip8.registers[0x2] = 0x05;
    chip8.execute(instruction);
    expect(chip8.registers[0x2]).toBe(0x9F);
  });
});