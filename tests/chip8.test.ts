import Chip8 from '../chip8';

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
  let instruction: {
    type: number, nnn: number, n: number,
    x: number, y: number, kk: number 
  }

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

  test("decodes variable 'n'", () => {
    expect(instruction.n).toEqual(0x000E);
  });

  test("decodes variable 'x'", () => {
    expect(instruction.x).toEqual(0x0005);
  });

  test("decodes variable 'y'", () => {
    expect(instruction.y).toEqual(0x0002);
  });

  test("decodes variable 'kk'", () => {
    expect(instruction.kk).toEqual(0x002E);
  });
});