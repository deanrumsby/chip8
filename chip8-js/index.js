import Chip8 from './chip8.js';
import { formatHex } from './utils.js';

const chip8 = new Chip8();

const filePicker = document.querySelector('#load');
const stepButton = document.querySelector('#step');
const disassemblyViewer = document.querySelector('#disassembly-viewer');
const registersViewer = document.querySelector('#registers-viewer');

async function handleFileSelection(event) {
    const file = event.target.files[0];
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    chip8.load(bytes);
    updateUi();
}

function handleStep() {
    chip8.step();
    updateUi();
}

function updateUi() {
    updateDisassemblyViewer();
    updateRegistersViewer();
}

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

updateUi();