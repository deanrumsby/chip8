export default class Keypad {
  root: HTMLDivElement;
  keys: Array<HTMLButtonElement>

  constructor() {
    this.root = document.querySelector('#keypad') as HTMLDivElement;
    this.keys = this.createKeys();

    for (let key of this.keys) {
      this.root.append(key);
    }
  }

  createKeys() {
    const keys = [];
    for (let i = 0; i < 16; i++) {
      const key = document.createElement('button');
      key.classList.add('key', 'num' + i.toString(16).toUpperCase());
      key.innerText = i.toString(16).toUpperCase();
      keys.push(key);
    }
    return keys;
  }
}