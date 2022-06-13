import Chip8 from '../chip8';

describe('fetch', () => {
  let chip8: Chip8;
  let view: DataView;

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