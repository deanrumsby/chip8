import Chip8 from './chip8.js';
import { formatHex, formatDec } from './utils.js';

const screen = document.querySelector('#screen');
const filePicker = document.querySelector('#load');
const playPauseButton = document.querySelector('#play-pause');
const stepButton = document.querySelector('#step');
const resetButton = document.querySelector('#reset');
const disassemblyViewer = document.querySelector('#disassembly-viewer');
const registersViewer = document.querySelector('#registers-viewer');
const keypad = document.querySelector('#keypad');

const chip8 = new Chip8(screen);
let isRunning = false;

const KEY_CODES = {
    'Digit1': 0x1,
    'Digit2': 0x2,
    'Digit3': 0x3,
    'Digit4': 0xc,
    'KeyQ': 0x4,
    'KeyW': 0x5,
    'KeyE': 0x6,
    'KeyR': 0xd,
    'KeyA': 0x7,
    'KeyS': 0x8,
    'KeyD': 0x9,
    'KeyF': 0xe,
    'KeyZ': 0xa,
    'KeyX': 0x0,
    'KeyC': 0xb,
    'KeyV': 0xf,
}

/**
 * Loads the program selected by the user into the Chip 8
 * @param {Event} event 
 */
async function handleFileSelection(event) {
    const file = event.target.files[0];
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    chip8.load(bytes);
    updateUi();
}

/**
 * Starts the emulation
 */
function play() {
    if (!chip8.program) return;

    let previousTimestamp = undefined;

    const emulate = (timestamp) => {
        if (!previousTimestamp) {
            previousTimestamp = timestamp;
        }

        const elapsed = timestamp - previousTimestamp;
        chip8.emulate(elapsed);
        updateUi();

        if (isRunning) {
            window.requestAnimationFrame(emulate);
        }
    }

    isRunning = true;
    window.requestAnimationFrame(emulate);
}

/**
 * Pauses the emulation
 */
function pause() {
    isRunning = false;
}

/**
 * Starts and stops the emulator
 */
function handlePlayPause() {
    if (!isRunning) {
        play();
    } else {
        pause();
    }
}

/**
 * Handles a key being pressed
 * @param {Event} event 
 */
function handleKeyDown(event) {
    const key = KEY_CODES[event.code];
    if (key !== undefined) {
        chip8.setKeyState(key, true);
    }
    updateButtons();
}

/**
 * Handles a key being released
 * @param {Event} event 
 */
function handleKeyUp(event) {
    const key = KEY_CODES[event.code];
    if (key !== undefined) {
        chip8.setKeyState(key, false);
    }
    updateButtons();
}

/**
 * Steps the emulator
 */
function handleStep() {
    chip8.step();
    updateUi();
}

/**
 * Resets the emulator
 */
function handleReset() {
    chip8.reset();
    updateUi();
}

/**
 * Updates all UI elements
 */
function updateUi() {
    updateButtons();
    updateDisassemblyViewer();
    updateRegistersViewer();
}

/**
 * Updates any buttons
 */
function updateButtons() {
    playPauseButton.textContent = isRunning ? 'Pause' : 'Play';

    chip8.keys.forEach((isPressed, key) => {
        const button = keypad.querySelector(`[data-key="${key}"`)
        if (isPressed) {
            button.classList.add('key-pressed');
        } else {
            button.classList.remove('key-pressed');
        }
    })
}

/**
 * Updates the Disassembly Viewer UI
 */
function updateDisassemblyViewer() {
    const disassembly = chip8.disassemble();
    const list = disassemblyViewer.querySelector('#disassembly-list');

    const lines = disassembly.map(line => {
        const listItem = document.createElement('li');
        listItem.textContent = line;

        const offset = parseInt(line.slice(1, 5), 16);
        if (chip8.pc === offset) {
            listItem.classList.add('current-instruction')
        }
        return listItem;
    });

    list.replaceChildren(...lines);
}

/**
 * Updates the Register Viewer UI
 */
function updateRegistersViewer() {
    const list = registersViewer.querySelector('#registers-list');

    const registers = [];

    const specialRegisters = [
        { name: 'PC', width: 4, value: chip8.pc, format: 'hex' },
        { name: 'I', width: 4, value: chip8.i, format: 'hex' },
        { name: 'SP', width: 3, value: chip8.sp, format: 'dec' },
        { name: 'DT', width: 3, value: chip8.dt, format: 'dec' },
        { name: 'ST', width: 3, value: chip8.st, format: 'dec' },
    ];

    const generalRegisters = chip8.v;

    specialRegisters.forEach((register) => {
        const listItem = document.createElement('li');
        const formattedValue = register.format === 'hex' ? formatHex(register.value, register.width) : formatDec(register.value, register.width);
        listItem.textContent = `${register.name}: ${formattedValue}`;
        registers.push(listItem);
    });

    generalRegisters.forEach((value, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `V${formatHex(index, 1, false)}: ${formatDec(value, 3)}`;
        registers.push(listItem);
    });

    list.replaceChildren(...registers);
}

filePicker.addEventListener('change', handleFileSelection);
playPauseButton.addEventListener('click', handlePlayPause);
stepButton.addEventListener('click', handleStep);
resetButton.addEventListener('click', handleReset);

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

updateUi();