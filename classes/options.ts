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
      let name: string | null = this.programSelect.value;
      if (name === 'Select a program') {
        name = null;
      }
      handler(event, name);
    });
  }

  bindStep(handler: Function) {
    this.step.addEventListener('click', (event) => {
      handler(event);
    });
  }

  bindRun(handler: Function) {
    this.run.addEventListener('click', (event) => {
      handler(event);
    });
  }

  bindPause(handler: Function) {
    this.pause.addEventListener('click', (event) => {
      handler(event);
    });
  }

  bindReset(handler: Function) {
    this.reset.addEventListener('click', (event) => {
      handler(event);
    });
  }
}