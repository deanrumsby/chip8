export default class Display {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D
    width: number;
    height: number;
    imageData: ImageData;

    constructor() {
        this.canvas = document.querySelector('#display');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.imageData = this.ctx.createImageData(this.width, this.height);
    }

    // TO-DO: Magic numbers to be made explicit
    togglePixel(x: number, y: number) {
        const offset = (4 * x) + (64 * y) + 3;
        const opacity = this.imageData.data[offset];
        const newOpacity = 1 - opacity;
        this.imageData.data[offset] = newOpacity;
    }

    update() {
        this.ctx.putImageData(this.imageData, 0, 0);
    }
}