export default class Options {
  root: HTMLDivElement;
  programSelect: HTMLSelectElement;

  constructor() {
    this.root = document.querySelector('#options') as HTMLDivElement;
    this.programSelect = this.createProgramSelect();

    this.root.append(this.programSelect);
  }

  createProgramSelect() {
    const select = document.createElement('select');
    const options = ['Select a program', 'IBM Logo'];
    for (let option of options) {
      select.append(new Option(option, option));
    }
    return select;
  }
}