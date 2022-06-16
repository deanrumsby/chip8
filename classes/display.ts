export default class Display {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D
  width: number;
  height: number;
  imageData: ImageData;

  constructor() {
    this.canvas = document.querySelector('#display') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.imageData = this.ctx.createImageData(this.width, this.height);
  }

  clearScreen() {
    this.imageData = this.ctx.createImageData(this.width, this.height);
    this.draw();
  }

  // TO-DO: Magic numbers to be made explicit
  // offset by 4x + (64 * 4)((31 - y)
  togglePixel(x: number, y: number) {
    //const offset = (4 * x) - (256 * y) + 7936 + 3;
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

  draw() {
    this.ctx.putImageData(this.imageData, 0, 0);
  }
}