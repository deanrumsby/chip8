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
      const numString = i.toString(16).toUpperCase();
      key.classList.add('key', 'num' + numString);
      key.innerText = numString;
      key.value = numString;
      keys.push(key);
    }
    return keys;
  }

  bindOnScreenKey(handler: Function) {
    for (let key of this.keys) {
      key.addEventListener('click', (event) => {
        handler(event, key.value);
      });
    }
  }
}