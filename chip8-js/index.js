import Chip8 from './chip8.js';
import { formatHex } from './utils.js';

const screen = document.querySelector('#screen');
const filePicker = document.querySelector('#load');
const stepButton = document.querySelector('#step');
const resetButton = document.querySelector('#reset');
const disassemblyViewer = document.querySelector('#disassembly-viewer');
const registersViewer = document.querySelector('#registers-viewer');

const chip8 = new Chip8(screen);

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
    updateDisassemblyViewer();
    updateRegistersViewer();
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
        { name: 'PC', width: 4, value: chip8.pc },
        { name: 'I', width: 4, value: chip8.i },
        { name: 'SP', width: 2, value: chip8.sp },
        { name: 'DT', width: 2, value: chip8.dt },
        { name: 'ST', width: 2, value: chip8.st },
    ];

    const generalRegisters = chip8.v;

    specialRegisters.forEach((register) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${register.name}: ${formatHex(register.value, register.width)}`;
        registers.push(listItem);
    });

    generalRegisters.forEach((value, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `V${formatHex(index, 1, false)}: ${formatHex(value, 2)}`;
        registers.push(listItem);
    });

    list.replaceChildren(...registers);
}

filePicker.addEventListener('change', handleFileSelection);
stepButton.addEventListener('click', handleStep);
resetButton.addEventListener('click', handleReset);

updateUi();