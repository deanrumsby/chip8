export default class Options {
  root: HTMLDivElement;
  programSelect: HTMLSelectElement;
  run: HTMLButtonElement;
  pause: HTMLButtonElement;
  step: HTMLButtonElement;
  reset: HTMLButtonElement;

  constructor() {
    this.root = document.querySelector('#options') as HTMLDivElement;
    this.programSelect = this.createProgramSelect();
    this.run = this.createButton('Run');
    this.pause = this.createButton('Pause');
    this.step = this.createButton('Step');
    this.reset = this.createButton('Reset');
  
    this.root.append(
      this.programSelect,
      this.run,
      this.pause,
      this.step,
      this.reset
    );
  }

  createProgramSelect() {
    const select = document.createElement('select');
    const options = ['Select a program', 'IBM Logo'];
    for (let option of options) {
      select.append(new Option(option, option));
    }
    return select;
  }

  createButton(text: string) {
    const button = document.createElement('button');
    button.innerText = text;
    return button;
  }

  bindLoad(handler: Function) {
    this.programSelect.addEventListener('change', (event) => {
      handler(event, this.programSelect.value);
    });
  }
}