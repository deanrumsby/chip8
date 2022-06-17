import Chip8 from "./chip8";
import Display from "./display";

export default class Controller {
  chip8: Chip8;
  display: Display;

  constructor() {
    this.chip8 = new Chip8();
    this.display = new Display();

    // Bind callbacks
    this.chip8.bindClearScreen(this.clearScreen);
    this.chip8.bindDrawSprite(this.drawSprite);
  }

  clearScreen = () => {
    this.display.clearScreen();
  }

  drawSprite = (x:number, y: number, sprite: Array<number>) => {
    console.log('From controller.ts', sprite);
    this.display.drawSprite(x, y, sprite);
  }
}