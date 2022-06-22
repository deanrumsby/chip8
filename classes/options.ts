export default class Options {
  root: HTMLDivElement;
  programSelect: HTMLSelectElement;
  run: HTMLButtonElement;
  pause: HTMLButtonElement;
  step: HTMLButtonElement;
  reset: HTMLButtonElement;
  speed: HTMLLabelElement;
  cosmacCompatability: HTMLLabelElement;

  constructor() {
    this.root = document.querySelector('#options') as HTMLDivElement;
    this.programSelect = this.createProgramSelect();
    this.run = this.createButton('Run');
    this.pause = this.createButton('Pause');
    this.step = this.createButton('Step');
    this.reset = this.createButton('Reset');
    this.speed = this.createNumberInput('Instructions / Second', 'speed', '700', '1', '1000');
    this.cosmacCompatability = this.createCheckbox('Cosmac Compatability', 'cosmac');
  
    this.root.append(
      this.programSelect,
      this.run,
      this.pause,
      this.step,
      this.reset,
      this.speed,
      this.cosmacCompatability
    );
  }

  createProgramSelect() {
    const select = document.createElement('select');
    const options = ['Select a program', 'IBM Logo', 'Delay Timer', 'Clock'];
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

  createCheckbox(text: string, id: string) {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    const label = document.createElement('label');
    label.htmlFor = id;
    label.innerText = text;
    label.append(input);
    return label;
  }

  createNumberInput(text: string, id: string, value: string, min: string, max: string) {
    const input = document.createElement('input');
    input.type = 'number';
    input.value = value;
    input.min = min;
    input.max = max;
    input.id = id;
    const label = document.createElement('label');
    label.htmlFor = id;
    label.innerText = text;
    label.append(input);
    return label;
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

  bindCosmacCompatability(handler: Function) {
    const checkbox = this.cosmacCompatability.querySelector('input') as HTMLInputElement;
    checkbox.addEventListener('change', (event) => {
      handler(event);
    });
  }

  bindSpeed(handler: Function) {
    const input = this.speed.querySelector('input') as HTMLInputElement;
    input.addEventListener('change', (event) => {
      handler(event, parseInt(input.value));
    });
  }
}