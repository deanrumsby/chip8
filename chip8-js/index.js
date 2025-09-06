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

    const pc = document.createElement('li');
    pc.textContent = `PC: ${formatHex(chip8.pc, 4)}`;
    registers.push(pc)

    const i = document.createElement('li');
    i.textContent = `I: ${formatHex(chip8.i, 4)}`;
    registers.push(i);

    const sp = document.createElement('li');
    sp.textContent = `SP: ${formatHex(chip8.sp, 2)}`;
    registers.push(sp);

    const dt = document.createElement('li');
    dt.textContent = `DT: ${formatHex(chip8.dt, 2)}`;
    registers.push(dt);

    const st = document.createElement('li');
    st.textContent = `ST: ${formatHex(chip8.st, 2)}`;
    registers.push(st);

    const v = [];
    for (let i = 0; i < 16; i++) {
        const reg = document.createElement('li');
        reg.textContent = `V${formatHex(i, 1, false)}: ${formatHex(chip8.v[i], 2)}`
        v.push(reg);
    }

    list.replaceChildren(...registers, ...v);
}

filePicker.addEventListener('change', handleFileSelection);
stepButton.addEventListener('click', handleStep);

updateUi();