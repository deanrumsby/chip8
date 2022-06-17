export default class Display {
  root: HTMLDivElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D
  imageData: ImageData;

  constructor() {
    this.root = document.querySelector('#display') as HTMLDivElement;
    this.canvas = this.createCanvas();
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);

    this.root.append(this.canvas);
  }

  createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.classList.add('screen');
    canvas.height = 32;
    canvas.width = 64;
    return canvas;
  }

  clearScreen() {
    this.imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
    this.ctx.putImageData(this.imageData, 0, 0);
  }

  togglePixel(x: number, y: number) {
    const offset = (4 * x) + (256 * y) + 3;
    const opacity = this.imageData.data[offset];
    const newOpacity = 255 - opacity;
    this.imageData.data[offset] = newOpacity;
  }

  toggleByte(x: number, y: number, byte: number) {
    const byteString = byte.toString(2);
    const padding = '0'.repeat(8 - byteString.length)
    const paddedByteString = padding + byteString;
    for (let i = 0; i < 8; i++) {
      if (paddedByteString[i] === '1') {
        this.togglePixel(x + i, y);
      }
    }
  }

  drawSprite(x: number, y: number, sprite: Array<number>) {
    for (let i = 0; i < sprite.length; i++) {
      this.toggleByte(x, y + i, sprite[i]);      
    }
    this.ctx.putImageData(this.imageData, 0, 0);
  }
}