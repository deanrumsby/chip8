import Chip8 from './chip8.js';

const chip8 = new Chip8();

const filePicker = document.querySelector('#load');
const disassemblyViewer = document.querySelector('#disassembly-viewer');

async function handleFileSelection(event) {
    const file = event.target.files[0];
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    chip8.load(bytes);
    updateDisassemblyViewer();
}

function updateDisassemblyViewer() {
    const disassembly = chip8.disassemble();
    const linesList = disassemblyViewer.querySelector('#disassembly-lines');

    const newLines = disassembly.map(line => {
        const listItem = document.createElement('li');
        listItem.textContent = line;

        const offset = parseInt(line.slice(1, 5), 16);
        if (chip8.pc === offset) {
            listItem.classList.add('current-instruction')
        }
        return listItem;
    });

    linesList.replaceChildren(...newLines);
}

filePicker.addEventListener('change', handleFileSelection);