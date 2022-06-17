import Chip8 from "./chip8";
import Display from "./display";
import Options from "./options";

export default class Controller {
  chip8: Chip8;
  display: Display;
  options: Options;

  constructor() {
    this.chip8 = new Chip8();
    this.display = new Display();
    this.options = new Options();

    // Bind callbacks and event handlers
    this.chip8.bindClearScreen(this.clearScreen);
    this.chip8.bindDrawSprite(this.drawSprite);
    this.options.bindLoad(this.handleLoad);
    this.options.bindStep(this.handleStep);
  }

  clearScreen = () => {
    this.display.clearScreen();
  }

  drawSprite = (x:number, y: number, sprite: Array<number>) => {
    this.display.drawSprite(x, y, sprite);
  }

  handleLoad = (event: Event, name: string) => {
    const path = "bin/" + name.toLowerCase().replace(" ", "-") + ".ch8";
    this.chip8.load(path);
  }

  handleStep = (event: Event) => {
    this.chip8.step();
  }
}